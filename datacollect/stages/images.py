"""
Image-set stage: download freely-licensed scene illustrations from Wikimedia
Commons into data/images/<set>/, recording attribution in <set>/credits.json.

Content type: ImageSet. A catalog module declares a set, e.g.

    ImageSet("roman", {
        "hunerberg": ("File:Batavorum.JPG", "Maquette ... Museum Het Valkhof"),
        "mariken":   ("File:Mariken.gif",   "Titelpagina ...", "gif"),
    })

Each value is (Commons File: title, Dutch caption prefix[, ext]). `ext` defaults
to "jpg" (fetched as a 900px thumbnail); give a real extension for non-JPG
originals, which are fetched as the full original file instead.
"""
import json
from dataclasses import dataclass

from ..core import DATA, Stage, http_get, register_content, register_stage
from ..sources import commons


@dataclass
class ImageSet:
    name: str
    images: dict   # slug -> (title, caption_prefix[, ext])

    def __post_init__(self):
        register_content("images", self)


def collect_set(s: ImageSet):
    out = DATA / "images" / s.name
    out.mkdir(parents=True, exist_ok=True)
    credits = {}
    print(f"[images:{s.name}]")
    for slug, spec in s.images.items():
        title, prefix = spec[0], spec[1]
        ext = spec[2] if len(spec) > 2 else "jpg"
        try:
            ii = commons.imageinfo(title, thumbwidth=900)
            artist, lic = commons.attribution(ii)
            # JPG scenes use the 900px thumbnail; other types keep the original file.
            src = ii["thumburl"] if ext == "jpg" else ii["url"]
            data = http_get(src, timeout=60)
            (out / f"{slug}.{ext}").write_bytes(data)
            tail = ", ".join(p for p in (artist, lic) if p)
            credits[slug] = f"{prefix} — {tail} (Wikimedia Commons)"
            print(f"  {slug}: {len(data)//1024} kB | {tail}")
        except Exception as e:  # noqa: BLE001
            print(f"  {slug}: FAILED ({e})")
    (out / "credits.json").write_text(json.dumps(credits, ensure_ascii=False, indent=2))
    print(f"  {len(credits)}/{len(s.images)} images -> data/images/{s.name}/")


@register_stage
class ImagesStage(Stage):
    name = "images"
    help = "scene illustrations from Wikimedia Commons -> data/images/<set>/"

    def configure(self, parser):
        parser.add_argument("set", nargs="?",
                            help="one image set (e.g. roman); default all")

    def run(self, args):
        from ..core import content
        sets = content("images")
        if getattr(args, "set", None):
            sets = [s for s in sets if s.name == args.set]
            if not sets:
                raise SystemExit(f"unknown image set: {args.set}")
        for s in sets:
            collect_set(s)
