#!/usr/bin/env python3
"""
Download Nijmegen open vector layers as GeoJSON from the city's GeoServer WFS,
into data/. Used by the frontend's "city growth" overlay (Stadsontwikkeling)
and the WW2 damage event stops (WO2_OORLOGSSCHADE).

Run:  python3 fetch_chw.py
"""
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://services.nijmegen.nl/geoservices"
OUT = Path(__file__).parent / "data"

# (service, GeoServer typeName)  ->  output filename
SOURCES = {
    ("extern_Cultuurhistorie", "CHW_STADSONTWIKKELING"): "stadsontwikkeling.geojson",
    ("extern_wo2", "WO2_OORLOGSSCHADE"): "wo2_oorlogsschade.geojson",
    # 1944 building footprints — shown in gray under the damage polygons.
    ("extern_Historie", "HIS_1944_BEBOUWING"): "his_1944_bebouwing.geojson",
    # Chapter overlays: fortifications + medieval city wall.
    ("extern_Cultuurhistorie", "CHW_VESTINGWERKEN"): "vestingwerken.geojson",
    ("extern_Historie", "HIS_STADSMUUR"): "stadsmuur.geojson",
    # Roman limes (UNESCO Neder-Germaanse Limes) kern-/bufferzones — chapter 1.
    ("extern_Archeologie", "ARC_ROMEINSE_LIMES"): "romeinse_limes.geojson",
    # More layers on the same services, ready when we want them:
    # ("extern_Cultuurhistorie", "CHW_VESTINGWERKEN"):    "vestingwerken.geojson",
    # ("extern_wo2", "WO2_OORLOGSMONUMENTEN_SQL"):        "wo2_monumenten.geojson",
    # ("extern_wo2", "WO2_DODEN_GEBEURTENIS"):            "wo2_doden.geojson",
}


def fetch(service, layer):
    params = urllib.parse.urlencode({
        "service": "WFS", "version": "2.0.0", "request": "GetFeature",
        "typeNames": f"{service}:{layer}",
        "outputFormat": "application/json", "srsName": "EPSG:4326",
    })
    url = f"{BASE}/{service}/ows?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "NijmegenMap/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read())


def main():
    OUT.mkdir(exist_ok=True)
    for (service, layer), fname in SOURCES.items():
        gj = fetch(service, layer)
        (OUT / fname).write_text(json.dumps(gj, ensure_ascii=False))
        print(f"  {layer}: {len(gj['features'])} features -> data/{fname}")


if __name__ == "__main__":
    sys.exit(main())
