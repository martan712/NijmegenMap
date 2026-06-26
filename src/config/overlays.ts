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

// --- Unified polygon overlays -------------------------------------------
// The limes zones and the WW2 damage are the same thing: a GeoJSON of polygons,
// each assigned a category by one feature property, styled per category, and
// (optionally) revealed cumulatively by an order. One PolygonOverlayManager
// renders any overlay described by an OverlayDef; the graph names which overlay
// a MapState shows (nmg:overlay → nmg:overlayKey) — see PolygonOverlayManager.

/** One category of features within an overlay (a value of `categoryProp`). */
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

/** A polygon overlay: a GeoJSON of categorised, conditionally-rendered polygons. */
export interface OverlayDef {
  /** Stable key matching the graph's nmg:overlayKey. */
  key: string;
  /** Map pane the polygons draw into. */
  pane: keyof typeof PANES;
  /** GeoJSON URL for the polygons. */
  src: string;
  /** Feature property whose value selects a category. */
  categoryProp: string;
  categories: OverlayCategory[];
  /** Feature properties tried in order for a per-feature popup title. */
  nameProps?: string[];
  /** Always-on context layer drawn underneath (e.g. the 1944 building footprints). */
  background?: {
    src: string;
    pane: keyof typeof PANES;
    fill: string;
    line: string;
    weight: number;
    fillOpacity: number;
  };
  /** Bright style for the single highlighted order (cumulative overlays). */
  highlight?: { fill: string; line: string; fillOpacity?: number; weight?: number };
  /** Dim "anchor" variant: show only features whose name contains `site`, desaturated. */
  dim?: { site: string; fill: string; line: string; fillOpacity: number; weight: number };
}

export const LIMES_OVERLAY: OverlayDef = {
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
};

export const WW2_OVERLAY: OverlayDef = {
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
};

/** Every overlay, keyed for lookup by the graph's overlayKey. */
export const OVERLAYS: Record<string, OverlayDef> = {
  [LIMES_OVERLAY.key]: LIMES_OVERLAY,
  [WW2_OVERLAY.key]: WW2_OVERLAY,
};
