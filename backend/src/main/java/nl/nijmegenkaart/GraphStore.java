package nl.nijmegenkaart;

import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the RDF graph (ontology + instances) from the classpath into an in-memory
 * Jena model and answers SPARQL. ALL query logic lives here so the HTTP layer stays
 * thin and the frontend stays pure frontend.
 */
public class GraphStore {

    /** Shared prefixes prepended to every typed query. */
    private static final String PRE = """
        PREFIX nmg:   <https://nijmegenkaart.nl/ns#>
        PREFIX id:    <https://nijmegenkaart.nl/id/>
        PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema:<http://schema.org/>
        PREFIX dct:   <http://purl.org/dc/terms/>
        """;

    private final Model model = ModelFactory.createDefaultModel();

    public GraphStore() {
        load("/graph/ontology.ttl");
        load("/graph/overlays.ttl");
        load("/graph/places.ttl");
        load("/graph/sources.ttl");
        load("/graph/ww2.ttl");
        load("/graph/stolpersteine.ttl");
        // Chapter instance files — created by other agents in the migration pipeline.
        // Non-fatal: if a file doesn't exist yet the graph simply won't have those triples.
        loadOptional("/graph/roman.ttl");
        loadOptional("/graph/middeleeuwen.ttl");
        loadOptional("/graph/vesting.ttl");
        loadOptional("/graph/wederopbouw.ttl");
        loadOptional("/graph/wikidata.ttl");
    }

    private void loadOptional(String classpathResource) {
        try (InputStream in = getClass().getResourceAsStream(classpathResource)) {
            if (in == null) return;
            RDFDataMgr.read(model, in, Lang.TURTLE);
        } catch (Exception e) {
            System.err.println("Warning: could not load " + classpathResource + ": " + e.getMessage());
        }
    }

    private void load(String classpathResource) {
        try (InputStream in = getClass().getResourceAsStream(classpathResource)) {
            if (in == null) {
                throw new IllegalStateException("Missing graph resource: " + classpathResource);
            }
            RDFDataMgr.read(model, in, Lang.TURTLE);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load " + classpathResource, e);
        }
    }

    public long size() {
        return model.size();
    }

    /** Run an arbitrary SELECT and flatten each row to a JSON-friendly map. */
    public List<Map<String, Object>> select(String sparql) {
        String query = sparql.contains("PREFIX ") ? sparql : PRE + sparql;
        List<Map<String, Object>> rows = new ArrayList<>();
        try (QueryExecution qe = QueryExecutionFactory.create(QueryFactory.create(query), model)) {
            ResultSet rs = qe.execSelect();
            List<String> vars = rs.getResultVars();
            while (rs.hasNext()) {
                QuerySolution sol = rs.next();
                Map<String, Object> row = new LinkedHashMap<>();
                for (String v : vars) {
                    RDFNode n = sol.get(v);
                    row.put(v, n == null ? null
                            : n.isLiteral() ? n.asLiteral().getLexicalForm()
                            : n.toString());
                }
                rows.add(row);
            }
        }
        return rows;
    }

    // ---- Typed views (one SPARQL query each) -------------------------------

    /**
     * Ordered segments of a story = the timeline ticks, grouped by verhaallijn
     * (thread). Each row carries its thread (bare id + label + order) so the
     * frontend can split the chapter into its storylines. Ordered by thread, then
     * by the segment's position within the thread.
     */
    public List<Map<String, Object>> segments(String storyId) {
        return select("""
            SELECT ?seg ?order ?tick ?event ?eventLabel ?date ?thread ?threadLabel ?threadOrder WHERE {
              id:%s nmg:hasThread ?th .
              ?th nmg:order ?threadOrder ; rdfs:label ?threadLabel ; nmg:hasSegment ?seg .
              ?seg nmg:order ?order ; nmg:tickLabel ?tick .
              BIND(STRAFTER(STR(?th), "https://nijmegenkaart.nl/id/") AS ?thread)
              OPTIONAL { ?seg nmg:primaryEvent ?event .
                         OPTIONAL { ?event rdfs:label ?eventLabel }
                         OPTIONAL { ?event nmg:startDate ?date } }
            } ORDER BY ?threadOrder ?order""".formatted(storyId));
    }

    /** Ordered blocks of a segment, resolving referenced verbatim/media content. */
    public List<Map<String, Object>> blocks(String segId) {
        return select("""
            SELECT ?block ?type ?order ?text ?ref ?verbatim ?mediaPath ?credit ?locator WHERE {
              id:%s nmg:hasBlock ?block .
              ?block a ?type ; nmg:order ?order .
              OPTIONAL { ?block schema:text ?text }
              OPTIONAL {
                ?block nmg:references ?ref .
                OPTIONAL { ?ref nmg:verbatim ?verbatim }
                OPTIONAL { ?ref nmg:locator ?locator }
                OPTIONAL { ?ref nmg:mediaPath ?mediaPath }
                OPTIONAL { ?ref rdfs:label ?credit }
                OPTIONAL { ?ref nmg:derivedFrom ?src .
                           OPTIONAL { ?src rdfs:label ?credit } }
              }
            } ORDER BY ?order""".formatted(segId));
    }

    /**
     * Companion-map state for a segment, as an ordered list of TYPED components.
     * Each row carries a ?type discriminator (the component family) that the
     * frontend SceneManager dispatches to a registered renderer — so a story is
     * authored entirely in the graph and the frontend only decides how to draw
     * each declared type. Component families:
     *   BaseMap         — the historical base map year (nmg:baseYear)
     *   PolygonOverlay  — a categorised, conditionally-revealed feature layer; its
     *                     `key` is the explicit nmg:overlayKey, else inferred
     *                     ("growth" from a bare nmg:overlayLevel, "fort" from
     *                     nmg:fortLevel); `level` drives the cumulative reveal and
     *                     `dim` (nmg:overlayDim) requests the anchor cue variant.
     *   FocusPlace      — a located label pin (nmg:focusPlace)
     *   PhotoPin        — a located, clickable image marker (nmg:photoPin)
     *   Arrow           — a Place->Place movement arrow (nmg:arrow)
     *   MemorialLayer   — the city-wide Stolpersteine layer (nmg:showMemorial)
     *   WallLayer       — the muted city-wall point layer (nmg:showWall)
     *   HeritageLayer   — the Wikidata heritage layer (nmg:showHeritage); its
     *                     `categories` is a comma-joined nmg:heritageCategory list
     *                     (empty = show all) the frontend filters the dataset by
     *   WikidataLayer   — a generic Wikidata instance layer keyed by
     *                     nmg:showWikidataLayer; `set` is the nmg:wikidataSet key
     *                     the frontend fetches from /api/wikidata/{set}
     */
    public List<Map<String, Object>> scene(String segId) {
        List<Map<String, Object>> out = new ArrayList<>();
        out.addAll(select("""
            SELECT ("BaseMap" AS ?type) ?year WHERE {
              id:%s nmg:mapState ?m . ?m nmg:baseYear ?year .
            }""".formatted(segId)));
        // One PolygonOverlay per state: explicit nmg:overlay wins; else a bare
        // nmg:overlayLevel is the city-growth overlay; else nmg:fortLevel is the
        // fortification rings. `level` is whichever level property is present.
        out.addAll(select("""
            SELECT ("PolygonOverlay" AS ?type) ?key ?level ?dim WHERE {
              id:%s nmg:mapState ?m .
              OPTIONAL { ?m nmg:overlayDim ?dim }
              {
                ?m nmg:overlay ?ov . ?ov nmg:overlayKey ?key .
                OPTIONAL { ?m nmg:overlayLevel ?level }
              } UNION {
                ?m nmg:overlayLevel ?level .
                FILTER NOT EXISTS { ?m nmg:overlay ?ov }
                BIND("growth" AS ?key)
              } UNION {
                ?m nmg:fortLevel ?level .
                BIND("fort" AS ?key)
              }
            }""".formatted(segId)));
        out.addAll(select("""
            SELECT ("FocusPlace" AS ?type) ?place ?lat ?long ?label WHERE {
              id:%s nmg:mapState ?m . ?m nmg:focusPlace ?place .
              ?place nmg:lat ?lat ; nmg:long ?long .
              OPTIONAL { ?place rdfs:label ?label }
            }""".formatted(segId)));
        out.addAll(select("""
            SELECT ("Arrow" AS ?type) ?fromLat ?fromLong ?toLat ?toLong ?arrowLabel ?curve WHERE {
              id:%s nmg:mapState ?m . ?m nmg:arrow ?a .
              ?a nmg:arrowFrom ?f ; nmg:arrowTo ?t ;
                 nmg:arrowLabel ?arrowLabel ; nmg:arrowCurve ?curve .
              ?f nmg:lat ?fromLat ; nmg:long ?fromLong .
              ?t nmg:lat ?toLat ; nmg:long ?toLong .
            }""".formatted(segId)));
        out.addAll(select("""
            SELECT ("PhotoPin" AS ?type) ?lat ?long ?label ?image ?credit ?text WHERE {
              id:%s nmg:mapState ?m . ?m nmg:photoPin ?pin . ?pin nmg:atPlace ?place .
              ?place nmg:lat ?lat ; nmg:long ?long .
              OPTIONAL { ?place rdfs:label ?label }
              OPTIONAL { ?pin schema:text ?text }
              OPTIONAL { ?pin nmg:references ?src . ?src nmg:mediaPath ?image .
                         OPTIONAL { ?src rdfs:label ?credit } }
            }""".formatted(segId)));
        out.addAll(select("""
            SELECT ("MemorialLayer" AS ?type) ?dataset WHERE {
              id:%s nmg:mapState ?m . ?m nmg:showMemorial true .
              BIND("stolpersteine" AS ?dataset)
            }""".formatted(segId)));
        out.addAll(select("""
            SELECT ("WallLayer" AS ?type) ?dataset WHERE {
              id:%s nmg:mapState ?m . ?m nmg:showWall true .
              BIND("stadswallen" AS ?dataset)
            }""".formatted(segId)));
        out.addAll(select("""
            SELECT ("HeritageLayer" AS ?type) ?dataset
                   (GROUP_CONCAT(?cat; SEPARATOR=",") AS ?categories)
                   (SAMPLE(?bf) AS ?before) (SAMPLE(?af) AS ?after) WHERE {
              id:%s nmg:mapState ?m . ?m nmg:showHeritage true .
              OPTIONAL { ?m nmg:heritageCategory ?cat }
              OPTIONAL { ?m nmg:heritageBefore ?bf }
              OPTIONAL { ?m nmg:heritageAfter ?af }
              BIND("heritage" AS ?dataset)
            } GROUP BY ?dataset""".formatted(segId)));
        out.addAll(select("""
            SELECT ("WikidataLayer" AS ?type) ?set
                   (GROUP_CONCAT(?cat; SEPARATOR=",") AS ?categories)
                   (SAMPLE(?bf) AS ?before) (SAMPLE(?af) AS ?after) WHERE {
              id:%s nmg:mapState ?m . ?m nmg:showWikidataLayer ?set .
              OPTIONAL { ?m nmg:heritageCategory ?cat }
              OPTIONAL { ?m nmg:heritageBefore ?bf }
              OPTIONAL { ?m nmg:heritageAfter ?af }
            } GROUP BY ?set""".formatted(segId)));
        return out;
    }

    /** All Stolpersteine: one memorial stone per victim, with location + inscription. */
    public List<Map<String, Object>> stolpersteine() {
        return select("""
            SELECT ?s ?name ?lat ?long ?lifespan ?address ?inscription ?image WHERE {
              ?s a nmg:Stolperstein ; rdfs:label ?name ; nmg:lat ?lat ; nmg:long ?long .
              OPTIONAL { ?s nmg:lifespan ?lifespan }
              OPTIONAL { ?s nmg:address ?address }
              OPTIONAL { ?s nmg:verbatim ?inscription }
              OPTIONAL { ?s nmg:image ?image }
            } ORDER BY ?name""");
    }

    /**
     * All Wikidata heritage places (one per monument), with the enrichment the
     * popup shows. Multi-valued fields (category, renovation, architect) are
     * joined per place; `categories` also drives the frontend's per-chapter filter.
     */
    public List<Map<String, Object>> heritage() {
        return select("""
            SELECT ?s ?name ?lat ?long
                   (GROUP_CONCAT(DISTINCT ?cat; SEPARATOR="; ") AS ?categories)
                   (SAMPLE(?inc) AS ?inception)
                   (GROUP_CONCAT(DISTINCT ?ren; SEPARATOR=", ") AS ?renovations)
                   (GROUP_CONCAT(DISTINCT ?archName; SEPARATOR=", ") AS ?architects)
                   (SAMPLE(?sty) AS ?style) (SAMPLE(?mid) AS ?monumentId)
                   (SAMPLE(?img) AS ?image) WHERE {
              ?s a/rdfs:subClassOf* nmg:Place ; rdfs:label ?name ; nmg:lat ?lat ; nmg:long ?long ;
                 nmg:wikidataSet "rijksmonument" ; nmg:category ?cat .
              OPTIONAL { ?s nmg:inception ?inc }
              OPTIONAL { ?s nmg:renovation ?ren }
              OPTIONAL { ?s nmg:architect ?arch . ?arch rdfs:label ?archName }
              OPTIONAL { ?s nmg:style ?sty }
              OPTIONAL { ?s nmg:monumentId ?mid }
              OPTIONAL { ?s nmg:image ?img }
            } GROUP BY ?s ?name ?lat ?long ORDER BY ?name""");
    }

    /** Escape a string for safe interpolation into a SPARQL string literal. */
    private static String escapeLiteral(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    /**
     * All Wikidata instances tagged with the given nmg:wikidataSet key: common
     * fields (name, position, categories, inception, image) sufficient to place
     * and describe any set's markers. The heritage layer keeps its own richer
     * {@link #heritage()} query with renovation/architect/style/monumentId fields.
     *
     * @param set the nmg:wikidataSet key, e.g. "rijksmonument" or "roman_finds";
     *            arrives from a URL path param and is SPARQL-escaped before use.
     */
    public List<Map<String, Object>> wikidata(String set) {
        String safeSet = escapeLiteral(set);
        return select("""
            SELECT ?s ?name ?lat ?long
                   (GROUP_CONCAT(DISTINCT ?cat; SEPARATOR="; ") AS ?categories)
                   (SAMPLE(?inc) AS ?inception) (SAMPLE(?img) AS ?image) WHERE {
              ?s a/rdfs:subClassOf* nmg:Place ; nmg:wikidataSet "%s" ;
                 rdfs:label ?name ; nmg:lat ?lat ; nmg:long ?long .
              OPTIONAL { ?s nmg:category ?cat }
              OPTIONAL { ?s nmg:inception ?inc }
              OPTIONAL { ?s nmg:image ?img }
            } GROUP BY ?s ?name ?lat ?long ORDER BY ?name""".formatted(safeSet));
    }

    /** Auto-bibliography: distinct sources used across a story, with rights/licence. */
    public List<Map<String, Object>> bibliography(String storyId) {
        return select("""
            SELECT DISTINCT ?src ?label ?license ?rights WHERE {
              id:%s nmg:hasThread ?th . ?th nmg:hasSegment ?seg . ?seg nmg:hasBlock ?b .
              { ?b nmg:cites ?src }
              UNION { ?b nmg:references ?src }
              UNION { ?b nmg:references ?cu . ?cu nmg:derivedFrom ?src }
              ?src rdfs:label ?label .
              OPTIONAL { ?src dct:license ?license }
              OPTIONAL { ?src nmg:rightsClass ?rights }
            } ORDER BY ?label""".formatted(storyId));
    }

    // ---- Story listing / metadata ------------------------------------------------

    /**
     * Stories for the picker, chronologically ordered. Only stories with an
     * explicit nmg:storyOrder appear here (so prototype/duplicate stories without
     * one are hidden). ?story is the bare resource id the frontend navigates by.
     */
    public List<Map<String, Object>> stories() {
        return select("""
            SELECT ?story ?label ?intro ?era ?year ?tag ?ord WHERE {
              ?id a nmg:Story ; nmg:storyOrder ?ord .
              OPTIONAL { ?id rdfs:label ?label }
              OPTIONAL { ?id nmg:introText ?intro }
              OPTIONAL { ?id nmg:eraLabel ?era }
              OPTIONAL { ?id nmg:representativeYear ?year }
              OPTIONAL { ?id nmg:tag ?tag }
              BIND(STRAFTER(STR(?id), "https://nijmegenkaart.nl/id/") AS ?story)
            } ORDER BY ?ord""");
    }

    /** Metadata for a single story. */
    public Map<String, Object> storyMeta(String storyId) {
        List<Map<String, Object>> rows = select("""
            SELECT ?label ?intro ?era ?year ?tag WHERE {
              VALUES ?s { id:%s }
              OPTIONAL { ?s rdfs:label ?label }
              OPTIONAL { ?s nmg:introText ?intro }
              OPTIONAL { ?s nmg:eraLabel ?era }
              OPTIONAL { ?s nmg:representativeYear ?year }
              OPTIONAL { ?s nmg:tag ?tag }
            }""".formatted(storyId));
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }
}
