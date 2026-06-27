"""Core layer: shared plumbing (paths, HTTP, text) and the stage/content
registries. Re-exported here so the rest of the package imports from one place."""
from .discover import import_submodules
from .http import http_get, http_json
from .paths import BACKEND_GRAPH, DATA, ROOT
from .registry import (STAGES, Stage, content, register_content,
                       register_stage)
from .text import clean_html

__all__ = [
    "ROOT", "DATA", "BACKEND_GRAPH",
    "http_get", "http_json", "clean_html",
    "Stage", "register_stage", "register_content", "content", "STAGES",
    "import_submodules",
]
