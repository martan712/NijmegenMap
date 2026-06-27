"""Slippy-map (XYZ / EPSG:3857) <-> lon/lat math. Pure functions, no I/O."""
import math

from .base import TILE


def lon_of_px(xpix, z):
    return xpix / (TILE * 2 ** z) * 360.0 - 180.0


def lat_of_px(ypix, z):
    yp = ypix / (TILE * 2 ** z)
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * yp))))


def xtile(lon, z):
    return int((lon + 180.0) / 360.0 * 2 ** z)


def ytile(lat, z):
    r = math.radians(lat)
    return int((1 - math.asinh(math.tan(r)) / math.pi) / 2 * 2 ** z)
