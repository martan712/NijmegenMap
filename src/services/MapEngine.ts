import L from "leaflet";
import { MapService } from "./MapService";
import { BaseLayerManager } from "./BaseLayerManager";
import { GrowthManager } from "./GrowthManager";
import { FortManager } from "./FortManager";
import { RomanManager } from "./RomanManager";
import { PinManager } from "./PinManager";
import { FlowManager } from "./FlowManager";
import { WallManager } from "./WallManager";
import { WO2Manager } from "./WO2Manager";
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
  readonly roman: RomanManager;
  readonly pins: PinManager;
  readonly flow: FlowManager;
  readonly wall: WallManager;
  readonly wo2: WO2Manager;
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
    this.roman = new RomanManager(this.map);
    this.pins = new PinManager(this.map);
    this.flow = new FlowManager(this.map);
    this.wall = new WallManager(this.map);
    this.wo2 = new WO2Manager(this.map);
    this.spy = new SpyManager(this.map, lens);
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
    this.roman.setVisible(!!(scene.limes || scene.anchor), !!scene.anchor);
    this.pins.show(scene.pin ?? null);
    this.flow.show(scene.arrows ?? null);
    this.wall.setVisible(!!scene.wall || scene.wallPoint != null);
    if (scene.wallPoint != null) this.wall.focusPoint(scene.wallPoint);
    else this.wall.clearHighlight();
    this.wo2.reveal(scene.ww2 ?? null);
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
    this.roman.setVisible(false);
    this.pins.show(null);
    this.flow.show(null);
    this.wall.setVisible(false);
    this.wo2.reveal(null);
  }

  setOpacity(opacity: number): void {
    this.base.setOpacity(opacity);
  }

  destroy(): void {
    this.service.destroy();
  }
}
