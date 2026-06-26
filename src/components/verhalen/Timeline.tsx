import { localName } from "../../verhalen/api";
import type { Segment } from "../../verhalen/types";
import styles from "./verhalen.module.css";

interface Props {
  segments: Segment[];
  activeSeg: string | null;
  onPick: (seg: string) => void;
}

/** The WW2 event scrubber: a tick per segment; click to jump. */
export function Timeline({ segments, activeSeg, onPick }: Props) {
  if (segments.length === 0) return null;
  return (
    <div className={styles.timeline}>
      <div className={styles.track}>
        {segments.map((s) => (
          <button
            key={s.seg}
            className={`${styles.tick} ${s.seg === activeSeg ? styles.tickOn : ""}`}
            title={localName(s.seg)}
            onClick={() => onPick(s.seg)}
          >
            <span className={styles.dot} />
            <span className={styles.tickLabel}>{s.tick}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
