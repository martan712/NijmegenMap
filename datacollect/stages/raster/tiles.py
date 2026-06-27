"""
tiles stage: render a local Web-Mercator (XYZ) tile pyramid for every layer in
maps.json, straight from the WMS, so the frontend serves tiles/<key>/{z}/{x}/{y}.webp
with no live requests up to each layer's max zoom.

The WMS only speaks EPSG:4326; slippy tiles are EPSG:3857. Longitude is linear
in both, so only rows need reprojecting: fetch a metatile in 4326 and remap its
rows to the Mercator latitudes of the output tiles. Idempotent per zoom level
(.z{z}.done markers); fully transparent tiles are skipped.
"""
import io
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from ...core import Stage, http_get, register_stage
from ...sources import wms
from . import tiling
from .base import (META, MINZOOM, OLD_MAXZOOM, TILE, TILE_DIR, TILE_QUALITY,
                   WORKERS, MAXZOOM, NATIVE_MAXZOOM, read_manifest, write_manifest)


def _maxzoom_for(entry):
    return NATIVE_MAXZOOM.get(entry["year"], MAXZOOM[entry["type"]])


def _render(entry, z, tx0, tx1, ty0, ty1):
    """Fetch one block, reproject to Mercator, slice into 256px tiles."""
    import numpy as np
    from PIL import Image

    X0, X1 = tx0 * TILE, (tx1 + 1) * TILE
    Y0, Y1 = ty0 * TILE, (ty1 + 1) * TILE
    w_px, h_px = X1 - X0, Y1 - Y0

    west, east = tiling.lon_of_px(X0, z), tiling.lon_of_px(X1, z)
    north, south = tiling.lat_of_px(Y0, z), tiling.lat_of_px(Y1, z)

    url = wms.getmap_url(entry["wms"], layers=entry["layers"],
                         south=south, west=west, north=north, east=east,
                         width=w_px, height=h_px)   # source rows linear in latitude
    raw = http_get(url, tries=3, timeout=120, detect_xml_error=True, retry_delay=1.5)
    src = np.asarray(Image.open(io.BytesIO(raw)).convert("RGBA"))  # (h_px, w_px, 4)

    # Remap source rows (equirectangular) -> output rows (Mercator) by latitude.
    out_y = np.arange(Y0, Y1)
    yp = out_y / (TILE * 2 ** z)
    lat = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * yp))))
    src_rows = np.clip(((north - lat) / (north - south) * (h_px - 1)).round().astype(int),
                       0, h_px - 1)
    out = src[src_rows, :, :]      # columns already aligned (linear lon)

    key_dir = TILE_DIR / entry["_key"]
    written = 0
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            px, py = tx * TILE - X0, ty * TILE - Y0
            tile = out[py:py + TILE, px:px + TILE, :]
            if tile.shape[0] != TILE or tile.shape[1] != TILE:
                continue
            if not tile[:, :, 3].any():     # fully transparent -> skip
                continue
            d = key_dir / str(z) / str(tx)
            d.mkdir(parents=True, exist_ok=True)
            Image.fromarray(tile).save(d / f"{ty}.webp", "WEBP",
                                       quality=TILE_QUALITY, method=4)
            written += 1
    return written


def _render_block(entry, z, tx0, tx1, ty0, ty1):
    """Render a block; on server failure (e.g. 500 at large sizes), split into
    quadrants and retry smaller, down to a single tile."""
    try:
        return _render(entry, z, tx0, tx1, ty0, ty1)
    except Exception as ex:  # noqa: BLE001
        if tx1 == tx0 and ty1 == ty0:
            print(f"    skip tile z{z} {tx0},{ty0}: {ex}")
            return 0
        mx, my = (tx0 + tx1) // 2, (ty0 + ty1) // 2
        if tx1 > tx0 and ty1 > ty0:
            quads = [(tx0, mx, ty0, my), (mx + 1, tx1, ty0, my),
                     (tx0, mx, my + 1, ty1), (mx + 1, tx1, my + 1, ty1)]
        elif tx1 > tx0:
            quads = [(tx0, mx, ty0, ty1), (mx + 1, tx1, ty0, ty1)]
        else:
            quads = [(tx0, tx1, ty0, my), (tx0, tx1, my + 1, ty1)]
        return sum(_render_block(entry, z, *q) for q in quads)


def _build_layer(entry):
    """Render the pyramid one zoom level at a time, skipping levels already
    marked done (so raising a layer's maxzoom only renders the new levels)."""
    import time
    kd = TILE_DIR / entry["_key"]
    kd.mkdir(parents=True, exist_ok=True)
    maxz = _maxzoom_for(entry)

    # Migrate the old whole-layer marker to per-zoom markers.
    if (kd / ".done").exists():
        for z in range(MINZOOM, OLD_MAXZOOM[entry["type"]] + 1):
            (kd / f".z{z}.done").touch()
        (kd / ".done").unlink()

    (s, w), (n, e) = entry["bounds"]
    for z in range(MINZOOM, maxz + 1):
        if (kd / f".z{z}.done").exists():
            continue
        jobs = []
        tx_lo, tx_hi = tiling.xtile(w, z), tiling.xtile(e, z)
        ty_lo, ty_hi = tiling.ytile(n, z), tiling.ytile(s, z)
        for tx in range(tx_lo, tx_hi + 1, META):
            for ty in range(ty_lo, ty_hi + 1, META):
                jobs.append((z, tx, min(tx + META - 1, tx_hi),
                             ty, min(ty + META - 1, ty_hi)))
        t0 = time.time()
        zt = 0
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futs = [ex.submit(_render_block, entry, *j) for j in jobs]
            for f in as_completed(futs):
                try:
                    zt += f.result()
                except Exception as ex2:  # noqa: BLE001
                    print(f"    metatile failed: {ex2}")
        (kd / f".z{z}.done").touch()
        print(f"  {entry['year']:>4}  z{z:<2} {len(jobs):>4} mt  {zt:>7,} tiles  "
              f"{time.time()-t0:5.0f}s  {entry['_key']}")
    return maxz


@register_stage
class TilesStage(Stage):
    name = "tiles"
    help = "XYZ tile pyramid -> tiles/"

    def configure(self, parser):
        parser.add_argument("--only", choices=("maps", "aerial"),
                            help="render just this layer type (leaves maps.json untouched)")

    def run(self, args):
        only = getattr(args, "only", None)
        want = {"maps": "map", "aerial": "aerial"}.get(only)
        manifest = read_manifest()
        TILE_DIR.mkdir(exist_ok=True)
        for entry in manifest:
            entry["_key"] = Path(entry["file"]).stem
            if want and entry["type"] != want:
                continue
            maxz = _build_layer(entry)
            entry["tiles"] = f"tiles/{entry['_key']}/{{z}}/{{x}}/{{y}}.webp"
            entry["minzoom"] = MINZOOM
            entry["maxzoom"] = maxz

        # Only rewrite the manifest on a full run; a filtered run just renders tiles.
        if not only:
            for entry in manifest:
                entry.pop("_key", None)
            write_manifest(manifest, ensure_ascii=False)
            print("  maps.json updated.")
        size = sum(f.stat().st_size for f in TILE_DIR.rglob("*.webp"))
        print(f"  Done. Tile pyramid = {size/1024/1024:.0f} MB.")
