"""
Media stage: assemble one flat media pool — data/images/<slug>.<ext> for
photographs, data/audio/<slug>.<ext> for recordings — and record the full credit
line per slug in data/images/credits.json (the graph stage uses those as source
labels).

Local-first: a source already present (in the flat pool, or in the pre-flat
layout: data/images/<set>/<slug> or data/stories/.../<slug>) is REUSED — copied
into place, never re-downloaded. Only genuinely-missing media is fetched from
Commons (throttled, with back-off). A Source with `path=` (the curated Korfmacher
drawings) is produced by another stage and skipped here. Idempotent.
"""
import json
import shutil
import time

from ..core import DATA, PUBLIC, Stage, http_get, register_stage
from ..graph import model
from ..sources import commons

THUMB = 1200   # px width for fetched image thumbnails (originals for non-jpg)

# Pre-flat locations for the few slugs that were renamed in the flatten, relative
# to data/. Same-slug sources are found by globbing data/images/<set>/<slug>.
RENAMED = {
    "venlo": "images/earlymodern/venlo1543.jpg",
    "maurits": "images/earlymodern/maurits1591.jpg",
    "vrede": "images/earlymodern/vrede1678.jpg",
    "franse": "images/earlymodern/franse1794.jpg",
    "waaloversteek": "images/ww2/waaloversteek.jpg",
    "bezetting": "stories/ww2/photos/bezetting.jpg",
    "deportatie": "stories/ww2/photos/deportatie.jpg",
    "bombardement": "stories/ww2/photos/bombardement.jpg",
    "marketgarden": "stories/ww2/photos/marketgarden.jpg",
    "bruggenomen": "stories/ww2/photos/bruggenomen.jpg",
    "frontstad": "stories/ww2/photos/frontstad.jpg",
    "bevrijding": "stories/ww2/photos/bevrijding.jpg",
    "radio_oranje": "stories/ww2/audio/radio-oranje-19sep1944.ogg",
}


def _local_source(s):
    """An existing on-disk file for this source (pre-flat layout), or None."""
    if s.slug in RENAMED:
        p = DATA / RENAMED[s.slug]
        return p if p.exists() else None
    return next((DATA / "images").glob(f"*/{s.slug}.{s.ext}"), None)


def _old_credits():
    """Merge every pre-flat per-set credits.json -> {old_slug: credit line}."""
    out = {}
    for c in (DATA / "images").glob("*/credits.json"):
        try:
            out.update(json.loads(c.read_text()))
        except Exception:  # noqa: BLE001
            pass
    return out


def _imageinfo(s, **kw):
    """commons.imageinfo with a little back-off (Commons 429s on bursts)."""
    for attempt in range(4):
        try:
            return commons.imageinfo(s.commons, **kw)
        except Exception:  # noqa: BLE001
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))


def _download_image(s):
    ii = _imageinfo(s, thumbwidth=THUMB, iiprop="url|extmetadata")
    artist, lic = commons.attribution(ii)
    src = ii["thumburl"] if s.ext == "jpg" else ii["url"]
    data = http_get(src, timeout=120, tries=3, retry_delay=3)
    (PUBLIC / s.media_path).write_bytes(data)
    tail = ", ".join(p for p in (artist, lic) if p)
    return len(data), (f"{s.caption} — {tail} (Wikimedia Commons)" if tail else s.caption)


def _download_audio(s):
    orig = _imageinfo(s, iiprop="url|mime")["url"]
    want = s.transcode or s.ext
    url = orig if orig.lower().endswith("." + want) else commons.transcode_url(orig, want)
    data = http_get(url, timeout=180, tries=3, retry_delay=3)
    (PUBLIC / s.media_path).write_bytes(data)
    return len(data), s.caption


@register_stage
class MediaStage(Stage):
    name = "media"
    help = "assemble flat media pool (reuse local, fetch missing) -> data/images|audio"

    def configure(self, parser):
        parser.add_argument("slug", nargs="?", help="one source slug; default all")
        parser.add_argument("--refetch", action="store_true",
                            help="ignore local copies and re-download from Commons")

    def run(self, args):
        wanted = [s for s in model.SOURCES.values() if s.commons]
        if getattr(args, "slug", None):
            wanted = [s for s in wanted if s.slug == args.slug]
            if not wanted:
                raise SystemExit(f"unknown source slug: {args.slug}")

        cpath = DATA / "images" / "credits.json"
        credits = json.loads(cpath.read_text()) if cpath.exists() else {}
        old = _old_credits()

        reused = fetched = 0
        for s in wanted:
            out = PUBLIC / s.media_path
            out.parent.mkdir(parents=True, exist_ok=True)

            # 1. already flat -> keep (just make sure it has a credit line)
            if out.exists() and not args.refetch:
                credits.setdefault(s.slug, old.get(s.slug, s.caption))
                continue

            # 2. reuse a pre-flat local copy
            local = None if args.refetch else _local_source(s)
            if local is not None:
                shutil.copyfile(local, out)
                credits[s.slug] = old.get(local.stem, s.caption)
                print(f"  {s.slug}: reused {local.relative_to(PUBLIC)}")
                reused += 1
                continue

            # 3. fetch from Commons (throttled)
            try:
                dl = _download_audio if s.kind == "AudioRecording" else _download_image
                size, credit = dl(s)
                credits[s.slug] = credit
                print(f"  {s.slug}: fetched {size // 1024} kB -> {s.media_path}")
                fetched += 1
                time.sleep(1.0)
            except Exception as e:  # noqa: BLE001
                print(f"  {s.slug}: FAILED ({e})")

        cpath.parent.mkdir(parents=True, exist_ok=True)
        cpath.write_text(json.dumps(credits, ensure_ascii=False, indent=2))
        print(f"  {reused} reused · {fetched} fetched · {len(credits)} credits "
              f"-> data/images|audio/ + credits.json")
