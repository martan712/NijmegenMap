"""Chapter: Bataven & Romeinen — 10 segments across 3 threads
(Prehistorie · Romeins Nijmegen · Het einde van Romeins Nijmegen)."""
from ...graph import Arrow, Chapter, Img, Map, Narr, Segment, Story, Thread

# The whole chapter shows the Wikidata Roman/archaeology subset as map context.
ROMAN_CATS = ("Romeins", "castrum", "castellum", "vicus", "aquaduct",
              "archeolog", "grafveld")


def rmap(**kw):
    """A Map with the Roman heritage layer always on (chapter-wide context)."""
    return Map(heritage=True, heritage_cats=ROMAN_CATS, **kw)

Chapter(
    "roman.ttl",
    "Bataven & Romeinen — de Romeinse tijd aan de Waal.",
    Story("bataven", "Bataven & Romeinen",
          intro="Nederland begint hier. Lang voor de stad woonden er al mensen bij de rivierovergang — en aan de Waal lag eeuwenlang de noordgrens van het Romeinse rijk: legerkampen op de heuvels, de Bataafse hoofdplaats en, onder keizer Trajanus, Ulpia Noviomagus, de oudste stad van Nederland.",
          era="Romeinse tijd", year=1557, tag="romeins", order=1),
    threads=(
        Thread("pre", "Prehistorie", 1, (
            Segment("pre_1", 1, "Grafheuvels en urnenvelden",
                    map=rmap(base=1557, focus=("nijmegen_oost",)),
                    blocks=(
                        Narr("Al lang voor de Romeinen woonden hier mensen. In Nijmegen-Oost liggen sporen uit het neolithicum tot de late bronstijd: grafheuvels en urnenvelden. De rivierovergang en de hoge stuwwal maakten deze plek al vroeg aantrekkelijk om te wonen."),
                        Img("grafheuvel"))),
            Segment("pre_2", 2, "De eerste Bataven",
                    map=rmap(base=1557, focus=("waterstraat",)),
                    blocks=(
                        Narr("Rond 50 v.Chr. vestigden zich de eerste Bataven in het gebied; de Waterstraat in de benedenstad gaat terug op een van de oudste wegen van Nederland. Wanneer kort daarna de Romeinen arriveren, treffen ze hier dus al bewoning aan — het begin van Romeins Nijmegen."),
                        Img("bataven"))),
        )),
        Thread("rom", "Romeins Nijmegen", 2, (
            Segment("rom_1", 3, "De rand van het rijk",
                    map=rmap(base=1557, overlay="limes", focus=("hunerberg",)),
                    blocks=(
                        Narr("Hier liep eeuwenlang de noordgrens van het Romeinse rijk: de limes. De archeologiekaart van de gemeente toont de kern- en bufferzone van werelderfgoed Neder-Germaanse Limes — sinds 2021 op de UNESCO-lijst — dwars door het oosten van Nijmegen."),)),
            Segment("rom_2", 4, "Het eerste legerkamp",
                    map=rmap(base=1557, overlay="limes", focus=("hunerberg",)),
                    blocks=(
                        Narr("Rond 19 v.Chr. legde het Romeinse leger onder veldheer Drusus een groot legerkamp aan op de Hunerberg — tijdelijk tot twee legioenen, zo'n 12.000 man. Het is het begin van de Romeinse aanwezigheid bij Nijmegen."),
                        Img("hunerberg"))),
            Segment("rom_3", 5, "Commandopost op het Kops Plateau",
                    map=rmap(base=1557, overlay="limes", focus=("kops_plateau",)),
                    blocks=(
                        Narr("Rond 12 v.Chr. verrees op het Kops Plateau een kleiner fort met enkele monumentaal gebouwde woningen — vermoedelijk een centrale commandopost van het Romeinse leger aan de grens."),
                        Img("kops"))),
            Segment("rom_4", 6, "Oppidum Batavorum",
                    map=rmap(base=1557, overlay="limes", focus=("valkhof",)),
                    blocks=(
                        Narr("Naast de militaire kampen groeide bij het Valkhof een burgernederzetting: Oppidum Batavorum, de hoofdplaats van het district van de Bataven."),
                        Img("oppidum"))),
            Segment("rom_5", 7, "De Bataafse Opstand",
                    map=rmap(base=1557, overlay="limes", focus=("valkhof",)),
                    blocks=(
                        Narr("In het jaar 70 ging Oppidum Batavorum in vlammen op tijdens de opstand van de Bataven onder Julius Civilis. Daarna legerde het Tiende Legioen (Legio X Gemina) zich bij Nijmegen."),
                        Img("civilis"))),
            Segment("rom_6", 8, "Ulpia Noviomagus, oudste stad",
                    map=rmap(base=1557, focus=("ulpia",)),
                    blocks=(
                        Narr("Na de opstand verrees in het westen — het huidige Waterkwartier — een geheel nieuwe stad: Ulpia Noviomagus Batavorum. Onder keizer Trajanus kreeg ze omstreeks 100 marktrecht; daaraan ontleent Nijmegen zijn titel 'oudste stad van Nederland'."),
                        Img("ulpia"))),
            Segment("rom_7", 9, "Het zwaartepunt verschuift",
                    map=rmap(base=1557,
                            focus=("hunerberg", "kops_plateau", "valkhof", "ulpia"),
                            arrows=(
                                Arrow("hunerberg", "kops_plateau", "19 v.Chr.", 0.18),
                                Arrow("kops_plateau", "valkhof", "12 v.Chr.", 0.18),
                                Arrow("valkhof", "ulpia", "na 70", 0.22),
                                Arrow("ulpia", "valkhof", "± 300", -0.22))),
                    blocks=(
                        Narr("Vier eeuwen lang verschoof het hart van Romeins Nijmegen over het landschap: van de legerkampen op de Hunerberg en het Kops Plateau naar de burgerstad bij het Valkhof, na de opstand westwaarts naar Ulpia Noviomagus, en rond 300 weer terug naar het Valkhof."),)),
        )),
        Thread("end", "Het einde van Romeins Nijmegen", 3, (
            Segment("end_1", 10, "Het laat-Romeinse castellum",
                    map=rmap(base=1557, overlay="limes", focus=("valkhof",)),
                    blocks=(
                        Narr("Rond 270–300 raakte Noviomagus in het westen verlaten en trok de bevolking terug naar het Valkhof. Daar bouwden de Romeinen een versterkt castellum; omstreeks 370 kreeg het onder keizer Valentinianus een stenen muur. De grens verschoof van de Rijn naar de Waal — tot de Romeinen in de 5e eeuw definitief vertrokken."),
                        Img("castellum"))),
        )),
    ),
)
