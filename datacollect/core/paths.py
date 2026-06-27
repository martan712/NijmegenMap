"""Repo-root path anchoring. Every artifact is written relative to the repo
root (data/, maps/, tiles/, maps.json, backend/.../graph/), never relative to a
module's own location, so stages can live anywhere in the package."""
from pathlib import Path

# datacollect/core/paths.py -> core/ -> datacollect/ -> repo root
ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
BACKEND_GRAPH = ROOT / "backend/src/main/resources/graph"
