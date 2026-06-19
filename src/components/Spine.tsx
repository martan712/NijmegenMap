import type { Chapter, Mode } from "../types";
import styles from "./Spine.module.css";

interface Props {
  chapters: Chapter[];
  mode: Mode;
  activeChapter: number | null;
  onOpenChapter: (index: number) => void;
  onEnterFree: () => void;
}

/** The spine: a thin always-visible ribbon of chapters + a free-explore entry. */
export function Spine({ chapters, mode, activeChapter, onOpenChapter, onEnterFree }: Props) {
  return (
    <div className={styles.spine}>
      {chapters.map((ch, i) => (
        <button
          key={ch.title}
          className={`${styles.chip} ${mode === "story" && i === activeChapter ? styles.active : ""}`}
          title={ch.short}
          onClick={() => onOpenChapter(i)}
        >
          <span className={styles.num}>{i + 1}</span>
          {ch.title}
        </button>
      ))}
      <div className={styles.sep} />
      <button
        className={`${styles.chip} ${styles.free} ${mode === "free" ? styles.active : ""}`}
        onClick={onEnterFree}
      >
        Vrij verkennen
      </button>
    </div>
  );
}
