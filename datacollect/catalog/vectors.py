"""WFS vector-layer catalog: (service, typeName, output filename). Add a layer
by appending one VectorLayer. More layers live on the same services (diaries,
deaths-by-event, war monuments, parken, …), ready when wanted."""
from ..stages.vectors import VectorLayer

# City-growth overlay (Stadsontwikkeling).
VectorLayer("extern_Cultuurhistorie", "CHW_STADSONTWIKKELING", "stadsontwikkeling.geojson")
# WW2 damage stops + 1944 building footprints (shown gray under the damage polygons).
VectorLayer("extern_wo2", "WO2_OORLOGSSCHADE", "wo2_oorlogsschade.geojson")
VectorLayer("extern_Historie", "HIS_1944_BEBOUWING", "his_1944_bebouwing.geojson")
# Chapter overlays: fortifications + medieval city wall.
VectorLayer("extern_Cultuurhistorie", "CHW_VESTINGWERKEN", "vestingwerken.geojson")
VectorLayer("extern_Historie", "HIS_STADSMUUR", "stadsmuur.geojson")
# Roman limes (UNESCO Neder-Germaanse Limes) kern-/bufferzones — chapter 1.
VectorLayer("extern_Archeologie", "ARC_ROMEINSE_LIMES", "romeinse_limes.geojson")
