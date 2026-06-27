import type { Block, SceneComponent, Segment, Stolperstein, StoryMeta, StoryListEntry } from "./types";

// The Java backend (Apache Jena + Javalin). Override with VITE_API at build time.
const API =
  (import.meta.env.VITE_API as string | undefined) ?? "http://localhost:8088";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const fetchSegments = (storyId: string) =>
  get<Segment[]>(`/api/stories/${storyId}/segments`);
export const fetchBlocks = (segId: string) =>
  get<Block[]>(`/api/segments/${segId}/blocks`);
export const fetchScene = (segId: string) =>
  get<SceneComponent[]>(`/api/segments/${segId}/scene`);
export const fetchStolpersteine = () =>
  get<Stolperstein[]>(`/api/stolpersteine`);
export const fetchStories = () =>
  get<StoryListEntry[]>("/api/stories");
export const fetchStoryMeta = (storyId: string) =>
  get<StoryMeta>(`/api/stories/${storyId}/meta`);

/** Last path/fragment segment of an IRI → the bare resource id. */
export const localName = (iri: string): string =>
  iri.includes("#") ? iri.split("#").pop()! : iri.split("/").pop()!;

/** A site-root-relative mediaPath ("data/…") → a URL served from public/data. */
export const mediaUrl = (p: string): string => "/" + p.replace(/^\//, "");
