import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import { fortColor, fortYearOf } from "../config/overlays";

interface FortProps {
  PERIODE: string;
  TOELICHTING?: string;
}
type FortFeature = Feature<Geometry, FortProps>;

/**
 * Vestingwerken (CHW): 7 dated ring lines revealed cumulatively.
 * `reveal(year)` shows rings established by that year; `reveal(null)` hides.
 */
export class FortManager {
  private map: L.Map;
  private layer: L.GeoJSON<FortProps> | null = null;
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
      this.layer?.setStyle(this.style);
    });
  }

  private style = (feature?: FortFeature): L.PathOptions => {
    const period = feature!.properties.PERIODE;
    const on = this.year == null || fortYearOf(period) <= this.year;
    return { pane: "fort", color: fortColor(period), weight: on ? 3 : 0, opacity: on ? 0.92 : 0 };
  };

  private load(cb: () => void): void {
    if (this.loaded) {
      cb();
      return;
    }
    fetch("data/vestingwerken.geojson")
      .then((r) => r.json())
      .then((gj) => {
        this.layer = L.geoJSON<FortProps>(gj, {
          pane: "fort",
          style: this.style,
          onEachFeature: (f, layer) => {
            const pr = (f as FortFeature).properties;
            layer.bindPopup(
              `<div class="pp">${pr.PERIODE}</div><div>${pr.TOELICHTING || ""}</div>`,
              { maxWidth: 320 },
            );
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("fort load failed", e));
  }
}
