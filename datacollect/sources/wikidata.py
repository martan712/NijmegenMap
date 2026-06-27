"""Wikidata Query Service (WDQS) client: run a SPARQL SELECT and get back plain
rows. This is the reusable engine behind any catalog set that pulls structured
facts from Wikidata; future linked-data sources (RCE, RAN) are sibling clients
with the same shape but a different endpoint.

The project already links its entities to Wikidata via owl:sameAs (wd:Q…), so a
SELECT here speaks the same vocabulary: bind ?item to a wd: entity and the stage
mints both a local IRI and the owl:sameAs back-link from it.
"""
import urllib.parse

from ..core import http_json

ENDPOINT = "https://query.wikidata.org/sparql"
ENTITY = "http://www.wikidata.org/entity/"


def _value(binding):
    """A binding's plain value; wd: entity URIs are shortened to their Q-id."""
    v = binding["value"]
    if binding["type"] == "uri" and v.startswith(ENTITY):
        return v[len(ENTITY):]
    return v


def select(sparql, *, timeout=90):
    """Run a SPARQL SELECT against WDQS; return a list of {var: value} dicts.

    Only bound variables appear in a given row (OPTIONALs may be absent), so
    callers should use row.get(var). The WDQS server caps a query at ~60s; keep
    queries scoped (e.g. located-in a Nijmegen Q-id) and add a LIMIT."""
    url = ENDPOINT + "?" + urllib.parse.urlencode({"query": sparql, "format": "json"})
    data = http_json(url, timeout=timeout,
                     headers={"Accept": "application/sparql-results+json"})
    return [{k: _value(v) for k, v in row.items()}
            for row in data["results"]["bindings"]]
