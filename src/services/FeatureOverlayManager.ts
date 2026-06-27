import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import type { OverlayDef, OverlayState } from "../config/overlays";

type Props = Record<string, string | null | undefined>;
type PolyFeature = Feature<Geometry, Props>;

/**
 * One renderer for every feature overlay (the Romeinse Limes zones, the WW2
 * damage, the city-growth polygons, the fortification rings). An {@link OverlayDef}
 * says where the GeoJSON lives and carries the per-feature `style` / `interactive`
 * / `popup` as functions of the current {@link OverlayState}; this class is purely
 * mechanical — it loads the data once and (re)applies those functions.
 *
 *   show()        → load (once) + display with the current state
 *   show(state)   → restyle (cumulative reveal / highlight / dim)
 *   hide()        → remove the features (and any context background)
 */
export class FeatureOverlayManager {
  private map: L.Map;
  private def: OverlayDef;
  private layer: L.GeoJSON<Props> | null = null;
  private bg: L.GeoJSON | null = null;
  private loaded = false;
  private state: OverlayState = {};

  constructor(map: L.Map, def: OverlayDef) {
    this.map = map;
    this.def = def;
  }

  show(state: OverlayState = {}): void {
    this.state = state;
    this.load(() => {
      if (this.bg && !this.map.hasLayer(this.bg)) this.bg.addTo(this.map);
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
      this.layer?.setStyle((f) => this.def.style(f as PolyFeature, this.state));
      if (this.def.interactive) this.updateInteractivity();
    });
  }

  hide(): void {
    if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
    if (this.bg && this.map.hasLayer(this.bg)) this.map.removeLayer(this.bg);
  }

  // Disable hit-testing on hidden (not-yet-revealed) features so their popups
  // can't be opened; setStyle only changes paint, not interactivity.
  private updateInteractivity(): void {
    const pred = this.def.interactive;
    if (!pred) return;
    this.layer?.eachLayer((raw) => {
      const lyr = raw as L.Path & { feature: PolyFeature };
      const vis = pred(lyr.feature, this.state);
      lyr.options.interactive = vis;
      const el = (lyr as unknown as { _path?: SVGElement })._path;
      if (el) {
        el.style.pointerEvents = vis ? "auto" : "none";
        el.classList.toggle("leaflet-interactive", vis);
      }
      if (!vis && lyr.isPopupOpen()) lyr.closePopup();
    });
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

        // Optional draw order: lower sortKey first, so higher sits on top.
        let features = (gj.features as PolyFeature[]).filter((f) => f.geometry != null);
        if (this.def.sortKey) {
          const key = this.def.sortKey;
          features = features.slice().sort((a, b) => key(a) - key(b));
        }

        this.layer = L.geoJSON<Props>(
          { type: "FeatureCollection", features } as GeoJSON.FeatureCollection,
          {
            pane: this.def.pane,
            style: (f) => this.def.style(f as PolyFeature, this.state),
            onEachFeature: (f, layer) => {
              const html = this.def.popup?.(f as PolyFeature);
              if (html) layer.bindPopup(html, { maxWidth: 330 });
            },
          },
        );
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error(`overlay '${this.def.key}' load failed`, e));
  }
}
