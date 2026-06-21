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

// "Anchor" mode (post-Roman scenes) shows only this kernzone, desaturated: a
// quiet location outline of the Valkhof without the limes colors or legend.
const ANCHOR_SITE = "valkhof";
const DIM_STYLE: L.PathOptions = {
  color: "#4b5563", weight: 1.5, fillColor: "#9aa3ad", fillOpacity: 0.35,
};
const HIDDEN: L.PathOptions = { stroke: false, fill: false };

/**
 * Romeinse Limes overlay from local vector data (data/romeinse_limes.geojson,
 * gemeente Archeologie ARC_ROMEINSE_LIMES). Renders the kern-/bufferzone
 * polygons (matching the WMS colors, but without its tile seams).
 * `setVisible(true)` loads + shows; `setVisible(false)` hides.
 */
export class RomanManager {
  private map: L.Map;
  private layer: L.GeoJSON<LimesProps> | null = null;
  private loaded = false;
  private dim = false;

  constructor(map: L.Map) {
    this.map = map;
  }

  /** Show the zones; `dim` renders them as a faint anchor (no limes colors). */
  setVisible(on: boolean, dim = false): void {
    if (!on) {
      if (this.layer && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
      return;
    }
    this.dim = dim;
    this.load(() => {
      if (this.layer && !this.map.hasLayer(this.layer)) this.layer.addTo(this.map);
      this.layer?.setStyle(this.style);
    });
  }

  private style = (feature?: LimesFeature): L.PathOptions => {
    if (this.dim) {
      // Anchor mode: show only the Valkhof kernzone, hide every other zone.
      const site = (feature?.properties.SITENAAM ?? "").toLowerCase();
      return { pane: "roman", ...(site.includes(ANCHOR_SITE) ? DIM_STYLE : HIDDEN) };
    }
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
