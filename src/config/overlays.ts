// Constants + small pure helpers shared by the overlay managers and the
// React legend. No Leaflet here — just data and math.

/** 1x1 transparent GIF used as Leaflet's errorTileUrl (hides missing tiles). */
export const BLANK =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/**
 * Map panes and their z-order. Higher = drawn on top.
 *   hist(350) < roman(360) < live(overlay 400) < growth(450) < wo2bg(455)
 *   < fort(458) < wall(459) < wo2(460) < spy(500)
 */
export const PANES = {
  hist: 350,
  roman: 360,
  growth: 450,
  wo2bg: 455,
  fort: 458,
  wall: 459,
  wo2: 460,
  wikidata: 464,
  heritage: 465,
  memorial: 470,
  spy: 500,
} as const;

// --- City growth (Stadsontwikkeling) ------------------------------------
export const GROWTH_PERIODS = [
  "Voor 1230", "1250-1400", "1400-1525", "1525-1874", "1900", "1915",
  "1925", "1935", "1955", "1965", "1975", "1985", "2000", "Lent", "Veur Lent",
];

// Representative "established by" year for the cumulative reveal.
// Lent / Veur Lent are the post-2000 Waalsprong expansion, not the village.
export const GROWTH_PERIOD_YEAR: Record<string, number> = {
  "Voor 1230": 1230, "1250-1400": 1400, "1400-1525": 1525, "1525-1874": 1874,
  1900: 1900, 1915: 1915, 1925: 1925, 1935: 1935, 1955: 1955, 1965: 1965,
  1975: 1975, 1985: 1985, 2000: 2000, Lent: 2003, "Veur Lent": 2015,
};

export function growthColor(period: string): string {
  const i = GROWTH_PERIODS.indexOf(period);
  const n = GROWTH_PERIODS.length - 1;
  return `hsl(${8 + ((i < 0 ? 0 : i) / n) * 250} 70% 50%)`; // red(old) → blue(new)
}

// --- Fortifications (Vestingwerken) -------------------------------------
// The PERIODE strings embed years, e.g. "1598-1605 Italiaanse vestingbouw".
export function fortYearOf(period: string): number {
  return Math.max(...(period.match(/\d{4}/g) || ["0"]).map(Number));
}

export function fortColor(period: string): string {
  const t = Math.max(0, Math.min(1, (fortYearOf(period) - 1300) / (1732 - 1300)));
  return `hsl(${10 + t * 230} 75% 52%)`; // red(old) → blue(new)
}

// --- Romeinse Limes (ARC_ROMEINSE_LIMES) --------------------------------
// UNESCO Neder-Germaanse Limes zones; colors match the gemeente WMS styling.
export const LIMES_ZONES = [
  { zone: "Kernzone", label: "Kernzone", fill: "#d9694a", line: "#a8341f" },
  { zone: "Bufferzone", label: "Bufferzone", fill: "#5a8fd0", line: "#2f5f9e" },
] as const;

// --- WW2 damage (WO2_OORLOGSSCHADE) -------------------------------------
export interface Wo2Event {
  cat: string;
  order: number;
  label: string;
  era: string;
  desc: string;
}

// Cumulative events in chronological order; `order` drives the reveal.
export const WO2_EVENTS: Wo2Event[] = [
  {
    cat: "Bombardement 22 feb", order: 1, label: "Bombardement",
    era: "22 februari 1944",
    desc: "22 februari 1944 — Amerikaans vergissingsbombardement; grote delen van het centrum verwoest.",
  },
  {
    cat: "Bevrijding 17-21 sep", order: 2, label: "Bevrijding",
    era: "17–21 september 1944",
    desc: "17–21 september 1944 — strijd om de Waalbrug tijdens Operatie Market Garden.",
  },
  {
    cat: "Granatentijd 22 sep", order: 3, label: "Granatentijd",
    era: "vanaf 22 september 1944",
    desc: "Vanaf 22 september 1944 — Nijmegen als frontstad onder Duitse granaatbeschietingen.",
  },
];

export const WO2_ORDER: Record<string, number> = Object.fromEntries(
  WO2_EVENTS.map((e) => [e.cat, e.order]),
);
export const WO2_DESC: Record<string, string> = Object.fromEntries(
  WO2_EVENTS.map((e) => [e.cat, e.desc]),
);

// --- Unified feature overlays -------------------------------------------
// Every map overlay (the Roman limes zones, the WW2 damage, the city-growth
// polygons, the fortification rings) is the same thing: a GeoJSON of features,
// styled per feature and (optionally) revealed cumulatively. One
// FeatureOverlayManager renders any overlay described by an OverlayDef; the graph
// names which overlay a MapState shows (its nmg:overlayKey). An OverlayDef carries
// the style/interactivity/popup as functions of (feature, state) so the manager
// stays purely mechanical. `import type` keeps Leaflet a compile-time type only —
// no runtime Leaflet in this data+math module.
import type L from "leaflet";
import type { Feature, Geometry } from "geojson";

type Props = Record<string, string | null | undefined>;
type PolyFeature = Feature<Geometry, Props>;

/** Reveal state shared by all overlays (each uses the subset it needs). */
export interface OverlayState {
  /** Highest cumulative level visible (≤ this stays shown). Undefined = show all. */
  level?: number | null;
  /** The single order/level rendered bright (just-added). Null = none bright. */
  highlight?: number | null;
  /** Anchor variant: only the configured `dim.site` feature, desaturated. */
  dim?: boolean;
}

const OFF: L.PathOptions = { stroke: false, fill: false, fillOpacity: 0, opacity: 0 };

/** A feature overlay: a GeoJSON layer with per-feature style + reveal logic. */
export interface OverlayDef {
  /** Stable key matching the graph's nmg:overlayKey. */
  key: string;
  /** Map pane the features draw into. */
  pane: keyof typeof PANES;
  /** GeoJSON URL for the features. */
  src: string;
  /** Always-on context layer drawn underneath (e.g. the 1944 building footprints). */
  background?: {
    src: string;
    pane: keyof typeof PANES;
    fill: string;
    line: string;
    weight: number;
    fillOpacity: number;
  };
  /** Per-feature paint for the current reveal state. */
  style: (feature: PolyFeature, state: OverlayState) => L.PathOptions;
  /** Whether a feature is hit-testable in the current state (default: always). */
  interactive?: (feature: PolyFeature, state: OverlayState) => boolean;
  /** Popup HTML for a feature, or null for none. */
  popup?: (feature: PolyFeature) => string | null;
  /** Draw order: higher draws on top (e.g. Kernzone over Bufferzone). */
  sortKey?: (feature: PolyFeature) => number;
}

/** One category of features within a category overlay (a value of `categoryProp`). */
export interface OverlayCategory {
  /** The `categoryProp` value that selects this category. */
  match: string;
  /** Cumulative reveal order; omit for an always-visible (unconditional) category. */
  order?: number;
  fill: string;
  line: string;
  fillOpacity?: number;
  weight?: number;
  /** Popup body shown for features of this category (when no per-feature name). */
  label?: string;
  desc?: string;
}

/**
 * Build an OverlayDef for a "category overlay": features assigned a category by
 * one feature property, styled per category, optionally revealed cumulatively by
 * each category's `order` (the limes zones and the WW2 damage). Earlier categories
 * draw on top; a category with an `order` is hidden until its order is reached and
 * rendered bright when it is the highlighted (just-added) one.
 */
function categoryOverlay(cfg: {
  key: string;
  pane: keyof typeof PANES;
  src: string;
  categoryProp: string;
  categories: OverlayCategory[];
  nameProps?: string[];
  background?: OverlayDef["background"];
  /** Bright style for the highlighted order. */
  highlight?: { fill: string; line: string; fillOpacity?: number; weight?: number };
  /** Dim "anchor" variant: only features whose name contains `site`, desaturated. */
  dim?: { site: string; fill: string; line: string; fillOpacity: number; weight: number };
}): OverlayDef {
  const { pane, categoryProp, categories, nameProps = [], highlight, dim } = cfg;
  const conditional = categories.some((c) => c.order != null);
  const idx = (f: PolyFeature) =>
    categories.findIndex((c) => c.match === (f.properties?.[categoryProp] ?? ""));
  const catOf = (f: PolyFeature) => categories[idx(f)];

  return {
    key: cfg.key,
    pane,
    src: cfg.src,
    background: cfg.background,
    sortKey: (f) => {
      const i = idx(f);
      return i < 0 ? -Infinity : categories.length - i; // lower index → on top
    },
    style: (f, s) => {
      // Anchor variant: show only the configured site, desaturated.
      if (s.dim && dim) {
        const names = nameProps
          .map((p) => (f.properties?.[p] ?? "").toLowerCase())
          .join(" ");
        if (!names.includes(dim.site)) return { pane, ...OFF };
        return { pane, color: dim.line, weight: dim.weight, fillColor: dim.fill, fillOpacity: dim.fillOpacity };
      }
      const cat = catOf(f);
      if (!cat) return { pane, ...(conditional ? OFF : {}) };
      // Cumulative category: hidden until its order is reached; bright when it is
      // the highlighted (just-added) order, else the darker "already there".
      if (cat.order != null && s.level != null) {
        if (cat.order > s.level) return { pane, ...OFF };
        if (cat.order === s.highlight && highlight) {
          return {
            pane, stroke: true, fill: true, color: highlight.line, fillColor: highlight.fill,
            weight: highlight.weight ?? 1, opacity: 0.9, fillOpacity: highlight.fillOpacity ?? 0.55,
          };
        }
      }
      return {
        pane, stroke: true, fill: true, color: cat.line, fillColor: cat.fill,
        weight: cat.weight ?? 1, opacity: 0.45, fillOpacity: cat.fillOpacity ?? 0.35,
      };
    },
    interactive: conditional
      ? (f, s) => {
          const cat = catOf(f);
          return s.level == null || cat?.order == null || cat.order <= s.level;
        }
      : undefined,
    popup: (f) => {
      const title = nameProps.map((p) => f.properties?.[p]).find((v) => v);
      const cat = catOf(f);
      const head = title || cat?.label;
      if (!head) return null;
      const body = cat?.desc ?? (title && cat?.label ? cat.label : "");
      return `<div class="pp">${head}</div>${body ? `<div>${body}</div>` : ""}`;
    },
  };
}

export const LIMES_OVERLAY = categoryOverlay({
  key: "limes",
  pane: "roman",
  src: "data/romeinse_limes.geojson",
  categoryProp: "TYPE_ZONE",
  nameProps: ["SITENAAM", "NAME_COMPP"],
  // Reuse the shared limes palette; Kernzone draws on top of the Bufferzone.
  categories: LIMES_ZONES.map((z) => ({
    match: z.zone,
    fill: z.fill,
    line: z.line,
    fillOpacity: z.zone === "Kernzone" ? 0.45 : 0.4,
    weight: 1,
    label: z.label,
  })),
  dim: { site: "valkhof", fill: "#9aa3ad", line: "#4b5563", fillOpacity: 0.35, weight: 1.5 },
});

export const WW2_OVERLAY = categoryOverlay({
  key: "ww2",
  pane: "wo2",
  src: "data/wo2_oorlogsschade.geojson",
  categoryProp: "CATEGORIE",
  background: {
    src: "data/his_1944_bebouwing.geojson",
    pane: "wo2bg",
    fill: "#cabfb2",
    line: "#5b5048",
    weight: 0.4,
    fillOpacity: 0.85,
  },
  highlight: { fill: "#e8281e", line: "#e8281e", fillOpacity: 0.55, weight: 1 },
  // Each event is a cumulative order; revealed dark red, bright when highlighted.
  categories: WO2_EVENTS.map((e) => ({
    match: e.cat,
    order: e.order,
    fill: "#5c1712",
    line: "#7a1d16",
    fillOpacity: 0.25,
    weight: 1,
    label: e.label,
    desc: e.desc,
  })),
});

// City growth (Stadsontwikkeling): all periods always visible — built areas
// (period-year ≤ level) solid dark, not-yet-built faint dashed outlines. `level`
// is a year. Only built areas are clickable.
export const GROWTH_OVERLAY: OverlayDef = {
  key: "growth",
  pane: "growth",
  src: "data/stadsontwikkeling.geojson",
  style: (f, s) => {
    const p = f.properties?.PERIODE ?? "";
    const built = GROWTH_PERIOD_YEAR[p] <= (s.level ?? 0);
    return {
      pane: "growth",
      color: built ? "#1a1d23" : growthColor(p),
      weight: 1,
      opacity: built ? 0.7 : 0.35,
      dashArray: built ? undefined : "3 4",
      fillColor: growthColor(p),
      fillOpacity: built ? 0.5 : 0.0,
    };
  },
  interactive: (f, s) => GROWTH_PERIOD_YEAR[f.properties?.PERIODE ?? ""] <= (s.level ?? 0),
  popup: (f) => {
    const pr = f.properties ?? {};
    return (
      `<div class="pp">${pr.PERIODE ?? ""}</div>` +
      (pr.WIJKEN && pr.WIJKEN !== "None" ? `<div class="pw">${pr.WIJKEN}</div>` : "") +
      `<div>${pr.OMSCHRIJVING || ""}</div>`
    );
  },
};

// Fortifications (Vestingwerken): dated ring LINES, revealed cumulatively by the
// year embedded in PERIODE. `level` is a year; un-revealed rings draw at weight 0.
export const FORT_OVERLAY: OverlayDef = {
  key: "fort",
  pane: "fort",
  src: "data/vestingwerken.geojson",
  style: (f, s) => {
    const period = f.properties?.PERIODE ?? "";
    const on = s.level == null || fortYearOf(period) <= s.level;
    return { pane: "fort", color: fortColor(period), weight: on ? 3 : 0, opacity: on ? 0.92 : 0 };
  },
  interactive: (f, s) => s.level == null || fortYearOf(f.properties?.PERIODE ?? "") <= (s.level ?? 0),
  popup: (f) => {
    const pr = f.properties ?? {};
    return `<div class="pp">${pr.PERIODE ?? ""}</div><div>${pr.TOELICHTING || ""}</div>`;
  },
};

/** Every overlay, keyed for lookup by the graph's overlayKey. */
export const OVERLAYS: Record<string, OverlayDef> = {
  [LIMES_OVERLAY.key]: LIMES_OVERLAY,
  [WW2_OVERLAY.key]: WW2_OVERLAY,
  [GROWTH_OVERLAY.key]: GROWTH_OVERLAY,
  [FORT_OVERLAY.key]: FORT_OVERLAY,
};
