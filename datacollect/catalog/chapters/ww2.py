"""Chapter: Nijmegen in de oorlog, 1940–1945 — 8 segments across 3 threads
(Bezetting & deportatie · Market Garden · Frontstad & bevrijding). The only
chapter with primary Events; its actors/events/quote are emitted into ww2.ttl."""
from ...graph import (Actor, Arrow, Audio, Chapter, Event, Gallery, Map,
                      MemorialWall, Narr, Quote, QuoteB, Segment, Story, Thread)

Chapter(
    "ww2.ttl",
    "Nijmegen in de oorlog, 1940–1945 — bezetting, Market Garden en frontstad.",
    Story("ww2", "Nijmegen in de oorlog, 1940–1945",
          intro="Van de Duitse inval tot de bevrijding: bezetting en deportatie, het vergissingsbombardement dat het hart van de stad wegvaagde, de Waaloversteek van Market Garden, en de lange granatentijd als frontstad.",
          era="1940 – 1945", year=1938, order=4),
    actors=(
        Actor("unit_504_pir", "504th Parachute Infantry Regiment, 82nd Airborne",
              cls="MilitaryUnit", lang="en", same_as="Q7727349"),
        Actor("person_dozy", "Petronella Dozy"),
    ),
    events=(
        Event("bezetting", "Bezetting van Nijmegen", date="1940-05-10", at=("annastraat",)),
        Event("deportatie", "Deportatie van de joodse gemeenschap", date="1942-11-17",
              at=("nieuwe_synagoge",)),
        Event("bombardement", "Het vergissingsbombardement", date="1944-02-22",
              at=("binnenstad",)),
        Event("market_garden", "Operatie Market Garden", date="1944-09-17",
              same_as="Q156721", at=("landingszone",)),
        Event("de_waaloversteek", "De Waaloversteek", date="1944-09-20",
              part_of="market_garden",
              at=("elektriciteitscentrale", "noordoever", "waalbrug"),
              participants=("unit_504_pir",)),
        Event("brug_genomen", "De brug genomen", date="1944-09-20",
              part_of="market_garden", at=("waalbrug",)),
        Event("frontstad", "Frontstad", date="1944-10-15", at=("annastraat",)),
        Event("bevrijding", "Bevrijding & nasleep", date="1945-04-01", at=("grote_markt",)),
    ),
    quotes=(
        Quote("quote_dozy_parachutes",
              "… de lucht hing vol met rood-wit-blauw-oranje parachutes …",
              derived_from="diary_dozy", about="market_garden",
              locator="17 september 1944"),
    ),
    threads=(
        Thread("ww2_bezetting", "Bezetting & deportatie", 1, (
            Segment("bezetting", 1, "Bezetting", event="bezetting",
                    map=Map(base=1938, focus=("annastraat", "waalbrug")), blocks=(
                        Narr("Op 10 mei 1940 trokken Duitse troepen Nijmegen binnen; de stad lag pal aan de Duitse grens en werd meteen bezet. In de eerste oorlogsjaren veranderde het dagelijks leven sluipend — distributie, verduistering, en vanaf 1941 de eerste maatregelen tegen joodse inwoners en de wegvoering van mannen voor de Arbeitseinsatz.",
                             about="bezetting", cites="bezetting"),
                        Gallery("bezetting"))),
            Segment("deportatie", 2, "Deportatie", event="deportatie",
                    map=Map(base=1938, focus=("nieuwe_synagoge",), memorial=True), blocks=(
                        Narr("Nijmegen telde voor de oorlog een joodse gemeenschap van zo'n 530 mensen. De Nieuwe Synagoge werd met hakenkruisen besmeurd; in oktober en november 1942 volgden de razzia's. Vrijwel alle Nijmeegse joden werden via Westerbork weggevoerd naar Auschwitz en Sobibor — slechts een handvol keerde terug.",
                             about="deportatie", cites="deportatie"),
                        Gallery("deportatie"),
                        MemorialWall())),
            Segment("bombardement", 3, "Bombardement", event="bombardement",
                    map=Map(base=1938, overlay="ww2", level=1,
                            focus=("binnenstad", "grote_markt")), blocks=(
                        Narr("Op 22 februari 1944 wierpen Amerikaanse bommenwerpers bij vergissing hun lading op het hart van Nijmegen. In enkele minuten werd de middeleeuwse binnenstad rond de Grote Markt weggevaagd; bijna achthonderd mensen kwamen om. Het was het zwaarst getroffen stadshart van bezet Nederland.",
                             about="bombardement", cites="bombardement"),
                        Gallery("bombardement"))),
        )),
        Thread("ww2_marketgarden", "Market Garden", 2, (
            Segment("marketgarden", 4, "Market Garden", event="market_garden",
                    map=Map(base=1938, overlay="ww2", level=2,
                            focus=("landingszone", "waalbrug"),
                            arrows=(Arrow("landingszone", "waalbrug", "82nd Airborne", 0.18),)),
                    blocks=(
                        Narr("Op 17 september 1944 begon Operatie Market Garden. Boven Groesbeek en de heuvels ten zuiden van Nijmegen daalden duizenden parachutisten neer; de Amerikaanse 82nd Airborne kreeg de opdracht de Waalbrug te veroveren. Voor de Nijmegenaren leek de bevrijding ineens nabij.",
                             about="market_garden", cites="marketgarden"),
                        QuoteB("quote_dozy_parachutes"),
                        Gallery("marketgarden"))),
            Segment("waaloversteek", 5, "Waaloversteek", event="de_waaloversteek",
                    map=Map(base=1938, overlay="ww2", level=2,
                            focus=("waalbrug", "elektriciteitscentrale", "noordoever"),
                            arrows=(Arrow("elektriciteitscentrale", "noordoever", "82nd Airborne", 0.14),)),
                    blocks=(
                        Narr("Om de Waalbrug intact te nemen waagde de 82nd Airborne op 20 september 1944 een overval bij klaarlichte dag. Ten westen van de spoorbrug, bij de elektriciteitscentrale, stak het 504e regiment in 26 wankele canvasbootjes de brede Waal over. Onder zwaar Duits vuur haalde maar de helft de overkant; de overlevenden namen het noordelijke bruggenhoofd in.",
                             about="de_waaloversteek", cites="radio_oranje"),
                        Audio("radio_oranje"),
                        Gallery("waaloversteek"))),
            Segment("brug", 6, "De brug genomen", event="brug_genomen",
                    map=Map(base=1938, overlay="ww2", level=3, focus=("waalbrug",)), blocks=(
                        Narr("Diezelfde avond viel de Waalbrug onbeschadigd in geallieerde handen. Maar de opmars naar Arnhem strandde, en Nijmegen bleef maandenlang frontstad. De brug werd een levensader én een doelwit; Duitse beschietingen begonnen aan wat de Nijmegenaren de granatentijd zouden noemen.",
                             about="brug_genomen", cites="bruggenomen"),
                        Gallery("bruggenomen"))),
        )),
        Thread("ww2_frontstad", "Frontstad & bevrijding", 3, (
            Segment("frontstad", 7, "Frontstad", event="frontstad",
                    map=Map(base=1938, overlay="ww2", level=3,
                            focus=("annastraat", "grote_markt")), blocks=(
                        Narr("Van najaar 1944 tot begin 1945 lag Nijmegen in de vuurlinie. Duitse granaten en V-1's troffen de stad; honderden burgers kwamen alsnog om. Tussen het puin, met geallieerde troepen in de straten, probeerden de Nijmegenaren een normaal bestaan vol te houden.",
                             about="frontstad", cites="frontstad"),
                        Gallery("frontstad"))),
            Segment("bevrijding", 8, "Bevrijding", event="bevrijding",
                    map=Map(base=1938, overlay="ww2", level=3, focus=("grote_markt",)), blocks=(
                        Narr("Pas in het voorjaar van 1945, toen het front oostwaarts trok, kwam Nijmegen echt tot rust. De stad vierde haar bevrijding — maar keek uit op een verwoest centrum. De wederopbouw zou decennia duren.",
                             about="bevrijding", cites="bevrijding"),
                        Gallery("bevrijding"))),
        )),
    ),
)
