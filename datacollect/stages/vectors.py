"""
Vector stage: download Gemeente Nijmegen WFS layers as GeoJSON into data/.

Content type: VectorLayer. A catalog module declares a layer, e.g.

    VectorLayer("extern_Historie", "HIS_STADSMUUR", "stadsmuur.geojson")
"""
import json
from dataclasses import dataclass

from ..core import DATA, Stage, register_content, register_stage
from ..sources import wfs


@dataclass
class VectorLayer:
    service: str    # GeoServer service / workspace
    layer: str      # typeName
    filename: str   # output under data/

    def __post_init__(self):
        register_content("vectors", self)


@register_stage
class VectorsStage(Stage):
    name = "vectors"
    help = "WFS GeoJSON layers -> data/*.geojson"

    def run(self, args):
        from ..core import content
        DATA.mkdir(exist_ok=True)
        for v in content("vectors"):
            gj = wfs.get_feature(v.service, v.layer)
            (DATA / v.filename).write_text(json.dumps(gj, ensure_ascii=False))
            print(f"  {v.layer}: {len(gj['features'])} features -> data/{v.filename}")
