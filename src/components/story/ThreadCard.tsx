import type { Thread } from "../../types";
import styles from "./story.module.css";

interface Props {
  thread: Thread;
  onClick: () => void;
}

/** A clickable card opening one thread from the chapter view. */
export function ThreadCard({ thread, onClick }: Props) {
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.cardTitle}>{thread.title}</div>
      <div className={styles.cardSub}>
        {thread.sub ?? `${thread.scenes.length} scènes`}
      </div>
    </button>
  );
}
