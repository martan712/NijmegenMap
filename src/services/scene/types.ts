import type L from "leaflet";
import type { ManifestEntry, MemorialPoint } from "../../types";
import type { SceneComponent } from "../../verhalen/types";
import type { BaseLayerManager } from "../BaseLayerManager";
import type { FeatureOverlayManager } from "../FeatureOverlayManager";
import type { PinManager } from "../PinManager";
import type { FlowManager } from "../FlowManager";
import type { MemorialManager } from "../MemorialManager";
import type { WallManager } from "../WallManager";

export type { SceneComponent };

/**
 * Cross-cutting render hints the view supplies (things the component list alone
 * can't carry): the shared Stolpersteine dataset, the WW2 highlight level (which
 * order to render bright — a cross-segment comparison), and whether to mark a lone
 * focus place with a teardrop (e.g. when the column shows an image of it).
 */
export interface RenderContext {
  memorials?: MemorialPoint[];
  highlightLevel?: number | null;
  markLoneFocus?: boolean;
}

/** The shared Leaflet managers a renderer drives (owned by MapEngine). */
export interface SceneDeps {
  map: L.Map;
  manifest: ManifestEntry[];
  base: BaseLayerManager;
  /** One FeatureOverlayManager per overlay key (limes, ww2, growth, fort). */
  overlays: Record<string, FeatureOverlayManager>;
  pins: PinManager;
  flow: FlowManager;
  memorials: MemorialManager;
  wall: WallManager;
}

/**
 * Renders every component of one type for a scene (an empty list clears that
 * layer), so transitions between scenes animate rather than blink.
 */
export type ComponentRenderer = (
  components: SceneComponent[],
  ctx: RenderContext,
  deps: SceneDeps,
) => void;
