"""
Story-media stage: download freely-licensed media for a "Verhalen" story into
data/stories/<story>/ — one hero photo per narrative segment (photos/) plus any
audio derivatives. The mediaPath values in the backend RDF graph point here.

Content type: StoryMedia. A catalog module declares a story's media, e.g.

    StoryMedia(
        story="ww2",
        photos={"bezetting": "File:... .jpg", ...},
        audio={("audio/radio-oranje", "ogg"): "File:... .wav"},
    )

Audio keys are (slug-with-subpath, ext): WAV/large originals are pulled as the
named transcode (.ogg) when the original isn't already that extension.
"""
from dataclasses import dataclass, field

from ..core import DATA, Stage, http_get, register_content, register_stage
from ..sources import commons


@dataclass
class StoryMedia:
    story: str
    photos: dict = field(default_factory=dict)   # slug -> Commons File: title
    audio: dict = field(default_factory=dict)     # (slug, ext) -> Commons File: title

    def __post_init__(self):
        register_content("stories", self)


def collect_story(sm: StoryMedia):
    root = DATA / "stories" / sm.story
    ok = 0
    total = len(sm.audio) + len(sm.photos)
    print(f"[stories:{sm.story}]")

    for (slug, ext), title in sm.audio.items():
        out = root / f"{slug}.{ext}"
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            orig = commons.imageinfo(title, iiprop="url|mime")["url"]
            src = orig if orig.lower().endswith("." + ext) else commons.transcode_url(orig, ext)
            out.write_bytes(http_get(src, timeout=180))
            print(f"  {slug}.{ext}: {out.stat().st_size // 1024} kB")
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"  {slug}.{ext}: FAILED ({e})")

    for slug, title in sm.photos.items():
        out = root / "photos" / f"{slug}.jpg"
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            ii = commons.imageinfo(title, thumbwidth=1400, iiprop="url|mime")
            out.write_bytes(http_get(ii.get("thumburl", ii["url"]), timeout=180))
            print(f"  photos/{slug}.jpg: {out.stat().st_size // 1024} kB")
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"  photos/{slug}.jpg: FAILED ({e})")

    print(f"  {ok}/{total} media -> data/stories/{sm.story}/")


@register_stage
class StoriesStage(Stage):
    name = "stories"
    help = "Verhalen story media -> data/stories/<story>/"

    def configure(self, parser):
        parser.add_argument("story", nargs="?",
                            help="one story (e.g. ww2); default all")

    def run(self, args):
        from ..core import content
        stories = content("stories")
        if getattr(args, "story", None):
            stories = [s for s in stories if s.story == args.story]
            if not stories:
                raise SystemExit(f"unknown story: {args.story}")
        for s in stories:
            collect_story(s)
