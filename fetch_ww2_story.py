#!/usr/bin/env python3
"""
Download freely-licensed media for the WW2 "Verhalen" story into data/stories/ww2/,
mirroring the image fetch scripts. One hero photo per narrative segment (photos/)
plus the public-domain Radio Oranje broadcast of 19 Sep 1944 (audio/).
Rerun:  python3 fetch_ww2_story.py

The mediaPath values in the RDF graph (backend ww2.ttl) point at the files written
here. Captions/licences are hand-mirrored into ww2.ttl per the project workflow.
"""
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"}

# Audio: slug (+ext) -> Commons File: title. WAV originals are huge, so we pull the
# .ogg transcode instead.
AUDIO = {
    ("audio/radio-oranje-19sep1944", "ogg"):
        "File:Radio Oranje 19-sep.-1944 REPORTAGE OVER BEVRIJDING EINDHOVEN, ARNHEM EN NIJMEGEN.wav",
}

# Photos: slug -> Commons File: title (one hero image per story segment).
PHOTOS = {
    "bezetting":     "File:Een Duitse Panzerkampfwagen IV tank rijdt door de Sint Annastraat 2000-1517-005.jpg",
    "deportatie":    "File:De met hakenkruisen besmeurde Nieuwe Synagoge, F67436.jpg",
    "bombardement":  "File:Bombardement Nijmegen - Fotodienst der NSB - NIOD - 211720.jpeg",
    "marketgarden":  "File:A fleet of Allied aircraft flies overhead as paratroopers of the Allied Airborne Command float groundward in the invasion of the Netherlands, still another step towards the liberation of Europe HD-SN-99-02724.jpg",
    "bruggenomen":   "File:Britse troepen passeren de brug bij Nijmegen, NG-2004-40-36.jpg",
    "frontstad":     "File:Een geallieerde verkeersregelaar op de hoek van de St. Annastraat en de Van Triestraat in Nijmegen. - FO 1300158 - RAA WO2.jpg",
    "bevrijding":    "File:Bevrijdingsfeesten met een wagenspel F65284.jpeg",
}


def imageinfo(title: str, thumbwidth: int | None = None):
    q = {"action": "query", "format": "json", "titles": title,
         "prop": "imageinfo", "iiprop": "url|mime"}
    if thumbwidth:
        q["iiurlwidth"] = str(thumbwidth)
    url = API + "?" + urllib.parse.urlencode(q)
    d = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read())
    return next(iter(d["query"]["pages"].values()))["imageinfo"][0]


def transcode_url(original: str, ext: str) -> str:
    name = original.rsplit("/", 1)[-1]
    return f'{original.replace("/commons/", "/commons/transcoded/")}/{name}.{ext}'


def fetch(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()


def main() -> int:
    root = Path(__file__).parent / "data" / "stories" / "ww2"
    ok = 0
    total = len(AUDIO) + len(PHOTOS)

    for (slug, ext), title in AUDIO.items():
        out = root / f"{slug}.{ext}"
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            orig = imageinfo(title)["url"]
            src = transcode_url(orig, ext) if not orig.lower().endswith("." + ext) else orig
            out.write_bytes(fetch(src))
            print(f"  {slug}.{ext}: {out.stat().st_size // 1024} kB")
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"  {slug}.{ext}: FAILED ({e})")

    for slug, title in PHOTOS.items():
        out = root / "photos" / f"{slug}.jpg"
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            ii = imageinfo(title, thumbwidth=1400)
            out.write_bytes(fetch(ii.get("thumburl", ii["url"])))
            print(f"  photos/{slug}.jpg: {out.stat().st_size // 1024} kB")
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"  photos/{slug}.jpg: FAILED ({e})")

    print(f"\n{ok}/{total} media -> data/stories/ww2/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
