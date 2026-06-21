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
    const pin = scene.kind === "limes" || scene.kind === "place" ? scene.pin : undefined;

    // Base map: pre-cartographic eras (limes/place/movement) show only the
    // modern reference map.
    if (scene.kind === "limes" || scene.kind === "place" || scene.kind === "movement") {
      this.base.clear();
    } else {
      const entry =
        entryByYear(this.manifest, scene.year) ??
        this.manifest.find((e) => e.type !== "wo2");
      if (entry) this.base.setActive(entry);
    }

    // Camera: a pin centres on its location; otherwise fit the scene focus.
    // (A wall point flies itself, below, overriding any focus.)
    if (pin) this.map.flyTo(pin.at, pin.zoom ?? 15.5, { duration: 0.85 });
    else if (scene.focus) this.map.flyToBounds(scene.focus, FLY);

    // Overlays: every manager is set each scene (value or off) so transitions
    // between consecutive scenes animate smoothly rather than blink.
    this.growth.reveal(scene.kind === "growth" ? scene.upto : null);
    this.fort.reveal(scene.kind === "fort" ? scene.upto : null);
    // Roman scenes show the full limes (+ legend); the post-Roman "anchor"
    // scenes keep the Valkhof zone as a dimmed location cue.
    this.roman.setVisible(scene.kind === "limes", scene.kind === "limes" && scene.mode === "anchor");
    this.pins.show(pin ?? null);
    this.flow.show(scene.kind === "movement" ? scene.arrows : null);
    this.wall.setVisible(scene.kind === "wall");
    if (scene.kind === "wall" && scene.point != null) this.wall.focusPoint(scene.point);
    else this.wall.clearHighlight();
    this.wo2.reveal(scene.kind === "ww2" ? scene.order : null);
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
