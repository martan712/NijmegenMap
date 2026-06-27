"""
Shared base for the raster pipeline (maps / tiles / finalize): output paths, the
manifest, tuning constants, and the TimelineEntry content type.

Content type: TimelineEntry — one map stop per year. A catalog module declares
the timeline; comma-joined `layers` are composited by the WMS, and `src` selects
the endpoint ("H" historie, "L" luchtfoto).

    TimelineEntry(1944, "Nijmegen1950oorlogsschade.ecw", "map", "Oorlogsschade", "1944 ⚠")
    TimelineEntry(2025, "Luchtfoto2025_mosaic.ecw", "aerial", "21e eeuw", src="L")
"""
import json
import os
from dataclasses import dataclass
from typing import Optional

from ...core import PUBLIC, register_content
from ...sources import wms

OUT_DIR = PUBLIC / "maps"
MANIFEST = PUBLIC / "maps.json"
TILE_DIR = PUBLIC / "tiles"

# maps stage
MAX_EDGE = 3000          # server hard cap is "< 4000"
WEBP_QUALITY = 82

# tiles stage
MINZOOM = 12
MAXZOOM = {"map": 17, "aerial": 17}
# Maps whose scans hold no real detail beyond z16 (from the resolution probe).
NATIVE_MAXZOOM = {1820: 16, 1850: 16, 1885: 16, 1894: 16}
OLD_MAXZOOM = {"map": 15, "aerial": 17}      # previous scheme, for migrating markers
LEGACY_MAXZOOM = {"map": 15, "aerial": 17}   # finalize: legacy whole-layer .done
META = 12                # metatile = META×META tiles → 3072px request (< 4000 cap)
WORKERS = int(os.environ.get("NIJ_WORKERS", "6"))
TILE_QUALITY = 80
TILE = 256


@dataclass
class TimelineEntry:
    year: int
    layers: str          # comma-joined WMS layer names
    kind: str            # "map" | "aerial"
    era: str
    label: Optional[str] = None
    src: str = "H"       # WMS endpoint key

    def __post_init__(self):
        register_content("timeline", self)

    @property
    def endpoint(self):
        return wms.ENDPOINTS[self.src]

    def maxzoom(self):
        return NATIVE_MAXZOOM.get(self.year, MAXZOOM[self.kind])


def read_manifest():
    return json.loads(MANIFEST.read_text())


def write_manifest(manifest, *, ensure_ascii=True):
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=ensure_ascii))
