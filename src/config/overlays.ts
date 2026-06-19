// Constants + small pure helpers shared by the overlay managers and the
// React legend. No Leaflet here — just data and math.

/** 1x1 transparent GIF used as Leaflet's errorTileUrl (hides missing tiles). */
export const BLANK =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/**
 * Map panes and their z-order. Higher = drawn on top.
 *   hist(350) < live(overlay 400) < growth(450) < wo2bg(455)
 *   < fort(458) < wall(459) < wo2(460) < spy(500)
 */
export const PANES = {
  hist: 350,
  growth: 450,
  wo2bg: 455,
  fort: 458,
  wall: 459,
  wo2: 460,
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
