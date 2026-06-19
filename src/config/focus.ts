import type { BoundsTuple } from "../types";

// Named focus extents the story flies to — [[south, west], [north, east]].
// Reused across chapters/scenes so geography stays consistent.
export const FOCUS = {
  oldtown: [
    [51.8435, 5.8585],
    [51.8525, 5.872],
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
