import type { RefObject } from "react";
import styles from "./MapCanvas.module.css";

interface Props {
  containerRef: RefObject<HTMLDivElement>;
  lensRingRef: RefObject<HTMLDivElement>;
  lensYearRef: RefObject<HTMLSpanElement>;
}

/**
 * The Leaflet map container plus the spyglass lens ring. Both are positioned
 * relative to the viewport so the lens coordinates (container points) line up.
 * The map div uses the global #map id; the engine attaches Leaflet to it.
 */
export function MapCanvas({ containerRef, lensRingRef, lensYearRef }: Props) {
  return (
    <>
      <div id="map" ref={containerRef} />
      <div className={styles.lens} ref={lensRingRef}>
        <span className={styles.lensYear} ref={lensYearRef} />
      </div>
    </>
  );
}
