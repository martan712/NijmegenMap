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
}

/**
 * One "page" of the book. Every scene shares these presentation fields; what it
 * renders on the map is set by the concrete variant below (the `kind`).
 */
interface SceneBase {
  title: string;
  text: string;
  /** Base map/aerial year to render (looked up in the manifest). */
  year: number;
  /** Extent to fly to (when the scene has no pin). */
  focus?: BoundsTuple;
  // Optional year-readout overrides.
  badge?: string;
  era?: string;
  tag?: string;
}

/** A plain historical-map page, no data overlay (the default kind). */
export interface MapScene extends SceneBase {
  kind?: "map";
}

/** Reveal Stadsontwikkeling (city-growth) polygons up to `upto`. */
export interface GrowthScene extends SceneBase {
  kind: "growth";
  upto: number;
}

/** Reveal fortification rings up to this period-year (cumulative). */
export interface FortScene extends SceneBase {
  kind: "fort";
  upto: number;
}

/** Show the city-wall points; optionally fly to + open one (by NUMMER). */
export interface WallScene extends SceneBase {
  kind: "wall";
  point?: number;
}

/** Reveal WW2 damage cumulatively up to this event order. */
export interface WW2Scene extends SceneBase {
  kind: "ww2";
  order: number;
}

/**
 * A pre-cartographic Roman page on the modern reference map: the Romeinse Limes
 * zones (`mode: "full"` with legend, or a dimmed `"anchor"`) plus a location pin.
 */
export interface LimesScene extends SceneBase {
  kind: "limes";
  mode?: "full" | "anchor";
  pin?: ScenePin;
}

/** A located pin on the modern map, no overlay (e.g. a vanished settlement). */
export interface PlaceScene extends SceneBase {
  kind: "place";
  pin: ScenePin;
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

/** A "how people moved" page: curved arrows over the modern reference map. */
export interface MovementScene extends SceneBase {
  kind: "movement";
  arrows: MovementArrow[];
}

/** A configured map state — one "page" of the book. */
export type Scene =
  | MapScene
  | GrowthScene
  | FortScene
  | WallScene
  | WW2Scene
  | LimesScene
  | PlaceScene
  | MovementScene;

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
export type Mode = "story" | "free";

/** Free-explore base-map filter. */
export type FilterMode = "all" | "map" | "aerial";
