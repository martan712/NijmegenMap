import type { OverlayState } from "../../config/overlays";
import type { MovementArrow, ScenePin } from "../../types";
import type { ComponentRenderer } from "./types";

const num = (s: string | null | undefined): number => Number(s);
/** A site-root-relative mediaPath ("data/…") → a URL served from public/data. */
const mediaUrl = (p: string): string => "/" + p.replace(/^\//, "");

/**
 * PolygonOverlay: show the named overlay (by its graph `key`) with the scene's
 * reveal level, and hide every other overlay so consecutive scenes cross-fade.
 * `highlightLevel` (WW2) renders the just-added order bright; other overlays
 * ignore it. `dim` requests the overlay's anchor cue (the limes → only the
 * dimmed Valkhof zone) instead of the full layer.
 */
export const overlayRenderer: ComponentRenderer = (components, ctx, deps) => {
  const active = new Set<string>();
  for (const c of components) {
    const key = c.key ?? "";
    const mgr = deps.overlays[key];
    if (!mgr) continue;
    active.add(key);
    const state: OverlayState = {
      level: c.level != null ? num(c.level) : undefined,
      highlight: ctx.highlightLevel ?? null,
      dim: c.dim === "true",
    };
    mgr.show(state);
  }
  for (const key of Object.keys(deps.overlays)) {
    if (!active.has(key)) deps.overlays[key].hide();
  }
};

/**
 * FocusPlace: places are primarily camera anchors (framed by the SceneManager).
 * A lone focus place gets a labelled teardrop when the column shows an image of
 * it (`markLoneFocus`), so the reader sees where it is.
 */
export const pinRenderer: ComponentRenderer = (components, ctx, deps) => {
  if (components.length === 1 && ctx.markLoneFocus) {
    const p = components[0];
    deps.pins.show({ label: p.label ?? "", at: [num(p.lat), num(p.long)] });
  } else {
    deps.pins.show(null);
  }
};

/** PhotoPin: located, clickable image markers (e.g. the Korfmacher wall drawings). */
export const photoPinRenderer: ComponentRenderer = (components, _ctx, deps) => {
  const pins: ScenePin[] = components.map((c) => ({
    at: [num(c.lat), num(c.long)],
    label: c.label ?? "",
    image: c.image ? mediaUrl(c.image) : undefined,
    credit: c.credit ?? undefined,
    text: c.text ?? undefined,
  }));
  deps.pins.showPhotoPins(pins.length ? pins : null);
};

/** Arrow: curved, labelled Place→Place movement arrows. */
export const arrowRenderer: ComponentRenderer = (components, _ctx, deps) => {
  const arrows: MovementArrow[] = components.map((c) => ({
    from: [num(c.fromLat), num(c.fromLong)],
    to: [num(c.toLat), num(c.toLong)],
    label: c.arrowLabel ?? undefined,
    curve: c.curve != null ? num(c.curve) : undefined,
  }));
  deps.flow.show(arrows.length ? arrows : null);
};

/** MemorialLayer: the city-wide Stolpersteine markers (data supplied via context). */
export const memorialRenderer: ComponentRenderer = (components, ctx, deps) => {
  deps.memorials.show(components.length && ctx.memorials?.length ? ctx.memorials : null);
};

// The wall points already shown as curated accent photo pins (vesting.ttl
// id:pin_*), keyed by NUMMER — omitted from the muted layer so they aren't
// doubled. The geojson PHOTO is data/images/korfmacher/<NUMMER>.jpg, so these
// match Kronenburgertoren (17), Molenpoort (11), Hezelpoort (21), Belvédère (27).
const CURATED_WALL_NUMMERS = [11, 17, 21, 27];

/**
 * WallLayer: the city-wide Lauwerier/Korfmacher wall points, drawn in a muted
 * secondary colour behind the curated accent photo pins (from the shared
 * data/stadswallen.geojson the WallManager loads). The curated points are
 * skipped to avoid doubling.
 */
export const wallRenderer: ComponentRenderer = (components, _ctx, deps) => {
  deps.wall.setVisible(components.length > 0, {
    secondary: true,
    skip: CURATED_WALL_NUMMERS,
  });
};
