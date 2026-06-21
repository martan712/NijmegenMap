#!/usr/bin/env python3
"""
Download freely-licensed illustrations for the Roman / early-medieval scenes
from Wikimedia Commons into data/roman/, and record their attribution.

Each scene pin in src/config/chapters.ts references data/roman/<slug>.jpg and
shows the caption below (which already embeds the author + licence). Rerun to
refresh:  python3 fetch_roman_images.py
"""
import html as H
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent / "data" / "roman"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"}

# slug -> (Commons File: title, Dutch descriptive caption prefix)
IMAGES = {
    "hunerberg": ("File:Batavorum.JPG",
                  "Maquette van de Romeinse legioensvesting (castra) op de Hunerberg — Museum Het Valkhof"),
    "kops": ("File:Cavalry Face-Mask Helmet, found at Noviomagus (Kops Plateau), Museum het Valkhof, Nijmegen (Netherlands) (9569892914).jpg",
             "Romeinse ruiterhelm met gezichtsmasker, gevonden op het Kops Plateau, Museum Het Valkhof"),
    "oppidum": ("File:Valkhof in Nijmegen, RP-P-1907-5769.jpg",
                "Het Valkhof, waar Oppidum Batavorum lag — prent, Rijksmuseum"),
    "civilis": ("File:The Conspiracy of Claudius Civilis by Rembrandt van Rijn.jpg",
                "De samenzwering van Claudius Civilis met de Bataven — Rembrandt, 1661–62"),
    "ulpia": ("File:Painting Roman 'Ulpia Noviomagus' by Peter Nuyten, Kelfkensbos Nijmegen.jpg",
              "Reconstructie van Ulpia Noviomagus — muurschildering Peter Nuyten"),
    "castellum": ("File:Tekening van zogenaamde Romeinse kapel, 1728 - Nijmegen - 20407404 - RCE.jpg",
                  "Het Valkhof met de 'Romeinse kapel', tekening uit 1728"),
    "franken": ("File:Grafurn, opgegraven bij de Karolingische kapel - Nijmegen - 20167093 - RCE.jpg",
                "Grafurn, opgegraven bij de kapel op het Valkhof"),
    "palts": ("File:Sint-Nicolaaskapel (gerestaureerd), zuidzijde - Nijmegen - 20167064 - RCE.jpg",
              "De Sint-Nicolaaskapel (Karolingische kapel) op het Valkhof"),
    "barbarossa": ("File:Gezicht op het Valkhof en de Sint Maartenskapel of Barbarossa-ruïne te Nijmegen, 1670, RP-P-2019-1628.jpg",
                   "Het Valkhof met de Barbarossa-ruïne, prent uit 1670"),
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
    print(f"\n{len(credits)}/{len(IMAGES)} images -> data/roman/  (captions in credits.json)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
