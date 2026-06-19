import L from "leaflet";
import { BLANK } from "../config/overlays";
import type { ManifestEntry } from "../types";

type SpyLayer = L.TileLayer | L.ImageOverlay;

const LENS_HIDDEN = "circle(0px at -300px -300px)";
const LENS_R = 130; // matches the lens DOM radius (260 / 2)

/** DOM nodes for the lens ring and its year label (rendered by React). */
export interface LensRefs {
  ring: HTMLElement;
  year: HTMLElement;
}

/**
 * A circular lens that follows the cursor and shows a second (compare) year in
 * a dedicated high pane, clipped to the lens. Lets you peek between two eras at
 * the same spot. Free-explore only.
 */
export class SpyManager {
  private map: L.Map;
  private lens: LensRefs;
  private pane: HTMLElement;
  private cache = new Map<string, SpyLayer>();
  private layer: SpyLayer | null = null;
  private lastPoint: L.Point | null = null;
  private enabled = false;

  constructor(map: L.Map, lens: LensRefs) {
    this.map = map;
    this.lens = lens;
    this.pane = map.getPane("spy")!;
    this.pane.style.pointerEvents = "none";
    this.pane.style.clipPath = LENS_HIDDEN;

    map.on("mousemove", (e) => {
      if (this.enabled) this.position(e.containerPoint);
    });
    map.on("move zoom", () => {
      if (this.enabled) this.position(this.lastPoint);
    });
    const c = map.getContainer();
    c.addEventListener("mouseleave", () => {
      if (this.enabled) {
        this.lens.ring.style.display = "none";
        this.pane.style.clipPath = LENS_HIDDEN;
      }
    });
    c.addEventListener("mouseenter", () => {
      if (this.enabled) this.lens.ring.style.display = "block";
    });
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (on) {
      this.lens.ring.style.display = "block";
      this.position(this.lastPoint || this.map.latLngToContainerPoint(this.map.getCenter()));
    } else {
      if (this.layer) this.map.removeLayer(this.layer);
      this.lens.ring.style.display = "none";
      this.pane.style.clipPath = LENS_HIDDEN;
    }
  }

  /** Set which year shows inside the lens. */
  setEntry(entry: ManifestEntry): void {
    const next = this.layerFor(entry);
    if (this.layer && this.layer !== next) this.map.removeLayer(this.layer);
    this.layer = next;
    if (this.enabled && !this.map.hasLayer(next)) next.addTo(this.map);
    this.lens.year.textContent = entry.label || String(entry.year);
  }

  private layerFor(entry: ManifestEntry): SpyLayer {
    const cached = this.cache.get(entry.file);
    if (cached) return cached;
    let layer: SpyLayer;
    if (entry.tiles) {
      layer = L.tileLayer(entry.tiles, {
        pane: "spy", bounds: entry.bounds, errorTileUrl: BLANK, keepBuffer: 2,
        minNativeZoom: entry.minzoom, maxNativeZoom: entry.maxzoom, minZoom: 12, maxZoom: 19,
      });
    } else {
      layer = L.imageOverlay(entry.file, entry.bounds, { pane: "spy", interactive: false });
    }
    this.cache.set(entry.file, layer);
    return layer;
  }

  private position(point: L.Point | null): void {
    if (!point) return;
    this.lastPoint = point;
    const mp = L.DomUtil.getPosition(this.map.getPane("mapPane")!);
    this.pane.style.clipPath = `circle(${LENS_R}px at ${point.x - mp.x}px ${point.y - mp.y}px)`;
    this.lens.ring.style.left = point.x + "px";
    this.lens.ring.style.top = point.y + "px";
  }
}
