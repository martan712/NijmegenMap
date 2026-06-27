import { useEffect, useState } from "react";
import { fetchBlocks, fetchScene, fetchSegments, localName } from "../verhalen/api";
import type { Block, SceneComponent, Segment, StoryMeta } from "../verhalen/types";
import { fetchStoryMeta } from "../verhalen/api";

export interface SegmentContent {
  blocks: Block[];
  components: SceneComponent[];
}

/**
 * Loads a story's full content: the ordered segments (the timeline) plus every
 * segment's blocks + companion-map state, keyed by segment IRI. All logic is
 * server-side (SPARQL); this just fetches and holds the JSON.
 */
export function useVerhaal(storyId: string) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [content, setContent] = useState<Record<string, SegmentContent>>({});
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<StoryMeta | null>(null);
  // The story whose content is fully loaded right now — lets the consumer tell a
  // freshly-switched story's data apart from the previous story's lingering data.
  const [loadedStory, setLoadedStory] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    // Clear immediately so a story switch never shows the previous story's data.
    setSegments([]);
    setContent({});
    setMeta(null);
    setLoadedStory(null);
    setError(null);
    if (!storyId) return;

    fetchStoryMeta(storyId)
      .then((m) => { if (!off) setMeta(m); })
      .catch(() => {});

    fetchSegments(storyId)
      .then(async (segs) => {
        if (off) return;
        setSegments(segs);
        const entries = await Promise.all(
          segs.map(async (s) => {
            const id = localName(s.seg);
            const [blocks, components] = await Promise.all([fetchBlocks(id), fetchScene(id)]);
            return [s.seg, { blocks, components }] as const;
          }),
        );
        if (off) return;
        setContent(Object.fromEntries(entries));
        setLoadedStory(storyId);
      })
      .catch((e) => !off && setError(String(e)));
    return () => {
      off = true;
    };
  }, [storyId]);

  return { segments, content, error, meta, loadedStory };
}
