"""
CLI for the data-collection stages. The subcommands are built from the stage
registry — every @register_stage stage and every catalog item is auto-discovered
on startup, so this file never needs editing to add a source or dataset.

  python -m datacollect <stage> [args]   run one stage
  python -m datacollect fetch            every source fetch, minus the raster pipeline
  python -m datacollect all              every stage, in dependency order
  python -m datacollect list             list discovered stages and content

Stages (discovered): images, vectors, korfmacher, stories, stolpersteine,
maps, tiles, finalize. The raster stages (maps/tiles/finalize) need Pillow +
numpy; the fetch stages do not. Re-running any stage is safe.
"""
import argparse
import sys
import time

from . import catalog, stages
from .core import STAGES, content, import_submodules

# Group commands: ordered sequences of stage names (korfmacher after vectors;
# tiles after maps; finalize after tiles).
GROUPS = {
    "fetch": ["images", "vectors", "korfmacher", "stories", "stolpersteine"],
    "all": ["images", "vectors", "korfmacher", "stories", "stolpersteine",
            "maps", "tiles", "finalize"],
}


def _discover():
    import_submodules(stages)    # registers stages + content dataclasses
    import_submodules(catalog)   # registers declarative content


def _run_stage(stage, args):
    print(f"\n=== {stage.name} ===")
    t0 = time.time()
    stage.run(args)
    print(f"--- {stage.name} done in {time.time()-t0:.0f}s ---")


def _cmd_list(_args):
    print("Stages:")
    for name, stage in STAGES.items():
        print(f"  {name:<14} {stage.help}")
    print("\nContent:")
    for kind in ("images", "vectors", "stories", "timeline"):
        items = content(kind)
        names = ", ".join(getattr(i, "name", getattr(i, "story", "")) for i in items
                          if hasattr(i, "name") or hasattr(i, "story"))
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
