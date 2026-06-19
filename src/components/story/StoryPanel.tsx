import type { Chapter } from "../../types";
import { ChapterView } from "./ChapterView";
import { SceneView } from "./SceneView";
import styles from "./story.module.css";

interface Props {
  chapter: Chapter;
  chapterIndex: number;
  threadIndex: number | null;
  sceneIndex: number;
  onOpenThread: (threadIndex: number) => void;
  onGotoScene: (sceneIndex: number) => void;
  onBackToChapter: () => void;
  onClose: () => void;
}

/**
 * The story panel. Shows the chapter overview when no thread is open, otherwise
 * the scene player for the active thread.
 */
export function StoryPanel({
  chapter,
  chapterIndex,
  threadIndex,
  sceneIndex,
  onOpenThread,
  onGotoScene,
  onBackToChapter,
  onClose,
}: Props) {
  return (
    <div className={styles.panel}>
      <button className={styles.close} onClick={onClose} aria-label="Sluiten" title="Sluiten">
        ×
      </button>
      {threadIndex == null ? (
        <ChapterView
          chapter={chapter}
          chapterIndex={chapterIndex}
          onOpenThread={onOpenThread}
        />
      ) : (
        <SceneView
          chapterTitle={chapter.title}
          thread={chapter.threads[threadIndex]}
          sceneIndex={sceneIndex}
          onGotoScene={onGotoScene}
          onBack={onBackToChapter}
        />
      )}
    </div>
  );
}
