import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import { WO2_DESC, WO2_ORDER } from "../config/overlays";

interface DamageProps {
  CATEGORIE: string;
}
type DamageFeature = Feature<Geometry, DamageProps>;

/**
 * WW2 damage: all 1944 building footprints (gray context) with the damage
 * polygons revealed cumulatively per event.
 *
 * `reveal(shown, highlight)`:
 *   - `shown`     = highest damage order that is visible at all (everything with
 *                   a lower-or-equal order persists, dark red);
 *   - `highlight` = the single order rendered BRIGHT red — the moment that
 *                   damage is first added. Pass `null` for none (so a scene that
 *                   only carries forward earlier damage shows it all dark).
 * `reveal(null)` hides both layers.
 */
export class WO2Manager {
  private map: L.Map;
  private buildings: L.GeoJSON | null = null;
  private damage: L.GeoJSON<DamageProps> | null = null;
  private loaded = false;

  constructor(map: L.Map) {
    this.map = map;
  }

  reveal(shown: number | null, highlight: number | null = null): void {
    if (shown == null) {
      this.hide();
      return;
    }
    this.load(() => {
      if (this.buildings && !this.map.hasLayer(this.buildings)) this.buildings.addTo(this.map);
      if (this.damage && !this.map.hasLayer(this.damage)) this.damage.addTo(this.map);
      this.update(shown, highlight);
    });
  }

  private hide(): void {
    if (this.buildings && this.map.hasLayer(this.buildings)) this.map.removeLayer(this.buildings);
    if (this.damage && this.map.hasLayer(this.damage)) this.map.removeLayer(this.damage);
  }

  // Always set stroke/fill in BOTH branches — setStyle only overrides the keys
  // you pass, so omitting them leaves a previously-hidden feature stuck off.
  // `highlight` is the order shown bright (newly added this moment); everything
  // else that's visible (o <= shown) is the darker "already damaged" red.
  private styleFor(feature: DamageFeature, shown: number, highlight: number | null): L.PathOptions {
    const o = WO2_ORDER[feature.properties.CATEGORIE] || 99;
    if (o > shown) {
      return { pane: "wo2", stroke: false, fill: false, fillOpacity: 0, opacity: 0 };
    }
    const cur = o === highlight;
    return {
      pane: "wo2", stroke: true, fill: true,
      color: cur ? "#e8281e" : "#7a1d16", weight: 1,
      opacity: cur ? 0.9 : 0.45, fillColor: cur ? "#e8281e" : "#5c1712",
      fillOpacity: cur ? 0.55 : 0.25,
    };
  }

  private update(shown: number, highlight: number | null): void {
    if (!this.damage) return;
    this.damage.setStyle((f) => this.styleFor(f as DamageFeature, shown, highlight));
    this.damage.eachLayer((raw) => {
      const layer = raw as L.Path & { feature: DamageFeature };
      const vis = (WO2_ORDER[layer.feature.properties.CATEGORIE] || 99) <= shown;
      layer.options.interactive = vis;
      const el = (layer as unknown as { _path?: SVGElement })._path;
      if (el) {
        el.style.pointerEvents = vis ? "auto" : "none";
        el.classList.toggle("leaflet-interactive", vis);
      }
      if (!vis && layer.isPopupOpen()) layer.closePopup();
    });
  }

  private load(cb: () => void): void {
    if (this.loaded) {
      cb();
      return;
    }
    Promise.all([
      fetch("data/his_1944_bebouwing.geojson").then((r) => r.json()),
      fetch("data/wo2_oorlogsschade.geojson").then((r) => r.json()),
    ])
      .then(([bldg, dmg]) => {
        this.buildings = L.geoJSON(bldg, {
          pane: "wo2bg",
          interactive: false,
          // `renderer` is a valid Leaflet option but missing from GeoJSONOptions types.
          renderer: L.canvas({ pane: "wo2bg" }),
          style: { color: "#5b5048", weight: 0.4, fillColor: "#cabfb2", fillOpacity: 0.85 },
        } as L.GeoJSONOptions);
        this.damage = L.geoJSON<DamageProps>(dmg, {
          pane: "wo2",
          onEachFeature: (f, layer) => {
            const cat = (f as DamageFeature).properties.CATEGORIE;
            layer.bindPopup(
              `<div class="pp">${cat}</div><div>${WO2_DESC[cat] || ""}</div>`,
              { maxWidth: 300 },
            );
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("WO2 load failed", e));
  }
}
