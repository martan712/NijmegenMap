#!/usr/bin/env python3
"""
Reconcile maps.json with the tile pyramid actually on disk: enable local tiles
for every layer that has them, set each layer's real max zoom (read from the
per-zoom .z{z}.done markers, or the legacy whole-layer .done), and keep the
1783 draw order flipped. Safe to re-run anytime (e.g. after more tiles finish).

Run:  python3 finalize.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
TILE_DIR = ROOT / "tiles"
MANIFEST = ROOT / "maps.json"
LEGACY_MAXZOOM = {"map": 15, "aerial": 17}   # old whole-layer .done scheme


def maxzoom_on_disk(key, kind):
    kd = TILE_DIR / key
    if (kd / ".z12.done").exists():          # per-zoom markers: highest contiguous
        mz = 12
        while (kd / f".z{mz + 1}.done").exists():
            mz += 1
        return mz
    if (kd / ".done").exists():              # legacy whole-layer marker
        return LEGACY_MAXZOOM[kind]
    return None                              # not tiled yet -> fall back to image


def main():
    m = json.loads(MANIFEST.read_text())
    enabled, pending = 0, []
    for e in m:
        key = Path(e["file"]).stem
        mz = maxzoom_on_disk(key, e["type"])
        if mz is not None:
            e["tiles"] = f"tiles/{key}/{{z}}/{{x}}/{{y}}.webp"
            e["minzoom"] = 12
            e["maxzoom"] = mz
            enabled += 1
        else:
            for k in ("tiles", "minzoom", "maxzoom"):
                e.pop(k, None)
            pending.append(e["year"])
        if e["year"] == 1783:
            e["layers"] = "1783_noord.tif,1783.ecw"   # flipped draw order

    MANIFEST.write_text(json.dumps(m, indent=2, ensure_ascii=False))
    print(f"tiles enabled: {enabled}/{len(m)} | still on fallback image: {pending}")
    print("map maxzooms:", {e["year"]: e.get("maxzoom") for e in m if e["type"] == "map"})


if __name__ == "__main__":
    sys.exit(main())
