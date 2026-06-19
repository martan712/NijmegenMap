import { useEffect, useState } from "react";
import type { MapEngine } from "../services/MapEngine";
import type { Chapter } from "../types";

/**
 * Owns the book position (chapter → thread → scene) and renders it through the
 * engine while story mode is active. Free exploration uses a separate hook.
 */
export function useStoryNavigation(
  engine: MapEngine | null,
  chapters: Chapter[],
  active: boolean,
) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [threadIndex, setThreadIndex] = useState<number | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);

  function openChapter(index: number) {
    setChapterIndex(index);
    setThreadIndex(null);
    setSceneIndex(0);
  }
  function openThread(index: number) {
    setThreadIndex(index);
    setSceneIndex(0);
  }
  function backToChapter() {
    setThreadIndex(null);
  }
  function gotoScene(index: number) {
    const scenes = chapters[chapterIndex].threads[threadIndex ?? 0].scenes;
    setSceneIndex(Math.max(0, Math.min(index, scenes.length - 1)));
  }

  // Render the current chapter overview or scene whenever it (or the data
  // behind a data-driven thread) changes.
  useEffect(() => {
    if (!engine || !active) return;
    const chapter = chapters[chapterIndex];
    const scene =
      threadIndex != null ? chapter.threads[threadIndex].scenes[sceneIndex] : undefined;
    if (scene) {
      engine.setOpacity(1); // story scenes always render at full opacity
      engine.applyScene(scene);
    } else {
      engine.applyChapterOverview(chapter);
    }
  }, [engine, active, chapters, chapterIndex, threadIndex, sceneIndex]);

  return {
    chapterIndex,
    threadIndex,
    sceneIndex,
    openChapter,
    openThread,
    backToChapter,
    gotoScene,
  };
}
