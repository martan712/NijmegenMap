"""Wikidata Query Service (WDQS) client: run a SPARQL SELECT and get back plain
rows. This is the reusable engine behind any catalog set that pulls structured
facts from Wikidata.

A sibling linked-data source (RCE, RAN) calls
``select(sparql, endpoint=…, entity_prefix=…)`` — same client shape, different
endpoint/namespace. The default ``endpoint`` and ``entity_prefix`` preserve the
existing Wikidata behaviour for all current callers.

The project already links its entities to Wikidata via owl:sameAs (wd:Q…), so a
SELECT here speaks the same vocabulary: bind ?item to a wd: entity and the stage
mints both a local IRI and the owl:sameAs back-link from it.
"""
import urllib.parse

from ..core import http_json

ENDPOINT = "https://query.wikidata.org/sparql"
ENTITY = "http://www.wikidata.org/entity/"


def _value(binding, entity_prefix=ENTITY):
    """A binding's plain value; entity URIs are shortened by stripping entity_prefix."""
    v = binding["value"]
    if binding["type"] == "uri" and v.startswith(entity_prefix):
        return v[len(entity_prefix):]
    return v


def select(sparql, *, timeout=90, endpoint=ENDPOINT, entity_prefix=ENTITY):
    """Run a SPARQL SELECT against endpoint; return a list of {var: value} dicts.

    Only bound variables appear in a given row (OPTIONALs may be absent), so
    callers should use row.get(var). The WDQS server caps a query at ~60s; keep
    queries scoped (e.g. located-in a Nijmegen Q-id) and add a LIMIT.

    Pass ``endpoint`` and ``entity_prefix`` to query a sibling linked-data
    source (RCE, RAN) with the same client interface."""
    url = endpoint + "?" + urllib.parse.urlencode({"query": sparql, "format": "json"})
    # tries>1 engages the HTTP layer's 429/Retry-After backoff (WDQS aggressively
    # rate-limits to ~1 req/min during outages); each retry waits out that window.
    data = http_json(url, timeout=timeout, tries=8, retry_delay=5,
                     headers={"Accept": "application/sparql-results+json"})
    return [{k: _value(v, entity_prefix) for k, v in row.items()}
            for row in data["results"]["bindings"]]
