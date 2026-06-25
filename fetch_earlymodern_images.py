#!/usr/bin/env python3
"""
Download freely-licensed illustrations for the early-modern ("Gewest, geloof &
vrede") scenes from Wikimedia Commons into data/images/earlymodern/, and record their
attribution.

Each scene pin in src/config/chapters.ts references data/images/earlymodern/<slug>.jpg
and shows the caption below. Rerun to refresh:
    python3 fetch_earlymodern_images.py

Mirrors fetch_roman_images.py / fetch_medieval_images.py — shared pattern.
"""
import html as H
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent / "data" / "images" / "earlymodern"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"}

# slug -> (Commons File: title, Dutch descriptive caption prefix)
IMAGES = {
    "venlo1543": ("File:Portrait of Charles V, Holy Roman Emperor, by anonymous, c. 1550 - Rijksmuseum, Amsterdam.jpg",
                  "Keizer Karel V, die Gelre in 1543 in de Habsburgse Nederlanden dwong — anoniem portret, ca. 1550 (Rijksmuseum)"),
    "maurits1591": ("File:Michiel Jansz van Mierevelt - Maurits prins van Oranje.jpg",
                    "Prins Maurits van Oranje, die Nijmegen in 1591 op de Spaanse koning veroverde — Michiel van Mierevelt"),
    "vrede1678": ("File:De vrede van Nijmegen, 1678, RP-P-OB-82.499.jpg",
                  "De Vrede van Nijmegen, 1678 — prent (Rijksmuseum)"),
    "franse1794": ("File:Siege Nijmegen 1794.jpg",
                   "Het beleg van Nijmegen door de Franse legers in 1794, met de schipbrug naar Lent — prent"),
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
    return ii["thumburl"], artist, lic


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    credits = {}
    for slug, (title, prefix) in IMAGES.items():
        try:
            thumb, artist, lic = info(title)
            data = urllib.request.urlopen(urllib.request.Request(thumb, headers=UA), timeout=60).read()
            (OUT / f"{slug}.jpg").write_bytes(data)
            tail = ", ".join(p for p in (artist, lic) if p)
            credits[slug] = f"{prefix} — {tail} (Wikimedia Commons)"
            print(f"  {slug}: {len(data)//1024} kB | {tail}")
        except Exception as e:  # noqa: BLE001
            print(f"  {slug}: FAILED ({e})")
    (OUT / "credits.json").write_text(json.dumps(credits, ensure_ascii=False, indent=2))
    print(f"\n{len(credits)}/{len(IMAGES)} images -> data/images/earlymodern/  (captions in credits.json)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
