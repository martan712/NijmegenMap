"""Canonical places — every located point the chapters reference (focusPlace,
arrowFrom/To, occurredAt). Fix a coordinate HERE if one is wrong."""
from ..graph import Place

# --- old town / centre ---
Place("valkhof", "Valkhof", 51.84782, 5.87026)
Place("grote_markt", "Grote Markt", 51.84775, 5.86505)
Place("sint_stevenskerk", "Sint-Stevenskerk", 51.84799, 5.8649)
Place("stadhuis", "Stadhuis", 51.84715, 5.86555, cls="Building")
Place("broerstraat", "Broerstraat", 51.8461, 5.8636)
Place("stevenskerkhof", "Stevenskerkhof", 51.8478, 5.8651)
Place("marienburg", "Mariënburg", 51.8447, 5.8639)
Place("waalkade", "Waalkade", 51.85045, 5.8645)
Place("binnenstad", "Verwoeste binnenstad", 51.8478, 5.8635)
Place("joods_monument", "Joods monument", 51.8458, 5.8628)
Place("centrum", "Centrum", 51.848, 5.865)

# --- roman ---
Place("nijmegen_oost", "Nijmegen-Oost", 51.8385, 5.887)
Place("waterstraat", "Waterstraat", 51.85, 5.8632)
Place("hunerberg", "Hunerberg", 51.8419, 5.8836)
Place("kops_plateau", "Kops Plateau", 51.83783, 5.89225)
Place("ulpia", "Ulpia Noviomagus Batavorum", 51.85363, 5.84522)

# --- fortress / gates (Vestingstad) ---
Place("schipbrug_lent", "Schipbrug naar Lent", 51.8507, 5.866)
Place("kronenburgertoren", "Kronenburgertoren", 51.846, 5.862)
Place("hezelpoort", "Hezelpoort", 51.847, 5.858)
Place("molenpoort", "Molenpoort", 51.848, 5.864)
Place("belvedere", "Belvédère", 51.843, 5.878)

# --- ww2 ---
Place("waalbrug", "Waalbrug", 51.857, 5.866, cls="Bridge", same_as="Q1798831")
Place("annastraat", "Sint Annastraat", 51.838, 5.846)
Place("nieuwe_synagoge", "Nieuwe Synagoge", 51.8466, 5.8612, cls="Building")
Place("landingszone", "Landingszone (Groesbeekse heuvels)", 51.812, 5.905)
Place("elektriciteitscentrale", "PGEM-elektriciteitscentrale (zuidoever)",
      51.8548, 5.8495, cls="Building")
Place("noordoever", "Noordoever (landingsplek)", 51.8608, 5.852)

# --- modern / Waalsprong ---
Place("heyendaal", "Heyendaal (Radboud Universiteit)", 51.8192, 5.8661)
Place("waalsprong", "Waalsprong", 51.87, 5.885)
Place("dukenburg", "Dukenburg", 51.823, 5.802)
Place("lindenholt", "Lindenholt", 51.838, 5.792)

# --- regional (Hanze trade routes) ---
Place("keulen", "Keulen", 50.9375, 6.9603)
Place("holland", "Holland & de zee", 51.96, 4.25)
