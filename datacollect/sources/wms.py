"""Gemeente Nijmegen WMS client: parse layer bounds from GetCapabilities, union
the bounds of a comma-joined layer set, and build GetMap requests. Shared by the
maps and tiles stages.

The server speaks only EPSG:4326 (and 28992); in WMS 1.3.0 + EPSG:4326 the bbox
axis order is lat,lon (south,west,north,east). Width/height must be < 4000."""
import re
import urllib.parse

from ..core import http_get

# Two endpoints, same server/CRS/limits: historical rasters (1557–1998) and the
# recent annual aerial photos (2008–2025).
ENDPOINTS = {
    "H": "https://services.nijmegen.nl/geoservices/wms/extern_Historie_raster",
    "L": "https://services.nijmegen.nl/geoservices/wms/extern_Luchtfoto",
}


def capabilities_bboxes(endpoint, *, timeout=120):
    """Map each layer <Name> to its (west, south, east, north) geographic bbox."""
    url = f"{endpoint}?service=WMS&request=GetCapabilities&version=1.3.0"
    xml = http_get(url, timeout=timeout).decode("utf-8", "replace")
    boxes = {}
    for m in re.finditer(r"<Layer\b.*?</Layer>", xml, re.S):
        block = m.group(0)
        name = re.search(r"<Name>([^<]+)</Name>", block)
        if not name:
            continue
        g = {}
        for tag in ("westBoundLongitude", "eastBoundLongitude",
                    "southBoundLatitude", "northBoundLatitude"):
            t = re.search(rf"<{tag}>([^<]+)<", block)
            if t:
                g[tag] = float(t.group(1))
        if len(g) == 4:
            boxes[name.group(1)] = (g["westBoundLongitude"], g["southBoundLatitude"],
                                    g["eastBoundLongitude"], g["northBoundLatitude"])
    return boxes


def union_bbox(layer_csv, boxes):
    """(west, south, east, north) covering every comma-joined layer in layer_csv."""
    w = s = e = n = None
    for layer in layer_csv.split(","):
        if layer not in boxes:
            raise KeyError(layer)
        bw, bs, be, bn = boxes[layer]
        w = bw if w is None else min(w, bw)
        s = bs if s is None else min(s, bs)
        e = be if e is None else max(e, be)
        n = bn if n is None else max(n, bn)
    return w, s, e, n


def getmap_url(endpoint, *, layers, south, west, north, east, width, height):
    params = urllib.parse.urlencode({
        "service": "WMS", "request": "GetMap", "version": "1.3.0",
        "layers": layers, "styles": "", "crs": "EPSG:4326",
        "format": "image/png", "transparent": "true",
        "width": width, "height": height,
        "bbox": f"{south},{west},{north},{east}",   # 1.3.0/4326 = lat,lon order
    })
    return endpoint + "?" + params
