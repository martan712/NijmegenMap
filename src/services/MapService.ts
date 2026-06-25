import L from "leaflet";
import { PANES } from "../config/overlays";

/**
 * Owns the Leaflet map instance, its custom panes, and the modern reference
 * basemap. Every other manager operates on the map it exposes.
 */
export class MapService {
  readonly map: L.Map;

  constructor(container: HTMLElement) {
    this.map = L.map(container, {
      zoomControl: true,
      // minZoom 7 lets regional scenes (e.g. the Hanze trade routes to Köln,
      // ~180 km SE) pull the camera back far enough to frame distant arrow tips;
      // the modern CARTO reference map renders cleanly down to this zoom.
      minZoom: 7,
      maxZoom: 19,
      zoomSnap: 0.5,
    }).setView([51.8475, 5.8625], 15);

    // Dedicated panes, ordered by z-index (see PANES).
    for (const [name, z] of Object.entries(PANES)) {
      this.map.createPane(name).style.zIndex = String(z);
    }

    // Modern reference basemap (Web Mercator) underneath everything.
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OpenStreetMap, &copy; CARTO", maxZoom: 20 },
    ).addTo(this.map);
  }

  destroy(): void {
    this.map.remove();
  }
}
