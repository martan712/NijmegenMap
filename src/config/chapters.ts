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
      "Nederland begint hier. Van het Romeinse Noviomagus en de palts van Karel " +
      "de Grote tot de middeleeuwse stad die rond het Valkhof aan de Waal groeit.",
    threads: [
      {
        // Limes-overlay (data/romeinse_limes.geojson = gemeente ARC_ROMEINSE_LIMES,
        // kern-/bufferzones). Locatiepins op vaste coördinaten; captions geaard op
        // romeinen.nl / welkominnijmegen.nl — zie nijmegen-caption-accuracy.
        title: "Romeins Nijmegen",
        sub: "Noviomagus aan de limes, 19 v.Chr. → 300 n.Chr.",
        scenes: [
          {
            title: "De rand van het rijk",
            year: 1557,
            noBase: true,
            focus: FOCUS.limes,
            roman: true,
            badge: "Romeinse tijd",
            era: "ca. 19 v.Chr. – 300 n.Chr.",
            tag: "romeins",
            text: "Hier liep eeuwenlang de noordgrens van het Romeinse rijk: de limes. De archeologiekaart van de gemeente toont de kern- en bufferzone van werelderfgoed Neder-Germaanse Limes — sinds 2021 op de UNESCO-lijst — dwars door het oosten van Nijmegen.",
          },
          {
            title: "Het eerste legerkamp",
            year: 1557,
            noBase: true,
            roman: true,
            pin: { label: "Hunerberg", at: [51.8419, 5.8836], zoom: 15 },
            badge: "± 19 v.Chr.",
            era: "Legerkamp op de Hunerberg",
            tag: "romeins",
            text: "Rond 19 v.Chr. legde het Romeinse leger onder veldheer Drusus een groot legerkamp aan op de Hunerberg — tijdelijk tot twee legioenen, zo'n 12.000 man. Het is het begin van de Romeinse aanwezigheid bij Nijmegen.",
          },
          {
            title: "Commandopost op het Kops Plateau",
            year: 1557,
            noBase: true,
            roman: true,
            pin: { label: "Kops Plateau", at: [51.83783, 5.89225], zoom: 15 },
            badge: "± 12 v.Chr.",
            era: "Kops Plateau",
            tag: "romeins",
            text: "Rond 12 v.Chr. verrees op het Kops Plateau een kleiner fort met enkele monumentaal gebouwde woningen — vermoedelijk een centrale commandopost van het Romeinse leger aan de grens.",
          },
          {
            title: "Oppidum Batavorum",
            year: 1557,
            noBase: true,
            roman: true,
            pin: { label: "Valkhof", at: [51.84782, 5.87026], zoom: 16 },
            badge: "± 10 v.Chr.",
            era: "Oppidum Batavorum",
            tag: "romeins",
            text: "Naast de militaire kampen groeide bij het Valkhof een burgernederzetting: Oppidum Batavorum, de hoofdplaats van het district van de Bataven.",
          },
          {
            title: "De Bataafse Opstand",
            year: 1557,
            noBase: true,
            roman: true,
            pin: { label: "Valkhof", at: [51.84782, 5.87026], zoom: 16 },
            badge: "69–70 n.Chr.",
            era: "Bataafse Opstand",
            tag: "romeins",
            text: "In het jaar 70 ging Oppidum Batavorum in vlammen op tijdens de opstand van de Bataven onder Julius Civilis. Daarna legerde het Tiende Legioen (Legio X Gemina) zich bij Nijmegen.",
          },
          {
            title: "Ulpia Noviomagus, oudste stad",
            year: 1557,
            noBase: true,
            pin: { label: "Ulpia Noviomagus", at: [51.85363, 5.84522], zoom: 15 },
            badge: "± 100 n.Chr.",
            era: "Ulpia Noviomagus Batavorum",
            tag: "romeins",
            text: "Na de opstand verrees in het westen — het huidige Waterkwartier — een geheel nieuwe stad: Ulpia Noviomagus Batavorum. Onder keizer Trajanus kreeg ze omstreeks 100 marktrecht; daaraan ontleent Nijmegen zijn titel 'oudste stad van Nederland'.",
          },
        ],
      },
      {
        // Bridge from the late-Roman Valkhof to the medieval city. Pre-1557 era,
        // so noBase + location pins; captions geaard op valkhof.nl / romeinen.nl.
        title: "Van castellum tot Valkhof",
        sub: "Romeins fort → keizerburcht, 300 → 1155",
        scenes: [
          {
            title: "Het laat-Romeinse castellum",
            year: 1557,
            noBase: true,
            roman: true,
            pin: { label: "Valkhof", at: [51.84782, 5.87026], zoom: 16 },
            badge: "± 300 n.Chr.",
            era: "Laat-Romeins castellum",
            tag: "romeins",
            text: "Rond 270–300 raakte Noviomagus in het westen verlaten en trok de bevolking terug naar het Valkhof. Daar bouwden de Romeinen een versterkt castellum; omstreeks 370 kreeg het onder keizer Valentinianus een stenen muur. De grens verschoof van de Rijn naar de Waal.",
          },
          {
            title: "Franken op het Valkhof",
            year: 1557,
            noBase: true,
            limesAnchor: true,
            pin: { label: "Valkhof", at: [51.84782, 5.87026], zoom: 16 },
            badge: "5e–7e eeuw",
            era: "Merovingische tijd",
            tag: "vroege middeleeuwen",
            text: "Anders dan lang gedacht bleef het Valkhof bewoond. Het oude castellum bood onderdak aan de opkomende Frankische elite, en vlakbij lag een uitgestrekt Merovingisch grafveld met duizenden graven.",
          },
          {
            title: "De palts van Karel de Grote",
            year: 1557,
            noBase: true,
            limesAnchor: true,
            pin: { label: "Valkhof", at: [51.84782, 5.87026], zoom: 16 },
            badge: "777",
            era: "Palts van Karel de Grote",
            tag: "karolingisch",
            text: "In 777 bouwde Karel de Grote een palts op het Valkhof, deels met hergebruikte Romeinse steen. Nijmegen — toen Numaga — werd een keizerlijke verblijfplaats waar Karel meermaals verbleef, onder meer met Pasen.",
          },
          {
            title: "Barbarossa's Valkhofburcht",
            year: 1557,
            noBase: true,
            limesAnchor: true,
            pin: { label: "Valkhof", at: [51.84782, 5.87026], zoom: 16 },
            badge: "1155",
            era: "Valkhofburcht",
            tag: "middeleeuwen",
            text: "Keizer Frederik Barbarossa liet de palts omstreeks 1155 herbouwen tot een echte burcht. In de luwte van het Valkhof groeit aan de Waal de middeleeuwse stad — het vervolg van dit verhaal.",
          },
        ],
      },
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
        // Data-driven: one scene per CHW_VESTINGWERKEN ring, captioned from the
        // gemeente's own TOELICHTING (see useChapters).
        title: "De vesting groeit",
        sub: "Vestingringen, 1230 → 1732",
        source: "vestingwerken",
        scenes: [],
      },
      {
        title: "De stad binnen de wallen",
        sub: "Op de kaart, 1639 → 1850",
        scenes: [
          {
            title: "De stad in 1639",
            year: 1639,
            focus: FOCUS.fortress,
            text: "Op de oudste stadsplattegrond ligt Nijmegen strak binnen haar wallen aan de Waal.",
          },
          {
            title: "Het Rampjaar (1672)",
            year: 1672,
            text: "Tijdens het Rampjaar is de vesting volop in bedrijf; de bastions steken scherp naar buiten.",
          },
          {
            title: "Vol tegen de wal (1850)",
            year: 1850,
            text: "Halverwege de 19e eeuw barst de dichtbevolkte stad uit haar voegen — de wal wordt een keurslijf.",
          },
        ],
      },
      {
        // Captions/images per point come from the gemeente Korfmacher popups
        // (Museum Het Valkhof / RAN) — see fetch_korfmacher.py. Each scene
        // focuses the point whose photo you can click.
        title: "Stadsmuur & poorten",
        sub: "De wal van binnenuit, vlak voor de sloop",
        scenes: [
          {
            title: "De ontmanteling (1874–1876)",
            year: 1879,
            focus: FOCUS.fortress,
            wall: true,
            era: "ontmanteling",
            tag: "muur",
            text: "Op 11 maart 1874 verloor Nijmegen zijn vestingstatus; vanaf 1876 werden de wallen, torens en poorten gesloopt om de overvolle benedenstad lucht en betere hygiëne te geven. Stadstekenaar Rudolphus Lauwerier en fotograaf Gerard Korfmacher legden de verdwijnende vestingwerken vast. Klik op de punten voor hun afbeeldingen (collectie Museum Het Valkhof / Regionaal Archief Nijmegen).",
          },
          {
            title: "Kronenburgertoren",
            year: 1879,
            wall: true,
            wallPoint: 17,
            era: "stadsmuur",
            tag: "muur",
            text: "De Kronenburgertoren, een zware ronde toren uit de 15e eeuw, vormde de zuidwesthoek van de middeleeuwse stadsmuur. Anders dan de meeste vestingwerken bleef hij na 1876 gespaard — vandaag staat hij nog steeds, als blikvanger van het Kronenburgerpark dat op de oude wal werd aangelegd.",
          },
          {
            title: "Hezelpoort",
            year: 1879,
            wall: true,
            wallPoint: 21,
            era: "stadsmuur",
            tag: "muur",
            text: "De Hezelpoort was de westelijke stadspoort, aan de weg naar Hees. Op de tekeningen uit 1876 zijn de slopers er al druk in de weer; de poort en de aangrenzende bolwerken verdwenen volledig.",
          },
          {
            title: "Molenpoort",
            year: 1879,
            wall: true,
            wallPoint: 11,
            era: "stadsmuur",
            tag: "muur",
            text: "De Molenpoort gaf vanaf de Molenstraat toegang tot de stad. Tijdens de afbraak in 1876–1877 verdween eerst de toegangsbrug en daarna de poort zelf. De naam leeft voort in het winkelcentrum Molenpoort.",
          },
          {
            title: "Belvédère",
            year: 1879,
            wall: true,
            wallPoint: 27,
            era: "stadsmuur",
            tag: "muur",
            text: "Hoog op de Hunerberg, met uitzicht over de Waal, staat de Belvédère — oorspronkelijk een middeleeuwse muurtoren, in de 17e eeuw verbouwd tot uitkijktoren. Ook de Belvédère overleefde de slechting en is er vandaag nog, nu als restaurant.",
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
