#!/usr/bin/env python3
"""
Pre-fetch every historical Nijmegen WMS layer once, at high resolution, and
store it locally as a transparent WebP plus a manifest (maps.json) that records
each map's exact geographic bounds. The frontend then places each map as a
single ImageOverlay anchored to those bounds, so panning/zooming never hits the
network again.

Run:  python3 build_maps.py
"""
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

# Two WMS endpoints, same server/CRS/limits: historical rasters (1557–1998) and
# the recent annual aerial photos (2008–2025). Each timeline entry tags which one.
WMS = {
    "H": "https://services.nijmegen.nl/geoservices/wms/extern_Historie_raster",
    "L": "https://services.nijmegen.nl/geoservices/wms/extern_Luchtfoto",
}
CAPS_URL = {k: f"{v}?service=WMS&request=GetCapabilities&version=1.3.0" for k, v in WMS.items()}
OUT_DIR = Path(__file__).parent / "maps"
MAX_EDGE = 3000          # server hard cap is "< 4000"
QUALITY = 82             # WebP quality

# Timeline: one stop per year. Comma-joined layers are composited by the WMS.
# Optional 6th field selects the source endpoint ("H" historie, "L" luchtfoto);
# defaults to "H".
TIMELINE = [
    (1557, "1557.ecw", "map", "Renaissance", None),
    (1639, "1639.ecw", "map", "Gouden Eeuw", None),
    (1668, "1668.ecw", "map", "Gouden Eeuw", None),
    (1672, "1672.ecw", "map", "Rampjaar", None),
    # Flipped draw order: WMS paints the last layer on top, so 1783.ecw now wins
    # the overlap over 1783_noord.tif.
    (1783, "1783_noord.tif,1783.ecw", "map", "Republiek", None),
    (1794, "1794.ecw", "map", "Voor de Bataafse Republiek", None),
    (1806, "1806.tif", "map", "Napoleontische tijd", None),
    (1820, "1820.ecw", "map", "Verenigd Koninkrijk", None),
    (1822, "1822_oost.tif,1822_west.tif", "map", "Verenigd Koninkrijk", None),
    (1833, "1833.ecw", "map", "Vestingstad", None),
    (1850, "1850.ecw,1850-1851.tif", "map", "Begin industrialisatie", None),
    (1871, "1871.ecw", "map", "Sloop vestingwerken", None),
    (1879, "1879.ecw", "map", "Stadsuitbreiding", None),
    (1885, "1880-1890.tif", "map", "Stadsuitbreiding", "1880–1890"),
    (1894, "1894.ecw", "map", "Stadsuitbreiding", None),
    (1897, "1897a.ecw,1897b.ecw", "map", "Stadsuitbreiding", None),
    (1900, "1900.ecw", "map", "Eeuwwisseling", None),
    (1908, "1908.ecw", "map", "Eeuwwisseling", None),
    (1910, "1910.ecw", "map", "Eeuwwisseling", None),
    (1925, "1925.ecw", "map", "Interbellum", None),
    (1927, "1927.ecw", "map", "Interbellum", None),
    (1930, "1930.ecw", "map", "Interbellum", None),
    (1936, "1936_lufo.ecw", "aerial", "Interbellum", None),
    (1938, "1938.ecw", "map", "Vooravond WOII", None),
    (1944, "Nijmegen1950oorlogsschade.ecw", "map", "Oorlogsschade WOII", "1944 ⚠"),
    (1949, "1949_lufo.ecw", "aerial", "Na de verwoesting", None),
    (1950, "1950.ecw", "map", "Wederopbouw", None),
    (1953, "1953_1954_lufo.tif", "aerial", "Wederopbouw", "1953–1954"),
    (1957, "1957.ecw", "map", "Wederopbouw", None),
    (1964, "1964_lufo.ecw", "aerial", "Naoorlogse groei", None),
    (1967, "1967.ecw", "map", "Naoorlogse groei", None),
    (1969, "1969_lufo.tif", "aerial", "Naoorlogse groei", None),
    (1974, "1974_lufo.ecw", "aerial", "Uitbreiding", None),
    (1977, "1977.ecw", "map", "Uitbreiding", None),
    (1981, "1981_lufo.tif", "aerial", "Jaren 80", None),
    (1983, "1983_lufo.tif", "aerial", "Jaren 80", None),
    (1986, "1986_lufo.tif", "aerial", "Jaren 80", None),
    (1989, "1989_lufo.tif", "aerial", "Jaren 80", None),
    (1992, "1992_lufo.tif", "aerial", "Jaren 90", None),
    (1995, "1995_lufo.tif", "aerial", "Jaren 90", None),
    (1997, "1997_1998_lufo.tif", "aerial", "Jaren 90", "1997–1998"),
    # Recent annual orthophotos (5cm), from the extern_Luchtfoto endpoint.
    (2008, "Luchtfoto2008.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2009, "Luchtfoto2009.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2010, "Luchtfoto2010.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2011, "Luchtfoto2011.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2012, "Luchtfoto2012.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2013, "Luchtfoto2013.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2014, "Luchtfoto2014.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2015, "Luchtfoto2015.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2016, "Luchtfoto2016.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2017, "Luchtfoto2017.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2018, "Luchtfoto2018.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2019, "Luchtfoto2019.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2020, "Luchtfoto2020.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2021, "Luchtfoto2021.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2022, "Luchtfoto2022.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2023, "Luchtfoto2023.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2024, "Luchtfoto2024.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2025, "Luchtfoto2025_mosaic.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
]


def fetch(url, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": "NijmegenMap/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def parse_bboxes(caps_xml):
    """Map each layer <Name> to its (west, south, east, north) geo bbox."""
    boxes = {}
    # Split into <Layer> blocks; each leaf layer has a Name + EX_GeographicBoundingBox.
    for m in re.finditer(r"<Layer\b.*?</Layer>", caps_xml, re.S):
        block = m.group(0)
        name = re.search(r"<Name>([^<]+)</Name>", block)
        if not name:
            continue
        g = {}
        for tag in ("westBoundLongitude", "eastBoundLongitude",
                    "southBoundLatitude", "northBoundLatitude"):
            t = re.search(rf"<{tag}>([^<]+)<", block)
            if t:
                g[tag] = float(t.group(1))
        if len(g) == 4:
            boxes[name.group(1)] = (g["westBoundLongitude"], g["southBoundLatitude"],
                                    g["eastBoundLongitude"], g["northBoundLatitude"])
    return boxes


def union_bbox(layer_csv, boxes):
    w = s = e = n = None
    for layer in layer_csv.split(","):
        if layer not in boxes:
            raise KeyError(layer)
        bw, bs, be, bn = boxes[layer]
        w = bw if w is None else min(w, bw)
        s = bs if s is None else min(s, bs)
        e = be if e is None else max(e, be)
        n = bn if n is None else max(n, bn)
    return w, s, e, n


def main():
    OUT_DIR.mkdir(exist_ok=True)
    print("Fetching capabilities ...")
    boxes = {}                       # layer name -> bbox (merged across endpoints)
    for key, url in CAPS_URL.items():
        boxes.update(parse_bboxes(fetch(url).decode("utf-8", "replace")))
    print(f"  parsed {len(boxes)} layer bboxes")

    manifest = []
    for row in TIMELINE:
        year, layer_csv, kind, era, label = row[:5]
        src = row[5] if len(row) > 5 else "H"
        endpoint = WMS[src]
        w, s, e, n = union_bbox(layer_csv, boxes)
        lon_span, lat_span = e - w, n - s

        def make_url(max_edge):
            if lon_span >= lat_span:
                width = max_edge
                height = max(1, round(max_edge * lat_span / lon_span))
            else:
                height = max_edge
                width = max(1, round(max_edge * lon_span / lat_span))
            params = {
                "service": "WMS", "request": "GetMap", "version": "1.3.0",
                "layers": layer_csv, "styles": "", "crs": "EPSG:4326",
                "format": "image/png", "transparent": "true",
                "width": width, "height": height,
                # WMS 1.3.0 + EPSG:4326 axis order = lat,lon (south,west,north,east)
                "bbox": f"{s},{w},{n},{e}",
            }
            return endpoint + "?" + urllib.parse.urlencode(params), width, height

        fname = f"{year}_{layer_csv.split('.')[0].split(',')[0]}.webp"
        out = OUT_DIR / fname

        entry = {
            "year": year, "type": kind, "era": era, "label": label or str(year),
            "file": f"maps/{fname}",
            # Leaflet ImageOverlay bounds: [[south, west], [north, east]]
            "bounds": [[s, w], [n, e]],
            # Kept so the frontend can render a sharp live WMS image when zoomed in.
            "layers": layer_csv, "wms": endpoint,
        }

        # Idempotent: keep already-downloaded layers (re-run only fills gaps).
        if out.exists() and out.stat().st_size > 1024:
            manifest.append(entry)
            print(f"  {year}  (cached) {fname}")
            continue

        # Some large-extent layers 500 at full size; step down until one renders.
        t0 = time.time()
        saved = None
        for max_edge in (MAX_EDGE, 2500, 2000, 1500):
            url, width, height = make_url(max_edge)
            try:
                raw = fetch(url, timeout=180)
                if raw[:5] == b"<?xml":
                    raise RuntimeError(raw[:120].decode("utf-8", "replace").strip())
                img = Image.open(io.BytesIO(raw)).convert("RGBA")
                img.save(out, "WEBP", quality=QUALITY, method=6)
                saved = (width, height)
                break
            except Exception as ex:  # noqa: BLE001
                last = ex
        if not saved:
            print(f"  !! {year} {layer_csv}: {last}")
            continue
        width, height = saved
        kb = out.stat().st_size // 1024
        print(f"  {year}  {width}x{height}  {kb:>5} KB  {time.time()-t0:4.1f}s  {fname}")
        manifest.append(entry)

    (Path(__file__).parent / "maps.json").write_text(json.dumps(manifest, indent=2))
    print(f"\nWrote maps.json with {len(manifest)} layers; images in {OUT_DIR}/")


if __name__ == "__main__":
    sys.exit(main())
