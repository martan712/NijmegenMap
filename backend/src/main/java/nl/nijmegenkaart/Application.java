package nl.nijmegenkaart;

import io.javalin.Javalin;

import java.util.Map;

/**
 * The Java backend service: holds all logic, queries the RDF graph via SPARQL
 * (GraphStore), and exposes a typed REST API + a generic /api/sparql endpoint.
 * The React frontend consumes only this API.
 */
public class Application {

    public static void main(String[] args) {
        GraphStore store = new GraphStore();

        Javalin app = Javalin.create(cfg ->
            // Allow the Vite dev server (and others) during development.
            cfg.bundledPlugins.enableCors(cors -> cors.addRule(rule -> rule.anyHost()))
        );

        app.get("/api/health", ctx ->
            ctx.json(Map.of("status", "ok", "triples", store.size())));

        // Timeline / story structure
        app.get("/api/stories/{id}/segments", ctx ->
            ctx.json(store.segments(ctx.pathParam("id"))));
        app.get("/api/stories/{id}/bibliography", ctx ->
            ctx.json(store.bibliography(ctx.pathParam("id"))));

        // Per-segment content + companion-map state
        app.get("/api/segments/{id}/blocks", ctx ->
            ctx.json(store.blocks(ctx.pathParam("id"))));
        // Typed scene components for a segment's companion map (the SceneManager
        // dispatches each by its ?type to a registered renderer).
        app.get("/api/segments/{id}/scene", ctx ->
            ctx.json(store.scene(ctx.pathParam("id"))));

        // Stolpersteine memorial layer (all stones)
        app.get("/api/stolpersteine", ctx ->
            ctx.json(store.stolpersteine()));

        // Story listing & metadata
        app.get("/api/stories", ctx ->
            ctx.json(store.stories()));
        app.get("/api/stories/{id}/meta", ctx ->
            ctx.json(store.storyMeta(ctx.pathParam("id"))));

        // Generic SPARQL SELECT (POST the query as the body)
        app.post("/api/sparql", ctx ->
            ctx.json(store.select(ctx.body())));

        // Default 8088 (8080 is often taken by a local Tomcat); override with $PORT.
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8088"));
        app.start(port);
        System.out.println("NijmegenKaart backend up on :" + port + " (" + store.size() + " triples)");
    }
}
