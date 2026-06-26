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

export interface Stolperstein {
  s: string; // IRI
  name: string;
  lat: string;
  long: string;
  lifespan?: string | null;
  address?: string | null;
  inscription?: string | null;
  image?: string | null;
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
  // null for a base-map-only state (no focus place / arrow) that only carries
  // year / overlay / limes.
  kind: "place" | "arrow" | "photopin" | null;
  place?: string | null;
  lat?: string | null;
  long?: string | null;
  label?: string | null;
  /** photopin rows: the located image + its caption + description. */
  image?: string | null;
  credit?: string | null;
  text?: string | null;
  year?: string | null;
  /** Cumulative overlay level (nmg:overlayLevel): WW2 damage order, or growth year. */
  overlay?: string | null;
  /** Which polygon overlay this map shows (nmg:overlay → nmg:overlayKey), e.g. "limes"/"ww2". */
  overlayKey?: string | null;
  /** Fortification-ring reveal year (nmg:fortLevel): rings established by this year show. */
  fort?: string | null;
  fromLat?: string | null;
  fromLong?: string | null;
  toLat?: string | null;
  toLong?: string | null;
  arrowLabel?: string | null;
  curve?: string | null;
}

export interface StoryMeta {
  story: string;
  label: string;
  intro?: string | null;
  era?: string | null;
  year?: string | null;
  tag?: string | null;
}

export interface StoryListEntry {
  story: string;
  label: string;
  intro?: string | null;
  era?: string | null;
  year?: string | null;
  tag?: string | null;
}
