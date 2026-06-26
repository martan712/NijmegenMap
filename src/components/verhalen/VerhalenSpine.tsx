import { localName } from "../../verhalen/api";
import type { Segment, StoryListEntry } from "../../verhalen/types";
import styles from "./verhalen.module.css";

interface Props {
  stories: StoryListEntry[];
  activeStory: string | null;
  onPickStory: (storyId: string) => void;
  segments: Segment[];
  activeSeg: string | null;
  onPickSeg: (seg: string) => void;
  onExit: () => void;
}

/**
 * The Verhalen navigator, pinned over the companion map. Two stacked layers:
 *  - top: the events (segments) of the current chapter — click a tick or use the
 *    arrow keys to step through them;
 *  - bottom: every chapter (story) in chronological order — click to switch,
 *    plus an exit back to the atlas. The active chapter is highlighted.
 */
export function VerhalenSpine({
  stories,
  activeStory,
  onPickStory,
  segments,
  activeSeg,
  onPickSeg,
  onExit,
}: Props) {
  return (
    <div className={styles.vspine}>
      {/* Top layer: events of the current chapter. */}
      {segments.length > 0 && (
        <div className={styles.track}>
          {segments.map((s) => (
            <button
              key={s.seg}
              className={`${styles.tick} ${s.seg === activeSeg ? styles.tickOn : ""}`}
              title={localName(s.seg)}
              onClick={() => onPickSeg(s.seg)}
            >
              <span className={styles.dot} />
              <span className={styles.tickLabel}>{s.tick}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom layer: every chapter. */}
      <div className={styles.chapterTrack}>
        <button
          type="button"
          className={styles.exitChip}
          onClick={onExit}
          title="Terug naar de atlas"
        >
          ← Atlas
        </button>
        {stories.map((st, i) => {
          const on = st.story === activeStory;
          return (
            <button
              key={st.story}
              type="button"
              className={`${styles.chapterChip} ${on ? styles.chapterChipOn : ""}`}
              title={[st.era, st.label].filter(Boolean).join(" — ")}
              onClick={() => onPickStory(st.story)}
            >
              <span className={styles.chapterNum}>{i + 1}</span>
              <span className={styles.chapterName}>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
