import { FOCUS } from "./focus";
import type { Chapter } from "../types";

/**
 * THE BOOK — the whole guided experience as plain data.
 *
 * Shape (see src/types.ts):
 *   Chapter → threads[] → scenes[]
 *   A Scene is one configured map state. Its map layers are independent
 *   optional fields (pin / arrows / growth / fort / limes / wall / ww2) and ANY
 *   combination may be set on one scene — e.g. limes anchor + pin + raid arrows,
 *   or growth polygons + a located pin.
 *
 * To extend the app you (almost) only edit this file: add a scene to a
 * thread, a thread to a chapter, or a whole chapter to the array.
 */
export const CHAPTERS: Chapter[] = [
  {
    title: "Bataven & Romeinen",
    short: "Romeinse tijd",
    year: 1557,
    focus: FOCUS.limes,
    intro:
      "Nederland begint hier. Lang voor de stad woonden er al mensen bij de " +
      "rivierovergang — en aan de Waal lag eeuwenlang de noordgrens van het " +
      "Romeinse rijk: legerkampen op de heuvels, de Bataafse hoofdplaats en, " +
      "onder keizer Trajanus, Ulpia Noviomagus, de oudste stad van Nederland.",
    threads: [
      {
        // Prehistory: the deepest layer, before the Romans. Located pins on the
        // modern reference map (no overlay). Beeld in data/images/prehistorie/.
        title: "Prehistorie",
        sub: "Voor de Romeinen, neolithicum → 50 v.Chr.",
        scenes: [
          {
            title: "Grafheuvels en urnenvelden",
            year: 1557,
            pin: {
              label: "Nijmegen-Oost",
              at: [51.8385, 5.887],
              zoom: 14,
              image: "data/images/prehistorie/grafheuvel.jpg",
              credit: "Een grote grafheuvel uit de bronstijd (Hoogeloon) — foto Bert van As, CC BY-SA 4.0 (Wikimedia Commons)",
            },
            badge: "Prehistorie",
            era: "Neolithicum – bronstijd",
            tag: "prehistorie",
            text: "Al lang voor de Romeinen woonden hier mensen. In Nijmegen-Oost liggen sporen uit het neolithicum tot de late bronstijd: grafheuvels en urnenvelden. De rivierovergang en de hoge stuwwal maakten deze plek al vroeg aantrekkelijk om te wonen.",
          },
          {
            title: "De eerste Bataven",
            year: 1557,
            pin: {
              label: "Waterstraat",
              at: [51.85, 5.8632],
              zoom: 15,
              image: "data/images/prehistorie/bataven.jpg",
              credit: "Reconstructie van een ijzertijdboerderij te Wekerom — foto Syborgh, CC BY-SA 3.0 (Wikimedia Commons)",
            },
            badge: "± 50 v.Chr.",
            era: "De eerste Bataven",
            tag: "prehistorie",
            text: "Rond 50 v.Chr. vestigden zich de eerste Bataven in het gebied; de Waterstraat in de benedenstad gaat terug op een van de oudste wegen van Nederland. Wanneer kort daarna de Romeinen arriveren, treffen ze hier dus al bewoning aan — het begin van Romeins Nijmegen.",
          },
        ],
      },
      {
        // Limes-overlay (data/romeinse_limes.geojson = gemeente ARC_ROMEINSE_LIMES,
        // kern-/bufferzones). Locatiepins op vaste coördinaten; captions geaard op
        // romeinen.nl / welkominnijmegen.nl — zie nijmegen-caption-accuracy.
        title: "Romeins Nijmegen",
        sub: "Noviomagus aan de limes, 19 v.Chr. → 300 n.Chr.",
        scenes: [
          {
            limes: true,
            title: "De rand van het rijk",
            year: 1557,
            focus: FOCUS.limes,
            badge: "Romeinse tijd",
            era: "ca. 19 v.Chr. – 300 n.Chr.",
            tag: "romeins",
            text: "Hier liep eeuwenlang de noordgrens van het Romeinse rijk: de limes. De archeologiekaart van de gemeente toont de kern- en bufferzone van werelderfgoed Neder-Germaanse Limes — sinds 2021 op de UNESCO-lijst — dwars door het oosten van Nijmegen.",
          },
          {
            limes: true,
            title: "Het eerste legerkamp",
            year: 1557,
            pin: {
              label: "Hunerberg",
              at: [51.8419, 5.8836],
              zoom: 15,
              image: "data/images/roman/hunerberg.jpg",
              credit: "Maquette van de Romeinse legioensvesting op de Hunerberg — Joris, CC BY-SA 4.0 (Wikimedia Commons)",
            },
            badge: "± 19 v.Chr.",
            era: "Legerkamp op de Hunerberg",
            tag: "romeins",
            text: "Rond 19 v.Chr. legde het Romeinse leger onder veldheer Drusus een groot legerkamp aan op de Hunerberg — tijdelijk tot twee legioenen, zo'n 12.000 man. Het is het begin van de Romeinse aanwezigheid bij Nijmegen.",
          },
          {
            limes: true,
            title: "Commandopost op het Kops Plateau",
            year: 1557,
            pin: {
              label: "Kops Plateau",
              at: [51.83783, 5.89225],
              zoom: 15,
              image: "data/images/roman/kops.jpg",
              credit: "Romeinse ruiterhelm gevonden op het Kops Plateau — foto Carole Raddato, CC BY-SA 2.0 (Wikimedia Commons)",
            },
            badge: "± 12 v.Chr.",
            era: "Kops Plateau",
            tag: "romeins",
            text: "Rond 12 v.Chr. verrees op het Kops Plateau een kleiner fort met enkele monumentaal gebouwde woningen — vermoedelijk een centrale commandopost van het Romeinse leger aan de grens.",
          },
          {
            limes: true,
            title: "Oppidum Batavorum",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/roman/oppidum.jpg",
              credit: "Het Valkhof, waar Oppidum Batavorum lag — prent, Rijksmuseum (CC0)",
            },
            badge: "± 10 v.Chr.",
            era: "Oppidum Batavorum",
            tag: "romeins",
            text: "Naast de militaire kampen groeide bij het Valkhof een burgernederzetting: Oppidum Batavorum, de hoofdplaats van het district van de Bataven.",
          },
          {
            limes: true,
            title: "De Bataafse Opstand",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/roman/civilis.jpg",
              credit: "Rembrandt, De samenzwering van Claudius Civilis (1661–62) — publiek domein",
            },
            badge: "69–70 n.Chr.",
            era: "Bataafse Opstand",
            tag: "romeins",
            text: "In het jaar 70 ging Oppidum Batavorum in vlammen op tijdens de opstand van de Bataven onder Julius Civilis. Daarna legerde het Tiende Legioen (Legio X Gemina) zich bij Nijmegen.",
          },
          {
            title: "Ulpia Noviomagus, oudste stad",
            year: 1557,
            pin: {
              label: "Ulpia Noviomagus",
              at: [51.85363, 5.84522],
              zoom: 15,
              image: "data/images/roman/ulpia.jpg",
              credit: "Reconstructie van Ulpia Noviomagus — muurschildering Peter Nuyten (foto Wouter Hinrichs, CC BY 4.0)",
            },
            badge: "± 100 n.Chr.",
            era: "Ulpia Noviomagus Batavorum",
            tag: "romeins",
            text: "Na de opstand verrees in het westen — het huidige Waterkwartier — een geheel nieuwe stad: Ulpia Noviomagus Batavorum. Onder keizer Trajanus kreeg ze omstreeks 100 marktrecht; daaraan ontleent Nijmegen zijn titel 'oudste stad van Nederland'.",
          },
          {
            // Summary: arrows trace how the centre of Roman Nijmegen shifted
            // across the landscape over four centuries (same sourced coords).
            title: "Het zwaartepunt verschuift",
            year: 1557,
            focus: FOCUS.romanArea,
            badge: "Romeinse tijd",
            era: "Noviomagus verschuift",
            tag: "romeins",
            text: "Vier eeuwen lang verschoof het hart van Romeins Nijmegen over het landschap: van de legerkampen op de Hunerberg en het Kops Plateau naar de burgerstad bij het Valkhof, na de opstand westwaarts naar Ulpia Noviomagus, en rond 300 weer terug naar het Valkhof.",
            arrows: [
              { from: [51.8419, 5.8836], to: [51.83783, 5.89225], label: "19 v.Chr.", curve: 0.18 },
              { from: [51.83783, 5.89225], to: [51.84782, 5.87026], label: "12 v.Chr.", curve: 0.18 },
              { from: [51.84782, 5.87026], to: [51.85363, 5.84522], label: "na 70", curve: 0.22 },
              { from: [51.85363, 5.84522], to: [51.84782, 5.87026], label: "± 300", curve: -0.22 },
            ],
          },
        ],
      },
      {
        // Closing beat of the Roman chapter: the frontier pulls back from the
        // Rhine to the Waal and the Valkhof becomes Rome's last foothold here.
        title: "Het einde van Romeins Nijmegen",
        sub: "Terug naar het Valkhof, ± 300",
        scenes: [
          {
            limes: true,
            title: "Het laat-Romeinse castellum",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/roman/castellum.jpg",
              credit: "Het Valkhof met de 'Romeinse kapel', tekening uit 1728 — RCE, CC BY-SA 4.0",
            },
            badge: "± 300 n.Chr.",
            era: "Laat-Romeins castellum",
            tag: "romeins",
            text: "Rond 270–300 raakte Noviomagus in het westen verlaten en trok de bevolking terug naar het Valkhof. Daar bouwden de Romeinen een versterkt castellum; omstreeks 370 kreeg het onder keizer Valentinianus een stenen muur. De grens verschoof van de Rijn naar de Waal — tot de Romeinen in de 5e eeuw definitief vertrokken.",
          },
        ],
      },
    ],
  },
  {
    title: "Keizerstad",
    short: "Middeleeuwen",
    year: 1557,
    focus: FOCUS.oldtown,
    intro:
      "Op de Romeinse resten bouwde Karel de Grote een palts; eeuwenlang " +
      "hielden keizers er rijksdagen. In de luwte van het Valkhof groeit aan " +
      "de Waal de middeleeuwse stad — met stadsrechten, de Sint-Steven en, " +
      "vanaf 1402, de Hanze.",
    threads: [
      {
        // Valkhof continuity, 5e–12e eeuw: the imperial seat from the Franks
        // through the Carolingian/Ottonian palts to Barbarossa's burcht.
        // Captions geaard op valkhof.nl / nl.wikipedia Geschiedenis van Nijmegen;
        // pin op het Valkhof, beeld in data/images/medieval/ (zie fetch_medieval_images.py).
        title: "Van palts tot burcht",
        sub: "Valkhof: Franken → keizerpalts → burcht, 450 → 1155",
        scenes: [
          {
            anchor: true,
            title: "Franken op het Valkhof",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/roman/franken.jpg",
              credit: "Grafurn opgegraven op het Valkhof — RCE, CC BY-SA 4.0",
            },
            badge: "5e–7e eeuw",
            era: "Merovingische tijd",
            tag: "vroege middeleeuwen",
            text: "Anders dan lang gedacht bleef het Valkhof bewoond. Het oude castellum bood onderdak aan de opkomende Frankische elite, en vlakbij lag een uitgestrekt Merovingisch grafveld met duizenden graven.",
          },
          {
            anchor: true,
            title: "De palts van Karel de Grote",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/roman/palts.jpg",
              credit: "De Sint-Nicolaaskapel (Karolingische kapel) op het Valkhof — RCE, CC BY-SA 4.0",
            },
            badge: "777",
            era: "Palts van Karel de Grote",
            tag: "karolingisch",
            text: "In 777 bouwde Karel de Grote een palts op het Valkhof, deels met hergebruikte Romeinse steen. Nijmegen — toen Numaga — werd een keizerlijke verblijfplaats waar Karel meermaals verbleef, onder meer met Pasen.",
          },
          {
            // Composite scene: dimmed Valkhof anchor + pin image + a raid-route
            // arrow coming upriver. The wide `waalbocht` focus frames the arrow.
            anchor: true,
            title: "Vikingen plunderen de palts",
            year: 1557,
            focus: FOCUS.waalbocht,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/medieval/vikingen.jpg",
              credit: "Het Osebergschip (9e eeuw), een bewaard Vikingschip — Vikingschipmuseum Oslo, foto Petter Ulleland, CC BY-SA 4.0 (Wikimedia Commons)",
            },
            arrows: [
              { from: [51.8572, 5.8475], to: [51.84782, 5.87026], label: "Noormannen", curve: 0.22 },
            ],
            badge: "9e eeuw",
            era: "Vikingplunderingen",
            tag: "vroege middeleeuwen",
            text: "De Karolingische palts was een begeerd doelwit. Over de Waal voeren de Noormannen stroomopwaarts naar Nijmegen: in 838 vond de eerste overval plaats, in 880 belegerden en bezetten ze het Valkhof en staken het bij hun vertrek in brand. Pas rond 925 hield het plunderen op.",
          },
          {
            anchor: true,
            title: "Keizerstad: rijksdagen & Theophanu",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/medieval/keizerstad.jpg",
              credit: "Keizer Otto III ontvangt de hulde van de rijksdelen — miniatuur uit het Evangeliarium van Otto III, ca. 1000, CC BY-SA 4.0 (Wikimedia Commons)",
            },
            badge: "10e–11e eeuw",
            era: "Keizerstad",
            tag: "middeleeuwen",
            text: "Onder de Ottoonse en Salische keizers werd het Valkhof een geliefde verblijfplaats: hier werden rijksdagen gehouden (949, 996) en in 991 stierf keizerin Theophanu, moeder van Otto III, in de palts. Aan deze keizerlijke band dankt Nijmegen zijn bijnaam Keizerstad.",
          },
          {
            anchor: true,
            title: "De palts verwoest",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/medieval/palts1047.jpg",
              credit: "Keizer Hendrik III, tegen wie hertog Godfried in opstand kwam — middeleeuwse miniatuur, publiek domein (Wikimedia Commons)",
            },
            badge: "1047",
            era: "De palts verwoest",
            tag: "middeleeuwen",
            text: "In 1047 ging de palts in vlammen op: hertog Godfried met de Baard verwoestte haar tijdens zijn opstand tegen keizer Hendrik III. De keizerlijke burcht lag daarna in puin — tot Barbarossa haar een eeuw later liet herbouwen.",
          },
          {
            anchor: true,
            title: "Barbarossa's Valkhofburcht",
            year: 1557,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/roman/barbarossa.jpg",
              credit: "Het Valkhof met de Barbarossa-ruïne, prent uit 1670 — Rijksmuseum (CC0)",
            },
            badge: "1155",
            era: "Valkhofburcht",
            tag: "middeleeuwen",
            text: "Keizer Frederik Barbarossa liet de palts omstreeks 1155 herbouwen tot een echte burcht. In de luwte van het Valkhof groeit aan de Waal de middeleeuwse stad — het vervolg van dit verhaal.",
          },
        ],
      },
      {
        // The city itself, west of the Valkhof: from the first citizens (1184)
        // through city rights, Gelre and the Hanze to a full medieval town.
        // Every scene carries `growth` so the city-development polygons persist
        // across the thread; event scenes add a located pin (data/images/medieval/).
        title: "De stad aan de Waal",
        sub: "Stadsrechten, Hanze & groei, 1184 → 1525",
        scenes: [
          {
            title: "Rond het Valkhof",
            year: 1557,
            focus: FOCUS.oldtown,
            growth: 1230,
            text: "In 1184 worden de inwoners — de cives — voor het eerst genoemd; het zwaartepunt verschuift dan van het Valkhof westwaarts, naar de markt aan de Waal. Voor 1230 ligt de bebouwing nog dicht tegen het Valkhof: de kiem van de middeleeuwse stad.",
          },
          {
            title: "Stadsrechten",
            year: 1557,
            growth: 1230,
            pin: {
              label: "Grote Markt",
              at: [51.84775, 5.86505],
              zoom: 16,
              image: "data/images/medieval/stadsrechten.jpg",
              credit: "Het wapen van Nijmegen met de dubbele Rijksadelaar — Martinvl, publiek domein (Wikimedia Commons)",
            },
            badge: "1230",
            era: "Stadsrechten",
            tag: "middeleeuwen",
            text: "Op 31 augustus 1230 verleende rooms-koning Hendrik (VII) Nijmegen stadsrechten naar het voorbeeld van Aken. Als vrije rijksstad kreeg de stad een eigen bestuur en zegel — de status die haar bijnaam Keizerstad bekrachtigde.",
          },
          {
            title: "Verpand aan Gelre",
            year: 1557,
            growth: 1230,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/medieval/gelre.jpg",
              credit: "Penning met het wapenschild van de graaf van Gelre (12e eeuw) — publiek domein (Wikimedia Commons)",
            },
            badge: "1247",
            era: "Verpand aan Gelre",
            tag: "middeleeuwen",
            text: "In 1247 verpandde rooms-koning Willem II het Rijk van Nijmegen — stad én burcht — aan de graaf van Gelre. De pandsom werd nooit afgelost; sindsdien hoort Nijmegen bij Gelre en niet meer rechtstreeks bij het keizerrijk.",
          },
          {
            title: "Sint-Steven & de Maria-Omdracht",
            year: 1557,
            growth: 1230,
            pin: {
              label: "Sint-Stevenskerk",
              at: [51.84799, 5.8649],
              zoom: 16,
              image: "data/images/medieval/sintsteven.jpg",
              credit: "De toren van de Sint-Stevenskerk — foto Tubantia, CC BY-SA 3.0 (Wikimedia Commons)",
            },
            badge: "1272",
            era: "Sint-Steven",
            tag: "middeleeuwen",
            text: "De Sint-Stevenskerk, de middeleeuwse hoofdkerk, werd in 1272 gewijd — naar verluidt door Albertus Magnus. Eromheen ontstond de Maria-Omdracht, een processie die het stadsleven eeuwenlang zou kleuren.",
          },
          {
            title: "Pest & Jodenvervolging",
            year: 1557,
            growth: 1400,
            pin: {
              label: "Mariënburg",
              at: [51.8447, 5.8639],
              zoom: 16,
              image: "data/images/medieval/pest1349.jpg",
              credit: "Jodenvervolging tijdens de pest van 1349 — miniatuur uit een 14e-eeuwse kroniek (Kon. Bibliotheek van België), publiek domein (Wikimedia Commons)",
            },
            badge: "1349",
            era: "Pest & vervolging",
            tag: "middeleeuwen",
            text: "De pest van 1349 trof ook Nijmegen — en werd, zoals in veel Rijnsteden, gevolgd door een vervolging van de joodse gemeenschap, destijds de grootste van de Lage Landen. De donkere keerzijde van de bloeiende stad.",
          },
          {
            title: "De stad breidt uit",
            year: 1557,
            focus: FOCUS.oldtown,
            growth: 1400,
            text: "Tussen 1250 en 1400 groeit Nijmegen binnen de stadsmuren tot een welvarende handelsstad.",
          },
          {
            title: "Hanzestad",
            year: 1557,
            growth: 1400,
            pin: {
              label: "Waalkade",
              at: [51.85045, 5.8645],
              zoom: 15,
              image: "data/images/medieval/hanze.jpg",
              credit: "De Kamper Kogge, varende replica van een middeleeuwse Hanzekogge — foto Jean-Pol Grandmont, CC BY 4.0 (Wikimedia Commons)",
            },
            badge: "1402",
            era: "Hanzestad",
            tag: "middeleeuwen",
            text: "In 1402 werd Nijmegen Hanzestad. Vanaf de Waalkade voeren koggen stroomopwaarts naar Keulen en stroomafwaarts naar Holland en de zee; de stad werd het regionale hoofd van het Keulse Hanzekwartier.",
          },
          {
            title: "Volgroeide middeleeuwse stad",
            year: 1557,
            focus: FOCUS.oldtown,
            growth: 1525,
            text: "Rond 1525 is de ommuurde stad zo goed als vol; verdere groei moet wachten tot de muren vallen.",
          },
        ],
      },
      {
        // Cultural "stad van naam": Nijmegen's medieval / early-16th-century
        // cultural output. Pure portrait/title-page pins on the 1557 base map
        // (basemap forced on, like the early-modern thread, since a lone pin would
        // otherwise fall back to the modern reference map). Beeld in
        // data/images/culture/ (zie fetch_culture_images.py).
        title: "Stad van naam",
        sub: "Kunst, geloof & toneel, ± 1400 → 1521",
        scenes: [
          {
            title: "De gebroeders van Limburg",
            year: 1557,
            basemap: true,
            focus: FOCUS.oldtown,
            pin: {
              label: "Stevenskerkhof",
              at: [51.8478, 5.8651],
              zoom: 16,
              image: "data/images/culture/limburg.jpg",
              credit: "De maand juni uit de Très Riches Heures du Duc de Berry — gebroeders van Limburg, ca. 1412–1416, publiek domein (Wikimedia Commons)",
            },
            badge: "± 1400",
            era: "Gebroeders van Limburg",
            tag: "cultuur",
            text: "Rond 1385 werden in Nijmegen de broers Herman, Paul en Johan van Limburg geboren — de beroemdste miniatuurschilders van hun tijd. Voor de Franse hertog Jean de Berry verluchtten zij de Très Riches Heures, het rijkst versierde getijdenboek van de middeleeuwen. Alle drie stierven ze jong, vermoedelijk in 1416 aan de pest.",
          },
          {
            title: "Mariken van Nieumeghen",
            year: 1557,
            basemap: true,
            pin: {
              label: "Grote Markt",
              at: [51.84755, 5.8650],
              zoom: 17,
              image: "data/images/culture/mariken.gif",
              credit: "Titelpagina van Mariken van Nieumeghen — Jan van Doesborch, ca. 1518, publiek domein (Wikimedia Commons)",
            },
            badge: "± 1515",
            era: "Mariken van Nieumeghen",
            tag: "cultuur",
            text: "Het rederijkersspel Mariken van Nieumeghen, gedrukt rond 1515, speelt zich af in en rond Nijmegen. Het vertelt hoe het meisje Mariken zeven jaar lang met de duivel Moenen door de wereld trekt, tot een mirakelspel haar van haar zonden verlost. Een hoogtepunt van de Middelnederlandse letterkunde — vandaag staat Mariken in brons op de Grote Markt.",
          },
          {
            title: "Petrus Canisius",
            year: 1557,
            basemap: true,
            pin: {
              label: "Broerstraat",
              at: [51.8461, 5.8636],
              zoom: 17,
              image: "data/images/culture/canisius.jpg",
              credit: "Petrus Canisius — anoniem portret, 1699, publiek domein (Wikimedia Commons)",
            },
            badge: "1521",
            era: "Petrus Canisius",
            tag: "cultuur",
            text: "Op 8 mei 1521 werd in de Broerstraat Petrus Canisius geboren. Als jezuïet werd hij de drijvende kracht achter de katholieke Contrareformatie in Duitstalig Europa; zijn catechismus werd eeuwenlang herdrukt. In 1925 werd hij heilig verklaard en tot kerkleraar uitgeroepen — de bekendste zoon van de stad.",
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
        // Early-modern bridge (1543 → 1794): the period between the full
        // medieval city and the cartographic fortress maps. Pin scenes on the
        // closest historical base map (basemap forced on, since a lone pin would
        // otherwise show the modern reference map). Beeld in data/images/earlymodern/.
        title: "Gewest, geloof & vrede",
        sub: "Van Habsburg tot de Fransen, 1543 → 1794",
        scenes: [
          {
            title: "Gelre wordt Habsburgs",
            year: 1557,
            basemap: true,
            pin: {
              label: "Grote Markt",
              at: [51.84775, 5.86505],
              zoom: 16,
              image: "data/images/earlymodern/venlo1543.jpg",
              credit: "Keizer Karel V — anoniem portret, ca. 1550 (Rijksmuseum), publiek domein (Wikimedia Commons)",
            },
            badge: "1543",
            era: "Verdrag van Venlo",
            tag: "vesting",
            text: "In 1543 dwong keizer Karel V met het Verdrag van Venlo het hertogdom Gelre in de Habsburgse Nederlanden. Nijmegen verloor haar eeuwenoude zelfstandige positie; voortaan was Arnhem de favoriete gewestelijke hoofdstad.",
          },
          {
            title: "Maurits verovert de stad",
            year: 1639,
            basemap: true,
            pin: {
              label: "Valkhof",
              at: [51.84782, 5.87026],
              zoom: 16,
              image: "data/images/earlymodern/maurits1591.jpg",
              credit: "Prins Maurits van Oranje — Michiel van Mierevelt, publiek domein (Wikimedia Commons)",
            },
            badge: "1591",
            era: "Maurits verovert Nijmegen",
            tag: "vesting",
            text: "In 1591 veroverde prins Maurits van Oranje Nijmegen op de Spaanse koning. Onder de Republiek werd de stad gereformeerd: de katholieke meerderheid werd minderheid en katholieke instellingen verdwenen of doken onder.",
          },
          {
            title: "De Vrede van Nijmegen",
            year: 1672,
            basemap: true,
            pin: {
              label: "Stadhuis",
              at: [51.84715, 5.86555],
              zoom: 16,
              image: "data/images/earlymodern/vrede1678.jpg",
              credit: "De Vrede van Nijmegen, 1678 — prent, Rijksmuseum (CC0, Wikimedia Commons)",
            },
            badge: "1678",
            era: "Vrede van Nijmegen",
            tag: "vesting",
            text: "Van 1678 tot 1679 werd in Nijmegen de vrede getekend die de Hollandse Oorlog beëindigde. Diplomaten uit heel Europa onderhandelden in de stad; heel even was Nijmegen het diplomatieke centrum van het continent.",
          },
          {
            title: "De Fransen nemen de vesting",
            year: 1783,
            basemap: true,
            pin: {
              label: "Schipbrug naar Lent",
              at: [51.8507, 5.866],
              zoom: 15,
              image: "data/images/earlymodern/franse1794.jpg",
              credit: "Het beleg van Nijmegen in 1794, met de schipbrug naar Lent — prent, Ambroise Tardieu, publiek domein (Wikimedia Commons)",
            },
            badge: "1794",
            era: "Franse inname",
            tag: "vesting",
            text: "Eind 1794 viel de vesting Nijmegen na hevige beschietingen in handen van de Franse Revolutionaire legers. Bij de overhaaste vlucht over de schipbrug naar Lent verdronken velen. Het begin van de Franse tijd — en van Nijmegen als zwaarbewapende grensvesting in de 19e eeuw.",
          },
        ],
      },
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
            wallPoint: 17,
            era: "stadsmuur",
            tag: "muur",
            text: "De Kronenburgertoren, een zware ronde toren uit de 15e eeuw, vormde de zuidwesthoek van de middeleeuwse stadsmuur. Anders dan de meeste vestingwerken bleef hij na 1876 gespaard — vandaag staat hij nog steeds, als blikvanger van het Kronenburgerpark dat op de oude wal werd aangelegd.",
          },
          {
            title: "Hezelpoort",
            year: 1879,
            wallPoint: 21,
            era: "stadsmuur",
            tag: "muur",
            text: "De Hezelpoort was de westelijke stadspoort, aan de weg naar Hees. Op de tekeningen uit 1876 zijn de slopers er al druk in de weer; de poort en de aangrenzende bolwerken verdwenen volledig.",
          },
          {
            title: "Molenpoort",
            year: 1879,
            wallPoint: 11,
            era: "stadsmuur",
            tag: "muur",
            text: "De Molenpoort gaf vanaf de Molenstraat toegang tot de stad. Tijdens de afbraak in 1876–1877 verdween eerst de toegangsbrug en daarna de poort zelf. De naam leeft voort in het winkelcentrum Molenpoort.",
          },
          {
            title: "Belvédère",
            year: 1879,
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
            growth: 1525,
            text: "Vlak voor de slechting is de stad nog volledig omsloten door de oude vestingrand.",
          },
          {
            title: "De wal valt (1874)",
            year: 1900,
            growth: 1900,
            text: "Na 1874 wordt de wal geslecht; rond de oude kern verrijzen de eerste 19e-eeuwse uitbreidingen.",
          },
          {
            title: "Eerste nieuwe wijken",
            year: 1925,
            growth: 1925,
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
        // Human story of 1944, alongside the destruction-overlay "Verwoesting"
        // thread. Pin + arrows scenes (no ww2 overlay), on the 1938 pre-war map.
        // Placed first so the chapter reads chronologically (1940 → 20 sep).
        // Beeld in data/images/ww2/ (zie fetch_ww2_images.py).
        title: "Bezetting & bevrijding",
        sub: "Onderdrukking, deportatie & de Waaloversteek, 1940 → 1944",
        scenes: [
          {
            title: "Bezetting & deportatie",
            year: 1938,
            basemap: true,
            focus: FOCUS.oldtown,
            pin: {
              label: "Joods monument",
              at: [51.8458, 5.8628],
              zoom: 16,
              image: "data/images/ww2/deportatie.jpg",
              credit: "Joods monument (Paul de Swaaf) op de Kitty de Wijzeplaats, ter nagedachtenis aan de weggevoerde Nijmeegse joden — foto Vysotsky, CC BY-SA 4.0 (Wikimedia Commons)",
            },
            badge: "1940–1944",
            era: "Bezetting & deportatie",
            tag: "oorlog",
            text: "Op 10 mei 1940 bezetten Duitse troepen Nijmegen. Voor de joodse gemeenschap — voor de oorlog zo'n 530 inwoners — werd de bezetting dodelijk: na de razzia's van oktober en november 1942 werden vrijwel alle Nijmeegse joden via Westerbork weggevoerd naar de vernietigingskampen Auschwitz en Sobibor. Slechts een handvol keerde terug.",
          },
          {
            title: "De Waaloversteek",
            year: 1938,
            basemap: true,
            focus: FOCUS.waaloversteek,
            pin: {
              label: "Noordoever",
              at: [51.8608, 5.852],
              zoom: 15,
              image: "data/images/ww2/waaloversteek.jpg",
              credit: "Geallieerde para's gaan bij Nijmegen aan land uit een overzetboot, september 1944 — Imperial War Museums, publiek domein (Wikimedia Commons)",
            },
            arrows: [
              { from: [51.8548, 5.8495], to: [51.8608, 5.852], label: "82nd Airborne", curve: 0.14 },
              { from: [51.8608, 5.852], to: [51.8592, 5.862], label: "naar de brug", curve: -0.2 },
            ],
            badge: "1944",
            era: "20 september 1944",
            tag: "oorlog",
            text: "Om de Waalbrug te veroveren waagde de Amerikaanse 82nd Airborne op 20 september 1944 een overval bij klaarlichte dag. Ten westen van de spoorbrug, bij de elektriciteitscentrale, stak het 504e regiment in 26 wankele canvasbootjes de brede Waal over. Onder zwaar Duits vuur haalde maar de helft de overkant; de overlevenden stormden langs de noordoever oostwaarts en namen het noordelijke bruggenhoofd in — een van de gedurfdste acties van Market Garden.",
          },
        ],
      },
      {
        title: "Verwoesting",
        sub: "22 feb → 17 sep → granatentijd",
        scenes: [
          {
            title: "Het bombardement",
            year: 1938,
            focus: FOCUS.center,
            ww2: 1,
            badge: "1944",
            era: "22 februari 1944",
            tag: "oorlog",
            text: "Op 22 februari 1944 treft een Amerikaans vergissingsbombardement het centrum — in rood de verwoeste percelen op de vooroorlogse stad.",
          },
          {
            title: "De slag om de brug",
            year: 1938,
            ww2: 2,
            badge: "1944",
            era: "17–21 september 1944",
            tag: "oorlog",
            text: "Tijdens Market Garden (17–21 september) woedt de strijd om de Waalbrug; de schade breidt zich verder uit.",
          },
          {
            title: "Granatentijd",
            year: 1938,
            ww2: 3,
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
            growth: 1955,
            text: "Het zuidwesten is rond 1960 nog grotendeels open land tussen de dorpen.",
          },
          {
            title: "Dukenburg verrijst",
            year: 1977,
            growth: 1975,
            text: "Vanaf de jaren '60–'70 verrijst Dukenburg als grote naoorlogse uitbreiding.",
          },
          {
            title: "Lindenholt erbij",
            year: 1986,
            growth: 1985,
            text: "In de jaren '80 komt Lindenholt erbij; het zuidwesten is dan volgebouwd.",
          },
        ],
      },
      {
        // A "what is Nijmegen now" beat beyond housing: the university as the
        // engine of the modern knowledge city. Single pin on the 2025 aerial
        // (basemap forced on). Beeld in data/images/modern/ (fetch_modern_images.py).
        title: "De kennisstad",
        sub: "Radboud Universiteit, 1923 → nu",
        scenes: [
          {
            title: "De kennisstad: Radboud Universiteit",
            year: 2025,
            basemap: true,
            focus: FOCUS.heyendaal,
            pin: {
              label: "Heyendaal",
              at: [51.8192, 5.8661],
              zoom: 16,
              image: "data/images/modern/radboud.jpg",
              credit: "Het Erasmusgebouw op de campus Heyendaal van de Radboud Universiteit — foto Roger Veringmeier, CC BY 3.0 (Wikimedia Commons)",
            },
            badge: "1923",
            era: "Radboud Universiteit",
            tag: "kennisstad",
            text: "Naast de wederopbouw groeide Nijmegen uit tot kennisstad. In 1923 opende hier de Roomsch-Katholieke Universiteit, de eerste katholieke universiteit van Nederland; in 2004 werd zij omgedoopt tot Radboud Universiteit. Op de zuidelijke campus Heyendaal — met het Erasmusgebouw als baken en het Radboudumc ernaast — studeren en werken vandaag tienduizenden mensen: de motor van het moderne Nijmegen.",
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
            growth: 2003,
            text: "Vanaf 2000 springt Nijmegen de Waal over: bij Lent verrijst een geheel nieuw stadsdeel.",
          },
          {
            title: "Ruimte voor de rivier",
            year: 2015,
            growth: 2015,
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
