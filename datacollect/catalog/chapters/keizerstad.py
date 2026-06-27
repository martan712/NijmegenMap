"""Chapter: Keizerstad — 17 segments across 3 threads
(Van palts tot burcht · De stad aan de Waal · Stad van naam)."""
from ...graph import Arrow, Chapter, Img, Map, Narr, Segment, Story, Thread

# Recurring map for the early-medieval palts scenes: the limes overlay dimmed to
# its Valkhof zone as a location cue.
def _palts():
    return Map(base=1557, overlay="limes", dim=True, focus=("valkhof",))

Chapter(
    "middeleeuwen.ttl",
    "Keizerstad — de middeleeuwse stad aan de Waal.",
    Story("keizerstad", "Keizerstad",
          intro="Op de Romeinse resten bouwde Karel de Grote een palts; eeuwenlang hielden keizers er rijksdagen. In de luwte van het Valkhof groeit aan de Waal de middeleeuwse stad — met stadsrechten, de Sint-Steven en, vanaf 1402, de Hanze.",
          era="Middeleeuwen", year=1557, tag="middeleeuwen", order=2),
    threads=(
        Thread("vmk_palts", "Van palts tot burcht", 1, (
            Segment("vmk_1", 1, "Franken op het Valkhof", map=_palts(), blocks=(
                Narr("Anders dan lang gedacht bleef het Valkhof bewoond. Het oude castellum bood onderdak aan de opkomende Frankische elite, en vlakbij lag een uitgestrekt Merovingisch grafveld met duizenden graven."),
                Img("franken"))),
            Segment("vmk_2", 2, "De palts van Karel de Grote", map=_palts(), blocks=(
                Narr("In 777 bouwde Karel de Grote een palts op het Valkhof, deels met hergebruikte Romeinse steen. Nijmegen — toen Numaga — werd een keizerlijke verblijfplaats waar Karel meermaals verbleef, onder meer met Pasen."),
                Img("palts"))),
            Segment("vmk_3", 3, "Vikingen plunderen de palts",
                    map=Map(base=1557, overlay="limes", dim=True, focus=("valkhof",),
                            arrows=(Arrow("grote_markt", "valkhof", "Noormannen", 0.22),)),
                    blocks=(
                        Narr("De Karolingische palts was een begeerd doelwit. Over de Waal voeren de Noormannen stroomopwaarts naar Nijmegen: in 838 vond de eerste overval plaats, in 880 belegerden en bezetten ze het Valkhof en staken het bij hun vertrek in brand. Pas rond 925 hield het plunderen op."),
                        Img("vikingen"))),
            Segment("vmk_4", 4, "Keizerstad: rijksdagen & Theophanu", map=_palts(), blocks=(
                Narr("Onder de Ottoonse en Salische keizers werd het Valkhof een geliefde verblijfplaats: hier werden rijksdagen gehouden (949, 996) en in 991 stierf keizerin Theophanu, moeder van Otto III, in de palts. Aan deze keizerlijke band dankt Nijmegen zijn bijnaam Keizerstad."),
                Img("keizerstad"))),
            Segment("vmk_5", 5, "De palts verwoest", map=_palts(), blocks=(
                Narr("In 1047 ging de palts in vlammen op: hertog Godfried met de Baard verwoestte haar tijdens zijn opstand tegen keizer Hendrik III. De keizerlijke burcht lag daarna in puin — tot Barbarossa haar een eeuw later liet herbouwen."),
                Img("palts1047"))),
            Segment("vmk_6", 6, "Barbarossa's Valkhofburcht", map=_palts(), blocks=(
                Narr("Keizer Frederik Barbarossa liet de palts omstreeks 1155 herbouwen tot een echte burcht. In de luwte van het Valkhof groeit aan de Waal de middeleeuwse stad — het vervolg van dit verhaal."),
                Img("barbarossa"))),
        )),
        Thread("vmk_stad", "De stad aan de Waal", 2, (
            Segment("vmk_7", 7, "Rond het Valkhof",
                    map=Map(base=1557, level=1230, focus=("grote_markt", "valkhof")),
                    blocks=(
                        Narr("In 1184 worden de inwoners — de cives — voor het eerst genoemd; het zwaartepunt verschuift dan van het Valkhof westwaarts, naar de markt aan de Waal. Voor 1230 ligt de bebouwing nog dicht tegen het Valkhof: de kiem van de middeleeuwse stad."),)),
            Segment("vmk_8", 8, "Stadsrechten",
                    map=Map(base=1557, level=1230, focus=("grote_markt",)), blocks=(
                        Narr("Op 31 augustus 1230 verleende rooms-koning Hendrik (VII) Nijmegen stadsrechten naar het voorbeeld van Aken. Als vrije rijksstad kreeg de stad een eigen bestuur en zegel — de status die haar bijnaam Keizerstad bekrachtigde."),
                        Img("stadsrechten"))),
            Segment("vmk_9", 9, "Verpand aan Gelre",
                    map=Map(base=1557, level=1230, focus=("valkhof",)), blocks=(
                        Narr("In 1247 verpandde rooms-koning Willem II het Rijk van Nijmegen — stad én burcht — aan de graaf van Gelre. De pandsom werd nooit afgelost; sindsdien hoort Nijmegen bij Gelre en niet meer rechtstreeks bij het keizerrijk."),
                        Img("gelre"))),
            Segment("vmk_10", 10, "Sint-Steven & de Maria-Omdracht",
                    map=Map(base=1557, level=1230, focus=("sint_stevenskerk",)), blocks=(
                        Narr("De Sint-Stevenskerk, de middeleeuwse hoofdkerk, werd in 1272 gewijd — naar verluidt door Albertus Magnus. Eromheen ontstond de Maria-Omdracht, een processie die het stadsleven eeuwenlang zou kleuren."),
                        Img("sintsteven"))),
            Segment("vmk_11", 11, "Pest & Jodenvervolging",
                    map=Map(base=1557, level=1400, focus=("marienburg",)), blocks=(
                        Narr("De pest van 1349 trof ook Nijmegen — en werd, zoals in veel Rijnsteden, gevolgd door een vervolging van de joodse gemeenschap, destijds de grootste van de Lage Landen. De donkere keerzijde van de bloeiende stad."),
                        Img("pest1349"))),
            Segment("vmk_12", 12, "De stad breidt uit",
                    map=Map(base=1557, level=1400, focus=("grote_markt", "valkhof")),
                    blocks=(
                        Narr("Tussen 1250 en 1400 groeit Nijmegen binnen de stadsmuren tot een welvarende handelsstad."),)),
            Segment("vmk_13", 13, "Hanzestad",
                    map=Map(base=1557, level=1400, focus=("waalkade",),
                            arrows=(Arrow("waalkade", "keulen", "naar Keulen", 0.14),
                                    Arrow("waalkade", "holland", "naar Holland & de zee", -0.14))),
                    blocks=(
                        Narr("In 1402 werd Nijmegen Hanzestad. Vanaf de Waalkade voeren koggen stroomopwaarts naar Keulen en stroomafwaarts naar Holland en de zee; de stad werd het regionale hoofd van het Keulse Hanzekwartier."),
                        Img("hanze"))),
            Segment("vmk_14", 14, "Volgroeide middeleeuwse stad",
                    map=Map(base=1557, level=1525, focus=("grote_markt", "valkhof")),
                    blocks=(
                        Narr("Rond 1525 is de ommuurde stad zo goed als vol; verdere groei moet wachten tot de muren vallen."),)),
        )),
        Thread("vmk_naam", "Stad van naam", 3, (
            Segment("vmk_15", 15, "De gebroeders van Limburg",
                    map=Map(base=1557, focus=("stevenskerkhof",)), blocks=(
                        Narr("Rond 1385 werden in Nijmegen de broers Herman, Paul en Johan van Limburg geboren — de beroemdste miniatuurschilders van hun tijd. Voor de Franse hertog Jean de Berry verluchtten zij de Très Riches Heures, het rijkst versierde getijdenboek van de middeleeuwen. Alle drie stierven ze jong, vermoedelijk in 1416 aan de pest."),
                        Img("limburg"))),
            Segment("vmk_16", 16, "Mariken van Nieumeghen",
                    map=Map(base=1557, focus=("grote_markt",)), blocks=(
                        Narr("Het rederijkersspel Mariken van Nieumeghen, gedrukt rond 1515, speelt zich af in en rond Nijmegen. Het vertelt hoe het meisje Mariken zeven jaar lang met de duivel Moenen door de wereld trekt, tot een mirakelspel haar van haar zonden verlost. Een hoogtepunt van de Middelnederlandse letterkunde — vandaag staat Mariken in brons op de Grote Markt."),
                        Img("mariken"))),
            Segment("vmk_17", 17, "Petrus Canisius",
                    map=Map(base=1557, focus=("broerstraat",)), blocks=(
                        Narr("Op 8 mei 1521 werd in de Broerstraat Petrus Canisius geboren. Als jezuïet werd hij de drijvende kracht achter de katholieke Contrareformatie in Duitstalig Europa; zijn catechismus werd eeuwenlang herdrukt. In 1925 werd hij heilig verklaard en tot kerkleraar uitgeroepen — de bekendste zoon van de stad."),
                        Img("canisius"))),
        )),
    ),
)
