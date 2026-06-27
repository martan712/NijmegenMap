"""Chapter: Vestingstad — 18 segments across 5 threads (Gewest, geloof & vrede ·
De vesting groeit · De stad binnen de wallen · Stadsmuur & poorten · Slechting &
uitbreiding).

The seven "De vesting groeit" rings show the gemeente's own CHW_VESTINGWERKEN
TOELICHTING. That text is NOT copied here: each ring's block is a Toelichting(periode)
whose text the graph stage resolves from vestingwerken.geojson (fetched by the
`vectors` stage) — so the only thing authored here is which period belongs where.
"""
from ...graph import Chapter, Img, Map, Narr, Pin, Segment, Story, Thread, Toelichting

Chapter(
    "vesting.ttl",
    "Vestingstad — de ingesnoerde vesting tot de slechting van de wallen.",
    Story("vesting", "Vestingstad",
          intro="Van de Gouden Eeuw tot 1900 is Nijmegen een ingesnoerde vestingstad. Bastions volgens de nieuwste school, tot de wal in 1874 valt.",
          era="tot 1900", year=1850, tag="vesting", order=3),
    threads=(
        Thread("vst_gewest", "Gewest, geloof & vrede", 1, (
            Segment("vst_1", 1, "Gelre wordt Habsburgs",
                    map=Map(base=1557, focus=("grote_markt",)), blocks=(
                        Narr("In 1543 dwong keizer Karel V met het Verdrag van Venlo het hertogdom Gelre in de Habsburgse Nederlanden. Nijmegen verloor haar eeuwenoude zelfstandige positie; voortaan was Arnhem de favoriete gewestelijke hoofdstad."),
                        Img("venlo"))),
            Segment("vst_2", 2, "Maurits verovert de stad",
                    map=Map(base=1639, focus=("valkhof",)), blocks=(
                        Narr("In 1591 veroverde prins Maurits van Oranje Nijmegen op de Spaanse koning. Onder de Republiek werd de stad gereformeerd: de katholieke meerderheid werd minderheid en katholieke instellingen verdwenen of doken onder."),
                        Img("maurits"))),
            Segment("vst_3", 3, "De Vrede van Nijmegen",
                    map=Map(base=1672, focus=("stadhuis",)), blocks=(
                        Narr("Van 1678 tot 1679 werd in Nijmegen de vrede getekend die de Hollandse Oorlog beëindigde. Diplomaten uit heel Europa onderhandelden in de stad; heel even was Nijmegen het diplomatieke centrum van het continent."),
                        Img("vrede"))),
            Segment("vst_4", 4, "De Fransen nemen de vesting",
                    map=Map(base=1783, focus=("schipbrug_lent",)), blocks=(
                        Narr("Eind 1794 viel de vesting Nijmegen na hevige beschietingen in handen van de Franse Revolutionaire legers. Bij de overhaaste vlucht over de schipbrug naar Lent verdronken velen. Het begin van de Franse tijd — en van Nijmegen als zwaarbewapende grensvesting in de 19e eeuw."),
                        Img("franse"))),
        )),
        # Seven dated rings; their text comes verbatim from the gemeente layer.
        Thread("vst_groeit", "De vesting groeit", 2, (
            Segment("vfg_1", 5, "1230–1300",
                    map=Map(base=1557, fort=1300,
                            focus=("grote_markt", "kronenburgertoren", "belvedere")),
                    blocks=(Toelichting("1230-1300"),)),
            Segment("vfg_2", 6, "1400–1425",
                    map=Map(base=1557, fort=1425), blocks=(Toelichting("1400-1425"),)),
            Segment("vfg_3", 7, "1436–1511",
                    map=Map(base=1557, fort=1511), blocks=(Toelichting("1436-1511"),)),
            Segment("vfg_4", 8, "1525–1536",
                    map=Map(base=1557, fort=1536), blocks=(Toelichting("1525-1536"),)),
            Segment("vfg_5", 9, "1598–1605 Italiaanse vestingbouw",
                    map=Map(base=1672, fort=1605),
                    blocks=(Toelichting("1598-1605 Italiaanse vestingbouw"),)),
            Segment("vfg_6", 10, "1700–1702 Versterking Coehoorn",
                    map=Map(base=1783, fort=1702),
                    blocks=(Toelichting("1700-1702 Versterking Coehoorn"),)),
            Segment("vfg_7", 11, "1726–1732",
                    map=Map(base=1783, fort=1732), blocks=(Toelichting("1726-1732"),)),
        )),
        Thread("vst_binnen", "De stad binnen de wallen", 3, (
            Segment("vst_5", 12, "De stad in 1639", map=Map(base=1639), blocks=(
                Narr("Op de oudste stadsplattegrond ligt Nijmegen strak binnen haar wallen aan de Waal."),)),
            Segment("vst_6", 13, "Het Rampjaar (1672)", map=Map(base=1672), blocks=(
                Narr("Tijdens het Rampjaar is de vesting volop in bedrijf; de bastions steken scherp naar buiten."),)),
            Segment("vst_7", 14, "Vol tegen de wal (1850)", map=Map(base=1850), blocks=(
                Narr("Halverwege de 19e eeuw barst de dichtbevolkte stad uit haar voegen — de wal wordt een keurslijf."),)),
        )),
        Thread("vst_muur", "Stadsmuur & poorten", 4, (
            Segment("vst_8", 16, "Stadsmuur & poorten",
                    map=Map(base=1879, wall=True, pins=(
                        Pin("kronenburgertoren", "kronenburg",
                            "De Kronenburgertoren, een zware ronde toren uit de 15e eeuw, vormde de zuidwesthoek van de middeleeuwse stadsmuur. Anders dan de meeste vestingwerken bleef hij na 1876 gespaard — vandaag staat hij nog steeds, als blikvanger van het Kronenburgerpark dat op de oude wal werd aangelegd."),
                        Pin("hezelpoort", "hezel",
                            "De Hezelpoort was de westelijke stadspoort, aan de weg naar Hees. Op de tekeningen uit 1876 zijn de slopers er al druk in de weer; de poort en de aangrenzende bolwerken verdwenen volledig."),
                        Pin("molenpoort", "molen",
                            "De Molenpoort gaf vanaf de Molenstraat toegang tot de stad. Tijdens de afbraak in 1876–1877 verdween eerst de toegangsbrug en daarna de poort zelf. De naam leeft voort in het winkelcentrum Molenpoort."),
                        Pin("belvedere", "belvedere",
                            "Hoog op de Hunerberg, met uitzicht over de Waal, staat de Belvédère — oorspronkelijk een middeleeuwse muurtoren, in de 17e eeuw verbouwd tot uitkijktoren. Ook de Belvédère overleefde de slechting en is er vandaag nog, nu als restaurant."))),
                    blocks=(
                        Narr("Op 11 maart 1874 verloor Nijmegen zijn vestingstatus; vanaf 1876 werden de wallen, torens en poorten gesloopt om de overvolle benedenstad lucht en betere hygiëne te geven. Stadstekenaar Rudolphus Lauwerier en fotograaf Gerard Korfmacher legden de verdwijnende vestingwerken vast. Klik op de punten op de kaart voor hun tekeningen (collectie Museum Het Valkhof / Regionaal Archief Nijmegen). De oranje punten markeren de bekendste vestingwerken; enkele — zoals de Kronenburgertoren en de Belvédère — staan vandaag nog in het stadsbeeld. De lichtere punten tonen alle overige plekken die de tekenaars vastlegden."),)),
        )),
        Thread("vst_slechting", "Slechting & uitbreiding", 5, (
            Segment("vst_13", 15, "De ingesnoerde stad",
                    map=Map(base=1871, level=1525), blocks=(
                        Narr("Vlak voor de slechting is de stad nog volledig omsloten door de oude vestingrand."),)),
            Segment("vst_14", 17, "De wal valt (1874)",
                    map=Map(base=1900, level=1900), blocks=(
                        Narr("Na 1874 wordt de wal geslecht; rond de oude kern verrijzen de eerste 19e-eeuwse uitbreidingen."),)),
            Segment("vst_15", 18, "Eerste nieuwe wijken",
                    map=Map(base=1925, level=1925), blocks=(
                        Narr("In het begin van de 20e eeuw groeit Nijmegen voor het eerst echt voorbij haar historische grens."),)),
        )),
    ),
)
