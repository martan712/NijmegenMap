// Shapes returned by the Java backend's REST API (all values are SPARQL lexical
// forms — strings — or null). The frontend stays a pure consumer of these.

export interface Segment {
  seg: string; // IRI
  order: string;
  tick: string;
  event?: string | null;
  eventLabel?: string | null;
  date?: string | null;
}

export interface Block {
  block: string; // IRI
  type: string; // IRI, e.g. .../ns#GalleryBlock
  order: string;
  text?: string | null;
  ref?: string | null;
  verbatim?: string | null;
  mediaPath?: string | null;
  credit?: string | null;
  locator?: string | null;
}

export interface MapRow {
  kind: "place" | "arrow";
  place?: string | null;
  lat?: string | null;
  long?: string | null;
  label?: string | null;
  year?: string | null;
  /** Cumulative WW2 damage-overlay level for this segment's map (nmg:overlayLevel). */
  overlay?: string | null;
  fromLat?: string | null;
  fromLong?: string | null;
  toLat?: string | null;
  toLong?: string | null;
  arrowLabel?: string | null;
  curve?: string | null;
}
