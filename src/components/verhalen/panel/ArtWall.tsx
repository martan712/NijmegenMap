import { useEffect, useMemo, useState } from "react";
import { fetchWikidata } from "../../../verhalen/api";
import { filterWikidataPoints } from "../../../services/scene/renderers";
import type { WikidataLayerPoint } from "../../../types";
import type { WikidataInstance } from "../../../verhalen/types";
import styles from "../verhalen.module.css";

/** One Promise per set key, shared across all ArtWall instances for the session. */
const cache = new Map<string, Promise<WikidataLayerPoint[]>>();

function loadSet(set: string): Promise<WikidataLayerPoint[]> {
  if (!cache.has(set)) {
    cache.set(
      set,
      fetchWikidata(set).then((rows: WikidataInstance[]) =>
        rows.map((r): WikidataLayerPoint => ({
          lat: +r.lat,
          lng: +r.long,
          name: r.name,
          categories: r.categories ?? undefined,
          inception: r.inception ?? undefined,
          image: r.image ?? undefined,
          depicts: r.depicts ?? undefined,
        })),
      ),
    );
  }
  return cache.get(set)!;
}

/**
 * A right-panel gallery of public-art works relevant to a scene: the same
 * Wikidata set the companion map draws, filtered to the scene's slice (by
 * inception period / depicted subject / category — see filterWikidataPoints).
 * Click a work to fly the map to it; type to search the visible slice.
 */
export function ArtWall({
  title,
  set,
  filters,
  onSelect,
}: {
  title?: string | null;
  set: string;
  filters: { before?: string | null; after?: string | null; depicts?: string | null; categories?: string | null; datedOnly?: string | null };
  onSelect: (p: WikidataLayerPoint) => void;
}) {
  const [all, setAll] = useState<WikidataLayerPoint[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let off = false;
    loadSet(set).then((pts) => { if (!off) setAll(pts); }).catch(() => {});
    return () => { off = true; };
  }, [set]);

  // The scene's slice: located works matching the period/subject/category filters.
  const slice = useMemo(
    () => filterWikidataPoints(all, filters),
    [all, filters],
  );

  const needle = q.trim().toLowerCase();
  const shown = needle
    ? slice.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.depicts ?? "").toLowerCase().includes(needle),
      )
    : slice;

  if (all.length > 0 && slice.length === 0) return null; // nothing relevant here

  return (
    <div className={styles.artwall}>
      <div className={styles.memorialHead}>
        <span className={styles.segTick}>Kunst in de stad</span>
        <h2>{title ?? `${slice.length} kunstwerken`}</h2>
        <p className={styles.memorialLede}>
          Publieke kunst uit deze periode. Klik een werk om het op de kaart te
          tonen.
        </p>
      </div>
      <div className={styles.memorialTools}>
        <input
          className={styles.memorialSearch}
          type="search"
          placeholder="Zoek op titel of onderwerp…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className={styles.memorialCount}>
          {shown.length} / {slice.length}
        </span>
      </div>
      <div className={styles.artGrid}>
        {shown.map((p, i) => (
          <button
            key={`${p.name}-${p.lat}-${i}`}
            type="button"
            className={styles.artCard}
            title={p.depicts ? `toont: ${p.depicts}` : p.name}
            onClick={() => onSelect(p)}
          >
            {p.image ? (
              <img className={styles.artThumb} src={p.image} alt="" loading="lazy" />
            ) : (
              <span className={styles.artThumbBlank} aria-hidden />
            )}
            <span className={styles.artName}>{p.name}</span>
            {p.inception && <span className={styles.artYear}>{p.inception}</span>}
          </button>
        ))}
        {shown.length === 0 && <p className={styles.memorialEmpty}>Geen kunstwerk gevonden.</p>}
      </div>
      <p className={styles.memorialSource}>Bron: Wikidata (CC0) · coördinaten via Wikidata</p>
    </div>
  );
}
