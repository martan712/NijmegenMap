import type { Feature, Geometry } from "geojson";
import { FOCUS } from "./focus";
import { fortYearOf } from "./overlays";
import type { Scene } from "../types";

/** One dated fortification ring from CHW_VESTINGWERKEN. */
export interface DefenceRing {
  year: number; // representative "established by" year (end of PERIODE)
  periode: string;
  toelichting: string;
}

interface VestingProps {
  PERIODE: string;
  TOELICHTING?: string;
}

/** Parse + sort the vestingwerken features into dated rings. */
export function parseDefenceRings(
  features: Feature<Geometry, VestingProps>[],
): DefenceRing[] {
  return features
    .map((f) => ({
      year: fortYearOf(f.properties.PERIODE),
      periode: f.properties.PERIODE,
      toelichting: (f.properties.TOELICHTING || "").trim(),
    }))
    .sort((a, b) => a.year - b.year);
}

// Pick a base map that comfortably covers each ring's era.
function baseYearFor(ringYear: number): number {
  if (ringYear <= 1557) return 1557;
  if (ringYear <= 1672) return 1672;
  return 1783;
}

/**
 * Build one scene per ring: caption comes straight from the gemeente's
 * TOELICHTING, and `upto` reveals that ring (cumulatively). Only the first
 * scene flies, so the view stays put while the rings accumulate.
 */
export function buildDefenceScenes(rings: DefenceRing[]): Scene[] {
  return rings.map((ring, i) => ({
    title: ring.periode,
    text: ring.toelichting || "[geen toelichting in de bron]",
    year: baseYearFor(ring.year),
    focus: i === 0 ? FOCUS.fortress : undefined,
    fort: ring.year,
    badge: String(ring.year),
    era: "vestingwerk",
    tag: "vesting",
  }));
}
