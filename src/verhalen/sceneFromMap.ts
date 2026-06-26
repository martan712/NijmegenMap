import type { BoundsTuple, MovementArrow, Scene, ScenePin } from "../types";
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

  // Located image markers (e.g. the Stadsmuur & poorten Korfmacher drawings):
  // a marker per pin whose popup (image + caption + text) opens on click.
  const photoPins: ScenePin[] = rows
    .filter((r) => r.kind === "photopin")
    .map((r) => ({
      at: [num(r.lat), num(r.long)] as [number, number],
      label: r.label ?? "",
      image: r.image ? "/" + r.image.replace(/^\//, "") : undefined,
      credit: r.credit ?? undefined,
      text: r.text ?? undefined,
    }));

  // Frame all focus places + arrow endpoints + photo pins, with a little
  // padding. A base-map-only scene (city-growth overlay, no pin/arrow) has no
  // points to frame — leave focus undefined so the camera holds its position
  // instead of flying to invalid (Infinity) bounds.
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
  for (const p of photoPins) {
    lats.push(p.at[0]);
    lngs.push(p.at[1]);
  }
  const pad = 0.004;
  const focus: BoundsTuple | undefined = lats.length
    ? [
        [Math.min(...lats) - pad, Math.min(...lngs) - pad],
        [Math.max(...lats) + pad, Math.max(...lngs) + pad],
      ]
    : undefined;

  // baseYear rides on every row (it's a MapState property); read it from any row.
  const yearRow = rows.find((r) => r.year != null);
  const year = yearRow?.year ? Number(yearRow.year) : 1938;

  // A named polygon overlay (nmg:overlay → key) plus its cumulative level
  // (nmg:overlayLevel). "ww2" = damage levels 1–3; "limes" = the Roman frontier
  // zones (no level). A bare overlayLevel with no overlay key is a growth year.
  const overlayKey = rows.find((r) => r.overlayKey)?.overlayKey ?? null;
  const overlayRow = rows.find((r) => r.overlay != null);
  const level = overlayRow ? Number(overlayRow.overlay) : undefined;
  const ww2 = overlayKey === "ww2" ? level : undefined;
  const limes = overlayKey === "limes";
  const growth = overlayKey == null ? level : undefined;

  // Fortification rings revealed up to this year (cumulative; nmg:fortLevel).
  const fortRow = rows.find((r) => r.fort != null);
  const fort = fortRow ? Number(fortRow.fort) : undefined;

  // Movement scenes (arrows) and the limes overlay span a wide area that runs
  // off the small historical city plan, leaving the geometry half on the drawn
  // map and half off it — confusing. For those, drop the historical overlay and
  // render on the modern reference map so it sits on one consistent surface.
  // Static/damage/growth scenes (no arrows) stay on the period plan.
  const basemap = arrows.length === 0 && !limes;

  return {
    title: "", text: "", year, basemap, focus, ww2, growth, fort,
    limes: limes || undefined,
    photoPins: photoPins.length ? photoPins : undefined,
    arrows,
  };
}
