// Shapes returned by the Java backend's REST API (all values are SPARQL lexical
// forms — strings — or null). The frontend stays a pure consumer of these.

export interface Segment {
  seg: string; // IRI
  order: string;
  tick: string;
  event?: string | null;
  eventLabel?: string | null;
  date?: string | null;
  /** The verhaallijn (thread) this segment belongs to, within its chapter. */
  thread?: string | null;
  threadLabel?: string | null;
  threadOrder?: string | null;
}

/** A verhaallijn: an ordered run of segments within a chapter. Derived frontend-side. */
export interface ThreadGroup {
  id: string;
  label: string;
  /** Global segment indices (into the chapter's flat segment array), in order. */
  segIdx: number[];
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

export interface Heritage {
  s: string; // IRI
  name: string;
  lat: string;
  long: string;
  categories?: string | null;
  inception?: string | null;
  renovations?: string | null;
  architects?: string | null;
  style?: string | null;
  monumentId?: string | null;
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

/**
 * One typed component of a segment's companion-map scene (from
 * `/api/segments/{id}/scene`). `type` is the discriminator the SceneManager
 * dispatches on — BaseMap, PolygonOverlay (with `key`/`level`), FocusPlace,
 * PhotoPin, Arrow, MemorialLayer; every other field is a SPARQL lexical form
 * (a string) or absent.
 */
export interface SceneComponent {
  type: string;
  [key: string]: string | null | undefined;
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
