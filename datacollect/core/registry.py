"""
The wiring that keeps logic and content decoupled.

Two registries:

* **Stages** — the verbs (the collection logic). A Stage is one CLI subcommand.
  Define a Stage subclass, decorate it with @register_stage, and it appears in
  the CLI automatically (auto-discovered from the `stages` package).

* **Content** — the nouns (declarative datasets: image sets, vector layers,
  timeline entries, story media). A catalog module registers an item under a
  `kind`; the matching stage reads `content(kind)` at run time. Adding an item
  is a local change in `catalog/`; no stage code changes.
"""
from collections import defaultdict

STAGES = {}                       # name -> Stage instance
_CONTENT = defaultdict(list)      # kind -> [item, ...]


class Stage:
    """A unit of collection work, surfaced as one CLI subcommand."""
    name = ""        # CLI subcommand name (required)
    help = ""        # one-line help

    def configure(self, parser):
        """Optionally add argparse arguments for this stage."""

    def run(self, args):
        raise NotImplementedError


def register_stage(cls):
    """Class decorator: instantiate and register a Stage by its .name."""
    stage = cls()
    if not stage.name:
        raise ValueError(f"{cls.__name__}.name is empty")
    if stage.name in STAGES:
        raise ValueError(f"duplicate stage name: {stage.name!r}")
    STAGES[stage.name] = stage
    return cls


def register_content(kind, item):
    """Register a declarative dataset under `kind`; returns it for convenience."""
    _CONTENT[kind].append(item)
    return item


def content(kind):
    """All registered items of a kind, in registration order."""
    return list(_CONTENT[kind])
