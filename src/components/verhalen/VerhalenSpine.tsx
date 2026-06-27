import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { StoryListEntry, ThreadGroup } from "../../verhalen/types";
import styles from "./verhalen.module.css";

/**
 * A horizontally-scrollable row whose native scrollbar is hidden; instead it
 * shows a page-left / page-right arrow on each side, hiding the arrow once that
 * edge is reached (and both when the content fits without scrolling).
 */
function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  // Re-measure after every render (content/story switches) and on viewport resize.
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className={styles.scrollWrap}>
      {!atStart && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          aria-label="Terug"
          onClick={() => page(-1)}
        >
          ‹
        </button>
      )}
      <div ref={ref} className={className} onScroll={update}>
        {children}
      </div>
      {!atEnd && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          aria-label="Verder"
          onClick={() => page(1)}
        >
          ›
        </button>
      )}
    </div>
  );
}

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
 *  - bottom: every chapter, plus a link to Vrij verkennen (the map explorer).
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
        <ScrollRow className={styles.threadTrack}>
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
        </ScrollRow>
      )}

      {/* Bottom layer: every chapter. */}
      <ScrollRow className={styles.chapterTrack}>
        <button
          type="button"
          className={styles.exitChip}
          onClick={onExit}
          title="Vrij verkennen op de kaart"
          aria-label="Vrij verkennen op de kaart"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
               strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
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
      </ScrollRow>
    </div>
  );
}
