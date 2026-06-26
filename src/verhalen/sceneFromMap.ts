import type { BoundsTuple, MovementArrow, Scene } from "../types";
import type { MapRow } from "./types";

const num = (s: string | null | undefined): number => Number(s);

/**
 * Translate a segment's backend map rows (focus places + Place->Place arrows +
 * base year) into a Scene the existing MapEngine.applyScene can render on the
 * companion map — so all the existing base-layer / arrow machinery is reused.
 */
export function sceneFromMapRows(rows: MapRow[]): Scene {
  const places = rows.filter((r) => r.kind === "place");
  const arrows: MovementArrow[] = rows
    .filter((r) => r.kind === "arrow")
    .map((r) => ({
      from: [num(r.fromLat), num(r.fromLong)] as [number, number],
      to: [num(r.toLat), num(r.toLong)] as [number, number],
      label: r.arrowLabel ?? undefined,
      curve: r.curve != null ? num(r.curve) : undefined,
    }));

  // Frame all focus places + arrow endpoints, with a little padding.
  const lats: number[] = [];
  const lngs: number[] = [];
  for (const p of places) {
    lats.push(num(p.lat));
    lngs.push(num(p.long));
  }
  for (const a of arrows) {
    lats.push(a.from[0], a.to[0]);
    lngs.push(a.from[1], a.to[1]);
  }
  const pad = 0.004;
  const focus: BoundsTuple = [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ];

  const year = places[0]?.year ? Number(places[0].year) : 1938;

  // The damage-overlay level lives on the MapState, so it rides on every row.
  const overlayRow = rows.find((r) => r.overlay != null);
  const ww2 = overlayRow ? Number(overlayRow.overlay) : undefined;

  // Movement scenes (with arrows) span a wide area that runs off the small
  // historical city map, which leaves the arrow half on the drawn map and half
  // off it — confusing. For those, drop the historical overlay and render on the
  // modern reference map so the whole route sits on one consistent surface.
  // Static/damage scenes (no arrows) stay on the period plan.
  const basemap = arrows.length === 0;

  return { title: "", text: "", year, basemap, focus, ww2, arrows };
}
