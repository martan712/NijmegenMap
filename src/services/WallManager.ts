import L from "leaflet";
import type { Feature, Geometry } from "geojson";

interface WallProps {
  ID?: number | string;
  NUMMER?: number | string;
}
type WallFeature = Feature<Geometry, WallProps>;

/** HIS_STADSMUUR: 36 tower/gate points. `setVisible` toggles the markers. */
export class WallManager {
  private map: L.Map;
  private layer: L.GeoJSON<WallProps> | null = null;
  private loaded = false;

  constructor(map: L.Map) {
    this.map = map;
  }

  setVisible(on: boolean): void {
    if (!on) {
      if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
      return;
    }
    this.load(() => {
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
    });
  }

  private load(cb: () => void): void {
    if (this.loaded) {
      cb();
      return;
    }
    fetch("data/stadsmuur.geojson")
      .then((r) => r.json())
      .then((gj) => {
        this.layer = L.geoJSON<WallProps>(gj, {
          pane: "wall",
          pointToLayer: (_f, latlng) =>
            L.circleMarker(latlng, {
              pane: "wall", radius: 5, color: "#1a1d23", weight: 1.5,
              fillColor: "#ffd27d", fillOpacity: 0.95,
            }),
          onEachFeature: (f, layer) => {
            const pr = (f as WallFeature).properties;
            layer.bindPopup(
              `<div class="pp">Stadsmuur</div><div>Punt ${pr.NUMMER ?? pr.ID}</div>`,
              { maxWidth: 220 },
            );
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("wall load failed", e));
  }
}
