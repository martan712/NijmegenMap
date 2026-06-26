import { useEffect, useMemo, useState } from "react";
import { filterManifest, yearOf } from "../lib/manifest";
import type { MapEngine } from "../services/MapEngine";
import type { FilterMode, ManifestEntry } from "../types";

const PLAY_INTERVAL = 1400;

/**
 * Owns the "Vrij verkennen" state (slider position, filter, opacity, growth,
 * spyglass, playback) and renders it through the engine while free mode is
 * active. Free mode never shows the story-only overlays (fort/wall/wo2).
 */
export function useFreeExplore(
  engine: MapEngine | null,
  manifest: ManifestEntry[] | null,
  active: boolean,
) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [current, setCurrent] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [growthOn, setGrowthOn] = useState(false);
  const [spyOn, setSpyOn] = useState(false);
  const [spyIndex, setSpyIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timeline = useMemo(
    () => (manifest ? filterManifest(manifest, filter) : []),
    [manifest, filter],
  );
  const lastIndex = Math.max(0, timeline.length - 1);

  // Keep indices in range when the filter shrinks the timeline.
  useEffect(() => {
    setCurrent((c) => Math.min(c, lastIndex));
    setSpyIndex((s) => Math.min(s, lastIndex));
  }, [lastIndex]);

  function step(delta: number) {
    setCurrent((c) => Math.max(0, Math.min(c + delta, lastIndex)));
  }
  function toggleGrowth() {
    setGrowthOn((v) => !v);
  }
  function toggleSpy() {
    setSpyOn((v) => {
      if (!v) setSpyIndex(lastIndex); // default the compare year to the newest
      return !v;
    });
  }
  function togglePlay() {
    setPlaying((v) => !v);
  }

  // Base map + growth overlay; explicitly clear the story-only overlays.
  useEffect(() => {
    if (!engine || !active) return;
    const entry = timeline[current];
    if (entry) engine.showFreeEntry(entry);
    engine.setOpacity(opacity);
    engine.growth.reveal(growthOn ? yearOf(entry) : null);
    engine.fort.reveal(null);
    engine.wall.setVisible(false);
    engine.wo2.hide();
  }, [engine, active, current, timeline, growthOn, opacity]);

  // Spyglass enable + compare layer.
  useEffect(() => {
    engine?.spy.setEnabled(active && spyOn);
  }, [engine, active, spyOn]);
  useEffect(() => {
    if (!engine || !active || !spyOn) return;
    const entry = timeline[spyIndex];
    if (entry) engine.spy.setEntry(entry);
  }, [engine, active, spyOn, spyIndex, timeline]);

  // Playback.
  useEffect(() => {
    if (!active || !playing) return;
    const id = setInterval(
      () => setCurrent((c) => (c >= lastIndex ? 0 : c + 1)),
      PLAY_INTERVAL,
    );
    return () => clearInterval(id);
  }, [active, playing, lastIndex]);

  return {
    timeline,
    current,
    setCurrent,
    step,
    opacity,
    setOpacity,
    filter,
    setFilter,
    growthOn,
    toggleGrowth,
    spyOn,
    toggleSpy,
    spyIndex,
    setSpyIndex,
    playing,
    togglePlay,
  };
}
