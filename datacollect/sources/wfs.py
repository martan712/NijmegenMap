"""Gemeente Nijmegen WFS client: download a GeoServer layer as GeoJSON."""
import urllib.parse

from ..core import http_json

BASE = "https://services.nijmegen.nl/geoservices"


def get_feature(service, layer, *, timeout=90):
    params = urllib.parse.urlencode({
        "service": "WFS", "version": "2.0.0", "request": "GetFeature",
        "typeNames": f"{service}:{layer}",
        "outputFormat": "application/json", "srsName": "EPSG:4326",
    })
    return http_json(f"{BASE}/{service}/ows?{params}", timeout=timeout)
