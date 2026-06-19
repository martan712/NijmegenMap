import { useEffect, useRef, useState } from "react";
import { MapEngine } from "../services/MapEngine";
import type { ManifestEntry } from "../types";

/**
 * Creates the MapEngine once the map container, the lens DOM, and the manifest
 * are all available, and tears it down on unmount. Returns the refs to attach
 * plus the live engine instance.
 */
export function useMapEngine(manifest: ManifestEntry[] | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRingRef = useRef<HTMLDivElement>(null);
  const lensYearRef = useRef<HTMLSpanElement>(null);
  const [engine, setEngine] = useState<MapEngine | null>(null);

  useEffect(() => {
    if (
      !manifest ||
      !containerRef.current ||
      !lensRingRef.current ||
      !lensYearRef.current
    ) {
      return;
    }
    const instance = new MapEngine(containerRef.current, manifest, {
      ring: lensRingRef.current,
      year: lensYearRef.current,
    });
    setEngine(instance);
    return () => {
      instance.destroy();
      setEngine(null);
    };
  }, [manifest]);

  return { containerRef, lensRingRef, lensYearRef, engine };
}
