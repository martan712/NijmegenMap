"""Repo-root path anchoring. Frontend artifacts are written under public/
(data/, maps/, tiles/, maps.json) so Vite serves them at the site root with no
copying or symlinks; the backend graph lives under backend/. Paths are always
resolved from the repo root, never a module's own location, so stages can live
anywhere in the package."""
from pathlib import Path

# datacollect/core/paths.py -> core/ -> datacollect/ -> repo root
ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"          # Vite static root (served at site root)
DATA = PUBLIC / "data"
BACKEND_GRAPH = ROOT / "backend/src/main/resources/graph"
