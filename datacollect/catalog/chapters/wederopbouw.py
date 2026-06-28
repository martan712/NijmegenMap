"""Chapter: Wederopbouw — 10 segments across 4 threads
(Wederopbouw · Naoorlogse wijken · De kennisstad · Waalsprong)."""
from ...graph import ArtWall, Chapter, Img, Map, Narr, Segment, Story, Thread

Chapter(
    "wederopbouw.ttl",
    "Wederopbouw — het naoorlogse herstel en de groei van de stad.",
    Story("wederopbouw", "Wederopbouw",
          intro="Na de oorlog herrijst het centrum en spreidt de stad zich uit: naoorlogse wijken in het zuiden en, later, de Waalsprong in het noorden.",
          era="na 1945", year=2025, tag="wederopbouw", order=5),
    threads=(
        Thread("wed_opbouw", "Wederopbouw", 1, (
            Segment("wed_1", 1, "Het verwoeste hart",
                    map=Map(base=1949, focus=("centrum",)), blocks=(
                        Narr("Op de luchtfoto van 1949 zijn de littekens van de oorlog in het centrum nog goed te zien."),)),
            Segment("wed_2", 2, "Een nieuw centrum",
                    map=Map(base=1957, focus=("centrum",), wikidata="publicart",
                            heritage_after=1945, heritage_before=1962,
                            wikidata_dated_only=True), blocks=(
                        Narr("In de jaren '50 verrijst een modern, ruimer opgezet stadshart op de oude fundamenten. Met de wederopbouw kwam ook de kunst: bij veel nieuwe gebouwen hoorde een beeld, een reliëf of een fontein — vaak betaald uit de percentageregeling voor beeldende kunst."),
                        ArtWall(title="Kunst van de wederopbouw",
                                after=1945, before=1962, dated_only=True))),
            Segment("wed_3", 3, "De stad hersteld",
                    map=Map(base=1967, focus=("centrum",), wikidata="publicart",
                            heritage_after=1963, heritage_before=1978,
                            wikidata_dated_only=True), blocks=(
                        Narr("Tegen het eind van de jaren '60 is de wederopbouw grotendeels voltooid. De stad raakt gevuld met naoorlogse beeldhouwkunst — van figuratieve gedenkbeelden tot abstracte, modernistische sculpturen."),
                        ArtWall(title="Beeldende kunst van de jaren zestig en zeventig",
                                after=1963, before=1978, dated_only=True))),
        )),
        Thread("wed_wijken", "Naoorlogse wijken", 2, (
            Segment("wed_4", 4, "Voor de uitbreiding",
                    map=Map(base=1964, level=1955, focus=("dukenburg", "centrum")),
                    blocks=(
                        Narr("Het zuidwesten is rond 1960 nog grotendeels open land tussen de dorpen."),)),
            Segment("wed_5", 5, "Dukenburg verrijst",
                    map=Map(base=1977, level=1975, focus=("dukenburg", "centrum")),
                    blocks=(
                        Narr("Vanaf de jaren '60–'70 verrijst Dukenburg als grote naoorlogse uitbreiding."),)),
            Segment("wed_6", 6, "Lindenholt erbij",
                    map=Map(base=1986, level=1985, focus=("lindenholt", "centrum")),
                    blocks=(
                        Narr("In de jaren '80 komt Lindenholt erbij; het zuidwesten is dan volgebouwd."),)),
        )),
        Thread("wed_kennis", "De kennisstad", 3, (
            Segment("wed_7", 7, "De kennisstad: Radboud Universiteit",
                    map=Map(base=2025, focus=("heyendaal",)), blocks=(
                        Narr("Naast de wederopbouw groeide Nijmegen uit tot kennisstad. In 1923 opende hier de Roomsch-Katholieke Universiteit, de eerste katholieke universiteit van Nederland; in 2004 werd zij omgedoopt tot Radboud Universiteit. Op de zuidelijke campus Heyendaal — met het Erasmusgebouw als baken en het Radboudumc ernaast — studeren en werken vandaag tienduizenden mensen: de motor van het moderne Nijmegen."),
                        Img("radboud"))),
        )),
        Thread("wed_waal", "Waalsprong", 4, (
            Segment("wed_8", 8, "Over de Waal",
                    map=Map(base=2008, level=2003, focus=("waalsprong", "centrum")),
                    blocks=(
                        Narr("Vanaf 2000 springt Nijmegen de Waal over: bij Lent verrijst een geheel nieuw stadsdeel."),)),
            Segment("wed_9", 9, "Ruimte voor de rivier",
                    map=Map(base=2015, level=2015, focus=("waalsprong", "centrum")),
                    blocks=(
                        Narr("Met 'Ruimte voor de Waal' krijgt de rivier een nevengeul; Veur Lent wordt een eiland."),)),
            Segment("wed_10", 10, "Nijmegen nu",
                    map=Map(base=2025, focus=("centrum", "waalsprong")), blocks=(
                        Narr("De actuele luchtfoto toont de hele gemeente — van de middeleeuwse kern tot de Waalsprong."),)),
        )),
    ),
)
