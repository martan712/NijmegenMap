import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import { GROWTH_PERIOD_YEAR, growthColor } from "../config/overlays";

interface GrowthProps {
  PERIODE: string;
  WIJKEN?: string;
  OMSCHRIJVING?: string;
}
type GrowthFeature = Feature<Geometry, GrowthProps>;

/**
 * Stadsontwikkeling (CHW) polygons, coloured by development period and
 * revealed cumulatively. `reveal(year)` shows everything built by that year;
 * `reveal(null)` hides the layer. Only built areas are clickable.
 */
export class GrowthManager {
  private map: L.Map;
  private layer: L.GeoJSON<GrowthProps> | null = null;
  private loaded = false;
  private year: number | null = null;

  constructor(map: L.Map) {
    this.map = map;
  }

  reveal(year: number | null): void {
    this.year = year;
    if (year == null) {
      if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
      return;
    }
    this.load(() => {
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
      this.update();
    });
  }

  private style = (feature?: GrowthFeature): L.PathOptions => {
    const p = feature!.properties.PERIODE;
    const built = GROWTH_PERIOD_YEAR[p] <= (this.year ?? 0);
    return {
      pane: "growth",
      color: built ? "#1a1d23" : growthColor(p),
      weight: 1,
      opacity: built ? 0.7 : 0.35,
      dashArray: built ? undefined : "3 4",
      fillColor: growthColor(p),
      fillOpacity: built ? 0.5 : 0.0,
    };
  };

  private update(): void {
    if (!this.layer) return;
    this.layer.setStyle(this.style);
    const y = this.year ?? 0;
    this.layer.eachLayer((raw) => {
      const layer = raw as L.Path & { feature: GrowthFeature };
      const built = GROWTH_PERIOD_YEAR[layer.feature.properties.PERIODE] <= y;
      layer.options.interactive = built; // only built areas are clickable
      const el = (layer as unknown as { _path?: SVGElement })._path;
      if (el) {
        el.style.pointerEvents = built ? "auto" : "none";
        el.classList.toggle("leaflet-interactive", built);
      }
      if (!built && layer.isPopupOpen()) layer.closePopup();
    });
  }

  private load(cb: () => void): void {
    if (this.loaded) {
      cb();
      return;
    }
    fetch("data/stadsontwikkeling.geojson")
      .then((r) => r.json())
      .then((gj) => {
        this.layer = L.geoJSON<GrowthProps>(gj, {
          pane: "growth",
          style: this.style,
          onEachFeature: (f, layer) => {
            const pr = (f as GrowthFeature).properties;
            layer.bindPopup(
              `<div class="pp">${pr.PERIODE}</div>` +
                (pr.WIJKEN && pr.WIJKEN !== "None" ? `<div class="pw">${pr.WIJKEN}</div>` : "") +
                `<div>${pr.OMSCHRIJVING || ""}</div>`,
              { maxWidth: 330 },
            );
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("growth load failed", e));
  }
}
