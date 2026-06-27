"""
Korfmacher stage: enrich the medieval wall points (HIS_STADSMUUR) with the
gemeente's Korfmacher popups — one historical image + caption per point — into
data/stadswallen.geojson. Reads data/stadsmuur.geojson, so run after `vectors`.

A single, self-contained enrichment (no catalog content): its only "config" is
the source/output pair below.
"""
import json
import re
import time
import urllib.parse
from pathlib import Path

from ..core import DATA, Stage, clean_html, http_get, register_stage

BASE = "https://kaart.nijmegen.nl/public/Multimedia/Korfmacher/"
SRC = "stadsmuur.geojson"          # produced by the vectors stage
OUT = "stadswallen.geojson"
_IMG_RE = re.compile(r"(?i)<img[^>]*\bsrc\s*=\s*[\"']?([^\"'> ]+)")


@register_stage
class KorfmacherStage(Stage):
    name = "korfmacher"
    help = "enrich wall points with Korfmacher popups (needs 'vectors' first)"

    def run(self, args):
        src = DATA / SRC
        if not src.exists():
            raise SystemExit(f"{src} not found — run the 'vectors' stage first.")
        gj = json.loads(src.read_text())
        img_dir = DATA / "images" / "korfmacher"
        img_dir.mkdir(parents=True, exist_ok=True)

        ok = 0
        for feat in gj["features"]:
            nummer = str(feat["properties"].get("NUMMER"))
            try:
                htm = http_get(f"{BASE}{nummer}.htm", timeout=40).decode("latin-1")
            except Exception as e:  # noqa: BLE001
                print(f"  {nummer}: htm failed ({e})")
                continue

            feat["properties"]["CAPTION"] = clean_html(htm)
            feat["properties"]["PHOTO"] = None

            m = _IMG_RE.search(htm)
            if m:
                rel = m.group(1).replace("\\", "/").lstrip("/")
                ext = Path(rel).suffix or ".jpg"
                try:
                    img = http_get(BASE + urllib.parse.quote(rel), timeout=40)
                    dst = img_dir / f"{nummer}{ext}"
                    dst.write_bytes(img)
                    feat["properties"]["PHOTO"] = f"data/images/korfmacher/{dst.name}"
                except Exception as e:  # noqa: BLE001
                    print(f"  {nummer}: image failed ({e})")
            print(f"  {nummer}: {'photo+' if feat['properties']['PHOTO'] else ''}caption")
            ok += 1
            time.sleep(0.3)

        (DATA / OUT).write_text(json.dumps(gj, ensure_ascii=False))
        print(f"  {ok}/{len(gj['features'])} points enriched -> data/{OUT}")
