import { useMemo } from "react";
import type { FilterMode, ManifestEntry } from "../types";
import styles from "./FreePanel.module.css";

interface Props {
  timeline: ManifestEntry[];
  current: number;
  onScrub: (index: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  onStep: (delta: number) => void;
  opacity: number;
  onOpacity: (value: number) => void;
  filter: FilterMode;
  onFilter: (mode: FilterMode) => void;
  growthOn: boolean;
  onToggleGrowth: () => void;
  spyOn: boolean;
  onToggleSpy: () => void;
  spyIndex: number;
  onSpyIndex: (index: number) => void;
  /** Back to the Verhalen surface. */
  onExit: () => void;
}

const TICK_COUNT = 6;

/** Vrij verkennen: the classic full slider + overlay/compare controls. */
export function FreePanel(props: Props) {
  const {
    timeline, current, onScrub, playing, onTogglePlay, onStep,
    opacity, onOpacity, filter, onFilter, growthOn, onToggleGrowth,
    spyOn, onToggleSpy, spyIndex, onSpyIndex, onExit,
  } = props;

  const ticks = useMemo(() => {
    const n = timeline.length;
    if (!n) return [];
    const count = Math.min(TICK_COUNT, n);
    return Array.from({ length: count }, (_, i) => {
      const idx = Math.round((i * (n - 1)) / (count - 1));
      return timeline[idx].year;
    });
  }, [timeline]);

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <button className={styles.nav} title="Vorige (←)" onClick={() => onStep(-1)}>
          ‹
        </button>
        <button className={styles.play} title="Afspelen" onClick={onTogglePlay}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button className={styles.nav} title="Volgende (→)" onClick={() => onStep(1)}>
          ›
        </button>
        <div className={styles.sliderWrap}>
          <input
            type="range"
            className={styles.timeline}
            min={0}
            max={Math.max(0, timeline.length - 1)}
            step={1}
            value={current}
            onChange={(e) => onScrub(+e.target.value)}
          />
          <div className={styles.ticks}>
            {ticks.map((y, i) => (
              <span key={`${y}-${i}`}>{y}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.ctrl}>
          <button className={styles.chip} title="Terug naar de verhalen" onClick={onExit}>
            ← Verhalen
          </button>
        </div>

        <div className={styles.ctrl}>
          <label htmlFor="opacity">Transparantie</label>
          <input
            id="opacity"
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={opacity}
            onChange={(e) => onOpacity(+e.target.value)}
          />
        </div>

        <div className={styles.ctrl}>
          <label htmlFor="filter">Toon</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => onFilter(e.target.value as FilterMode)}
          >
            <option value="all">Alles</option>
            <option value="map">Alleen kaarten</option>
            <option value="aerial">Alleen luchtfoto's</option>
          </select>
        </div>

        <div className={styles.ctrl}>
          <button
            className={`${styles.chip} ${spyOn ? styles.chipActive : ""}`}
            title="Vergelijk-loep (V)"
            onClick={onToggleSpy}
          >
            🔍 Vergelijk
          </button>
          {spyOn && (
            <select value={spyIndex} onChange={(e) => onSpyIndex(+e.target.value)}>
              {timeline.map((e, i) => (
                <option key={e.file} value={i}>
                  {e.label || e.year}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.ctrl}>
          <button
            className={`${styles.chip} ${growthOn ? styles.chipActive : ""}`}
            title="Stadsontwikkeling (G)"
            onClick={onToggleGrowth}
          >
            🏗 Groei
          </button>
        </div>

        <div className={styles.spacer} />
        <a
          className={styles.cred}
          href="https://services.nijmegen.nl/geoservices/wms/extern_Historie_raster?request=GetCapabilities&service=WMS"
          target="_blank"
          rel="noopener"
        >
          Bron: Gemeente Nijmegen (WMS)
        </a>
      </div>
    </div>
  );
}
