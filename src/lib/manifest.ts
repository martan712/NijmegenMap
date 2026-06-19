import type { FilterMode, ManifestEntry } from "../types";

/** Pick a base entry for a year — prefer a real map, never a WW2 clone. */
export function entryByYear(
  manifest: ManifestEntry[],
  year: number,
): ManifestEntry | undefined {
  const candidates = manifest.filter((e) => e.year === year && e.type !== "wo2");
  return (
    candidates.find((e) => e.type === "map") ||
    candidates[0] ||
    manifest.find((e) => e.year === year)
  );
}

/** Filter the manifest for the free-explore timeline. */
export function filterManifest(
  manifest: ManifestEntry[],
  mode: FilterMode,
): ManifestEntry[] {
  return manifest.filter((l) => (mode === "all" ? true : l.type === mode));
}

/** Human label for an entry's kind (shown in the year badge). */
export function entryTag(entry: ManifestEntry): string {
  return entry.type === "aerial"
    ? "luchtfoto"
    : entry.type === "wo2"
      ? "oorlog"
      : "kaart";
}

/** Numeric year of an entry (years are already numbers, but be defensive). */
export function yearOf(entry: ManifestEntry | undefined): number {
  if (!entry) return 0;
  return typeof entry.year === "number" ? entry.year : parseInt(entry.year, 10);
}
