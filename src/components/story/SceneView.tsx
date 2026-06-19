import type { Thread } from "../../types";
import styles from "./story.module.css";

interface Props {
  chapterTitle: string;
  thread: Thread;
  sceneIndex: number;
  onGotoScene: (sceneIndex: number) => void;
  onBack: () => void;
}

/** Scene player: caption for the current scene + prev/next/dot navigation. */
export function SceneView({ chapterTitle, thread, sceneIndex, onGotoScene, onBack }: Props) {
  const { scenes } = thread;
  const scene = scenes[sceneIndex];
  const isLast = sceneIndex === scenes.length - 1;

  // Data-driven threads have no scenes until their dataset has loaded.
  if (!scene) {
    return (
      <>
        <button className={styles.back} onClick={onBack}>
          ‹ {chapterTitle}
        </button>
        <div className={styles.crumb}>{thread.title}</div>
        <p className={styles.sceneText}>Laden…</p>
      </>
    );
  }

  return (
    <>
      <button className={styles.back} onClick={onBack}>
        ‹ {chapterTitle}
      </button>
      <div className={styles.crumb}>
        {thread.title} · {sceneIndex + 1}/{scenes.length}
      </div>
      <h3 className={styles.sceneTitle}>{scene.title}</h3>
      <p className={styles.sceneText}>{scene.text}</p>
      <div className={styles.nav}>
        <button
          className={styles.navBtn}
          disabled={sceneIndex === 0}
          onClick={() => onGotoScene(sceneIndex - 1)}
        >
          ‹
        </button>
        <div className={styles.dots}>
          {scenes.map((s, si) => (
            <button
              key={s.title}
              className={`${styles.dot} ${si === sceneIndex ? styles.dotOn : ""}`}
              onClick={() => onGotoScene(si)}
              aria-label={`Scène ${si + 1}`}
            />
          ))}
        </div>
        <button
          className={styles.navBtn}
          onClick={() => (isLast ? onBack() : onGotoScene(sceneIndex + 1))}
        >
          {isLast ? "✓" : "›"}
        </button>
      </div>
    </>
  );
}
