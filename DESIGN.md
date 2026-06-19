# Nijmegen Tijdmachine — navigation design

## Goal

Turn the flat 1557→2025 slider into an **explorative, guided experience**: you can
move through the city's big-picture arc *and* drill into the specifics of rich
topics (e.g. WW2) without everything being mashed onto one timeline.

## The model: a fractal book

Navigation is nested, and "zoom out / back" always steps toward the overview.
The same page-turn feel applies at every depth.

```
SPINE  (always visible — the whole arc, jump anywhere)
  └─ CHAPTER        a themed era; opens into a few threads
       └─ THREAD    a short themed sequence (a "storyline")
            └─ SCENE a single configured map state (a "page")
```

- **Spine** — a thin ribbon of the chapters (Middeleeuwen → Vestingstad → Oorlog
  → Wederopbouw → nu). Always on screen; you're never lost. Click to jump.
- **Chapter** — entering one shows a title + short intro and its **threads** as
  cards. Light chapters have one thread; heavy chapters (WW2) have several.
- **Thread** — a short ordered run of scenes you page through (‹ prev / next ›).
- **Scene** — one configured map state: a base map/year, which overlays are on
  (and how far they're revealed), a focus extent to fly to, and a caption.

**Why this scales:** a big chapter grows by **adding threads**, never by
lengthening one slider. WW2 isn't one tick — it's its own mini-book.

**Free exploration is always allowed.** Within any scene you can pan, zoom and
scrub; the chapter only *suggests* a starting scene. A dedicated **Vrij
verkennen** chapter exposes the classic full slider + all overlay toggles.

## Scene config (the engine's unit)

```js
{
  title, text,                 // caption shown over the map
  year,                        // base map/aerial to render (reuses the tile pyramid + live WMS)
  focus,                       // [[s,w],[n,e]] bounds to flyTo (optional)
  growthUpto,                  // reveal Stadsontwikkeling polygons up to this year (optional)
  ww2Order,                    // reveal WW2 damage cumulatively to this event (optional)
  fortUpto,                    // reveal fortification rings up to this period-year (optional)
  wall,                        // show city-wall points (bool)
}
```
A **thread** = `{ title, scenes:[...] }`; a **chapter** = `{ title, intro,
focus, threads:[...] }`; the **spine** = ordered chapters.

## Chapters (initial)

1. **Vroeg Nijmegen — middeleeuwen (tot ~1500)** · focus: Valkhof/old town
   - Threads: *De eerste stad* (growth Voor 1230 → 1400 → 1525), *Muren &
     verdediging* (fortification rings 1230–1525 + stadsmuur points).
2. **Vestingstad — Gouden Eeuw tot 1900** · focus: fortress ring/singels
   - Threads: *De vesting groeit* (maps 1639→1900), *Vestingwerken* (rings
     1525–1732, incl. Italian + Coehoorn), *Slechting & uitbreiding* (1874 wall
     demolition → first expansion).
3. **Oorlog — 1944** · focus: center  *(Verwoesting thread = already built)*
   - Threads: *Verwoesting* (22 feb bombing → 17–21 sep battle → granatentijd,
     cumulative damage over 1944 footprints), *Slachtoffers*
     (`WO2_DODEN_GEBEURTENIS`), *Bezetting* (`WO2_PANDEN_DUITSERS`),
     *Herinnering* (`WO2_OORLOGSMONUMENTEN`).
4. **Wederopbouw & groei (na 1945)** · focus: whole municipality
   - Threads: *Wederopbouw* (1949→1965), *Naoorlogse wijken* (Dukenburg,
     Lindenholt — growth 1965→1985), *Waalsprong* (Lent/Veur Lent, growth 2000+,
     aerials → 2025).
+ **Vrij verkennen** — the classic full slider + Transparantie / Toon / Vergelijk
  / Groei controls.

## Data behind it (all open Nijmegen GeoServer/WMS)

- Base maps/aerials: local tile pyramid + live WMS (`extern_Historie_raster`,
  `extern_Luchtfoto`) — see README.
- Stadsontwikkeling growth: `extern_Cultuurhistorie:CHW_STADSONTWIKKELING`.
- Fortifications: `CHW_VESTINGWERKEN` (7 dated `PERIODE` ring lines + `TOELICHTING`).
- City wall: `extern_Historie:HIS_STADSMUUR` (36 tower/gate points + `HTML`).
- WW2: `extern_wo2` (`WO2_OORLOGSSCHADE` events, `HIS_1944_BEBOUWING` footprints,
  plus `WO2_DODEN_*`, `WO2_PANDEN_DUITSERS`, `WO2_OORLOGSMONUMENTEN_SQL`).

## Build order

1. Scaffold: spine + chapter/thread/scene engine + scene→map renderer (reusing
   the existing base/overlay primitives), keep Vrij verkennen.
2. Port the WW2 **Verwoesting** thread as the first worked example.
3. Flesh out remaining chapters/threads.
