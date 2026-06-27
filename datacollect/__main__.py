"""
CLI for the data-collection stages. The subcommands are built from the stage
registry — every @register_stage stage and every catalog item is auto-discovered
on startup, so this file never needs editing to add a source or dataset.

  python -m datacollect <stage> [args]   run one stage
  python -m datacollect fetch            every source fetch, minus the raster pipeline
  python -m datacollect all              every stage, in dependency order
  python -m datacollect list             list discovered stages and content

Stages (discovered): media, vectors, korfmacher, stolpersteine, wikidata,
graph, maps, tiles, finalize. The raster stages (maps/tiles/finalize) need
Pillow + numpy; the fetch stages do not. Re-running any stage is safe.

The instance ontology is built by the `graph` stage from the declarative catalog
(catalog/places.py, sources.py, overlays.py, chapters/*.py); it runs after the
fetches so it can fold in fetched credits + the gemeente TOELICHTING text.
"""
import argparse
import sys
import time

from . import catalog, graph, stages
from .core import STAGES, content, import_submodules
from .graph import model

# Group commands: ordered sequences of stage names. graph runs last so it can
# fold in credits.json (media) and vestingwerken.geojson (vectors).
GROUPS = {
    "fetch": ["media", "vectors", "korfmacher", "stolpersteine", "wikidata",
              "graph"],
    "all": ["media", "vectors", "korfmacher", "stolpersteine", "wikidata",
            "graph", "maps", "tiles", "finalize"],
}


def _discover():
    import_submodules(stages)    # registers stages
    import_submodules(catalog)   # registers declarative content (model registries)
    _ = graph                    # ensure the graph package is importable


def _run_stage(stage, args):
    print(f"\n=== {stage.name} ===")
    t0 = time.time()
    stage.run(args)
    print(f"--- {stage.name} done in {time.time()-t0:.0f}s ---")


def _cmd_list(_args):
    print("Stages:")
    for name, stage in STAGES.items():
        print(f"  {name:<14} {stage.help}")
    print("\nCatalog (graph model):")
    print(f"  {'places':<14} {len(model.PLACES)} item(s)")
    print(f"  {'sources':<14} {len(model.SOURCES)} item(s)")
    print(f"  {'overlays':<14} {len(model.OVERLAYS)} item(s)")
    print(f"  {'chapters':<14} {len(model.CHAPTERS)} item(s): "
          + ", ".join(c.story.slug for c in model.CHAPTERS))
    print("\nContent (geo / raster):")
    for kind in ("vectors", "timeline"):
        items = content(kind)
        names = ", ".join(getattr(i, "name", "") for i in items if hasattr(i, "name"))
        print(f"  {kind:<14} {len(items)} item(s)" + (f": {names}" if names else ""))


def main(argv=None):
    _discover()

    p = argparse.ArgumentParser(prog="datacollect", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="command", required=True)

    for name, stage in STAGES.items():
        sp = sub.add_parser(name, help=stage.help)
        stage.configure(sp)
        sp.set_defaults(_stage=stage)

    for group in GROUPS:
        sub.add_parser(group, help=f"run stages: {', '.join(GROUPS[group])}")
    sub.add_parser("list", help="list discovered stages and content")

    args = p.parse_args(argv)

    if args.command == "list":
        _cmd_list(args)
    elif args.command in GROUPS:
        for name in GROUPS[args.command]:
            _run_stage(STAGES[name], args)
    else:
        _run_stage(args._stage, args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
