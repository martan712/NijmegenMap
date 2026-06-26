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

/** A labelled marker the camera centres on (pre-cartographic era scenes). */
export interface ScenePin {
  label: string;
  /** [lat, lon] of the marker tip. */
  at: [number, number];
  /** Zoom to fly to (default ~15.5). */
  zoom?: number;
  /** Local illustration shown in the pin's popup (e.g. "data/images/roman/valkhof.jpg"). */
  image?: string;
  /** Caption / attribution shown under the image. */
  credit?: string;
}

/** One directed, curved arrow between two [lat, lon] points. */
export interface MovementArrow {
  from: [number, number];
  to: [number, number];
  /** Short label placed at the arc's apex. */
  label?: string;
  /** Signed bow of the curve; negative bends the other way (default 0.18). */
  curve?: number;
}

/**
 * One "page" of the book: a configured map state.
 *
 * Besides the shared presentation fields, a scene declares its map layers as
 * independent optional fields — and ANY combination may be set at once. So a
 * single scene can show, e.g., the limes anchor + a pin image + raid arrows, or
 * the city-growth polygons together with a located pin. Each layer maps 1:1 to
 * a manager in MapEngine.applyScene, which sets every manager (value or off)
 * every scene so transitions animate instead of blink.
 */
export interface Scene {
  title: string;
  text: string;
  /** Base map/aerial year to render (looked up in the manifest). */
  year: number;
  /** Extent to fly to. Takes precedence over a pin's own centre. */
  focus?: BoundsTuple;
  // Optional year-readout overrides.
  badge?: string;
  era?: string;
  tag?: string;

  // ---- Composable map layers (any combination) ----
  /**
   * Show the historical base map for `year`. When omitted it shows
   * automatically, unless the scene is purely pre-cartographic (only a pin,
   * arrows and/or the limes overlay) — those render on the modern reference
   * map. Set explicitly to override (e.g. growth polygons over the 1557 map
   * while a pin is also shown).
   */
  basemap?: boolean;
  /** A located image marker; its popup auto-opens. */
  pin?: ScenePin;
  /** Curved, labelled movement / raid arrows. */
  arrows?: MovementArrow[];
  /** Reveal Stadsontwikkeling (city-growth) polygons built up to this year. */
  growth?: number;
  /** Reveal fortification rings up to this period-year (cumulative). */
  fort?: number;
  /** Romeinse Limes frontier overlay: the kern-/bufferzones (+ legend). */
  limes?: boolean;
  /**
   * Dimmed Valkhof location cue — a faint spotlight on the Valkhof (reuses the
   * limes kernzone geometry). A separate, simpler concern than the `limes`
   * frontier overlay; used to anchor the post-Roman Valkhof scenes.
   */
  anchor?: boolean;
  /** Show the city-wall points. */
  wall?: boolean;
  /** Fly to + open one wall point by NUMMER (implies `wall`). */
  wallPoint?: number;
  /** Reveal WW2 damage cumulatively up to this event order (persists, dark red). */
  ww2?: number;
  /**
   * Which damage order to render BRIGHT red — the moment it is first added.
   * `null` = none bright (a scene that only carries forward earlier damage).
   * Omitted = default to `ww2` (each Atlas scene introduces its own level).
   */
  ww2Highlight?: number | null;
}

/** A datasource that a thread's scenes are generated from at runtime. */
export type ThreadSource = "vestingwerken";

/** A short, ordered run of scenes you page through. */
export interface Thread {
  title: string;
  sub?: string;
  /** Static scenes. Empty when `source` generates them from a dataset. */
  scenes: Scene[];
  /** If set, scenes are built from this gemeente datasource (see useChapters). */
  source?: ThreadSource;
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
export type Mode = "story" | "free" | "verhalen";

/** Free-explore base-map filter. */
export type FilterMode = "all" | "map" | "aerial";
