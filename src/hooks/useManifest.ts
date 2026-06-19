import { useEffect, useState } from "react";
import { WO2_EVENTS } from "../config/overlays";
import type { ManifestEntry } from "../types";

/**
 * Loads maps.json and injects the three synthetic WW2 damage stops right after
 * the 1938 map (they reuse the 1938 base so the pre-war footprint shows beneath).
 */
export function useManifest() {
  const [manifest, setManifest] = useState<ManifestEntry[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    fetch("maps.json")
      .then((r) => r.json())
      .then((data: ManifestEntry[]) => {
        const base = data.find((e) => e.year === 1938 && e.type === "map");
        if (base) {
          const stops: ManifestEntry[] = WO2_EVENTS.map((ev) => ({
            ...base,
            type: "wo2",
            year: 1944,
            label: ev.label,
            era: ev.era,
            wo2cat: ev.cat,
            wo2order: ev.order,
          }));
          data.splice(data.indexOf(base) + 1, 0, ...stops);
        }
        setManifest(data);
      })
      .catch(setError);
  }, []);

  return { manifest, error };
}
