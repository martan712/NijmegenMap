import L from "leaflet";
import type { MovementArrow } from "../types";

const ACCENT = "#ff8a3d";

// Quadratic-bezier points (lat/lon) bowing perpendicular to from→to. Computed
// in a local equirectangular frame (lon scaled by cos(lat)) so the arc looks
// symmetric on screen regardless of latitude.
function curvePoints(a: [number, number], b: [number, number], bow: number): L.LatLngTuple[] {
  const k = Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));
  const ax = a[1] * k, ay = a[0], bx = b[1] * k, by = b[0];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1e-9;
  const cx = (ax + bx) / 2 + (-dy / len) * len * bow;
  const cy = (ay + by) / 2 + (dx / len) * len * bow;
  const pts: L.LatLngTuple[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, u = 1 - t;
    const x = u * u * ax + 2 * u * t * cx + t * t * bx;
    const y = u * u * ay + 2 * u * t * cy + t * t * by;
    pts.push([y, x / k]);
  }
  return pts;
}

// Arrowhead pinned at its tip (rotation pivots about the tip, so it keeps
// pointing along the curve's end at the exact end point).
function headIcon(angleDeg: number): L.DivIcon {
  return L.divIcon({
    className: "flow-arrow",
    html:
      `<svg width="22" height="22" viewBox="0 0 22 22" style="transform: rotate(${angleDeg}deg); transform-origin: 17px 11px">` +
      `<path d="M4 4 L17 11 L4 18 L8 11 Z" fill="${ACCENT}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    iconSize: [22, 22],
    iconAnchor: [17, 11],
  });
}

/** Draws curved, labelled movement arrows for a `movement` scene. */
export class FlowManager {
  private map: L.Map;
  private group: L.LayerGroup | null = null;

  constructor(map: L.Map) {
    this.map = map;
  }

  show(arrows: MovementArrow[] | null): void {
    if (this.group) {
      this.map.removeLayer(this.group);
      this.group = null;
    }
    if (!arrows || arrows.length === 0) return;
    const group = L.layerGroup();
    for (const arr of arrows) {
      const pts = curvePoints(arr.from, arr.to, arr.curve ?? 0.18);
      // White casing under the accent line for contrast over the map.
      L.polyline(pts, { pane: "roman", color: "#fff", weight: 6, opacity: 0.9, lineCap: "round" }).addTo(group);
      L.polyline(pts, { pane: "roman", color: ACCENT, weight: 3, lineCap: "round" }).addTo(group);

      // Arrowhead angle from the last segment, in CSS-pixel space (north = up).
      const end = pts[pts.length - 1], prev = pts[pts.length - 2];
      const k = Math.cos((end[0] as number) * (Math.PI / 180));
      const angle = Math.atan2(prev[0] - end[0], (end[1] - prev[1]) * k) * (180 / Math.PI);
      L.marker(end, { icon: headIcon(angle), interactive: false }).addTo(group);

      if (arr.label) {
        const mid = pts[Math.round(pts.length / 2)];
        L.marker(mid, {
          icon: L.divIcon({ className: "flow-label", html: `<span>${arr.label}</span>`, iconSize: [0, 0] }),
          interactive: false,
        }).addTo(group);
      }
    }
    group.addTo(this.map);
    this.group = group;
  }
}
