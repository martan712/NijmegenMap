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

const NORMAL = { radius: 5, color: "#1a1d23", weight: 1.5, fillColor: "#ffd27d", fillOpacity: 0.95 };
const HIGHLIGHT = { radius: 9, color: "#ffffff", weight: 3, fillColor: "#ff8a3d", fillOpacity: 1 };
const FOCUS_ZOOM = 16;

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
  private byNummer = new Map<string, L.CircleMarker>();
  private highlighted: L.CircleMarker | null = null;

  constructor(map: L.Map) {
    this.map = map;
  }

  setVisible(on: boolean): void {
    if (!on) {
      this.clearHighlight();
      if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
      return;
    }
    this.load(() => {
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
    });
  }

  /** Fly to a point (gently), highlight it, and open its popup. */
  focusPoint(nummer: number): void {
    this.load(() => {
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
      const marker = this.byNummer.get(String(nummer));
      if (!marker) return;
      this.highlight(marker);
      this.map.flyTo(marker.getLatLng(), FOCUS_ZOOM, { duration: 0.85 });
      this.map.once("moveend", () => marker.openPopup());
    });
  }

  clearHighlight(): void {
    if (this.highlighted) {
      this.highlighted.setStyle(NORMAL);
      this.highlighted.closePopup();
      this.highlighted = null;
    }
  }

  private highlight(marker: L.CircleMarker): void {
    if (this.highlighted && this.highlighted !== marker) this.highlighted.setStyle(NORMAL);
    marker.setStyle(HIGHLIGHT);
    marker.bringToFront();
    this.highlighted = marker;
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
          pointToLayer: (_f, latlng) => L.circleMarker(latlng, { pane: "wall", ...NORMAL }),
          onEachFeature: (f, layer) => {
            const pr = (f as WallFeature).properties;
            if (pr.NUMMER != null) this.byNummer.set(String(pr.NUMMER), layer as L.CircleMarker);
            const photo = pr.PHOTO
              ? `<img class="wallpop-img" src="${pr.PHOTO}" alt="" loading="lazy">`
              : "";
            const caption = pr.CAPTION
              ? `<div class="wallpop-cap">${firstCaption(pr.CAPTION)}</div>`
              : `<div>Punt ${pr.NUMMER ?? pr.ID}</div>`;
            layer.bindPopup(`<div class="pp">Stadsmuur</div>${photo}${caption}`, {
              maxWidth: 340,
              className: "wallpop",
            });
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("wall load failed", e));
  }
}
