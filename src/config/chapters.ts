import { FOCUS } from "./focus";
import type { Chapter } from "../types";

/**
 * THE BOOK — the whole guided experience as plain data.
 *
 * Shape (see src/types.ts):
 *   Chapter → threads[] → scenes[]
 *   A Scene is one configured map state (base year + overlays + focus + caption).
 *
 * To extend the app you (almost) only edit this file: add a scene to a
 * thread, a thread to a chapter, or a whole chapter to the array.
 */
export const CHAPTERS: Chapter[] = [
  {
    title: "Vroeg Nijmegen",
    short: "Middeleeuwen",
    year: 1557,
    focus: FOCUS.oldtown,
    intro:
      "De oudste stad van Nederland groeit rond het Valkhof. Volg de eerste " +
      "stadsuitleg en de muren die haar moesten beschermen.",
    threads: [
      {
        title: "De eerste stad",
        sub: "Stadsgroei tot ~1525",
        scenes: [
          {
            title: "Rond het Valkhof",
            year: 1557,
            focus: FOCUS.oldtown,
            growthUpto: 1230,
            text: "Voor 1230 ligt de bebouwing dicht tegen het Valkhof en de Waal — de kiem van de middeleeuwse stad.",
          },
          {
            title: "De stad breidt uit",
            year: 1557,
            growthUpto: 1400,
            text: "Tussen 1250 en 1400 groeit Nijmegen binnen de stadsmuren tot een welvarende Hanzestad.",
          },
          {
            title: "Volgroeide middeleeuwse stad",
            year: 1557,
            growthUpto: 1525,
            text: "Rond 1525 is de ommuurde stad zo goed als vol; verdere groei moet wachten tot de muren vallen.",
          },
        ],
      },
    ],
  },
  {
    title: "Vestingstad",
    short: "tot 1900",
    year: 1850,
    focus: FOCUS.fortress,
    intro:
      "Van de Gouden Eeuw tot 1900 is Nijmegen een ingesnoerde vestingstad. " +
      "Bastions volgens de nieuwste school, tot de wal in 1874 valt.",
    threads: [
      {
        title: "De vesting groeit",
        sub: "Kaarten 1639 → 1900",
        scenes: [
          {
            title: "De stad in 1639",
            year: 1639,
            focus: FOCUS.fortress,
            text: "Op de oudste stadsplattegrond ligt Nijmegen strak binnen haar wallen aan de Waal.",
          },
          {
            title: "Bastions en bolwerken",
            year: 1672,
            text: "Tijdens het Rampjaar is de vesting volop in bedrijf; de bastions steken scherp naar buiten.",
          },
          {
            title: "De 18e-eeuwse vesting",
            year: 1783,
            text: "De vorm verandert nauwelijks: een eeuw lang blijft de stad gevangen in haar wallen.",
          },
          {
            title: "Tegen de grenzen",
            year: 1850,
            text: "Halverwege de 19e eeuw barst de dichtbevolkte stad uit haar voegen — de wal wordt een keurslijf.",
          },
          {
            title: "Na de slechting",
            year: 1900,
            text: "Met de wal weg in 1874 kan Nijmegen eindelijk de ruimte in; de eerste singels en wijken verschijnen.",
          },
        ],
      },
      {
        // Data-driven: one scene per CHW_VESTINGWERKEN ring (captioned from the
        // gemeente's own TOELICHTING), with the later stadsmuur appended after
        // the generated rings (see useChapters).
        title: "Vestingwerken",
        sub: "Alle vestingringen + stadsmuur, 1230 → 1880",
        source: "vestingwerken",
        scenes: [
          {
            // Source: https://www.noviomagus.nl/OudNijmegen/Stadswallen.htm
            title: "De stadsmuur (1870–1880)",
            year: 1879,
            focus: FOCUS.oldtown,
            wall: true,
            badge: "1870–1880",
            era: "stadsmuur",
            tag: "muur",
            text: "Op 11 maart 1874 verloor Nijmegen zijn vestingstatus. Vanaf 1876 werden de wallen, torens en poorten gesloopt om de overvolle benedenstad — ruim 23.000 inwoners — lucht en betere hygiëne te geven. Klik op de punten voor historische afbeeldingen van de stadswal en haar poorten (collectie Museum Het Valkhof). Fort Krayenhoff en de forten bij Lent bleven behouden.",
          },
        ],
      },
      {
        title: "Slechting & uitbreiding",
        sub: "1874 → eerste wijken",
        scenes: [
          {
            title: "De ingesnoerde stad",
            year: 1871,
            focus: FOCUS.fortress,
            growthUpto: 1525,
            text: "Vlak voor de slechting is de stad nog volledig omsloten door de oude vestingrand.",
          },
          {
            title: "De wal valt (1874)",
            year: 1900,
            growthUpto: 1900,
            text: "Na 1874 wordt de wal geslecht; rond de oude kern verrijzen de eerste 19e-eeuwse uitbreidingen.",
          },
          {
            title: "Eerste nieuwe wijken",
            year: 1925,
            growthUpto: 1925,
            text: "In het begin van de 20e eeuw groeit Nijmegen voor het eerst echt voorbij haar historische grens.",
          },
        ],
      },
    ],
  },
  {
    title: "Oorlog",
    short: "1944",
    year: 1938,
    focus: FOCUS.center,
    intro:
      "1944 is een eigen mini-geschiedenis. Volg hoe het centrum in golven " +
      "wordt verwoest — over de vooroorlogse plattegrond van de stad.",
    threads: [
      {
        title: "Verwoesting",
        sub: "22 feb → 17 sep → granatentijd",
        scenes: [
          {
            title: "Het bombardement",
            year: 1938,
            focus: FOCUS.center,
            ww2Order: 1,
            badge: "1944",
            era: "22 februari 1944",
            tag: "oorlog",
            text: "Op 22 februari 1944 treft een Amerikaans vergissingsbombardement het centrum — in rood de verwoeste percelen op de vooroorlogse stad.",
          },
          {
            title: "De slag om de brug",
            year: 1938,
            ww2Order: 2,
            badge: "1944",
            era: "17–21 september 1944",
            tag: "oorlog",
            text: "Tijdens Market Garden (17–21 september) woedt de strijd om de Waalbrug; de schade breidt zich verder uit.",
          },
          {
            title: "Granatentijd",
            year: 1938,
            ww2Order: 3,
            badge: "1944",
            era: "vanaf 22 september 1944",
            tag: "oorlog",
            text: "Als frontstad ligt Nijmegen maandenlang onder Duitse granaatbeschietingen — de schade stapelt zich op.",
          },
        ],
      },
    ],
  },
  {
    title: "Wederopbouw",
    short: "na 1945",
    year: 2025,
    focus: FOCUS.city,
    intro:
      "Na de oorlog herrijst het centrum en spreidt de stad zich uit: " +
      "naoorlogse wijken in het zuiden en, later, de Waalsprong in het noorden.",
    threads: [
      {
        title: "Wederopbouw",
        sub: "1949 → 1967",
        scenes: [
          {
            title: "Het verwoeste hart",
            year: 1949,
            focus: FOCUS.center,
            text: "Op de luchtfoto van 1949 zijn de littekens van de oorlog in het centrum nog goed te zien.",
          },
          {
            title: "Een nieuw centrum",
            year: 1957,
            text: "In de jaren '50 verrijst een modern, ruimer opgezet stadshart op de oude fundamenten.",
          },
          {
            title: "De stad hersteld",
            year: 1967,
            text: "Tegen het eind van de jaren '60 is de wederopbouw grotendeels voltooid.",
          },
        ],
      },
      {
        title: "Naoorlogse wijken",
        sub: "Dukenburg & Lindenholt",
        scenes: [
          {
            title: "Voor de uitbreiding",
            year: 1964,
            focus: FOCUS.dukenburg,
            growthUpto: 1955,
            text: "Het zuidwesten is rond 1960 nog grotendeels open land tussen de dorpen.",
          },
          {
            title: "Dukenburg verrijst",
            year: 1977,
            growthUpto: 1975,
            text: "Vanaf de jaren '60–'70 verrijst Dukenburg als grote naoorlogse uitbreiding.",
          },
          {
            title: "Lindenholt erbij",
            year: 1986,
            growthUpto: 1985,
            text: "In de jaren '80 komt Lindenholt erbij; het zuidwesten is dan volgebouwd.",
          },
        ],
      },
      {
        title: "Waalsprong",
        sub: "Lent & Veur Lent, 2000+",
        scenes: [
          {
            title: "Over de Waal",
            year: 2008,
            focus: FOCUS.waalsprong,
            growthUpto: 2003,
            text: "Vanaf 2000 springt Nijmegen de Waal over: bij Lent verrijst een geheel nieuw stadsdeel.",
          },
          {
            title: "Ruimte voor de rivier",
            year: 2015,
            growthUpto: 2015,
            text: "Met 'Ruimte voor de Waal' krijgt de rivier een nevengeul; Veur Lent wordt een eiland.",
          },
          {
            title: "Nijmegen nu",
            year: 2025,
            focus: FOCUS.city,
            text: "De actuele luchtfoto toont de hele gemeente — van de middeleeuwse kern tot de Waalsprong.",
          },
        ],
      },
    ],
  },
];
