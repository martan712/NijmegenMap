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

    /** Ordered segments of a story = the timeline ticks. */
    public List<Map<String, Object>> segments(String storyId) {
        return select("""
            SELECT ?seg ?order ?tick ?event ?eventLabel ?date WHERE {
              id:%s nmg:hasSegment ?seg .
              ?seg nmg:order ?order ; nmg:tickLabel ?tick .
              OPTIONAL { ?seg nmg:primaryEvent ?event .
                         OPTIONAL { ?event rdfs:label ?eventLabel }
                         OPTIONAL { ?event nmg:startDate ?date } }
            } ORDER BY ?order""".formatted(storyId));
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

    /** Companion-map state for a segment: focus places + arrows (Place->Place). */
    public List<Map<String, Object>> map(String segId) {
        return select("""
            SELECT ?kind ?place ?lat ?long ?label ?year ?overlay ?overlayKey ?fort
                   ?fromLat ?fromLong ?toLat ?toLong ?arrowLabel ?curve
                   ?image ?credit ?text WHERE {
              id:%s nmg:mapState ?m .
              OPTIONAL { ?m nmg:baseYear ?year }
              OPTIONAL { ?m nmg:overlayLevel ?overlay }
              OPTIONAL { ?m nmg:fortLevel ?fort }
              OPTIONAL { ?m nmg:overlay ?ov . ?ov nmg:overlayKey ?overlayKey }
              # Places/arrows/photo-pins are OPTIONAL so a base-map-only state (e.g.
              # a city-growth scene with no pin) still returns one row carrying its
              # baseYear + overlayLevel — the frontend needs those even with no pin.
              OPTIONAL {
                {
                  ?m nmg:focusPlace ?place . ?place nmg:lat ?lat ; nmg:long ?long .
                  OPTIONAL { ?place rdfs:label ?label }
                  BIND("place" AS ?kind)
                } UNION {
                  ?m nmg:arrow ?a .
                  ?a nmg:arrowFrom ?f ; nmg:arrowTo ?t ;
                     nmg:arrowLabel ?arrowLabel ; nmg:arrowCurve ?curve .
                  ?f nmg:lat ?fromLat ; nmg:long ?fromLong .
                  ?t nmg:lat ?toLat ; nmg:long ?toLong .
                  BIND("arrow" AS ?kind)
                } UNION {
                  ?m nmg:photoPin ?pin . ?pin nmg:atPlace ?place .
                  ?place nmg:lat ?lat ; nmg:long ?long .
                  OPTIONAL { ?place rdfs:label ?label }
                  OPTIONAL { ?pin schema:text ?text }
                  OPTIONAL { ?pin nmg:references ?src .
                             ?src nmg:mediaPath ?image .
                             OPTIONAL { ?src rdfs:label ?credit } }
                  BIND("photopin" AS ?kind)
                }
              }
            }""".formatted(segId));
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

    /** Auto-bibliography: distinct sources used across a story, with rights/licence. */
    public List<Map<String, Object>> bibliography(String storyId) {
        return select("""
            SELECT DISTINCT ?src ?label ?license ?rights WHERE {
              id:%s nmg:hasSegment ?seg . ?seg nmg:hasBlock ?b .
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
