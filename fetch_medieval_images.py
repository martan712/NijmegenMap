#!/usr/bin/env python3
"""
Download freely-licensed illustrations for the medieval ("Keizerstad") scenes
from Wikimedia Commons into data/images/medieval/, and record their attribution.

Each scene pin in src/config/chapters.ts references data/images/medieval/<slug>.jpg and
shows the caption below (which already embeds the author + licence). Rerun to
refresh:  python3 fetch_medieval_images.py

Mirrors fetch_roman_images.py — see that file for the shared pattern.
"""
import html as H
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent / "data" / "images" / "medieval"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"}

# slug -> (Commons File: title, Dutch descriptive caption prefix)
IMAGES = {
    "vikingen": ("File:Osebergskipet 2016.jpg",
                 "Het Osebergschip (9e eeuw), een bewaard gebleven Vikingschip — Vikingschipmuseum, Oslo"),
    "keizerstad": ("File:Gospels of Otto III. Miniature.jpg",
                   "Keizer Otto III ontvangt de hulde van de rijksdelen — miniatuur uit het Evangeliarium van Otto III, ca. 1000"),
    "palts1047": ("File:Heinrich III. (HRR) Miniatur.jpg",
                  "Keizer Hendrik III, tegen wie hertog Godfried in opstand kwam — middeleeuwse miniatuur"),
    "stadsrechten": ("File:NijmegenCoatOfArms.jpg",
                     "Het wapen van Nijmegen met de dubbele Rijksadelaar — herinnering aan de status van vrije rijksstad"),
    "gelre": ("File:Penning met wapenschild Otto I van Gelre (1190).jpg",
              "Penning met het wapenschild van de graaf van Gelre — het huis waaraan Nijmegen in 1247 werd verpand"),
    "sintsteven": ("File:Sint Stevenstoren Nijmegen.JPG",
                   "De toren van de Sint-Stevenskerk, de middeleeuwse hoofdkerk van Nijmegen"),
    "hanze": ("File:0 Kamper Kogge - 1er juin 2013 à Dunkerque (1).JPG",
              "De Kamper Kogge, varende replica van een middeleeuwse Hanzekogge"),
    "pest1349": ("File:1349 burning of Jews-European chronicle on Black Death.jpg",
                 "Jodenvervolging tijdens de pest van 1349 — miniatuur uit een 14e-eeuwse kroniek (Koninklijke Bibliotheek van België)"),
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
    print(f"\n{len(credits)}/{len(IMAGES)} images -> data/images/medieval/  (captions in credits.json)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
