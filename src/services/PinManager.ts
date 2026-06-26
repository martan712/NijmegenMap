import L from "leaflet";
import type { ScenePin } from "../types";

// SVG teardrop pin: tip at viewBox (12,30) = bottom-centre, so the anchor is
// exact (a rotated CSS box would overflow and mis-anchor).
const PIN_ICON = L.divIcon({
  className: "map-pin",
  html:
    '<svg width="24" height="31" viewBox="0 0 24 31" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 1 C6 1 2 5.2 2 10.5 C2 16.5 12 30 12 30 C12 30 22 16.5 22 10.5 C22 5.2 18 1 12 1 Z" ' +
    'style="fill: var(--accent)" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="12" cy="10.5" r="3.4" fill="#fff"/></svg>',
  iconSize: [24, 31],
  iconAnchor: [12, 30],
});

/** A single labelled scene pin. `show(pin)` places it; `show(null)` clears it. */
export class PinManager {
  private map: L.Map;
  private marker: L.Marker | null = null;
  private photoMarkers: L.Marker[] = [];

  constructor(map: L.Map) {
    this.map = map;
  }

  /**
   * Several located image markers (e.g. the wall towers/gates). Unlike `show`,
   * the popups DON'T auto-open — each opens on click, so the reader explores the
   * points. `showPhotoPins(null)` clears them.
   */
  showPhotoPins(pins: ScenePin[] | null): void {
    this.photoMarkers.forEach((m) => this.map.removeLayer(m));
    this.photoMarkers = [];
    if (!pins) return;
    for (const pin of pins) {
      const marker = L.marker(pin.at, { icon: PIN_ICON });
      const img = pin.image
        ? `<img class="wallpop-img" src="${pin.image}" alt="" loading="lazy">`
        : "";
      const text = pin.text ? `<div class="wallpop-text">${pin.text}</div>` : "";
      const credit = pin.credit ? `<div class="wallpop-cap">${pin.credit}</div>` : "";
      marker
        .bindPopup(`<div class="pp">${pin.label}</div>${img}${text}${credit}`, {
          className: "wallpop pinpop",
          maxWidth: 340,
          autoPan: false,
        })
        .addTo(this.map);
      this.photoMarkers.push(marker);
    }
  }

  show(pin: ScenePin | null): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    if (!pin) return;
    const marker = L.marker(pin.at, { icon: PIN_ICON });
    if (pin.image) {
      // Illustrated pin: a click-popup with the drawing/photo + caption that
      // auto-opens for the scene (autoPan off — the camera already framed it).
      const credit = pin.credit ? `<div class="wallpop-cap">${pin.credit}</div>` : "";
      marker
        .bindPopup(
          `<div class="pp">${pin.label}</div>` +
            `<img class="wallpop-img" src="${pin.image}" alt="" loading="lazy">${credit}`,
          { className: "wallpop pinpop", maxWidth: 320, autoPan: false },
        )
        .addTo(this.map)
        .openPopup();
    } else {
      marker
        .addTo(this.map)
        .bindTooltip(pin.label, {
          permanent: true,
          direction: "right",
          className: "map-tip",
          offset: [8, -10],
        });
    }
    this.marker = marker;
  }
}
