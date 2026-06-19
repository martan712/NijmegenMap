import type { Chapter } from "../../types";
import { ThreadCard } from "./ThreadCard";
import styles from "./story.module.css";

interface Props {
  chapter: Chapter;
  chapterIndex: number;
  onOpenThread: (threadIndex: number) => void;
}

/** Chapter overview: title, intro, and the chapter's threads as cards. */
export function ChapterView({ chapter, chapterIndex, onOpenThread }: Props) {
  return (
    <>
      <div className={styles.crumb}>Hoofdstuk {chapterIndex + 1}</div>
      <h2 className={styles.heading}>{chapter.title}</h2>
      <p className={styles.intro}>{chapter.intro}</p>
      <div className={styles.threadCards}>
        {chapter.threads.map((thread, ti) => (
          <ThreadCard key={thread.title} thread={thread} onClick={() => onOpenThread(ti)} />
        ))}
      </div>
    </>
  );
}
