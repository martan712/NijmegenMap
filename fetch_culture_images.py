#!/usr/bin/env python3
"""
Download freely-licensed illustrations for the cultural ("Stad van naam") scenes
from Wikimedia Commons into data/images/culture/, and record their attribution.

This is a thematic (non-era) fetch script — like fetch_korfmacher.py — because the
three works span the medieval and early-modern eras (± 1400 → 1699). Each scene pin
in src/config/chapters.ts references data/images/culture/<slug>.<ext> and shows the
caption below (which already embeds the author + licence). Rerun to refresh:
  python3 fetch_culture_images.py

Mirrors fetch_medieval_images.py — see that file for the shared pattern. The only
addition is a per-image extension: the Mariken title page is a GIF, so it is fetched
as the original file (not the JPG thumbnail) and written as mariken.gif.
"""
import html as H
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent / "data" / "images" / "culture"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"}

# slug -> (Commons File: title, Dutch descriptive caption prefix, extension)
# ext defaults to "jpg" (JPG thumbnail); use the real extension for non-JPG originals.
IMAGES = {
    "limburg": ("File:Les Très Riches Heures du duc de Berry juin.jpg",
                "De maand juni uit de Très Riches Heures du Duc de Berry — gebroeders van Limburg, ca. 1412–1416", "jpg"),
    "mariken": ("File:Mariken van Nieuweghen.gif",
                "Titelpagina van Mariken van Nieumeghen — Jan van Doesborch, ca. 1518", "gif"),
    "canisius": ("File:Saint Petrus Canisius.jpg",
                 "Petrus Canisius — anoniem portret, 1699", "jpg"),
}

TAGS = re.compile(r"(?is)<[^>]+>")


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", H.unescape(TAGS.sub(" ", s or ""))).strip()


def info(title: str):
    q = {"action": "query", "format": "json", "titles": title, "prop": "imageinfo",
         "iiprop": "url|extmetadata", "iiurlwidth": 900}
    url = API + "?" + urllib.parse.urlencode(q)
    d = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read())
    page = next(iter(d["query"]["pages"].values()))
    ii = page["imageinfo"][0]
    ext = ii.get("extmetadata", {})
    artist = clean(ext.get("Artist", {}).get("value", "")) or "onbekend"
    lic = ext.get("LicenseShortName", {}).get("value", "")
    return ii["thumburl"], ii["url"], artist, lic


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    credits = {}
    for slug, (title, prefix, ext) in IMAGES.items():
        try:
            thumb, original, artist, lic = info(title)
            # JPG scenes use the 900px thumbnail; non-JPG (GIF) keeps the original file.
            src = thumb if ext == "jpg" else original
            data = urllib.request.urlopen(urllib.request.Request(src, headers=UA), timeout=60).read()
            (OUT / f"{slug}.{ext}").write_bytes(data)
            tail = ", ".join(p for p in (artist, lic) if p)
            credits[slug] = f"{prefix} — {tail} (Wikimedia Commons)"
            print(f"  {slug}: {len(data)//1024} kB | {tail}")
        except Exception as e:  # noqa: BLE001
            print(f"  {slug}: FAILED ({e})")
    (OUT / "credits.json").write_text(json.dumps(credits, ensure_ascii=False, indent=2))
    print(f"\n{len(credits)}/{len(IMAGES)} images -> data/images/culture/  (captions in credits.json)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
