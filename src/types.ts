// Shared domain types for the whole app.

/** Leaflet-style bounds tuple: [[south, west], [north, east]]. */
export type BoundsTuple = [[number, number], [number, number]];

export type EntryType = "map" | "aerial" | "wo2";

/** One row of maps.json (plus the synthetic WW2 stops added at load time). */
export interface ManifestEntry {
  year: number;
  type: EntryType;
  era: string;
  label: string;
  file: string;
  bounds: BoundsTuple;
  layers: string;
  wms: string;
  tiles?: string;
  minzoom?: number;
  maxzoom?: number;
  // Present only on the synthetic WW2 stops cloned from the 1938 base.
  wo2cat?: string;
  wo2order?: number;
}

/** A single configured map state — one "page" of the book. */
export interface Scene {
  title: string;
  text: string;
  /** Base map/aerial year to render (looked up in the manifest). */
  year: number;
  /** Extent to fly to. */
  focus?: BoundsTuple;
  /** Reveal Stadsontwikkeling polygons up to this year. */
  growthUpto?: number;
  /** Reveal fortification rings up to this period-year. */
  fortUpto?: number;
  /** Show the city-wall points. */
  wall?: boolean;
  /** Reveal WW2 damage cumulatively up to this event order. */
  ww2Order?: number;
  // Optional year-readout overrides.
  badge?: string;
  era?: string;
  tag?: string;
}

/** A short, ordered run of scenes you page through. */
export interface Thread {
  title: string;
  sub?: string;
  scenes: Scene[];
}

/** A themed era that opens into one or more threads. */
export interface Chapter {
  title: string;
  short: string;
  intro: string;
  focus: BoundsTuple;
  /** Representative base year shown on the chapter overview. */
  year: number;
  threads: Thread[];
}

/** The top-right year readout. */
export interface Badge {
  label: string | number;
  era?: string;
  tag: string;
}

/** Top-level navigation mode. */
export type Mode = "story" | "free";

/** Free-explore base-map filter. */
export type FilterMode = "all" | "map" | "aerial";
