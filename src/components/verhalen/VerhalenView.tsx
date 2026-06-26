import { useCallback, useEffect, useRef, useState } from "react";
import type { MapEngine } from "../../services/MapEngine";
import { useVerhaal } from "../../hooks/useVerhaal";
import { sceneFromMapRows } from "../../verhalen/sceneFromMap";
import { localName, mediaUrl } from "../../verhalen/api";
import type { Block } from "../../verhalen/types";
import { Timeline } from "./Timeline";
import styles from "./verhalen.module.css";

type Frame = "full" | "companion";

/** Resize/relocate the shared Leaflet container (styles only). */
function setFrame(engine: MapEngine, frame: Frame, animate: boolean): void {
  const el = engine.map.getContainer();
  el.style.transition = animate ? "all .45s ease" : "none";
  ["width", "height", "top", "right", "bottom", "left", "border-radius", "box-shadow", "z-index"]
    .forEach((p) => el.style.removeProperty(p));
  if (frame === "companion") {
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "56vw";
    el.style.height = "100vh";
    el.style.zIndex = "0";
  }
}

function BlockView({ block }: { block: Block }) {
  switch (localName(block.type)) {
    case "NarrativeBlock":
      return <p className={styles.narrative}>{block.text}</p>;
    case "QuoteBlock":
      return (
        <blockquote className={styles.quote}>
          <p>{block.verbatim}</p>
          <cite>{[block.credit, block.locator].filter(Boolean).join(" · ")}</cite>
        </blockquote>
      );
    case "AudioBlock":
      return (
        <figure className={styles.audio}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls preload="metadata" src={block.mediaPath ? mediaUrl(block.mediaPath) : undefined} />
          <figcaption>{block.credit}</figcaption>
        </figure>
      );
    case "DocumentBlock":
      return (
        <figure className={styles.document}>
          {block.mediaPath && <img src={mediaUrl(block.mediaPath)} alt={block.credit ?? ""} />}
          {block.verbatim && <p className={styles.transcript}>{block.verbatim}</p>}
          <figcaption>{[block.credit, block.locator].filter(Boolean).join(" · ")}</figcaption>
        </figure>
      );
    case "GalleryBlock":
    case "ImageBlock":
      return (
        <figure className={styles.gallery}>
          {block.mediaPath && <img src={mediaUrl(block.mediaPath)} alt={block.credit ?? ""} />}
          <figcaption>{block.credit}</figcaption>
        </figure>
      );
    default:
      return <p className={styles.narrative}>{block.text ?? block.verbatim}</p>;
  }
}

/**
 * The "Verhalen" surface: all segments stacked in one scrolling narrative column
 * (right), with a permanent companion map (left) that flies to each segment's state
 * as it scrolls into view. A timeline scrubber reflects the active segment / jumps
 * to one on click.
 *
 * The map is a fixed-size companion at all times — it never shrinks to a corner —
 * so the layout is always balanced and the active-segment measurement is stable.
 */
export function VerhalenView({
  engine,
  storyId,
  onExit,
}: {
  engine: MapEngine | null;
  storyId: string;
  onExit: () => void;
}) {
  const { segments, content, error } = useVerhaal(storyId);
  const columnRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSeg, setActiveSeg] = useState<string | null>(null);

  const segRef = useRef<number>(-1);
  const busyUntil = useRef(0);
  const ticking = useRef(false);
  const busy = () => performance.now() < busyUntil.current;

  const navRef = useRef<number | null>(null); // accumulates rapid key presses
  const navTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const animRef = useRef<number>(0); // fastScrollTo rAF handle

  // The cumulative damage level shown at a segment (0 = none).
  const overlayAt = useCallback((idx: number): number => {
    const rows = content[segments[idx]?.seg]?.mapRows;
    const row = rows?.find((r) => r.overlay != null);
    return row ? Number(row.overlay) : 0;
  }, [segments, content]);

  // Fly the companion map to a segment's state.
  const goToSegment = useCallback((idx: number, animate: boolean) => {
    if (!engine || idx < 0 || idx >= segments.length) return;
    segRef.current = idx;
    const seg = segments[idx];
    setActiveSeg(seg.seg);
    setFrame(engine, "companion", animate);
    const c = content[seg.seg];
    if (c) {
      const scene = sceneFromMapRows(c.mapRows);
      // Render the damage bright ONLY on the segment that first reaches this
      // level; later segments carry it forward dark (until a future segment
      // lowers the shown level). No new damage this step → nothing bright.
      const cur = overlayAt(idx);
      const prev = idx > 0 ? overlayAt(idx - 1) : 0;
      scene.ww2Highlight = cur > prev ? cur : null;
      engine.applyScene(scene);
      busyUntil.current = performance.now() + 950; // cover the map flight
      window.setTimeout(() => engine.map.invalidateSize({ animate: false }), animate ? 480 : 40);
    }
  }, [engine, segments, content, overlayAt]);

  // Initial: show the first segment once content is ready.
  useEffect(() => {
    if (!engine || segments.length === 0 || segRef.current !== -1) return;
    if (!content[segments[0].seg]) return;
    engine.clearStoryOverlays();
    engine.setOpacity(1);
    goToSegment(0, false);
  }, [engine, segments, content, goToSegment]);

  // Hide the +/- zoom control in the immersive surface; restore on exit.
  // (Scenes whose arrows run off the historical map drop that overlay and show
  // the modern reference map instead — see sceneFromMapRows — so there's no
  // confusing half-historical / half-modern split.)
  useEffect(() => {
    if (!engine) return;
    engine.setZoomControlVisible(false);
    return () => {
      engine.setZoomControlVisible(true);
      setFrame(engine, "full", false);
      engine.map.invalidateSize({ animate: false });
    };
  }, [engine]);

  // rAF-throttled active-segment detection (centre dead-zone) → map flight.
  const onScroll = useCallback(() => {
    if (ticking.current || busy()) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const col = columnRef.current;
      if (!col || !engine || busy()) return;
      const colRect = col.getBoundingClientRect();
      const center = colRect.top + colRect.height / 2;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      col.querySelectorAll<HTMLElement>("[data-block]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = el;
        }
      });
      if (!best || bestDist > colRect.height * 0.4) return;
      const segIdx = Number((best as HTMLElement).dataset.seg);
      if (segIdx !== segRef.current) goToSegment(segIdx, true);
    });
  }, [engine, goToSegment]);

  // Which segment is at the top right now, read from the live scroll position
  // (never from a lagging ref) so nav stays correct even after manual scrolling.
  const nearestIndex = useCallback((): number => {
    const col = columnRef.current;
    if (!col) return Math.max(0, segRef.current);
    let best = 0;
    let bestDist = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(el.offsetTop - 40 - col.scrollTop);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, []);

  // Fixed-duration scroll (snappy regardless of section height); bypasses the
  // CSS smooth-scroll so its own rAF is in control.
  const cancelAnim = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    if (columnRef.current) columnRef.current.style.scrollBehavior = "";
  }, []);
  const fastScrollTo = useCallback((to: number) => {
    const col = columnRef.current;
    if (!col) return;
    cancelAnimationFrame(animRef.current);
    const start = col.scrollTop;
    const dist = to - start;
    if (Math.abs(dist) < 2) {
      col.scrollTop = to;
      return;
    }
    const t0 = performance.now();
    col.style.scrollBehavior = "auto";
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 300);
      col.scrollTop = start + dist * ease(p);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else col.style.scrollBehavior = "";
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  // Go to a segment: scroll the column AND fly the map in lock-step (so the map
  // updates immediately, not via the busy-locked scroll detector). `navRef`
  // accumulates rapid key presses; it resets after a pause or a manual scroll.
  const navigateTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= segments.length) return;
    navRef.current = idx;
    window.clearTimeout(navTimer.current);
    navTimer.current = window.setTimeout(() => { navRef.current = null; }, 600);
    const el = sectionRefs.current[idx];
    if (el) fastScrollTo(el.offsetTop - 40);
    goToSegment(idx, true);
  }, [segments, fastScrollTo, goToSegment]);

  const stepSegment = useCallback((dir: 1 | -1) => {
    const base = navRef.current ?? nearestIndex();
    navigateTo(Math.max(0, Math.min(segments.length - 1, base + dir)));
  }, [segments, navigateTo, nearestIndex]);

  const onPick = useCallback(
    (segIri: string) => navigateTo(segments.findIndex((s) => s.seg === segIri)),
    [segments, navigateTo],
  );

  // Arrow keys step between segments (↑/← previous, ↓/→ next).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        stepSegment(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        stepSegment(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepSegment]);

  return (
    <div className={styles.surface}>
      <div
        ref={columnRef}
        className={styles.column}
        onScroll={onScroll}
        onWheel={() => {
          navRef.current = null; // a manual scroll resets the key accumulator
          cancelAnim();
        }}
        onTouchMove={() => {
          navRef.current = null;
          cancelAnim();
        }}
      >
        <header className={styles.head}>
          <button type="button" className={styles.back} onClick={onExit}>
            ← Atlas
          </button>
          <span className={styles.kicker}>Verhaal</span>
          <h1>Nijmegen in de oorlog</h1>
          <p className={styles.lede}>1940 – 1945</p>
        </header>

        {error && <div className={styles.error}>Backend niet bereikbaar: {error}</div>}

        {segments.map((s, si) => {
          const c = content[s.seg];
          if (!c) return null;
          return (
            <section
              key={s.seg}
              ref={(el) => {
                sectionRefs.current[si] = el;
              }}
              className={styles.section}
            >
              <div className={styles.segHead}>
                <h2>{s.eventLabel ?? s.tick}</h2>
              </div>
              {c.blocks.map((b) => (
                <div key={b.block} data-block data-seg={si} className={styles.block}>
                  <BlockView block={b} />
                </div>
              ))}
            </section>
          );
        })}

        <div className={styles.spacer} />
      </div>

      <Timeline segments={segments} activeSeg={activeSeg} onPick={onPick} />
    </div>
  );
}
