import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import type { OverlayCategory, OverlayDef } from "../config/overlays";

type Props = Record<string, string | null | undefined>;
type PolyFeature = Feature<Geometry, Props>;

export interface OverlayState {
  /** Highest cumulative order visible (≤ this stays shown). Undefined = show all. */
  level?: number | null;
  /** The single order rendered bright (just-added). Null/undefined = none bright. */
  highlight?: number | null;
  /** Anchor variant: only the `dim.site` feature, desaturated (post-Roman scenes). */
  dim?: boolean;
}

const OFF: L.PathOptions = { stroke: false, fill: false, fillOpacity: 0, opacity: 0 };

/**
 * One renderer for every polygon overlay (the Romeinse Limes zones, the WW2
 * damage, …). An {@link OverlayDef} says where the GeoJSON lives, which feature
 * property categorises a polygon, and how each category is coloured; whether a
 * category reveals cumulatively is just whether it carries an `order`. The graph
 * names which overlay a scene shows; this draws it.
 *
 *   show()        → load (once) + display with the current {@link OverlayState}
 *   show(state)   → restyle (cumulative reveal / highlight / dim)
 *   hide()        → remove the polygons (and any context background)
 */
export class PolygonOverlayManager {
  private map: L.Map;
  private def: OverlayDef;
  private layer: L.GeoJSON<Props> | null = null;
  private bg: L.GeoJSON | null = null;
  private loaded = false;
  private state: OverlayState = {};
  private readonly conditional: boolean;

  constructor(map: L.Map, def: OverlayDef) {
    this.map = map;
    this.def = def;
    this.conditional = def.categories.some((c) => c.order != null);
  }

  show(state: OverlayState = {}): void {
    this.state = state;
    this.load(() => {
      if (this.bg && !this.map.hasLayer(this.bg)) this.bg.addTo(this.map);
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
      this.layer?.setStyle(this.style);
      if (this.conditional) this.updateInteractivity();
    });
  }

  hide(): void {
    if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
    if (this.bg && this.map.hasLayer(this.bg)) this.map.removeLayer(this.bg);
  }

  private category(feature?: PolyFeature): OverlayCategory | undefined {
    const val = feature?.properties?.[this.def.categoryProp] ?? "";
    return this.def.categories.find((c) => c.match === val);
  }

  private style = (feature?: PolyFeature): L.PathOptions => {
    const pane = this.def.pane;

    // Anchor variant: show only the configured site, desaturated.
    if (this.state.dim && this.def.dim) {
      const names = (this.def.nameProps ?? [])
        .map((p) => (feature?.properties?.[p] ?? "").toLowerCase())
        .join(" ");
      if (!names.includes(this.def.dim.site)) return { pane, ...OFF };
      const d = this.def.dim;
      return { pane, color: d.line, weight: d.weight, fillColor: d.fill, fillOpacity: d.fillOpacity };
    }

    const cat = this.category(feature);
    if (!cat) return { pane, ...(this.conditional ? OFF : {}) };

    // Cumulative category: hidden until its order is reached; bright when it is
    // the highlighted (just-added) order, otherwise the darker "already there".
    if (cat.order != null && this.state.level != null) {
      if (cat.order > this.state.level) return { pane, ...OFF };
      if (cat.order === this.state.highlight && this.def.highlight) {
        const h = this.def.highlight;
        return {
          pane, stroke: true, fill: true, color: h.line, fillColor: h.fill,
          weight: h.weight ?? 1, opacity: 0.9, fillOpacity: h.fillOpacity ?? 0.55,
        };
      }
    }
    return {
      pane, stroke: true, fill: true, color: cat.line, fillColor: cat.fill,
      weight: cat.weight ?? 1, opacity: 0.45, fillOpacity: cat.fillOpacity ?? 0.35,
    };
  };

  // Disable hit-testing on hidden (not-yet-revealed) features so their popups
  // can't be opened; setStyle only changes paint, not interactivity.
  private updateInteractivity(): void {
    const level = this.state.level;
    this.layer?.eachLayer((raw) => {
      const lyr = raw as L.Path & { feature: PolyFeature };
      const cat = this.category(lyr.feature);
      const vis = level == null || cat?.order == null || cat.order <= level;
      lyr.options.interactive = vis;
      const el = (lyr as unknown as { _path?: SVGElement })._path;
      if (el) {
        el.style.pointerEvents = vis ? "auto" : "none";
        el.classList.toggle("leaflet-interactive", vis);
      }
      if (!vis && lyr.isPopupOpen()) lyr.closePopup();
    });
  }

  private popupHtml(feature: PolyFeature): string | null {
    const title = (this.def.nameProps ?? [])
      .map((p) => feature.properties?.[p])
      .find((v) => v);
    const cat = this.category(feature);
    const head = title || cat?.label;
    if (!head) return null;
    const body = cat?.desc ?? (title && cat?.label ? cat.label : "");
    return `<div class="pp">${head}</div>${body ? `<div>${body}</div>` : ""}`;
  }

  private load(cb: () => void): void {
    if (this.loaded) {
      cb();
      return;
    }
    const polys = fetch(this.def.src).then((r) => r.json());
    const bg = this.def.background
      ? fetch(this.def.background.src).then((r) => r.json())
      : Promise.resolve(null);

    Promise.all([polys, bg])
      .then(([gj, bgGj]) => {
        if (this.def.background && bgGj) {
          const b = this.def.background;
          this.bg = L.geoJSON(bgGj, {
            pane: b.pane,
            interactive: false,
            // `renderer` is a valid Leaflet option missing from GeoJSONOptions types.
            renderer: L.canvas({ pane: b.pane }),
            style: { color: b.line, weight: b.weight, fillColor: b.fill, fillOpacity: b.fillOpacity },
          } as L.GeoJSONOptions);
        }

        // Draw earlier categories last so they sit on top (e.g. Kernzone over
        // Bufferzone). Features of an unknown category sort to the bottom.
        const idx = (f: PolyFeature) =>
          this.def.categories.findIndex((c) => c.match === (f.properties?.[this.def.categoryProp] ?? ""));
        const features = (gj.features as PolyFeature[])
          .filter((f) => f.geometry != null)
          .sort((a, b) => idx(b) - idx(a));

        this.layer = L.geoJSON<Props>(
          { type: "FeatureCollection", features } as GeoJSON.FeatureCollection,
          {
            pane: this.def.pane,
            style: this.style,
            onEachFeature: (f, layer) => {
              const html = this.popupHtml(f as PolyFeature);
              if (html) layer.bindPopup(html, { maxWidth: 300 });
            },
          },
        );
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error(`overlay '${this.def.key}' load failed`, e));
  }
}
