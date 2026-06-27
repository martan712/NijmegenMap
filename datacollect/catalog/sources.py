"""
Canonical sources — one flat pool of media keyed by global slug. An image is an
image regardless of which chapter uses it; a block or pin just names the slug.

Each `commons=` source is fetched by the `media` stage to data/images/<slug>.jpg
(audio -> data/audio/<slug>.<ext>); `path=` sources point at a file produced by
another stage (the curated Korfmacher drawings). Licence + rights live here so
the graph is valid before any fetch; the fetched credit line (credits.json) is
preferred as the label when present.
"""
from ..graph import L, Source

# ───────────────────────── Prehistorie ─────────────────────────
Source("grafheuvel",
       "Een grote grafheuvel uit de bronstijd (Hoogeloon, RCE); zulke heuvels en urnenvelden liggen ook in Nijmegen-Oost",
       commons="File:Overzicht op een van de grootste grafheuvels uit de Bronstijd van Nederland, doorsnede ruim 40 m - Hoogeloon - 20528497 - RCE.jpg",
       license=L.BY_SA_4)
Source("bataven",
       "Reconstructie van een ijzertijdboerderij te Wekerom (Gelderland), zoals de vroege Bataven die bewoonden",
       commons="File:Wekerom ijzertijdboerderij-Syborgh2012.jpg", license=L.BY_SA_3)

# ───────────────────────── Romeins ─────────────────────────
Source("hunerberg",
       "Maquette van de Romeinse legioensvesting (castra) op de Hunerberg — Museum Het Valkhof",
       commons="File:Batavorum.JPG", license=L.BY_SA_4)
Source("kops",
       "Romeinse ruiterhelm met gezichtsmasker, gevonden op het Kops Plateau, Museum Het Valkhof",
       commons="File:Cavalry Face-Mask Helmet, found at Noviomagus (Kops Plateau), Museum het Valkhof, Nijmegen (Netherlands) (9569892914).jpg",
       license=L.BY_SA_2)
Source("oppidum", "Het Valkhof, waar Oppidum Batavorum lag — prent, Rijksmuseum",
       commons="File:Valkhof in Nijmegen, RP-P-1907-5769.jpg", license=L.CC0)
Source("civilis",
       "De samenzwering van Claudius Civilis met de Bataven — Rembrandt, 1661–62",
       commons="File:The Conspiracy of Claudius Civilis by Rembrandt van Rijn.jpg",
       license=L.PD)
Source("ulpia", "Reconstructie van Ulpia Noviomagus — muurschildering Peter Nuyten",
       commons="File:Painting Roman 'Ulpia Noviomagus' by Peter Nuyten, Kelfkensbos Nijmegen.jpg",
       license=L.BY_4)
Source("castellum", "Het Valkhof met de 'Romeinse kapel', tekening uit 1728",
       commons="File:Tekening van zogenaamde Romeinse kapel, 1728 - Nijmegen - 20407404 - RCE.jpg",
       license=L.BY_SA_4)
Source("franken", "Grafurn, opgegraven bij de kapel op het Valkhof",
       commons="File:Grafurn, opgegraven bij de Karolingische kapel - Nijmegen - 20167093 - RCE.jpg",
       license=L.BY_SA_4)
Source("palts", "De Sint-Nicolaaskapel (Karolingische kapel) op het Valkhof",
       commons="File:Sint-Nicolaaskapel (gerestaureerd), zuidzijde - Nijmegen - 20167064 - RCE.jpg",
       license=L.BY_SA_4)
Source("barbarossa", "Het Valkhof met de Barbarossa-ruïne, prent uit 1670",
       commons="File:Gezicht op het Valkhof en de Sint Maartenskapel of Barbarossa-ruïne te Nijmegen, 1670, RP-P-2019-1628.jpg",
       license=L.CC0)

# ───────────────────────── Middeleeuwen ─────────────────────────
Source("vikingen",
       "Het Osebergschip (9e eeuw), een bewaard gebleven Vikingschip — Vikingschipmuseum, Oslo",
       commons="File:Osebergskipet 2016.jpg", license=L.BY_SA_4)
Source("keizerstad",
       "Keizer Otto III ontvangt de hulde van de rijksdelen — miniatuur uit het Evangeliarium van Otto III, ca. 1000",
       commons="File:Gospels of Otto III. Miniature.jpg", license=L.BY_SA_4)
Source("palts1047",
       "Keizer Hendrik III, tegen wie hertog Godfried in opstand kwam — middeleeuwse miniatuur",
       commons="File:Heinrich III. (HRR) Miniatur.jpg", license=L.PD)
Source("stadsrechten",
       "Het wapen van Nijmegen met de dubbele Rijksadelaar — herinnering aan de status van vrije rijksstad",
       commons="File:NijmegenCoatOfArms.jpg", license=L.PD)
Source("gelre",
       "Penning met het wapenschild van de graaf van Gelre — het huis waaraan Nijmegen in 1247 werd verpand",
       commons="File:Penning met wapenschild Otto I van Gelre (1190).jpg", license=L.PD)
Source("sintsteven", "De toren van de Sint-Stevenskerk, de middeleeuwse hoofdkerk van Nijmegen",
       commons="File:Sint Stevenstoren Nijmegen.JPG", license=L.BY_SA_3)
Source("hanze", "De Kamper Kogge, varende replica van een middeleeuwse Hanzekogge",
       commons="File:0 Kamper Kogge - 1er juin 2013 à Dunkerque (1).JPG", license=L.BY_4)
Source("pest1349",
       "Jodenvervolging tijdens de pest van 1349 — miniatuur uit een 14e-eeuwse kroniek (Koninklijke Bibliotheek van België)",
       commons="File:1349 burning of Jews-European chronicle on Black Death.jpg", license=L.PD)

# ───────────────────────── Cultuur (Stad van naam) ─────────────────────────
Source("limburg",
       "De maand juni uit de Très Riches Heures du Duc de Berry — gebroeders van Limburg, ca. 1412–1416",
       commons="File:Les Très Riches Heures du duc de Berry juin.jpg", license=L.PD)
Source("mariken", "Titelpagina van Mariken van Nieumeghen — Jan van Doesborch, ca. 1518",
       commons="File:Mariken van Nieuweghen.gif", ext="gif", license=L.PD)
Source("canisius", "Petrus Canisius — anoniem portret, 1699",
       commons="File:Saint Petrus Canisius.jpg", license=L.PD)

# ───────────────────────── Vroegmodern (Vestingstad) ─────────────────────────
Source("venlo",
       "Keizer Karel V, die Gelre in 1543 in de Habsburgse Nederlanden dwong — anoniem portret, ca. 1550 (Rijksmuseum)",
       commons="File:Portrait of Charles V, Holy Roman Emperor, by anonymous, c. 1550 - Rijksmuseum, Amsterdam.jpg",
       license=L.PD)
Source("maurits",
       "Prins Maurits van Oranje, die Nijmegen in 1591 op de Spaanse koning veroverde — Michiel van Mierevelt",
       commons="File:Michiel Jansz van Mierevelt - Maurits prins van Oranje.jpg", license=L.PD)
Source("vrede", "De Vrede van Nijmegen, 1678 — prent (Rijksmuseum)",
       commons="File:De vrede van Nijmegen, 1678, RP-P-OB-82.499.jpg", license=L.CC0)
Source("franse",
       "Het beleg van Nijmegen door de Franse legers in 1794, met de schipbrug naar Lent — prent",
       commons="File:Siege Nijmegen 1794.jpg", license=L.PD)

# Stadsmuur & poorten — curated Lauwerier/Korfmacher drawings (1876–1878), from
# the korfmacher stage (data/images/korfmacher/<n>.jpg). Artworks public domain.
Source("kronenburg",
       "Rudolphus Lauwerier (1797–1883), De stadsmuur en de Kronenburgertoren, met op de achtergrond de aanleg van de spoordijk, 1878 — Collectie Museum Het Valkhof",
       path="data/images/korfmacher/17.jpg", license=L.PD)
Source("hezel",
       "Rudolphus Lauwerier (1797–1883), Slopers aan het werk op de Hezelpoort en de bolwerken, 1876 — Collectie Museum Het Valkhof",
       path="data/images/korfmacher/21.jpg", license=L.PD)
Source("molen",
       "Rudolphus Lauwerier (1797–1883), De Molenpoort tijdens de afbraak van de wal; de toegangsbrug is reeds verdwenen, 1876 — Collectie Museum Het Valkhof",
       path="data/images/korfmacher/11.jpg", license=L.PD)
Source("belvedere",
       "Rudolphus Lauwerier (1797–1883), Gezicht vanaf de wal onderaan de Voerweg op de Belvédère, links de Hunnerpoort, 1878 — Collectie Museum Het Valkhof",
       path="data/images/korfmacher/27.jpg", license=L.PD)

# ───────────────────────── Modern (Wederopbouw) ─────────────────────────
Source("radboud", "Het Erasmusgebouw op de campus Heyendaal van de Radboud Universiteit",
       commons="File:Erasmusgebouw Erasmusplein 1 Radboud Universiteit Nijmegen.jpg",
       license=L.BY_3)

# ───────────────────────── WW2 ─────────────────────────
Source("bezetting", "Een Duitse Panzer IV rijdt door de Sint Annastraat, mei 1940",
       commons="File:Een Duitse Panzerkampfwagen IV tank rijdt door de Sint Annastraat 2000-1517-005.jpg",
       creator="Foto Van der Horst", license=L.BY_SA_4, rights="a", about="bezetting")
Source("deportatie", "De met hakenkruisen besmeurde Nieuwe Synagoge in Nijmegen, 1942",
       commons="File:De met hakenkruisen besmeurde Nieuwe Synagoge, F67436.jpg",
       creator="J.F.M. Trum, Fotopersbureau Gelderland", license=L.BY_SA_4,
       rights="a", about="deportatie")
Source("bombardement", "De verwoeste binnenstad na het bombardement van 22 februari 1944",
       commons="File:Bombardement Nijmegen - Fotodienst der NSB - NIOD - 211720.jpeg",
       creator="Fotodienst der NSB (NIOD)", license=L.PD, rights="a", about="bombardement")
Source("marketgarden", "Geallieerde parachutisten dalen neer boven Nederland, 17 september 1944",
       commons="File:A fleet of Allied aircraft flies overhead as paratroopers of the Allied Airborne Command float groundward in the invasion of the Netherlands, still another step towards the liberation of Europe HD-SN-99-02724.jpg",
       creator="US Army", license=L.PD, rights="a", about="market_garden")
Source("waaloversteek", "Geallieerde para's gaan bij Nijmegen aan land uit een overzetboot, september 1944",
       commons="File:Four British paratroops clamber ashore from a small rowing boat at Nijmegen.jpg",
       creator="Imperial War Museums", license=L.PD, rights="a", about="de_waaloversteek")
Source("bruggenomen", "Britse troepen passeren de veroverde Waalbrug bij Nijmegen, september 1944",
       commons="File:Britse troepen passeren de brug bij Nijmegen, NG-2004-40-36.jpg",
       creator="Rijksmuseum", license=L.CC0, rights="a", about="brug_genomen")
Source("frontstad", "Een geallieerde verkeersregelaar op een gehavende kruising in Nijmegen, 1945",
       commons="File:Een geallieerde verkeersregelaar op de hoek van de St. Annastraat en de Van Triestraat in Nijmegen. - FO 1300158 - RAA WO2.jpg",
       creator="P.J. Bosman (Regionaal Archief Nijmegen)", license=L.CC0, rights="a", about="frontstad")
Source("bevrijding", "Bevrijdingsfeesten met een wagenspel, 1945",
       commons="File:Bevrijdingsfeesten met een wagenspel F65284.jpeg",
       creator="J.F.M. Trum, Fotopersbureau Gelderland", license=L.BY_SA_4,
       rights="a", about="bevrijding")

# Radio Oranje broadcast (19 Sep 1944); the WAV original is huge, so the .ogg
# transcode is fetched instead.
Source("radio_oranje",
       "Radio Oranje, 19 sep 1944 — reportage bevrijding Eindhoven/Arnhem/Nijmegen",
       kind="AudioRecording",
       commons="File:Radio Oranje 19-sep.-1944 REPORTAGE OVER BEVRIJDING EINDHOVEN, ARNHEM EN NIJMEGEN.wav",
       ext="ogg", transcode="ogg", license=L.PD, rights="a", about="market_garden")

# Petronella Dozy's diary — a verbatim source with no media of its own, quoted in
# the Market Garden segment (see chapters/ww2.py). Rights class "b": short
# attributed excerpt. Authored by id:person_dozy (defined in ww2.ttl).
Source("diary_dozy", "Dagboek Petronella Dozy", kind="Diary",
       authored_by="person_dozy", rights="b")
