"""Raster pipeline: maps (overlays), tiles (XYZ pyramid), finalize (reconcile).
Split across base (paths/constants/TimelineEntry), tiling (mercator math), and
one module per stage. Pillow/numpy are imported lazily inside the maps/tiles
stages, so discovery and the fetch stages don't require them."""
