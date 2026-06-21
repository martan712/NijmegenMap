import L from "leaflet";
import { BLANK } from "../config/overlays";
import type { ManifestEntry } from "../types";

type BaseLayer = L.TileLayer | L.ImageOverlay;

/**
 * Renders the active base map/aerial and keeps it sharp.
 *
 * Each layer is a local XYZ tile pyramid (fast, fully local) when built, else
 * a single anchored image. The pyramid is only crisp up to its maxzoom; beyond
 * that we fetch a live WMS render of the current viewport and lay it on top.
 */
export class BaseLayerManager {
  private map: L.Map;
  private cache = new Map<string, BaseLayer>();
  private active: BaseLayer | null = null;
  private current: ManifestEntry | null = null;
  private opacity = 1;

  private live: L.ImageOverlay | null = null;
  private liveToken = 0;
  private liveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(map: L.Map) {
    this.map = map;
    this.map.on("moveend zoomend", () => {
      if (this.liveTimer) clearTimeout(this.liveTimer);
      this.liveTimer = setTimeout(() => this.refreshLive(), 160);
    });
  }

  /** Crossfade to the base layer for an entry and refresh the live overlay. */
  setActive(entry: ManifestEntry): void {
    this.current = entry;
    const next = this.layerFor(entry);
    if (!this.map.hasLayer(next)) {
      next.setOpacity(0);
      next.addTo(this.map);
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => next.setOpacity(this.opacity)),
    );
    const old = this.active;
    this.active = next;
    if (old && old !== next) {
      old.setOpacity(0);
      setTimeout(() => {
        if (this.active !== old) this.map.removeLayer(old);
      }, 320);
    }
    this.clearLive();
    this.refreshLive();
  }

  setOpacity(opacity: number): void {
    this.opacity = opacity;
    this.active?.setOpacity(opacity);
    this.live?.setOpacity(opacity);
  }

  /** Remove the historical base entirely, revealing the modern reference map. */
  clear(): void {
    this.current = null;
    this.clearLive();
    const old = this.active;
    this.active = null;
    if (old) {
      old.setOpacity(0);
      setTimeout(() => {
        if (this.active !== old) this.map.removeLayer(old);
      }, 320);
    }
  }

  private layerFor(entry: ManifestEntry): BaseLayer {
    const cached = this.cache.get(entry.file);
    if (cached) return cached;
    let layer: BaseLayer;
    if (entry.tiles) {
      layer = L.tileLayer(entry.tiles, {
        pane: "hist", bounds: entry.bounds, opacity: 0, className: "wms-img",
        minNativeZoom: entry.minzoom, maxNativeZoom: entry.maxzoom,
        minZoom: 12, maxZoom: 19, errorTileUrl: BLANK, keepBuffer: 2,
      });
    } else {
      layer = L.imageOverlay(entry.file, entry.bounds, {
        pane: "hist", opacity: 0, interactive: false, className: "wms-img",
      });
    }
    this.cache.set(entry.file, layer);
    return layer;
  }

  private liveMax(entry: ManifestEntry): number {
    return entry.maxzoom != null ? entry.maxzoom : 15;
  }

  private clearLive(): void {
    this.liveToken++;
    if (this.live) {
      this.map.removeLayer(this.live);
      this.live = null;
    }
  }

  private refreshLive(): void {
    const entry = this.current;
    if (!entry || this.map.getZoom() <= this.liveMax(entry)) {
      this.clearLive();
      return;
    }
    const b = this.map.getBounds().pad(0.08);
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const size = this.map.getSize();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.min(3999, Math.round(size.x * dpr * 1.16));
    const h = Math.min(3999, Math.round(size.y * dpr * 1.16));
    const params = new URLSearchParams({
      service: "WMS", request: "GetMap", version: "1.3.0",
      layers: entry.layers, styles: "", crs: "EPSG:4326",
      format: "image/png", transparent: "true", width: String(w), height: String(h),
      // WMS 1.3.0 + EPSG:4326 axis order = lat,lon (south,west,north,east)
      bbox: [sw.lat, sw.lng, ne.lat, ne.lng].join(","),
    });
    const token = ++this.liveToken;
    const img = L.imageOverlay(entry.wms + "?" + params.toString(), b, {
      opacity: 0, interactive: false, className: "wms-img", zIndex: 650,
    }).addTo(this.map);
    img.on("load", () => {
      if (token !== this.liveToken) {
        this.map.removeLayer(img);
        return;
      }
      img.setOpacity(this.opacity);
      const old = this.live;
      this.live = img;
      if (old && old !== img) setTimeout(() => this.map.removeLayer(old), 320);
    });
    img.on("error", () => {
      if (img !== this.live) this.map.removeLayer(img);
    });
  }
}
