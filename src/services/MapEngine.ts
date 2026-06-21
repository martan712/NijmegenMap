import L from "leaflet";
import { MapService } from "./MapService";
import { BaseLayerManager } from "./BaseLayerManager";
import { GrowthManager } from "./GrowthManager";
import { FortManager } from "./FortManager";
import { RomanManager } from "./RomanManager";
import { PinManager } from "./PinManager";
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
    this.wall = new WallManager(this.map);
    this.wo2 = new WO2Manager(this.map);
    this.spy = new SpyManager(this.map, lens);
  }

  /** Render one scene's full map state (story mode). */
  applyScene(scene: Scene): void {
    // Pre-cartographic eras (Roman, early-medieval) show no anachronistic base
    // — just the modern reference map under any overlay/pin.
    if (scene.noBase) {
      this.base.clear();
    } else {
      const entry =
        entryByYear(this.manifest, scene.year) ??
        this.manifest.find((e) => e.type !== "wo2");
      if (entry) this.base.setActive(entry);
    }
    // A pinned scene centres on its location; otherwise use the scene focus.
    if (scene.pin) this.map.flyTo(scene.pin.at, scene.pin.zoom ?? 15.5, { duration: 0.85 });
    else if (scene.focus) this.map.flyToBounds(scene.focus, FLY);
    this.growth.reveal(scene.growthUpto ?? null);
    this.fort.reveal(scene.fortUpto ?? null);
    // Full limes (with legend) for Roman scenes; a dimmed anchor for the
    // post-Roman Valkhof scenes that keep the zone as a location cue.
    this.roman.setVisible(!!scene.roman || !!scene.limesAnchor, !scene.roman);
    this.pins.show(scene.pin ?? null);
    this.wall.setVisible(!!scene.wall);
    if (scene.wall && scene.wallPoint != null) this.wall.focusPoint(scene.wallPoint);
    else this.wall.clearHighlight();
    this.wo2.reveal(scene.ww2Order ?? null);
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
