"""
finalize stage: reconcile maps.json with the tile pyramid actually on disk —
enable local tiles for every layer that has them, set each layer's real max zoom
(from the per-zoom .z{z}.done markers, or the legacy whole-layer .done), and
keep the 1783 draw order flipped. Safe to re-run anytime.
"""
from pathlib import Path

from ...core import Stage, register_stage
from .base import LEGACY_MAXZOOM, MINZOOM, TILE_DIR, read_manifest, write_manifest


def _maxzoom_on_disk(key, kind):
    kd = TILE_DIR / key
    if (kd / f".z{MINZOOM}.done").exists():   # per-zoom markers: highest contiguous
        mz = MINZOOM
        while (kd / f".z{mz + 1}.done").exists():
            mz += 1
        return mz
    if (kd / ".done").exists():               # legacy whole-layer marker
        return LEGACY_MAXZOOM[kind]
    return None                               # not tiled yet -> fall back to image


@register_stage
class FinalizeStage(Stage):
    name = "finalize"
    help = "reconcile maps.json with tiles on disk"

    def run(self, args):
        m = read_manifest()
        enabled, pending = 0, []
        for e in m:
            key = Path(e["file"]).stem
            mz = _maxzoom_on_disk(key, e["type"])
            if mz is not None:
                e["tiles"] = f"tiles/{key}/{{z}}/{{x}}/{{y}}.webp"
                e["minzoom"] = MINZOOM
                e["maxzoom"] = mz
                enabled += 1
            else:
                for k in ("tiles", "minzoom", "maxzoom"):
                    e.pop(k, None)
                pending.append(e["year"])
            if e["year"] == 1783:
                e["layers"] = "1783_noord.tif,1783.ecw"   # flipped draw order

        write_manifest(m, ensure_ascii=False)
        print(f"  tiles enabled: {enabled}/{len(m)} | still on fallback image: {pending}")
        print("  map maxzooms:",
              {e["year"]: e.get("maxzoom") for e in m if e["type"] == "map"})
