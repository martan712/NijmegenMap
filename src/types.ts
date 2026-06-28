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
  /** Optional descriptive text shown in the popup (photo pins). */
  text?: string;
}

/** One Stolperstein (memorial stone) marker: a victim at a located address. */
export interface MemorialPoint {
  lat: number;
  lng: number;
  name: string;
  lifespan?: string;
  address?: string;
  inscription?: string;
  image?: string;
}

/** One Wikidata heritage place (rijksmonument etc.): a located, enriched marker. */
export interface HeritagePoint {
  lat: number;
  lng: number;
  name: string;
  /** "; "-joined Wikidata type labels (P31); also the per-chapter filter key. */
  categories?: string;
  inception?: string;
  renovations?: string;
  architects?: string;
  style?: string;
  monumentId?: string;
  image?: string;
}

/** One generic Wikidata instance marker (common fields across any nmg:wikidataSet). */
export interface WikidataLayerPoint {
  lat: number;
  lng: number;
  name: string;
  categories?: string;
  inception?: string;
  image?: string;
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

/** The top-right year readout. */
export interface Badge {
  label: string | number;
  era?: string;
  tag: string;
}

/** Top-level navigation surface: the Verhalen scrollytelling or Vrij verkennen. */
export type Mode = "free" | "verhalen";

/** Free-explore base-map filter. */
export type FilterMode = "all" | "map" | "aerial";
