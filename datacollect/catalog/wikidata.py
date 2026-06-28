"""Wikidata SPARQL catalog: one WikidataSet per query. Each set's SELECT must
bind ?item (a wd: entity) and ?itemLabel; it may bind ?lat/?long (clean decimals
via the psv:P625 value node), ?image (a P18 Special:FilePath URL), and any vars
referenced by the set's `extra` spec. Queries GROUP BY ?item so each entity is
one row; multi-valued attributes are GROUP_CONCAT'd with the ";;" separator (and
"QID|Label" pairs for linked entities) and unpacked into triples by the stage.

Add a set by appending one WikidataSet — the wikidata stage emits it to
wikidata.ttl. Nijmegen on Wikidata is split between the municipality (Q47887) and
the city (Q13188714); P131 statements point at either, so the queries match both.
"""
from ..stages.wikidata import WikidataSet

# Heritage-listed places in Nijmegen (rijksmonument / gemeentelijk monument, via
# P1435 "heritage designation"), geocoded and enriched. Spans every chapter — the
# Valkhof, churches, fortification works, the bridge kazematten, interbellum
# villas. Enrichment per entity: construction year + renovation years (P571),
# architect(s) (P84, linked), architectural style (P149), Wikidata type (P31, for
# per-chapter filtering) and the rijksmonument register number (P359).
WikidataSet(
    key="rijksmonument",
    label="heritage-listed places in Nijmegen",
    cls="Place",
    extra=(
        ("years", "years", "nmg:inception", "nmg:renovation"),
        ("architect", "links", "nmg:architect"),
        ("style", "litset", "nmg:style"),
        ("category", "litset", "nmg:category"),
        ("monumentId", "lit", "nmg:monumentId"),
    ),
    query="""
SELECT ?item ?itemLabel (SAMPLE(?lat) AS ?lat) (SAMPLE(?long) AS ?long)
       (SAMPLE(?image) AS ?image)
       (GROUP_CONCAT(DISTINCT STR(?yr); SEPARATOR=";;") AS ?years)
       (GROUP_CONCAT(DISTINCT CONCAT(REPLACE(STR(?arch), "^.*/", ""), "|", ?archLabel); SEPARATOR=";;") AS ?architect)
       (GROUP_CONCAT(DISTINCT ?styleLabel; SEPARATOR=";;") AS ?style)
       (GROUP_CONCAT(DISTINCT ?typeLabel; SEPARATOR=";;") AS ?category)
       (SAMPLE(?mid) AS ?monumentId)
WHERE {
  VALUES ?city { wd:Q47887 wd:Q13188714 }
  ?item wdt:P131 ?city ; wdt:P1435 ?status .
  ?item p:P625/psv:P625 ?node .
  ?node wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?long .
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item wdt:P571 ?inc . BIND(YEAR(?inc) AS ?yr) }
  OPTIONAL { ?item wdt:P84 ?arch . ?arch rdfs:label ?archLabel . FILTER(LANG(?archLabel) = "nl") }
  OPTIONAL { ?item wdt:P149 ?sty . ?sty rdfs:label ?styleLabel . FILTER(LANG(?styleLabel) = "nl") }
  OPTIONAL { ?item wdt:P31 ?type . ?type rdfs:label ?typeLabel . FILTER(LANG(?typeLabel) = "nl") }
  OPTIONAL { ?item wdt:P359 ?mid . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
}
GROUP BY ?item ?itemLabel
""",
)

# Public artworks in Nijmegen (statues, murals, fountains, memorials), geocoded
# and enriched. What sets art apart from streets/buildings is a creator (P170) —
# so the query requires one, plus coordinates. Enrichment per artwork: creator(s)
# (P170, linked → biographies for free via the agent second pass), subject(s)
# depicted (P180, linked — many are Nijmegen history: the 1944 bombing, Market
# Garden, Titus Brandsma, Mariken van Nieumeghen, Charlemagne…), inception year
# (P571) and the Wikidata type (P31, for per-chapter filtering). Creator labels
# use a COALESCE(nl, en, QID) so no artwork loses a creator to a missing nl label.
WikidataSet(
    key="publicart",
    label="public artworks in Nijmegen",
    cls="Place",
    extra=(
        ("years", "years", "nmg:inception", "nmg:renovation"),
        ("creator", "links", "nmg:creator"),
        ("depicts", "links", "nmg:depicts"),
        ("category", "litset", "nmg:category"),
    ),
    query="""
SELECT ?item ?itemLabel (SAMPLE(?lat) AS ?lat) (SAMPLE(?long) AS ?long)
       (SAMPLE(?image) AS ?image)
       (GROUP_CONCAT(DISTINCT CONCAT(REPLACE(STR(?cre), "^.*/", ""), "|", ?creLabel); SEPARATOR=";;") AS ?creator)
       (GROUP_CONCAT(DISTINCT CONCAT(REPLACE(STR(?dep), "^.*/", ""), "|", ?depLabel); SEPARATOR=";;") AS ?depicts)
       (GROUP_CONCAT(DISTINCT STR(?yr); SEPARATOR=";;") AS ?years)
       (GROUP_CONCAT(DISTINCT ?typeLabel; SEPARATOR=";;") AS ?category)
WHERE {
  VALUES ?city { wd:Q47887 wd:Q13188714 }
  ?item wdt:P131 ?city ; wdt:P170 ?cre .
  ?item p:P625/psv:P625 ?node .
  ?node wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?long .
  OPTIONAL { ?cre rdfs:label ?creNl . FILTER(LANG(?creNl) = "nl") }
  OPTIONAL { ?cre rdfs:label ?creEn . FILTER(LANG(?creEn) = "en") }
  BIND(COALESCE(?creNl, ?creEn, REPLACE(STR(?cre), "^.*/", "")) AS ?creLabel)
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item wdt:P571 ?inc . BIND(YEAR(?inc) AS ?yr) }
  OPTIONAL {
    ?item wdt:P180 ?dep .
    OPTIONAL { ?dep rdfs:label ?depNl . FILTER(LANG(?depNl) = "nl") }
    OPTIONAL { ?dep rdfs:label ?depEn . FILTER(LANG(?depEn) = "en") }
    BIND(COALESCE(?depNl, ?depEn, REPLACE(STR(?dep), "^.*/", "")) AS ?depLabel)
  }
  OPTIONAL { ?item wdt:P31 ?type . ?type rdfs:label ?typeLabel . FILTER(LANG(?typeLabel) = "nl") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
}
GROUP BY ?item ?itemLabel
""",
)
