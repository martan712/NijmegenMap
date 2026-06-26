import L from "leaflet";
import type { MemorialPoint } from "../types";

/**
 * Stolpersteine memorial layer: one small brass marker per victim, drawn on a
 * canvas (fast for ~150+ points). `show(points)` renders them; `show(null)`
 * clears. `highlight(point)` opens a specific stone's popup (e.g. from a card).
 */
export class MemorialManager {
  private map: L.Map;
  private renderer: L.Canvas;
  private layer: L.LayerGroup | null = null;
  private byKey = new Map<string, L.CircleMarker>();

  constructor(map: L.Map) {
    this.map = map;
    this.renderer = L.canvas({ pane: "memorial" });
  }

  private key(p: MemorialPoint): string {
    return `${p.lat},${p.lng},${p.name}`;
  }

  show(points: MemorialPoint[] | null): void {
    if (this.layer) {
      this.map.removeLayer(this.layer);
      this.layer = null;
      this.byKey.clear();
    }
    if (!points || points.length === 0) return;
    const markers = points.map((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        pane: "memorial", renderer: this.renderer,
        // High-contrast against the cream historical map: vivid accent fill with
        // a white halo (the stroke) so each stone stays legible over any basemap.
        radius: 6, weight: 2, color: "#ffffff", fillColor: "#ff4d2e", fillOpacity: 1,
      });
      m.bindPopup(this.popupHtml(p), { className: "wallpop", maxWidth: 280, autoPan: false });
      this.byKey.set(this.key(p), m);
      return m;
    });
    this.layer = L.layerGroup(markers).addTo(this.map);
  }

  highlight(p: MemorialPoint): void {
    this.byKey.get(this.key(p))?.openPopup();
  }

  private popupHtml(p: MemorialPoint): string {
    const sub = [p.lifespan, p.address].filter(Boolean).join(" · ");
    const img = p.image ? `<img class="wallpop-img" src="${p.image}" alt="" loading="lazy">` : "";
    const ins = p.inscription ? `<div class="wallpop-cap">${p.inscription}</div>` : "";
    return `<div class="pp">${p.name}</div>${sub ? `<div class="pw">${sub}</div>` : ""}${img}${ins}`;
  }
}
