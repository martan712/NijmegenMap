import { useState } from "react";
import type { MemorialPoint } from "../../../types";
import styles from "../verhalen.module.css";

/** The fate lines of an inscription (everything after the "GEB. jjjj" line). */
function fateOf(inscription?: string): string {
  if (!inscription) return "";
  const parts = inscription.split(" / ");
  const gi = parts.findIndex((p) => /^GEB\./i.test(p));
  return (gi >= 0 ? parts.slice(gi + 1) : parts).join(" · ");
}

/**
 * The Stolpersteine "memorial wall": a searchable, capped-height list of victims
 * (155 is too many to dump in full). Type to filter by name or street; click a
 * name to fly the companion map to that stone. The fate shows on hover.
 */
export function MemorialWall({
  points,
  onSelect,
}: {
  points: MemorialPoint[];
  onSelect: (p: MemorialPoint) => void;
}) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? points.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.address ?? "").toLowerCase().includes(needle),
      )
    : points;
  return (
    <div className={styles.memorial}>
      <div className={styles.memorialHead}>
        <span className={styles.segTick}>Struikelstenen</span>
        <h2>{points.length} namen</h2>
        <p className={styles.memorialLede}>
          Voor elk weggevoerd slachtoffer ligt een struikelsteen bij hun laatste
          woning. Zoek een naam of klik er een om de steen op de kaart te tonen.
        </p>
      </div>
      <div className={styles.memorialTools}>
        <input
          className={styles.memorialSearch}
          type="search"
          placeholder="Zoek op naam of straat…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className={styles.memorialCount}>
          {shown.length} / {points.length}
        </span>
      </div>
      <div className={styles.memorialGrid}>
        {shown.map((p) => (
          <button
            key={`${p.name}-${p.address ?? ""}`}
            type="button"
            className={styles.victim}
            title={fateOf(p.inscription)}
            onClick={() => onSelect(p)}
          >
            <span className={styles.victimName}>{p.name}</span>
            {p.lifespan && <span className={styles.victimYears}>{p.lifespan}</span>}
          </button>
        ))}
        {shown.length === 0 && <p className={styles.memorialEmpty}>Geen naam gevonden.</p>}
      </div>
      <p className={styles.memorialSource}>
        Bron: Wikipedia, “Lijst van Stolpersteine in Nijmegen” (CC BY-SA) · coördinaten via PDOK
      </p>
    </div>
  );
}
