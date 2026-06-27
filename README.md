# Nijmegen Tijdmachine

An interactive "time machine" for Nijmegen — slide through 41 historical maps and
aerial photos (1557–1998) draped over a modern basemap, like topotijdreis.nl.

## How it works

The maps come from two **Gemeente Nijmegen WMS** endpoints:
`extern_Historie_raster` (historical maps + aerials, 1557–1998) and
`extern_Luchtfoto` (annual 5cm orthophotos, 2008–2025).

Rather than streaming tiles live (which is slow and produces ragged white
edge-tiles from the ERDAS server), each map is **fetched once at ~3000px and
stored locally**, then placed in the browser as a single image anchored to its
exact geographic bounds. After load, Leaflet pans/zooms that image with CSS
transforms — no network, fully seamless.

**Hybrid detail:** the cached overview (~3000px over the whole extent) goes
blurry up close, so from zoom ≥ 15 the frontend additionally fetches a sharp
live WMS render of just the current viewport and overlays it on top. Pan/zoom
out and it's dropped again. Best of both: instant overview + crisp close-ups.

```
datacollect maps  → fetches every layer (≤3000px, auto-downscales on server 500s)
                    as a transparent WebP into maps/, and writes maps.json
maps.json         → manifest: year, type, era, label, file, [[S,W],[N,E]] bounds
index.html        → loads maps.json, preloads all images, crossfades between years
```

All build/fetch logic lives in the **`datacollect/`** Python package — a single
data-collection tool with one stage per concern (run `python -m datacollect list`
to see them). It is layered: `sources/` (reusable upstream clients — Commons,
WFS, WMS, PDOK, Wikipedia), `stages/` (the collection logic, one CLI subcommand
each), and `catalog/` (declarative content — image sets, vector layers, story
media, the timeline). Adding an image set, a vector layer, or a map year is a
local edit in `catalog/`; the registry + auto-discovery wire it into the CLI.

### Key facts about the source WMS

- Endpoint: `https://services.nijmegen.nl/geoservices/wms/extern_Historie_raster`
- Only supports **EPSG:4326** and **EPSG:28992** (no Web Mercator) — so the
  overlays are requested in 4326 while OSM stays in 3857.
- Hard cap: `width`/`height` must be **< 4000**. Several large-extent municipal
  maps (1850, 1910, 1930, 1957, 1967, 1977) **HTTP 500 at 3000px**, so the build
  steps down to 2500/2000 automatically.

## Run

```bash
pip install -r datacollect/requirements.txt   # Pillow + numpy (raster stages only)
python3 -m datacollect maps    # one-time: download maps/ + maps.json (~50 MB)
python3 -m datacollect tiles   # render the local XYZ tile pyramid into tiles/
python3 -m datacollect finalize  # reconcile maps.json with the tiles on disk
python3 -m http.server 8765    # serve  (open http://localhost:8765)
```

Every stage is idempotent — re-running only fetches what's missing. Run
`python3 -m datacollect all` to collect everything (images, vectors, stories,
stolpersteine + the raster pipeline) in dependency order, or `fetch` for just the
lightweight source fetches.

## City growth (Stadsontwikkeling)

The `vectors` stage (`python3 -m datacollect vectors`) pulls the city's
*Cultuurhistorische Waardenkaart* polygons from the open GeoServer WFS:

```
https://services.nijmegen.nl/geoservices/extern_Cultuurhistorie/ows  (WFS, GeoJSON, EPSG:4326)
layer: CHW_STADSONTWIKKELING  → data/stadsontwikkeling.geojson
```

Each polygon has a `PERIODE` (Voor 1230 … 2000, Lent, Veur Lent), a rich
`OMSCHRIJVING`, and `WIJKEN`. The "🏗 Groei" overlay colors them by period and
reveals them cumulatively as the slider moves; click an area for its
description. Sibling CHW layers (vestingwerken, gebouwde omgeving, parken, …)
live on the same service for future annotation layers.

## WW2 damage stops

The `vectors` stage also pulls two layers used for three dedicated **1944
timeline stops** (spliced in after the 1938 map):

- `extern_wo2:WO2_OORLOGSSCHADE` — 1565 damage polygons, attribute `CATEGORIE`
  with the three events: *Bombardement 22 feb*, *Bevrijding 17–21 sep*,
  *Granatentijd 22 sep*.
- `extern_Historie:HIS_1944_BEBOUWING` — 26 999 1944 building footprints.

Each stop draws all 1944 footprints in gray (Leaflet canvas) with that event's
damage polygons in red on top; earlier events stay faintly visible (cumulative
destruction). Click a damaged area for the event description. `extern_wo2` also
hosts diaries, deaths-by-event, war monuments and German-occupied buildings.

## Controls

- Timeline slider · ‹ › step · ▶ play · ← → / space keys
- Transparency slider (blend against the modern map)
- Filter: all / maps only / aerial photos only
- 🔍 Vergelijk (V): compare-spyglass lens following the cursor, with a year selector
- 🏗 Groei (G): city-development overlay synced to the timeline

## Ideas / next steps

- Monument annotations per period (Rijksmonumenten + temporal validity)
- WWII bomb-damage overlay (the 1944 `Nijmegen1950oorlogsschade` layer is in)
- Attach historical news articles / photos to locations
- Swipe/spyglass compare between two eras
- Port to React if it grows beyond a single page
