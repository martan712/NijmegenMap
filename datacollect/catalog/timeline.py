"""
Raster timeline catalog: one map stop per year. Add a stop by appending a row.
Each row is (year, layers, kind, era, label[, src]); comma-joined layers are
composited by the WMS (last wins the overlap), and src selects the endpoint
("H" historie raster, "L" luchtfoto). label defaults to str(year).
"""
from ..stages.raster.base import TimelineEntry

ROWS = [
    (1557, "1557.ecw", "map", "Renaissance", None),
    (1639, "1639.ecw", "map", "Gouden Eeuw", None),
    (1668, "1668.ecw", "map", "Gouden Eeuw", None),
    (1672, "1672.ecw", "map", "Rampjaar", None),
    # Flipped draw order: WMS paints the last layer on top, so 1783.ecw wins the
    # overlap over 1783_noord.tif.
    (1783, "1783_noord.tif,1783.ecw", "map", "Republiek", None),
    (1794, "1794.ecw", "map", "Voor de Bataafse Republiek", None),
    (1806, "1806.tif", "map", "Napoleontische tijd", None),
    (1820, "1820.ecw", "map", "Verenigd Koninkrijk", None),
    (1822, "1822_oost.tif,1822_west.tif", "map", "Verenigd Koninkrijk", None),
    (1833, "1833.ecw", "map", "Vestingstad", None),
    (1850, "1850.ecw,1850-1851.tif", "map", "Begin industrialisatie", None),
    (1871, "1871.ecw", "map", "Sloop vestingwerken", None),
    (1879, "1879.ecw", "map", "Stadsuitbreiding", None),
    (1885, "1880-1890.tif", "map", "Stadsuitbreiding", "1880–1890"),
    (1894, "1894.ecw", "map", "Stadsuitbreiding", None),
    (1897, "1897a.ecw,1897b.ecw", "map", "Stadsuitbreiding", None),
    (1900, "1900.ecw", "map", "Eeuwwisseling", None),
    (1908, "1908.ecw", "map", "Eeuwwisseling", None),
    (1910, "1910.ecw", "map", "Eeuwwisseling", None),
    (1925, "1925.ecw", "map", "Interbellum", None),
    (1927, "1927.ecw", "map", "Interbellum", None),
    (1930, "1930.ecw", "map", "Interbellum", None),
    (1936, "1936_lufo.ecw", "aerial", "Interbellum", None),
    (1938, "1938.ecw", "map", "Vooravond WOII", None),
    (1944, "Nijmegen1950oorlogsschade.ecw", "map", "Oorlogsschade WOII", "1944 ⚠"),
    (1949, "1949_lufo.ecw", "aerial", "Na de verwoesting", None),
    (1950, "1950.ecw", "map", "Wederopbouw", None),
    (1953, "1953_1954_lufo.tif", "aerial", "Wederopbouw", "1953–1954"),
    (1957, "1957.ecw", "map", "Wederopbouw", None),
    (1964, "1964_lufo.ecw", "aerial", "Naoorlogse groei", None),
    (1967, "1967.ecw", "map", "Naoorlogse groei", None),
    (1969, "1969_lufo.tif", "aerial", "Naoorlogse groei", None),
    (1974, "1974_lufo.ecw", "aerial", "Uitbreiding", None),
    (1977, "1977.ecw", "map", "Uitbreiding", None),
    (1981, "1981_lufo.tif", "aerial", "Jaren 80", None),
    (1983, "1983_lufo.tif", "aerial", "Jaren 80", None),
    (1986, "1986_lufo.tif", "aerial", "Jaren 80", None),
    (1989, "1989_lufo.tif", "aerial", "Jaren 80", None),
    (1992, "1992_lufo.tif", "aerial", "Jaren 90", None),
    (1995, "1995_lufo.tif", "aerial", "Jaren 90", None),
    (1997, "1997_1998_lufo.tif", "aerial", "Jaren 90", "1997–1998"),
    # Recent annual orthophotos (5cm), from the extern_Luchtfoto endpoint.
    (2008, "Luchtfoto2008.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2009, "Luchtfoto2009.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2010, "Luchtfoto2010.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2011, "Luchtfoto2011.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2012, "Luchtfoto2012.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2013, "Luchtfoto2013.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2014, "Luchtfoto2014.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2015, "Luchtfoto2015.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2016, "Luchtfoto2016.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2017, "Luchtfoto2017.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2018, "Luchtfoto2018.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2019, "Luchtfoto2019.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2020, "Luchtfoto2020.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2021, "Luchtfoto2021.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2022, "Luchtfoto2022.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2023, "Luchtfoto2023.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2024, "Luchtfoto2024.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
    (2025, "Luchtfoto2025_mosaic.ecw", "aerial", "Eenentwintigste eeuw", None, "L"),
]

for _row in ROWS:
    TimelineEntry(*_row)
