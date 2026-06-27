import L from "leaflet";
import { entryByYear } from "../../lib/manifest";
import type { BoundsTuple } from "../../types";
import {
  arrowRenderer,
  memorialRenderer,
  overlayRenderer,
  photoPinRenderer,
  pinRenderer,
  wallRenderer,
} from "./renderers";
import type { ComponentRenderer, RenderContext, SceneComponent, SceneDeps } from "./types";

const FLY = { duration: 0.85, padding: [20, 20] as L.PointTuple };
const num = (s: string | null | undefined): number => Number(s);

function boundsOf(pts: [number, number][], pad: number): BoundsTuple {
  const lats = pts.map((p) => p[0]);
  const lngs = pts.map((p) => p[1]);
  return [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ];
}

/**
 * Renders a backend-described scene (an ordered list of typed components) onto
 * the companion map. It owns the cross-cutting concerns — the base map and the
 * camera — and dispatches every other component to a renderer registered by its
 * type. Each renderer is called every scene (with an empty list when its type is
 * absent) so layers cross-fade rather than blink.
 *
 * The graph fully describes the scene; this only decides *how* each declared type
 * draws. New component types are added by registering one more renderer here.
 */
export class SceneManager {
  private deps: SceneDeps;
  private registry: Record<string, ComponentRenderer> = {
    PolygonOverlay: overlayRenderer,
    FocusPlace: pinRenderer,
    PhotoPin: photoPinRenderer,
    Arrow: arrowRenderer,
    MemorialLayer: memorialRenderer,
    WallLayer: wallRenderer,
  };

  constructor(deps: SceneDeps) {
    this.deps = deps;
  }

  render(components: SceneComponent[], ctx: RenderContext = {}): void {
    this.applyBaseAndCamera(components, ctx);
    const byType = this.group(components);
    for (const type of Object.keys(this.registry)) {
      this.registry[type](byType[type] ?? [], ctx, this.deps);
    }
  }

  /** Turn off every scene-driven overlay (mode transitions); leaves the base map. */
  clear(): void {
    for (const type of Object.keys(this.registry)) {
      this.registry[type]([], {}, this.deps);
    }
  }

  private group(components: SceneComponent[]): Record<string, SceneComponent[]> {
    const out: Record<string, SceneComponent[]> = {};
    for (const c of components) (out[c.type] ??= []).push(c);
    return out;
  }

  private applyBaseAndCamera(components: SceneComponent[], ctx: RenderContext): void {
    const hasArrow = components.some((c) => c.type === "Arrow");
    const hasLimes = components.some((c) => c.type === "PolygonOverlay" && c.key === "limes");
    const baseMap = components.find((c) => c.type === "BaseMap");

    // A pre-cartographic scene (movement arrows or the limes frontier) spans a
    // wide area that runs off the small historical city plan; show those on the
    // modern reference map instead. Everything else stays on the period plan.
    if (baseMap && !hasArrow && !hasLimes) {
      const year = num(baseMap.year);
      const entry =
        entryByYear(this.deps.manifest, year) ??
        this.deps.manifest.find((e) => e.type !== "wo2");
      if (entry) this.deps.base.setActive(entry);
    } else {
      this.deps.base.clear();
    }

    const focus = this.computeFocus(components, ctx);
    if (focus) this.deps.map.flyToBounds(focus, FLY);
  }

  // Frame all located components (+ a little padding); a memorial scene frames the
  // whole city from its stones. A scene with no located points (e.g. a bare growth
  // overlay) returns undefined so the camera holds its position.
  private computeFocus(components: SceneComponent[], ctx: RenderContext): BoundsTuple | undefined {
    if (components.some((c) => c.type === "MemorialLayer") && ctx.memorials?.length) {
      return boundsOf(ctx.memorials.map((m) => [m.lat, m.lng]), 0.002);
    }
    const pts: [number, number][] = [];
    for (const c of components) {
      if (c.type === "FocusPlace" || c.type === "PhotoPin") pts.push([num(c.lat), num(c.long)]);
      if (c.type === "Arrow") {
        pts.push([num(c.fromLat), num(c.fromLong)], [num(c.toLat), num(c.toLong)]);
      }
    }
    return pts.length ? boundsOf(pts, 0.004) : undefined;
  }
}
