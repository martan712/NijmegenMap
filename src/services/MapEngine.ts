import L from "leaflet";
import { MapService } from "./MapService";
import { BaseLayerManager } from "./BaseLayerManager";
import { FeatureOverlayManager } from "./FeatureOverlayManager";
import { OVERLAYS } from "../config/overlays";
import { PinManager } from "./PinManager";
import { FlowManager } from "./FlowManager";
import { WallManager } from "./WallManager";
import { MemorialManager } from "./MemorialManager";
import { HeritageManager } from "./HeritageManager";
import { SpyManager, type LensRefs } from "./SpyManager";
import { SceneManager } from "./scene/SceneManager";
import type { ManifestEntry } from "../types";

/**
 * Top-level map orchestration. Owns the map + every layer manager and exposes
 * intent-level methods (render a typed scene, show a free-explore year). React
 * calls these; it never touches Leaflet directly.
 */
export class MapEngine {
  readonly map: L.Map;
  readonly base: BaseLayerManager;
  // One unified renderer per overlay key (limes, ww2, growth, fort) — each a
  // categorised, conditionally-revealed feature layer (see FeatureOverlayManager).
  readonly overlays: Record<string, FeatureOverlayManager>;
  readonly pins: PinManager;
  readonly flow: FlowManager;
  readonly wall: WallManager;
  readonly memorials: MemorialManager;
  readonly heritage: HeritageManager;
  readonly spy: SpyManager;
  /** Renders backend-described, type-driven scenes (the Verhalen surface). */
  readonly scene: SceneManager;

  private service: MapService;
  private manifest: ManifestEntry[];

  constructor(container: HTMLElement, manifest: ManifestEntry[], lens: LensRefs) {
    this.service = new MapService(container);
    this.map = this.service.map;
    this.manifest = manifest;
    this.base = new BaseLayerManager(this.map);
    this.overlays = Object.fromEntries(
      Object.values(OVERLAYS).map((def) => [def.key, new FeatureOverlayManager(this.map, def)]),
    );
    this.pins = new PinManager(this.map);
    this.flow = new FlowManager(this.map);
    this.wall = new WallManager(this.map);
    this.memorials = new MemorialManager(this.map);
    this.heritage = new HeritageManager(this.map);
    this.spy = new SpyManager(this.map, lens);
    this.scene = new SceneManager({
      map: this.map, manifest: this.manifest, base: this.base, overlays: this.overlays,
      pins: this.pins, flow: this.flow, memorials: this.memorials,
      heritage: this.heritage, wall: this.wall,
    });
  }

  /** Show/hide the built-in zoom (+/–) control. */
  setZoomControlVisible(visible: boolean): void {
    this.service.setZoomControlVisible(visible);
  }

  /** Render a base year in free-explore mode (overlays handled separately). */
  showFreeEntry(entry: ManifestEntry): void {
    this.base.setActive(entry);
  }

  setOpacity(opacity: number): void {
    this.base.setOpacity(opacity);
  }

  destroy(): void {
    this.service.destroy();
  }
}
