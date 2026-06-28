import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapEngine } from "../../services/MapEngine";
import type { HeritagePoint, MemorialPoint } from "../../types";
import { useVerhaal } from "../../hooks/useVerhaal";
import { fetchHeritage, fetchStolpersteine, fetchStories, localName } from "../../verhalen/api";
import type { StoryListEntry, ThreadGroup } from "../../verhalen/types";
import { VerhalenSpine } from "./VerhalenSpine";
import { PanelBlock, type PanelContext } from "./panel/registry";
import { RomanLegend } from "../RomanLegend";
import { GrowthLegend } from "../GrowthLegend";
import { YearBadge } from "../YearBadge";
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
  onExit,
}: {
  engine: MapEngine | null;
  onExit: () => void;
}) {
  // The chapters (stories) and which one is open. The bottom spine switches
  // between them; the top spine shows the open chapter's verhaallijnen.
  const [stories, setStories] = useState<StoryListEntry[]>([]);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  useEffect(() => {
    let off = false;
    fetchStories()
      .then((s) => {
        if (off) return;
        setStories(s);
        setActiveStory((prev) => prev ?? s[0]?.story ?? null);
      })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  const { segments, content, error, meta, loadedStory } = useVerhaal(activeStory ?? "");

  // Split the open chapter into its verhaallijnen (threads are contiguous runs in
  // the thread-ordered segment array the backend returns).
  const threads = useMemo<ThreadGroup[]>(() => {
    const out: ThreadGroup[] = [];
    segments.forEach((s, i) => {
      const id = s.thread ?? "_";
      const last = out[out.length - 1];
      if (!last || last.id !== id) {
        out.push({ id, label: s.threadLabel ?? "", segIdx: [i] });
      } else {
        last.segIdx.push(i);
      }
    });
    return out;
  }, [segments]);
  const columnRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSeg, setActiveSeg] = useState<string | null>(null);
  const [memorials, setMemorials] = useState<MemorialPoint[]>([]);
  const [heritage, setHeritage] = useState<HeritagePoint[]>([]);

  const segRef = useRef<number>(-1);
  const initedStory = useRef<string | null>(null); // story whose first segment we've shown
  // Which segment to land on once a freshly-switched story finishes loading: 0
  // when entering from the front, "last" when rolling in from the next story's
  // left edge.
  const pendingSeg = useRef<number | "last">(0);
  const busyUntil = useRef(0);
  const ticking = useRef(false);
  const busy = () => performance.now() < busyUntil.current;

  const navRef = useRef<number | null>(null); // accumulates rapid key presses
  const navTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const animRef = useRef<number>(0); // fastScrollTo rAF handle

  // The cumulative WW2 damage level shown at a segment (0 = none).
  const overlayAt = useCallback((idx: number): number => {
    const comps = content[segments[idx]?.seg]?.components;
    const ww2 = comps?.find((c) => c.type === "PolygonOverlay" && c.key === "ww2");
    return ww2?.level != null ? Number(ww2.level) : 0;
  }, [segments, content]);

  // Stolpersteine: fetched once; shown on the segment whose scene declares a
  // MemorialLayer component (the Deportatie segment).
  useEffect(() => {
    let off = false;
    fetchStolpersteine()
      .then((rows) => {
        if (off) return;
        setMemorials(rows.map((r) => ({
          lat: Number(r.lat), lng: Number(r.long), name: r.name,
          lifespan: r.lifespan ?? undefined, address: r.address ?? undefined,
          inscription: r.inscription ?? undefined, image: r.image ?? undefined,
        })));
      })
      .catch(() => {}); // memorial layer is optional; ignore if backend lacks it
    return () => { off = true; };
  }, []);

  // Wikidata heritage monuments: fetched once; each scene that declares a
  // HeritageLayer shows the per-chapter category-filtered subset.
  useEffect(() => {
    let off = false;
    fetchHeritage()
      .then((rows) => {
        if (off) return;
        setHeritage(rows.map((r) => ({
          lat: Number(r.lat), lng: Number(r.long), name: r.name,
          categories: r.categories ?? undefined, inception: r.inception ?? undefined,
          renovations: r.renovations ?? undefined, architects: r.architects ?? undefined,
          style: r.style ?? undefined, monumentId: r.monumentId ?? undefined,
          image: r.image ?? undefined,
        })));
      })
      .catch(() => {}); // heritage layer is optional; ignore if backend lacks it
    return () => { off = true; };
  }, []);

  // Fly the companion map to a segment's state by rendering its typed scene
  // components through the SceneManager.
  const goToSegment = useCallback((idx: number, animate: boolean) => {
    if (!engine || idx < 0 || idx >= segments.length) return;
    segRef.current = idx;
    const seg = segments[idx];
    setActiveSeg(seg.seg);
    setFrame(engine, "companion", animate);
    const c = content[seg.seg];
    if (c) {
      // Render WW2 damage bright ONLY on the segment that first reaches this
      // level; later segments carry it forward dark (overlayAt returns 0 when a
      // scene has no ww2 overlay, so non-WW2 scenes never highlight).
      const cur = overlayAt(idx);
      const prev = idx > 0 ? overlayAt(idx - 1) : 0;
      // A lone focus place gets a teardrop when the column also shows an image of
      // it (so the reader sees where that illustrated place is on the map).
      const hasImage = c.blocks.some((b) => {
        const t = localName(b.type);
        return t === "ImageBlock" || t === "GalleryBlock";
      });
      engine.scene.render(c.components, {
        memorials,
        heritage,
        highlightLevel: cur > prev ? cur : null,
        markLoneFocus: hasImage,
      });
      busyUntil.current = performance.now() + 950; // cover the map flight
      window.setTimeout(() => engine.map.invalidateSize({ animate: false }), animate ? 480 : 40);
    }
  }, [engine, segments, content, overlayAt, memorials, heritage]);

  // Show the first segment once a chapter's content is fully loaded — and re-run
  // for each chapter the spine switches to. `loadedStory` guarantees segments +
  // content belong to the now-active chapter (not the previous one lingering).
  useEffect(() => {
    if (!engine || !activeStory || loadedStory !== activeStory) return;
    if (initedStory.current === activeStory) return;
    if (segments.length === 0 || !content[segments[0].seg]) return;
    initedStory.current = activeStory;
    const target = pendingSeg.current === "last" ? segments.length - 1 : pendingSeg.current;
    pendingSeg.current = 0;
    segRef.current = -1;
    engine.scene.clear();
    engine.setOpacity(1);
    goToSegment(target, false);
    const el = sectionRefs.current[target];
    if (columnRef.current) columnRef.current.scrollTop = el ? Math.max(0, el.offsetTop - 40) : 0;
  }, [engine, activeStory, loadedStory, segments, content, goToSegment]);

  // Hide the +/- zoom control in the immersive surface; restore on exit.
  // (Scenes whose arrows run off the historical map drop that overlay and show
  // the modern reference map instead — see SceneManager.applyBaseAndCamera — so
  // there's no confusing half-historical / half-modern split.)
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

  // Switch to another storyline, landing on its first segment ("first") or its
  // last ("last", when rolling in backwards). The init effect reads pendingSeg
  // once the new story's content has loaded.
  const switchStory = useCallback((storyId: string, landing: "first" | "last") => {
    if (storyId === activeStory) return;
    pendingSeg.current = landing === "last" ? "last" : 0;
    setActiveStory(storyId);
  }, [activeStory]);

  const stepSegment = useCallback((dir: 1 | -1) => {
    const base = navRef.current ?? nearestIndex();
    const next = base + dir;
    // Within a chapter, stepping the (thread-ordered) index rolls between scenes
    // and across storylines automatically. At the chapter's own edge, roll over
    // into the previous / next chapter.
    if (next < 0 || next >= segments.length) {
      const si = stories.findIndex((s) => s.story === activeStory);
      const ni = si + dir;
      if (ni >= 0 && ni < stories.length) {
        switchStory(stories[ni].story, dir === 1 ? "first" : "last");
      }
      return;
    }
    navigateTo(next);
  }, [segments, stories, activeStory, navigateTo, nearestIndex, switchStory]);

  // Where we are in the active story, for the spine's progress strip.
  const activeIndex = useMemo(() => {
    const i = segments.findIndex((s) => s.seg === activeSeg);
    return i < 0 ? 0 : i;
  }, [segments, activeSeg]);

  // Map chrome over the companion map for the active segment: the legend that
  // explains its overlay (the limes zones or the city-growth periods) and a
  // per-segment year readout. The dimmed-Valkhof anchor cue (limes with `dim`)
  // is a location hint, not the full frontier, so it gets no legend.
  const chrome = useMemo(() => {
    const comps = activeSeg ? content[activeSeg]?.components : undefined;
    const limes = comps?.some(
      (c) => c.type === "PolygonOverlay" && c.key === "limes" && c.dim !== "true",
    ) ?? false;
    const growth = comps?.find((c) => c.type === "PolygonOverlay" && c.key === "growth");
    const seg = segments[activeIndex];
    // The badge must show the map actually on screen: the scene's BaseMap year
    // (the same value SceneManager.applyBaseAndCamera picks the layer from).
    // Fall back to the segment's narrative date / chapter year only for scenes
    // with no period map (arrow/limes scenes show the modern reference map).
    const baseMap = comps?.find((c) => c.type === "BaseMap");
    const year = baseMap?.year ?? (seg?.date ? seg.date.slice(0, 4) : meta?.year ?? null);
    return {
      limes,
      growthYear: growth?.level != null ? Number(growth.level) : null,
      badge: year ? { label: year, era: meta?.era ?? undefined, tag: meta?.tag ?? "" } : null,
    };
  }, [activeSeg, content, segments, activeIndex, meta]);

  // Click a victim card → fly the companion map to that stone and open its popup.
  const onSelectVictim = useCallback((p: MemorialPoint) => {
    if (!engine) return;
    engine.map.flyTo([p.lat, p.lng], 18, { duration: 0.6 });
    engine.memorials.highlight(p);
  }, [engine]);

  // Click an art card → fly the companion map to that artwork's marker.
  const onSelectArt = useCallback((p: { lat: number; lng: number }) => {
    if (!engine) return;
    engine.map.flyTo([p.lat, p.lng], 17, { duration: 0.6 });
  }, [engine]);

  // Shared data the type-driven panel blocks may need (the memorial + art walls).
  const panelCtx = useMemo<PanelContext>(
    () => ({ memorials, onSelectVictim, onSelectArt }),
    [memorials, onSelectVictim, onSelectArt],
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
          <span className={styles.kicker}>
            {[meta?.label, meta?.era].filter(Boolean).join(" · ") || "Verhaal"}
          </span>
        </header>

        {error && <div className={styles.error}>Backend niet bereikbaar: {error}</div>}

        {threads.map((t) => (
          <div key={t.id} className={styles.thread}>
            <h1 className={styles.threadTitle}>{t.label}</h1>
            {t.segIdx.map((si) => {
              const s = segments[si];
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
                      <PanelBlock block={b} ctx={panelCtx} />
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        ))}

      </div>

      {/* Chrome over the companion map (left): a per-segment year badge at the
          map's top-right, and the active overlay's legend at its top-left. */}
      {chrome.badge && (
        <YearBadge {...chrome.badge} style={{ top: 12, right: "calc(44vw + 12px)" }} />
      )}
      <RomanLegend visible={chrome.limes} style={{ top: 78, left: 12, right: "auto" }} />
      <GrowthLegend
        visible={chrome.growthYear != null}
        activeYear={chrome.growthYear ?? 0}
        style={{ top: 78, left: 12 }}
      />

      <VerhalenSpine
        stories={stories}
        activeStory={activeStory}
        threads={threads}
        activeIndex={activeIndex}
        onPickStory={(id) => switchStory(id, "first")}
        onPickSegIndex={navigateTo}
        onExit={onExit}
      />
    </div>
  );
}
