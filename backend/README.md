# NijmegenKaart backend

Java service for the **Verhalen** surface. Loads the RDF graph (ontology + story
instances) into an in-memory **Apache Jena** model and answers **SPARQL**, exposing a
typed REST API (+ a generic `/api/sparql`) consumed by the React frontend. All query
logic lives here so the frontend stays pure frontend.

Stack: **Javalin** (HTTP, over Jetty) + **Apache Jena** (`jena-arq`). Java 21+ (built
and run here on JDK 25). Lean by design — no Spring — to avoid bytecode-proxy friction
on bleeding-edge JDKs.

## Build & run
```bash
cd backend
./mvnw -B package                 # builds target/nijmegenkaart-backend.jar
java -jar target/nijmegenkaart-backend.jar     # serves on :8088 (override with $PORT)
```

## Graph
- `src/main/resources/graph/ontology.ttl` — the ontology (schema.org / CIDOC-CRM /
  PROV-O / CITO / Dublin Core; Wikidata via `owl:sameAs`).
- `src/main/resources/graph/ww2.ttl` — instance data; currently the **Waaloversteek**
  vertical slice (P1) with real sourced material (Radio Oranje 1944, IWM photo, Dozy
  diary quote). Add segments/stories here.

Namespaces: terms `https://nijmegenkaart.nl/ns#` (`nmg:`), resources
`https://nijmegenkaart.nl/id/` (`id:`) — placeholders, see ontology decision O1.

## REST API
| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{status, triples}` |
| GET | `/api/stories/{id}/segments` | ordered segments = timeline ticks |
| GET | `/api/segments/{id}/blocks` | ordered blocks + resolved verbatim/media |
| GET | `/api/segments/{id}/map` | companion-map focus places + arrows + base year |
| GET | `/api/stories/{id}/bibliography` | distinct sources used, with licence/rights |
| POST | `/api/sparql` | run a SPARQL SELECT (query in the body) |

Story id for WW2 is `story_ww2`; first segment is `seg_waaloversteek`.
CORS is open (any host) for the Vite dev server.

## Media
`mediaPath` values are site-root-relative (e.g. `data/images/ww2/waaloversteek.jpg`),
served directly from `public/data/`. The Radio Oranje
audio is not fetched yet (path points to its future `data/stories/ww2/audio/` home).
