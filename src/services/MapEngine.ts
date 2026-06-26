import L from "leaflet";
import { MapService } from "./MapService";
import { BaseLayerManager } from "./BaseLayerManager";
import { GrowthManager } from "./GrowthManager";
import { FortManager } from "./FortManager";
import { PolygonOverlayManager } from "./PolygonOverlayManager";
import { LIMES_OVERLAY, WW2_OVERLAY } from "../config/overlays";
import { PinManager } from "./PinManager";
import { FlowManager } from "./FlowManager";
import { WallManager } from "./WallManager";
import { MemorialManager } from "./MemorialManager";
import { SpyManager, type LensRefs } from "./SpyManager";
import { entryByYear } from "../lib/manifest";
import type { Chapter, ManifestEntry, Scene } from "../types";

const FLY = { duration: 0.85, padding: [20, 20] as L.PointTuple };

/**
 * Top-level map orchestration. Owns the map + every layer manager and exposes
 * intent-level methods (apply a scene, open a chapter, render a free year).
 * React calls these; it never touches Leaflet directly.
 */
export class MapEngine {
  readonly map: L.Map;
  readonly base: BaseLayerManager;
  readonly growth: GrowthManager;
  readonly fort: FortManager;
  // Polygon overlays — one renderer, two configs (the Roman limes zones and the
  // WW2 damage). Both are categorised, conditionally-revealed polygon sets.
  readonly limes: PolygonOverlayManager;
  readonly pins: PinManager;
  readonly flow: FlowManager;
  readonly wall: WallManager;
  readonly wo2: PolygonOverlayManager;
  readonly memorials: MemorialManager;
  readonly spy: SpyManager;

  private service: MapService;
  private manifest: ManifestEntry[];

  constructor(container: HTMLElement, manifest: ManifestEntry[], lens: LensRefs) {
    this.service = new MapService(container);
    this.map = this.service.map;
    this.manifest = manifest;
    this.base = new BaseLayerManager(this.map);
    this.growth = new GrowthManager(this.map);
    this.fort = new FortManager(this.map);
    this.limes = new PolygonOverlayManager(this.map, LIMES_OVERLAY);
    this.pins = new PinManager(this.map);
    this.flow = new FlowManager(this.map);
    this.wall = new WallManager(this.map);
    this.wo2 = new PolygonOverlayManager(this.map, WW2_OVERLAY);
    this.memorials = new MemorialManager(this.map);
    this.spy = new SpyManager(this.map, lens);
  }

  /** Show/hide the built-in zoom (+/–) control. */
  setZoomControlVisible(visible: boolean): void {
    this.service.setZoomControlVisible(visible);
  }

  /** Render one scene's full map state (story mode). */
  applyScene(scene: Scene): void {
    // Base map: a purely pre-cartographic scene (only a pin / arrows / limes,
    // no map-anchored overlay) shows the modern reference map; everything else
    // shows the historical map for `year`. `basemap` overrides the default.
    const preCartographic =
      !!(scene.pin || scene.arrows || scene.limes || scene.anchor) &&
      scene.growth == null && scene.fort == null && !scene.wall && scene.ww2 == null;
    if (!(scene.basemap ?? !preCartographic)) {
      this.base.clear();
    } else {
      const entry =
        entryByYear(this.manifest, scene.year) ??
        this.manifest.find((e) => e.type !== "wo2");
      if (entry) this.base.setActive(entry);
    }

    // Camera: an explicit focus wins (e.g. to frame arrows); otherwise a pin
    // centres on its location. (A wall point flies itself, below.)
    if (scene.focus) this.map.flyToBounds(scene.focus, FLY);
    else if (scene.pin) this.map.flyTo(scene.pin.at, scene.pin.zoom ?? 15.5, { duration: 0.85 });

    // Overlays: every manager is set each scene (value or off) so transitions
    // between consecutive scenes animate smoothly rather than blink.
    this.growth.reveal(scene.growth ?? null);
    this.fort.reveal(scene.fort ?? null);
    // The limes frontier shows the zones (+ legend); `anchor` keeps just the
    // Valkhof zone as a dimmed location cue under post-Roman scenes.
    if (scene.limes || scene.anchor) this.limes.show({ dim: !!scene.anchor });
    else this.limes.hide();
    this.pins.show(scene.pin ?? null);
    this.pins.showPhotoPins(scene.photoPins ?? null);
    this.flow.show(scene.arrows ?? null);
    this.wall.setVisible(!!scene.wall || scene.wallPoint != null);
    if (scene.wallPoint != null) this.wall.focusPoint(scene.wallPoint);
    else this.wall.clearHighlight();
    // Omitted highlight defaults to the shown level (Atlas: each scene adds its
    // own damage); Verhalen sets it explicitly so a level stays bright only on
    // the segment that first introduces it.
    const ww2Highlight = scene.ww2Highlight === undefined ? scene.ww2 ?? null : scene.ww2Highlight;
    if (scene.ww2 != null) this.wo2.show({ level: scene.ww2, highlight: ww2Highlight });
    else this.wo2.hide();
    this.memorials.show(scene.memorials ?? null);
  }

  /** Show a chapter's overview: representative base map, no story overlays. */
  applyChapterOverview(chapter: Chapter): void {
    this.clearStoryOverlays();
    const entry = entryByYear(this.manifest, chapter.year);
    if (entry) this.base.setActive(entry);
    this.map.flyToBounds(chapter.focus, FLY);
  }

  /** Render a base year in free-explore mode (overlays handled separately). */
  showFreeEntry(entry: ManifestEntry): void {
    this.base.setActive(entry);
  }

  /** Turn off every scene-driven overlay (used on mode transitions). */
  clearStoryOverlays(): void {
    this.growth.reveal(null);
    this.fort.reveal(null);
    this.limes.hide();
    this.pins.show(null);
    this.pins.showPhotoPins(null);
    this.flow.show(null);
    this.wall.setVisible(false);
    this.wo2.hide();
    this.memorials.show(null);
  }

  setOpacity(opacity: number): void {
    this.base.setOpacity(opacity);
  }

  destroy(): void {
    this.service.destroy();
  }
}
