#!/usr/bin/env python3
"""
Download freely-licensed illustrations for the prehistory scenes (Chapter 1,
"Bataven & Romeinen") from Wikimedia Commons into data/prehistorie/, and record
their attribution.

Each scene pin in src/config/chapters.ts references data/prehistorie/<slug>.jpg
and shows the caption below. Rerun to refresh:
    python3 fetch_prehistorie_images.py

Mirrors fetch_roman_images.py — shared pattern.
"""
import html as H
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent / "data" / "prehistorie"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"}

# slug -> (Commons File: title, Dutch descriptive caption prefix)
IMAGES = {
    "grafheuvel": ("File:Overzicht op een van de grootste grafheuvels uit de Bronstijd van Nederland, doorsnede ruim 40 m - Hoogeloon - 20528497 - RCE.jpg",
                   "Een grote grafheuvel uit de bronstijd (Hoogeloon, RCE); zulke heuvels en urnenvelden liggen ook in Nijmegen-Oost"),
    "bataven": ("File:Wekerom ijzertijdboerderij-Syborgh2012.jpg",
                "Reconstructie van een ijzertijdboerderij te Wekerom (Gelderland), zoals de vroege Bataven die bewoonden"),
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
    print(f"\n{len(credits)}/{len(IMAGES)} images -> data/prehistorie/  (captions in credits.json)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
