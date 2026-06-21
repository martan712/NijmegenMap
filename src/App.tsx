import { useEffect, useMemo, useState } from "react";
import { entryByYear, entryTag, yearOf } from "./lib/manifest";
import { useManifest } from "./hooks/useManifest";
import { useChapters } from "./hooks/useChapters";
import { useMapEngine } from "./hooks/useMapEngine";
import { useStoryNavigation } from "./hooks/useStoryNavigation";
import { useFreeExplore } from "./hooks/useFreeExplore";
import { MapCanvas } from "./components/MapCanvas";
import { TitleBadge } from "./components/TitleBadge";
import { YearBadge } from "./components/YearBadge";
import { GrowthLegend } from "./components/GrowthLegend";
import { RomanLegend } from "./components/RomanLegend";
import { Spine } from "./components/Spine";
import { FreePanel } from "./components/FreePanel";
import { StoryPanel } from "./components/story/StoryPanel";
import type { Badge, Mode } from "./types";
import styles from "./App.module.css";

export default function App() {
  const { manifest, error } = useManifest();
  const chapters = useChapters();
  const { containerRef, lensRingRef, lensYearRef, engine } = useMapEngine(manifest);

  const [mode, setMode] = useState<Mode>("story");
  const [storyOpen, setStoryOpen] = useState(true);
  const story = useStoryNavigation(engine, chapters, mode === "story");
  const free = useFreeExplore(engine, manifest, mode === "free");

  const { chapterIndex, threadIndex, sceneIndex } = story;
  const activeScene =
    threadIndex != null
      ? chapters[chapterIndex].threads[threadIndex].scenes[sceneIndex]
      : undefined;

  // Year readout, derived from whichever mode is active.
  const badge: Badge | null = useMemo(() => {
    if (!manifest) return null;
    if (mode === "story") {
      const chapter = chapters[chapterIndex];
      if (activeScene) {
        const entry = entryByYear(manifest, activeScene.year);
        return {
          label: activeScene.badge ?? entry?.label ?? activeScene.year,
          era: activeScene.era ?? entry?.era,
          tag: activeScene.tag ?? (entry ? entryTag(entry) : "kaart"),
        };
      }
      const entry = entryByYear(manifest, chapter.year);
      return entry ? { label: entry.label, era: entry.era, tag: entryTag(entry) } : null;
    }
    const entry = free.timeline[free.current];
    return entry ? { label: entry.label || entry.year, era: entry.era, tag: entryTag(entry) } : null;
  }, [manifest, mode, chapters, chapterIndex, activeScene, free.timeline, free.current]);

  // Growth legend visibility + dimming year.
  const legend = useMemo(() => {
    if (mode === "story") {
      return activeScene?.kind === "growth"
        ? { visible: true, year: activeScene.upto }
        : { visible: false, year: 0 };
    }
    return free.growthOn
      ? { visible: true, year: yearOf(free.timeline[free.current]) }
      : { visible: false, year: 0 };
  }, [mode, activeScene, free.growthOn, free.timeline, free.current]);

  // Keyboard: scene paging in story mode, slider/overlay shortcuts in free mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "SELECT") return;
      if (mode === "story") {
        if (story.threadIndex == null) return;
        if (e.key === "ArrowLeft") story.gotoScene(story.sceneIndex - 1);
        else if (e.key === "ArrowRight") story.gotoScene(story.sceneIndex + 1);
        return;
      }
      if (e.key === "ArrowLeft") free.step(-1);
      else if (e.key === "ArrowRight") free.step(1);
      else if (e.key === " ") {
        e.preventDefault();
        free.togglePlay();
      } else if (e.key === "v" || e.key === "V") free.toggleSpy();
      else if (e.key === "g" || e.key === "G") free.toggleGrowth();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, story, free]);

  return (
    <>
      <MapCanvas
        containerRef={containerRef}
        lensRingRef={lensRingRef}
        lensYearRef={lensYearRef}
      />
      <TitleBadge />
      {badge && <YearBadge {...badge} />}
      <GrowthLegend visible={legend.visible} activeYear={legend.year} />
      <RomanLegend
        visible={
          mode === "story" &&
          activeScene?.kind === "limes" &&
          (activeScene.mode ?? "full") === "full"
        }
      />

      {mode === "story" && storyOpen && (
        <StoryPanel
          chapter={chapters[chapterIndex]}
          chapterIndex={chapterIndex}
          threadIndex={threadIndex}
          sceneIndex={sceneIndex}
          onOpenThread={story.openThread}
          onGotoScene={story.gotoScene}
          onBackToChapter={story.backToChapter}
          onClose={() => setStoryOpen(false)}
        />
      )}

      {mode === "free" && (
        <FreePanel
          timeline={free.timeline}
          current={free.current}
          onScrub={free.setCurrent}
          playing={free.playing}
          onTogglePlay={free.togglePlay}
          onStep={free.step}
          opacity={free.opacity}
          onOpacity={free.setOpacity}
          filter={free.filter}
          onFilter={free.setFilter}
          growthOn={free.growthOn}
          onToggleGrowth={free.toggleGrowth}
          spyOn={free.spyOn}
          onToggleSpy={free.toggleSpy}
          spyIndex={free.spyIndex}
          onSpyIndex={free.setSpyIndex}
        />
      )}

      <Spine
        chapters={chapters}
        mode={mode}
        activeChapter={chapterIndex}
        onOpenChapter={(i) => {
          // Clicking the active chapter toggles its panel (keeps the position);
          // clicking another chapter opens it fresh.
          if (mode === "story" && i === chapterIndex) {
            setStoryOpen((open) => !open);
            return;
          }
          setMode("story");
          setStoryOpen(true);
          story.openChapter(i);
        }}
        onEnterFree={() => setMode("free")}
      />

      {error != null && (
        <div className={styles.error}>
          maps.json niet gevonden — draai build_maps.py
        </div>
      )}
    </>
  );
}
