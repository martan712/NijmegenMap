import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import { LIMES_ZONES } from "../config/overlays";

interface LimesProps {
  TYPE_ZONE?: string; // "Kernzone" | "Bufferzone"
  SITENAAM?: string | null;
  NAME_COMPP?: string | null;
}
type LimesFeature = Feature<Geometry, LimesProps>;

// Per-zone polygon styling, derived from the shared LIMES_ZONES palette.
const ZONE_STYLE: Record<string, L.PathOptions> = Object.fromEntries(
  LIMES_ZONES.map((z) => [
    z.zone,
    { color: z.line, weight: 1, fillColor: z.fill, fillOpacity: z.zone === "Kernzone" ? 0.45 : 0.4 },
  ]),
);

// SVG teardrop pin: the tip is at viewBox (12,30) = bottom-center, so the
// anchor is exact (a rotated CSS box would overflow and mis-anchor).
const PIN_ICON = L.divIcon({
  className: "limes-pin",
  html:
    '<svg width="24" height="31" viewBox="0 0 24 31" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 1 C6 1 2 5.2 2 10.5 C2 16.5 12 30 12 30 C12 30 22 16.5 22 10.5 C22 5.2 18 1 12 1 Z" ' +
    'style="fill: var(--accent)" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="12" cy="10.5" r="3.4" fill="#fff"/></svg>',
  iconSize: [24, 31],
  iconAnchor: [12, 30],
});

// Area-weighted centroid of a polygon's outer ring (lng/lat coords) via the
// shoelace formula; returns the point and the |area| (for picking the largest).
function ringCentroid(ring: number[][]): { center: L.LatLng; area: number } {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    a += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (a === 0) return { center: L.latLng(ring[0][1], ring[0][0]), area: 0 };
  return { center: L.latLng(cy / (3 * a), cx / (3 * a)), area: Math.abs(a / 2) };
}

/**
 * Romeinse Limes overlay from local vector data (data/romeinse_limes.geojson,
 * gemeente Archeologie ARC_ROMEINSE_LIMES). Renders the kern-/bufferzone
 * polygons (matching the WMS colors, but without its tile seams) and, per
 * scene, a labelled pin on one component site.
 */
export class RomanManager {
  private map: L.Map;
  private layer: L.GeoJSON<LimesProps> | null = null;
  private loaded = false;
  // Per component site (SITENAAM), the largest polygon's centroid (pin spot)
  // and bounds (to frame the camera on it).
  private siteInfo = new Map<string, { center: L.LatLng; bounds: L.LatLngBounds; area: number }>();
  private pin: L.Marker | null = null;

  constructor(map: L.Map) {
    this.map = map;
  }

  setVisible(on: boolean): void {
    if (!on) {
      this.clearPin();
      if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
      return;
    }
    this.load(() => {
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
    });
  }

  /**
   * Show a labelled pin on the site whose SITENAAM contains `label` (or clear).
   * When `pan`, also center the camera on that site.
   */
  showPin(label: string | null, pan = false): void {
    this.clearPin();
    if (!label) return;
    this.load(() => {
      const needle = label.toLowerCase();
      const key = [...this.siteInfo.keys()].find((k) => k.toLowerCase().includes(needle));
      if (!key) return;
      const info = this.siteInfo.get(key)!;
      this.pin = L.marker(info.center, { icon: PIN_ICON })
        .addTo(this.map)
        .bindTooltip(label, { permanent: true, direction: "right", className: "limes-tip", offset: [8, -10] });
      if (pan) {
        const zoom = Math.min(16, this.map.getBoundsZoom(info.bounds.pad(0.6)));
        this.map.flyTo(info.center, zoom, { duration: 0.85 });
      }
    });
  }

  private clearPin(): void {
    if (this.pin) {
      this.map.removeLayer(this.pin);
      this.pin = null;
    }
  }

  private style = (feature?: LimesFeature): L.PathOptions => {
    const zone = feature?.properties.TYPE_ZONE ?? "";
    return { pane: "roman", ...(ZONE_STYLE[zone] ?? ZONE_STYLE.Bufferzone) };
  };

  private load(cb: () => void): void {
    if (this.loaded) {
      cb();
      return;
    }
    fetch("data/romeinse_limes.geojson")
      .then((r) => r.json())
      .then((gj) => {
        // Draw the larger bufferzone first so the kernzone sits on top of it.
        const features: LimesFeature[] = (gj.features as LimesFeature[])
          .filter((f) => f.geometry != null)
          .sort((a, b) => (a.properties.TYPE_ZONE === "Kernzone" ? 1 : 0) -
            (b.properties.TYPE_ZONE === "Kernzone" ? 1 : 0));
        const fc = { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
        this.layer = L.geoJSON<LimesProps>(fc, {
          pane: "roman",
          style: this.style,
          onEachFeature: (f, layer) => {
            const pr = (f as LimesFeature).properties;
            const geom = (f as LimesFeature).geometry;
            if (pr.SITENAAM && geom && (geom.type === "Polygon" || geom.type === "MultiPolygon")) {
              // Use the outer ring of each polygon part; keep the largest.
              const rings = geom.type === "Polygon"
                ? [geom.coordinates[0] as number[][]]
                : geom.coordinates.map((poly) => poly[0] as number[][]);
              const bounds = (layer as L.Polygon).getBounds();
              for (const ring of rings) {
                const c = ringCentroid(ring);
                const prev = this.siteInfo.get(pr.SITENAAM);
                if (!prev || c.area > prev.area) {
                  this.siteInfo.set(pr.SITENAAM, { center: c.center, bounds, area: c.area });
                }
              }
            }
            const name = pr.SITENAAM || pr.NAME_COMPP;
            if (name) {
              layer.bindPopup(
                `<div class="pp">${name}</div><div>${pr.TYPE_ZONE || ""}${pr.NAME_COMPP && pr.SITENAAM ? ` — ${pr.NAME_COMPP}` : ""}</div>`,
                { maxWidth: 280 },
              );
            }
          },
        });
        this.loaded = true;
        cb();
      })
      .catch((e) => console.error("limes load failed", e));
  }
}
