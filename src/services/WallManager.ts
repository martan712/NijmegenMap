import L from "leaflet";
import type { Feature, Geometry } from "geojson";

interface WallProps {
  ID?: number | string;
  NUMMER?: number | string;
  /** Caption from the gemeente Korfmacher popup (see fetch_korfmacher.py). */
  CAPTION?: string;
  /** Local path to the historical image, or null. */
  PHOTO?: string | null;
}
type WallFeature = Feature<Geometry, WallProps>;

// Korfmacher popups often concatenate two image captions; keep just the first
// (it matches the single image we show), ending at "… Collectie … Valkhof".
function firstCaption(caption: string): string {
  const m = caption.match(/^(.*?Collectie[^]*?Valkhof)/);
  return (m ? m[1] : caption).trim();
}

/** HIS_STADSMUUR: 36 tower/gate points enriched with Korfmacher images. */
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
    fetch("data/stadswallen.geojson")
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
            const photo = pr.PHOTO
              ? `<img class="wallpop-img" src="${pr.PHOTO}" alt="" loading="lazy">`
              : "";
            const caption = pr.CAPTION
              ? `<div class="wallpop-cap">${firstCaption(pr.CAPTION)}</div>`
              : `<div>Punt ${pr.NUMMER ?? pr.ID}</div>`;
            layer.bindPopup(
              `<div class="pp">Stadsmuur</div>${photo}${caption}`,
              { maxWidth: 340 },
            );
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("wall load failed", e));
  }
}
