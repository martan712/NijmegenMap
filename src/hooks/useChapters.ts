import { useEffect, useMemo, useState } from "react";
import { CHAPTERS } from "../config/chapters";
import {
  buildDefenceScenes,
  parseDefenceRings,
  type DefenceRing,
} from "../config/defenceScenes";
import type { Chapter } from "../types";

/**
 * Returns the book with data-driven threads resolved: any thread with
 * `source: "vestingwerken"` gets its scenes built from the gemeente's
 * CHW_VESTINGWERKEN layer (caption text = the layer's TOELICHTING). Until the
 * data loads, such threads have no scenes (the UI shows a loading state).
 */
export function useChapters(): Chapter[] {
  const [rings, setRings] = useState<DefenceRing[]>([]);

  useEffect(() => {
    fetch("data/vestingwerken.geojson")
      .then((r) => r.json())
      .then((gj) => setRings(parseDefenceRings(gj.features)))
      .catch((e) => console.error("vestingwerken load failed", e));
  }, []);

  return useMemo(
    () =>
      CHAPTERS.map((chapter) => ({
        ...chapter,
        threads: chapter.threads.map((thread) =>
          thread.source === "vestingwerken"
            ? // Generated ring scenes first, then any static scenes (the wall).
              { ...thread, scenes: [...buildDefenceScenes(rings), ...thread.scenes] }
            : thread,
        ),
      })),
    [rings],
  );
}
