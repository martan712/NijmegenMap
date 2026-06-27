import { useEffect, useMemo, useState } from "react";
import { entryTag, yearOf } from "./lib/manifest";
import { useManifest } from "./hooks/useManifest";
import { useMapEngine } from "./hooks/useMapEngine";
import { useFreeExplore } from "./hooks/useFreeExplore";
import { MapCanvas } from "./components/MapCanvas";
import { TitleBadge } from "./components/TitleBadge";
import { YearBadge } from "./components/YearBadge";
import { GrowthLegend } from "./components/GrowthLegend";
import { FreePanel } from "./components/FreePanel";
import { VerhalenView } from "./components/verhalen/VerhalenView";
import type { Badge, Mode } from "./types";
import styles from "./App.module.css";

export default function App() {
  const { manifest, error } = useManifest();
  const { containerRef, lensRingRef, lensYearRef, engine } = useMapEngine(manifest);

  // Two surfaces: the Verhalen scrollytelling (home) and Vrij verkennen (the map
  // explorer). Each links to the other; there is no separate story "book" — its
  // chapters now live in the graph and are served by Verhalen.
  const [mode, setMode] = useState<Mode>("verhalen");
  const free = useFreeExplore(engine, manifest, mode === "free");

  // Year readout for free-explore: the active base map.
  const badge: Badge | null = useMemo(() => {
    if (!manifest) return null;
    const entry = free.timeline[free.current];
    return entry ? { label: entry.label || entry.year, era: entry.era, tag: entryTag(entry) } : null;
  }, [manifest, free.timeline, free.current]);

  // Growth legend visibility + dimming year (free-explore only).
  const legend = useMemo(
    () =>
      free.growthOn
        ? { visible: true, year: yearOf(free.timeline[free.current]) }
        : { visible: false, year: 0 },
    [free.growthOn, free.timeline, free.current],
  );

  // Keyboard: slider / overlay shortcuts in free mode (Verhalen handles its own).
  useEffect(() => {
    if (mode !== "free") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "SELECT") return;
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
  }, [mode, free]);

  return (
    <>
      <MapCanvas
        containerRef={containerRef}
        lensRingRef={lensRingRef}
        lensYearRef={lensYearRef}
      />
      <TitleBadge />

      {mode === "free" && (
        <>
          {badge && <YearBadge {...badge} />}
          <GrowthLegend visible={legend.visible} activeYear={legend.year} />
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
            onExit={() => setMode("verhalen")}
          />
        </>
      )}

      {mode === "verhalen" && (
        <VerhalenView engine={engine} onExit={() => setMode("free")} />
      )}

      {error != null && (
        <div className={styles.error}>
          maps.json niet gevonden — draai build_maps.py
        </div>
      )}
    </>
  );
}
