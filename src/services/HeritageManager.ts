import L from "leaflet";
import type { HeritagePoint } from "../types";

/**
 * Wikidata heritage layer: one marker per protected monument, drawn on a canvas
 * (fast for hundreds of points). `show(points)` renders them; `show(null)` clears.
 * The popup surfaces the enrichment — build/renovation years, architect, style —
 * and links to the official rijksmonument register when a number is present.
 *
 * Distinct from the Stolpersteine layer (vivid red): heritage uses a muted blue
 * so it reads as context behind the narrative's accent pins.
 */
export class HeritageManager {
  private map: L.Map;
  private renderer: L.Canvas;
  private layer: L.LayerGroup | null = null;

  constructor(map: L.Map) {
    this.map = map;
    this.renderer = L.canvas({ pane: "heritage" });
  }

  show(points: HeritagePoint[] | null): void {
    if (this.layer) {
      this.map.removeLayer(this.layer);
      this.layer = null;
    }
    if (!points || points.length === 0) return;
    const markers = points.map((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        pane: "heritage", renderer: this.renderer,
        radius: 5, weight: 2, color: "#ffffff", fillColor: "#2e6bff", fillOpacity: 0.95,
      });
      m.bindPopup(this.popupHtml(p), { className: "wallpop", maxWidth: 280, autoPan: false });
      return m;
    });
    this.layer = L.layerGroup(markers).addTo(this.map);
  }

  private popupHtml(p: HeritagePoint): string {
    const dates = [p.inception, p.renovations && `verb. ${p.renovations}`]
      .filter(Boolean).join(" · ");
    const sub = [p.categories, dates].filter(Boolean).join(" — ");
    const img = p.image ? `<img class="wallpop-img" src="${p.image}" alt="" loading="lazy">` : "";
    const meta = [
      p.architects && `Architect: ${p.architects}`,
      p.style,
    ].filter(Boolean).join("<br>");
    const link = p.monumentId
      ? `<div class="wallpop-cap"><a href="https://monumentenregister.cultureelerfgoed.nl/monumenten/${p.monumentId}" target="_blank" rel="noopener">Rijksmonument ${p.monumentId}</a></div>`
      : "";
    return `<div class="pp">${p.name}</div>${sub ? `<div class="pw">${sub}</div>` : ""}${img}${meta ? `<div class="wallpop-cap">${meta}</div>` : ""}${link}`;
  }
}
