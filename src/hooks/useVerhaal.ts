import { useEffect, useState } from "react";
import { fetchBlocks, fetchMap, fetchSegments, localName } from "../verhalen/api";
import type { Block, MapRow, Segment } from "../verhalen/types";

export interface SegmentContent {
  blocks: Block[];
  mapRows: MapRow[];
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

  useEffect(() => {
    let off = false;
    fetchSegments(storyId)
      .then(async (segs) => {
        if (off) return;
        setSegments(segs);
        const entries = await Promise.all(
          segs.map(async (s) => {
            const id = localName(s.seg);
            const [blocks, mapRows] = await Promise.all([fetchBlocks(id), fetchMap(id)]);
            return [s.seg, { blocks, mapRows }] as const;
          }),
        );
        if (!off) setContent(Object.fromEntries(entries));
      })
      .catch((e) => !off && setError(String(e)));
    return () => {
      off = true;
    };
  }, [storyId]);

  return { segments, content, error };
}
