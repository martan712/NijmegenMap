#!/usr/bin/env python3
"""
Render a local Web-Mercator (XYZ) tile pyramid for every layer in maps.json,
straight from the Nijmegen WMS, so the frontend can serve tiles/<key>/{z}/{x}/{y}.webp
fully locally with no live requests up to each layer's max zoom.

The WMS only speaks EPSG:4326 (equirectangular), but slippy-map tiles are
EPSG:3857 (Mercator). Longitude is linear in both, so only the vertical axis
needs reprojecting: we fetch a metatile in 4326 and remap its rows to the
Mercator latitudes of the output tiles (exact, sub-pixel). Fully transparent
tiles are skipped, so small old maps cost little.

Run:  python3 build_tiles.py        (idempotent: finished layers are skipped)
"""
import io
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
from PIL import Image

import os

ROOT = Path(__file__).parent
MANIFEST = ROOT / "maps.json"
TILE_DIR = ROOT / "tiles"
MINZOOM = 12
MAXZOOM = {"map": 17, "aerial": 17}
# Maps whose scans hold no real detail beyond z16 (from the resolution probe);
# everything else resolves cleanly to z17.
NATIVE_MAXZOOM = {1820: 16, 1850: 16, 1885: 16, 1894: 16}
OLD_MAXZOOM = {"map": 15, "aerial": 17}   # previous scheme, for migrating markers
META = 12            # metatile = META×META tiles → 3072px request (< 4000 cap)
WORKERS = int(os.environ.get("NIJ_WORKERS", "6"))
QUALITY = 80
TILE = 256


def maxzoom_for(entry):
    return NATIVE_MAXZOOM.get(entry["year"], MAXZOOM[entry["type"]])


# --- slippy-map <-> lon/lat ------------------------------------------------
def lon_of_px(xpix, z):
    return xpix / (TILE * 2 ** z) * 360.0 - 180.0


def lat_of_px(ypix, z):
    yp = ypix / (TILE * 2 ** z)
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * yp))))


def xtile(lon, z):
    return int((lon + 180.0) / 360.0 * 2 ** z)


def ytile(lat, z):
    r = math.radians(lat)
    return int((1 - math.asinh(math.tan(r)) / math.pi) / 2 * 2 ** z)


def fetch(url, tries=3, timeout=120):
    last = None
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "NijmegenMap/1.0"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
            if data[:5] == b"<?xml":
                raise RuntimeError(data[:120].decode("utf-8", "replace").strip())
            return data
        except Exception as ex:  # noqa: BLE001
            last = ex
            time.sleep(1.5)
    raise last


def render_block(entry, z, tx0, tx1, ty0, ty1):
    """Render a block of tiles; on server failure (e.g. 500 at large sizes),
    split into quadrants and retry smaller, down to a single tile."""
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
        return sum(render_block(entry, z, *q) for q in quads)


def _render(entry, z, tx0, tx1, ty0, ty1):
    """Fetch one block, reproject to Mercator, slice into 256px tiles."""
    X0, X1 = tx0 * TILE, (tx1 + 1) * TILE
    Y0, Y1 = ty0 * TILE, (ty1 + 1) * TILE
    w_px, h_px = X1 - X0, Y1 - Y0

    west, east = lon_of_px(X0, z), lon_of_px(X1, z)
    north, south = lat_of_px(Y0, z), lat_of_px(Y1, z)

    params = urllib.parse.urlencode({
        "service": "WMS", "request": "GetMap", "version": "1.3.0",
        "layers": entry["layers"], "styles": "", "crs": "EPSG:4326",
        "format": "image/png", "transparent": "true",
        "width": w_px, "height": h_px,         # source rows linear in latitude
        "bbox": f"{south},{west},{north},{east}",   # 1.3.0/4326 = lat,lon order
    })
    raw = fetch(entry["wms"] + "?" + params)
    src = np.asarray(Image.open(io.BytesIO(raw)).convert("RGBA"))  # (h_px, w_px, 4)

    # Remap source rows (equirectangular) -> output rows (Mercator) by latitude.
    out_y = np.arange(Y0, Y1)
    yp = out_y / (TILE * 2 ** z)
    lat = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * yp))))
    src_rows = np.clip(((north - lat) / (north - south) * (h_px - 1)).round().astype(int),
                       0, h_px - 1)
    out = src[src_rows, :, :]      # (h_px, w_px, 4), columns already aligned (linear lon)

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
                                       quality=QUALITY, method=4)
            written += 1
    return written


def build_layer(entry):
    """Render the pyramid one zoom level at a time, skipping levels already
    marked done (so raising a layer's maxzoom only renders the new levels)."""
    key = entry["_key"]
    kd = TILE_DIR / key
    kd.mkdir(parents=True, exist_ok=True)
    maxz = maxzoom_for(entry)

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
        tx_lo, tx_hi = xtile(w, z), xtile(e, z)
        ty_lo, ty_hi = ytile(n, z), ytile(s, z)
        for tx in range(tx_lo, tx_hi + 1, META):
            for ty in range(ty_lo, ty_hi + 1, META):
                jobs.append((z, tx, min(tx + META - 1, tx_hi),
                             ty, min(ty + META - 1, ty_hi)))
        t0 = time.time()
        zt = 0
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futs = [ex.submit(render_block, entry, *j) for j in jobs]
            for f in as_completed(futs):
                try:
                    zt += f.result()
                except Exception as ex2:  # noqa: BLE001
                    print(f"    metatile failed: {ex2}")
        (kd / f".z{z}.done").touch()
        print(f"  {entry['year']:>4}  z{z:<2} {len(jobs):>4} mt  {zt:>7,} tiles  "
              f"{time.time()-t0:5.0f}s  {key}")
    return maxz


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None   # "maps" | "aerial" | None
    want = {"maps": "map", "aerial": "aerial"}.get(only)
    manifest = json.loads(MANIFEST.read_text())
    TILE_DIR.mkdir(exist_ok=True)
    for entry in manifest:
        entry["_key"] = Path(entry["file"]).stem
        if want and entry["type"] != want:
            continue
        maxz = build_layer(entry)
        entry["tiles"] = f"tiles/{entry['_key']}/{{z}}/{{x}}/{{y}}.webp"
        entry["minzoom"] = MINZOOM
        entry["maxzoom"] = maxz

    # Only rewrite the manifest on a full run; a filtered run just renders tiles.
    if not only:
        for entry in manifest:
            entry.pop("_key", None)
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        print("maps.json updated.")
    size = sum(f.stat().st_size for f in TILE_DIR.rglob("*.webp"))
    print(f"Done. Tile pyramid = {size/1024/1024:.0f} MB.")


if __name__ == "__main__":
    sys.exit(main())
