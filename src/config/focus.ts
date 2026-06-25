import type { BoundsTuple } from "../types";

// Named focus extents the story flies to — [[south, west], [north, east]].
// Reused across chapters/scenes so geography stays consistent.
export const FOCUS = {
  oldtown: [
    [51.8435, 5.8585],
    [51.8525, 5.872],
  ],
  // Romeinse Limes: the gemeente kern-/bufferzone (Hunerberg, Kops Plateau,
  // Valkhof) east of the medieval core — covers the layer's full extent.
  limes: [
    [51.8215, 5.8695],
    [51.851, 5.902],
  ],
  // The eastern military terraces — Kops Plateau and the Hunerberg.
  kopsplateau: [
    [51.835, 5.872],
    [51.85, 5.895],
  ],
  // All Roman sites east→west, incl. Ulpia Noviomagus in the Waterkwartier —
  // wide enough to frame the movement arrows.
  romanArea: [
    [51.831, 5.838],
    [51.858, 5.899],
  ],
  valkhof:[
    [51.8435, 5.8595],
    [51.8525, 5.876],
  ],
  // Frames the Waal bend west of the Valkhof — wide enough for a raid-route
  // arrow coming upriver to the palts (the Viking scene).
  waalbocht: [
    [51.842, 5.842],
    [51.858, 5.878],
  ],
  // The 82nd Airborne's Waal crossing W of the bridges (Sep 1944) — frames both
  // river banks plus the road/rail bridges to the east for orientation. North
  // capped under the 1938 map's 51.8666 edge.
  waaloversteek: [
    [51.849, 5.841],
    [51.8662, 5.871],
  ],
  fortress: [
    [51.8395, 5.852],
    [51.856, 5.88],
  ],
  center: [
    [51.843, 5.8575],
    [51.853, 5.8745],
  ],
  city: [
    [51.805, 5.79],
    [51.882, 5.918],
  ],
  dukenburg: [
    [51.815, 5.778],
    [51.842, 5.828],
  ],
  waalsprong: [
    [51.854, 5.852],
    [51.886, 5.912],
  ],
} satisfies Record<string, BoundsTuple>;
