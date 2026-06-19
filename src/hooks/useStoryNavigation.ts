import { useEffect, useState } from "react";
import { CHAPTERS } from "../config/chapters";
import type { MapEngine } from "../services/MapEngine";

/**
 * Owns the book position (chapter → thread → scene) and renders it through the
 * engine while story mode is active. Free exploration uses a separate hook.
 */
export function useStoryNavigation(engine: MapEngine | null, active: boolean) {
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
    const scenes = CHAPTERS[chapterIndex].threads[threadIndex ?? 0].scenes;
    setSceneIndex(Math.max(0, Math.min(index, scenes.length - 1)));
  }

  // Render the current chapter overview or scene whenever it changes.
  useEffect(() => {
    if (!engine || !active) return;
    const chapter = CHAPTERS[chapterIndex];
    if (threadIndex == null) {
      engine.applyChapterOverview(chapter);
    } else {
      engine.setOpacity(1); // story scenes always render at full opacity
      engine.applyScene(chapter.threads[threadIndex].scenes[sceneIndex]);
    }
  }, [engine, active, chapterIndex, threadIndex, sceneIndex]);

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
