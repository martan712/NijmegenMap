"""
Graph stage: build the instance ontology from the declarative catalog and emit
Turtle into the backend graph (places.ttl, sources.ttl, overlays.ttl and one
file per chapter). This is the step that turns the Python single-source-of-truth
into the RDF the Java backend loads.

Block text that comes from a fetched dataset (the CHW_VESTINGWERKEN TOELICHTING,
via Toelichting()) is resolved here from the geojson the `vectors` stage wrote,
so no upstream prose is ever copied into the codebase. Source labels prefer the
fetched credit line in data/images/credits.json when present.

ontology.ttl (the schema) and stolpersteine.ttl (its own stage) are not touched.
"""
import json

from ..core import BACKEND_GRAPH, DATA, Stage, register_stage
from ..graph import emit, model


def _resolve_fetched(geocache):
    """Fill block.text for every Toelichting()/fetched block from its geojson."""
    for ch in model.CHAPTERS:
        for th in ch.threads:
            for sg in th.segments:
                for b in sg.blocks:
                    if not b.fetch:
                        continue
                    fname, match_k, key, text_k = b.fetch
                    feats = geocache.get(fname)
                    if feats is None:
                        path = DATA / fname
                        if not path.exists():
                            raise SystemExit(
                                f"{path} not found — run the 'vectors' stage first "
                                f"(needed for fetched text in {ch.filename}).")
                        feats = json.loads(path.read_text())["features"]
                        geocache[fname] = feats
                    hit = next((f for f in feats
                                if f["properties"].get(match_k) == key), None)
                    if hit is None:
                        raise SystemExit(
                            f"{fname}: no feature with {match_k}={key!r} "
                            f"(needed by {ch.filename})")
                    b.text = hit["properties"][text_k]


@register_stage
class GraphStage(Stage):
    name = "graph"
    help = "build instance ontology TTL from the catalog -> backend graph"

    def run(self, args):
        _resolve_fetched({})

        credits = {}
        cpath = DATA / "images" / "credits.json"
        if cpath.exists():
            credits = json.loads(cpath.read_text())

        BACKEND_GRAPH.mkdir(parents=True, exist_ok=True)
        outputs = {
            "places.ttl": emit.places_ttl(),
            "sources.ttl": emit.sources_ttl(credits),
            "overlays.ttl": emit.overlays_ttl(),
        }
        for ch in model.CHAPTERS:
            outputs[ch.filename] = emit.chapter_ttl(ch)

        for name, text in outputs.items():
            (BACKEND_GRAPH / name).write_text(text, encoding="utf-8")
            print(f"  wrote {name} ({text.count(chr(10))} lines)")

        print(f"  {len(model.PLACES)} places · {len(model.SOURCES)} sources · "
              f"{len(model.OVERLAYS)} overlays · {len(model.CHAPTERS)} chapters "
              f"({'with' if credits else 'no'} fetched credits)")
