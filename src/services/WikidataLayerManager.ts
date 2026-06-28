import L from "leaflet";
import type { WikidataLayerPoint } from "../types";
import { fetchWikidata } from "../verhalen/api";
import type { WikidataInstance } from "../verhalen/types";

/**
 * Generic Wikidata instance layer: one amber marker per instance of the
 * requested nmg:wikidataSet key, drawn on a canvas (fast for many points).
 * `show(set, filters)` lazily fetches and renders; `show(null, …)` clears.
 *
 * Unlike HeritageManager (which pre-fetches one fixed dataset), this manager
 * fetches lazily and caches per set key so new catalog sets need no VerhalenView
 * changes — a scene that declares nmg:showWikidataLayer "<key>" just works.
 *
 * Distinct from the heritage layer (blue #2e6bff): uses magenta #e6007e.
 */
export class WikidataLayerManager {
  private map: L.Map;
  private renderer: L.SVG;
  private layer: L.LayerGroup | null = null;
  /** One Promise per set key — fetched once, then cached for the session. */
  private cache = new Map<string, Promise<WikidataLayerPoint[]>>();
  /** The most recently requested set; stale resolves are silently discarded. */
  private latestSet: string | null = null;

  constructor(map: L.Map) {
    this.map = map;
    // SVG (not canvas) so only the drawn dots capture clicks and the gaps fall
    // through to panes below; a canvas would swallow clicks across the whole map.
    this.renderer = L.svg({ pane: "wikidata" });
  }

  /**
   * Show markers for `set` (a nmg:wikidataSet key), filtered by optional
   * category/inception-period filters (reusing the heritage filter schema).
   * Passing `null` clears the layer. Fetches are lazy and cached per set;
   * a race guard ensures only the latest requested set is ever rendered.
   */
  show(
    set: string | null,
    filters: { categories?: string | null; before?: string | null; after?: string | null; depicts?: string | null; datedOnly?: string | null },
  ): void {
    this.latestSet = set;
    if (!set) {
      this._clear();
      return;
    }
    if (!this.cache.has(set)) {
      this.cache.set(
        set,
        fetchWikidata(set).then((rows: WikidataInstance[]) =>
          rows.map((r): WikidataLayerPoint => ({
            lat: +r.lat,
            lng: +r.long,
            name: r.name,
            categories: r.categories ?? undefined,
            inception: r.inception ?? undefined,
            image: r.image ?? undefined,
            depicts: r.depicts ?? undefined,
          })),
        ),
      );
    }
    const requestedSet = set;
    this.cache.get(set)!.then((points) => {
      // Race guard: discard if a newer set was requested while this was fetching.
      if (this.latestSet !== requestedSet) return;
      const filtered = this._filter(points, filters);
      this._render(filtered);
    });
  }

  private _filter(
    points: WikidataLayerPoint[],
    filters: { categories?: string | null; before?: string | null; after?: string | null; depicts?: string | null; datedOnly?: string | null },
  ): WikidataLayerPoint[] {
    const terms = (filters.categories ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const before = filters.before ? Number(filters.before) : null;
    const after = filters.after ? Number(filters.after) : null;
    const datedOnly = filters.datedOnly === "true";
    const depTerms = (filters.depicts ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    return points.filter((p) => {
      const cats = (p.categories ?? "").toLowerCase();
      if (terms.length && !terms.some((t) => cats.includes(t))) return false;
      const inc = p.inception ? Number(p.inception) : null;
      // Undated works pass by default; `datedOnly` opts into a clean per-era slice.
      if (datedOnly && inc == null) return false;
      if (inc != null && before != null && inc > before) return false;
      if (inc != null && after != null && inc < after) return false;
      const dep = (p.depicts ?? "").toLowerCase();
      if (depTerms.length && !depTerms.some((t) => dep.includes(t))) return false;
      return true;
    });
  }

  private _clear(): void {
    if (this.layer) {
      this.map.removeLayer(this.layer);
      this.layer = null;
    }
  }

  private _render(points: WikidataLayerPoint[]): void {
    this._clear();
    if (!points.length) return;
    const markers = points.map((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        pane: "wikidata",
        renderer: this.renderer,
        radius: 8,
        weight: 2.5,
        color: "#ffffff",
        fillColor: "#e6007e",
        fillOpacity: 1,
      });
      m.bindPopup(this._popupHtml(p), {
        className: "wallpop",
        maxWidth: 280,
        autoPan: false,
      });
      return m;
    });
    this.layer = L.layerGroup(markers).addTo(this.map);
  }

  private _popupHtml(p: WikidataLayerPoint): string {
    const sub = [p.categories, p.inception && `ca. ${p.inception}`, p.depicts && `toont: ${p.depicts}`]
      .filter(Boolean)
      .join(" — ");
    const img = p.image
      ? `<img class="wallpop-img" src="${p.image}" alt="" loading="lazy">`
      : "";
    return (
      `<div class="pp">${p.name}</div>` +
      (sub ? `<div class="pw">${sub}</div>` : "") +
      img
    );
  }
}
