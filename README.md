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
build_maps.py   → fetches every layer (≤3000px, auto-downscales on server 500s)
                  as a transparent WebP into maps/, and writes maps.json
maps.json       → manifest: year, type, era, label, file, [[S,W],[N,E]] bounds
index.html      → loads maps.json, preloads all images, crossfades between years
```

### Key facts about the source WMS

- Endpoint: `https://services.nijmegen.nl/geoservices/wms/extern_Historie_raster`
- Only supports **EPSG:4326** and **EPSG:28992** (no Web Mercator) — so the
  overlays are requested in 4326 while OSM stays in 3857.
- Hard cap: `width`/`height` must be **< 4000**. Several large-extent municipal
  maps (1850, 1910, 1930, 1957, 1967, 1977) **HTTP 500 at 3000px**, so the build
  steps down to 2500/2000 automatically.

## Run

```bash
python3 build_maps.py        # one-time: download maps/ + maps.json (~50 MB)
python3 -m http.server 8765  # serve
# open http://localhost:8765
```

`build_maps.py` is idempotent — re-running only fetches missing layers.

## Controls

- Timeline slider · ‹ › step · ▶ play · ← → / space keys
- Transparency slider (blend against the modern map)
- Filter: all / maps only / aerial photos only

## Ideas / next steps

- Monument annotations per period (Rijksmonumenten + temporal validity)
- WWII bomb-damage overlay (the 1944 `Nijmegen1950oorlogsschade` layer is in)
- Attach historical news articles / photos to locations
- Swipe/spyglass compare between two eras
- Port to React if it grows beyond a single page
