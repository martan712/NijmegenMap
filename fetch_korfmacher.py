#!/usr/bin/env python3
"""
Enrich the city-wall points (HIS_STADSMUUR) with the gemeente's Korfmacher
popups. Each point's NUMMER maps to a popup at

    https://kaart.nijmegen.nl/public/Multimedia/Korfmacher/<NUMMER>.htm

which holds one historical image + a caption (artist, title, year, collection).
We download the images locally and write an enriched GeoJSON the frontend's
wall overlay uses for click popups.

Run:  python3 fetch_korfmacher.py   (after fetch_chw.py has produced stadsmuur.geojson)
"""
import html as H
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / "data"
IMG_DIR = DATA / "korfmacher"
BASE = "https://kaart.nijmegen.nl/public/Multimedia/Korfmacher/"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project)"}

IMG_RE = re.compile(r"(?i)<img[^>]*\bsrc\s*=\s*[\"']?([^\"'> ]+)")
TAG_RE = re.compile(r"(?is)<[^>]+>")


def get(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
        return r.read()


def caption_of(htm: str) -> str:
    text = TAG_RE.sub(" ", htm)
    text = H.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    gj = json.loads((DATA / "stadsmuur.geojson").read_text())
    IMG_DIR.mkdir(parents=True, exist_ok=True)

    ok = 0
    for feat in gj["features"]:
        nummer = str(feat["properties"].get("NUMMER"))
        try:
            htm = get(f"{BASE}{nummer}.htm").decode("latin-1")
        except Exception as e:  # noqa: BLE001
            print(f"  {nummer}: htm failed ({e})")
            continue

        feat["properties"]["CAPTION"] = caption_of(htm)
        feat["properties"]["PHOTO"] = None

        m = IMG_RE.search(htm)
        if m:
            src = m.group(1).replace("\\", "/").lstrip("/")
            ext = Path(src).suffix or ".jpg"
            try:
                img = get(BASE + urllib.parse.quote(src))
                out = IMG_DIR / f"{nummer}{ext}"
                out.write_bytes(img)
                feat["properties"]["PHOTO"] = f"data/korfmacher/{out.name}"
            except Exception as e:  # noqa: BLE001
                print(f"  {nummer}: image failed ({e})")
        print(f"  {nummer}: {'photo+' if feat['properties']['PHOTO'] else ''}caption")
        ok += 1
        time.sleep(0.3)

    (DATA / "stadswallen.geojson").write_text(json.dumps(gj, ensure_ascii=False))
    print(f"\n{ok}/{len(gj['features'])} points enriched -> data/stadswallen.geojson")
    return 0


if __name__ == "__main__":
    sys.exit(main())
