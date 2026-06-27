"""
maps stage: pre-fetch every timeline layer once at ~3000px as a transparent
WebP into maps/, and write maps.json (year, type, era, label, file, bounds,
layers, wms). The frontend places each as a single ImageOverlay; tiles are added
later by the tiles stage. Idempotent — a re-run only fills gaps.
"""
import io
import time

from ...core import Stage, content, http_get, register_stage
from ...sources import wms
from .base import MAX_EDGE, OUT_DIR, WEBP_QUALITY, write_manifest


def _bboxes_for(entries):
    """GetCapabilities bboxes for every endpoint the timeline actually uses."""
    boxes = {}
    for key in sorted({e.src for e in entries}):
        boxes.update(wms.capabilities_bboxes(wms.ENDPOINTS[key]))
    return boxes


def _save_overlay(entry, west, south, east, north):
    """Fetch the overlay, stepping the resolution down on server 500s. Returns
    (width, height) on success, or raises the last error."""
    from PIL import Image
    lon_span, lat_span = east - west, north - south
    last = None
    for max_edge in (MAX_EDGE, 2500, 2000, 1500):
        if lon_span >= lat_span:
            width = max_edge
            height = max(1, round(max_edge * lat_span / lon_span))
        else:
            height = max_edge
            width = max(1, round(max_edge * lon_span / lat_span))
        url = wms.getmap_url(entry.endpoint, layers=entry.layers,
                             south=south, west=west, north=north, east=east,
                             width=width, height=height)
        try:
            raw = http_get(url, timeout=180, detect_xml_error=True)
            img = Image.open(io.BytesIO(raw)).convert("RGBA")
            fname = f"{entry.year}_{entry.layers.split('.')[0].split(',')[0]}.webp"
            img.save(OUT_DIR / fname, "WEBP", quality=WEBP_QUALITY, method=6)
            return fname, width, height
        except Exception as ex:  # noqa: BLE001
            last = ex
    raise last


@register_stage
class MapsStage(Stage):
    name = "maps"
    help = "WMS overlays -> maps/ + maps.json"

    def run(self, args):
        entries = content("timeline")
        OUT_DIR.mkdir(exist_ok=True)
        print("  Fetching capabilities ...")
        boxes = _bboxes_for(entries)
        print(f"  parsed {len(boxes)} layer bboxes")

        manifest = []
        for e in entries:
            west, south, east, north = wms.union_bbox(e.layers, boxes)
            fname = f"{e.year}_{e.layers.split('.')[0].split(',')[0]}.webp"
            out = OUT_DIR / fname
            entry = {
                "year": e.year, "type": e.kind, "era": e.era,
                "label": e.label or str(e.year), "file": f"maps/{fname}",
                # Leaflet ImageOverlay bounds: [[south, west], [north, east]]
                "bounds": [[south, west], [north, east]],
                # Kept so the frontend can render a sharp live WMS image up close.
                "layers": e.layers, "wms": e.endpoint,
            }

            # Idempotent: keep already-downloaded layers (re-run only fills gaps).
            if out.exists() and out.stat().st_size > 1024:
                manifest.append(entry)
                print(f"  {e.year}  (cached) {fname}")
                continue

            t0 = time.time()
            try:
                _, width, height = _save_overlay(e, west, south, east, north)
            except Exception as ex:  # noqa: BLE001
                print(f"  !! {e.year} {e.layers}: {ex}")
                continue
            kb = out.stat().st_size // 1024
            print(f"  {e.year}  {width}x{height}  {kb:>5} KB  {time.time()-t0:4.1f}s  {fname}")
            manifest.append(entry)

        write_manifest(manifest)
        print(f"  Wrote maps.json with {len(manifest)} layers; images in {OUT_DIR}/")
