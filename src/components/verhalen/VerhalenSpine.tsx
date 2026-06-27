import type { StoryListEntry, ThreadGroup } from "../../verhalen/types";
import styles from "./verhalen.module.css";

interface Props {
  stories: StoryListEntry[];
  activeStory: string | null;
  /** The verhaallijnen of the open chapter, in order. */
  threads: ThreadGroup[];
  /** Current segment index (global, into the chapter's flat segment array). */
  activeIndex: number;
  onPickStory: (storyId: string) => void;
  onPickSegIndex: (idx: number) => void;
  onExit: () => void;
}

/**
 * The Verhalen navigator, pinned over the companion map. Two stacked layers:
 *  - top: the verhaallijnen (storylines) of the open chapter. Each carries a
 *    strip of n blocks — one per scene — above its title; blocks 1…x light up
 *    orange, x being the scene you're on in that storyline. Arrow keys step
 *    within a storyline and roll over into the next/previous one at its ends.
 *  - bottom: every chapter, plus an exit back to the atlas. Click to switch.
 */
export function VerhalenSpine({
  stories,
  activeStory,
  threads,
  activeIndex,
  onPickStory,
  onPickSegIndex,
  onExit,
}: Props) {
  return (
    <div className={styles.vspine}>
      {/* Top layer: the verhaallijnen of the open chapter. */}
      {threads.length > 0 && (
        <div className={styles.threadTrack}>
          {threads.map((t) => {
            const pos = t.segIdx.indexOf(activeIndex); // -1 unless this is the active storyline
            return (
              <div key={t.id} className={styles.threadBlock}>
                <div className={styles.progress}>
                  {t.segIdx.map((si, k) => (
                    <button
                      key={si}
                      type="button"
                      className={`${styles.pblock} ${pos >= 0 && k <= pos ? styles.pblockOn : ""}`}
                      title={`${k + 1} / ${t.segIdx.length}`}
                      onClick={() => onPickSegIndex(si)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className={`${styles.threadName} ${pos >= 0 ? styles.threadNameOn : ""}`}
                  title={t.label}
                  onClick={() => onPickSegIndex(t.segIdx[0])}
                >
                  {t.label}
                </button>
              </div>
            );
          })}
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
