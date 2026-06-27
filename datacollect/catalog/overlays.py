"""Polygon overlays. A MapState references one via nmg:overlay; the key selects
the frontend OverlayDef (geometry + colours). "growth" and "fort" are also
inferred by the scene endpoint from a bare overlayLevel / fortLevel."""
from ..graph import Overlay

Overlay("limes", "Neder-Germaanse Limes (kern- en bufferzone)")
Overlay("ww2", "Oorlogsschade 1944")
Overlay("growth", "Stadsontwikkeling")
Overlay("fort", "Vestingwerken")
