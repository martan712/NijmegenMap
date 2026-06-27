#!/usr/bin/env python3
"""
Render a schema-level overview of the NijmegenMap knowledge graph to
docs/graph-overview.svg (+ .png via rsvg-convert). Nodes are the ontology
classes, edges the object properties; each node is annotated with the live
instance count from backend/src/main/resources/graph/*.ttl.

Counts below were measured from the generated graph (3164 triples). Re-measure
with rdflib and update COUNTS if the catalog changes substantially.
"""
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_SVG = ROOT / "docs" / "graph-overview.svg"
OUT_PNG = ROOT / "docs" / "graph-overview.png"

W, H = 1700, 1180

# group -> (stroke, fill, accent text)
GROUPS = {
    "narr": ("#1d4ed8", "#dbeafe"),   # Verhalen / narrative
    "scene": ("#047857", "#d1fae5"),  # companion-map scene
    "domain": ("#b45309", "#fef3c7"),  # places / events / actors
    "prov": ("#6d28d9", "#ede9fe"),   # sources / provenance
}

# id: (cx, cy, w, h, group, [title lines])
NODES = {
    "Story":    (175, 110, 180, 58, "narr", ["Story", "(chapter) · 5"]),
    "Thread":   (175, 240, 180, 58, "narr", ["Thread", "(verhaallijn) · 18"]),
    "Segment":  (175, 372, 180, 58, "narr", ["Segment", "(timeline step) · 63"]),
    "Block":    (500, 300, 250, 196, "narr",
                 ["Block  (63)", "— NarrativeBlock 63", "— ImageBlock 27",
                  "— GalleryBlock 8", "— AudioBlock 1", "— QuoteBlock 1",
                  "— MemorialWallBlock 1"]),
    "MapState": (175, 560, 180, 58, "scene", ["MapState", "(scene) · 63"]),
    "Overlay":  (150, 730, 190, 60, "scene", ["PolygonOverlay", "· 4"]),
    "Arrow":    (410, 730, 150, 54, "scene", ["Arrow · 9"]),
    "PhotoPin": (410, 880, 160, 54, "scene", ["PhotoPin · 4"]),
    "Place":    (720, 745, 230, 70, "domain",
                 ["Place / Building / Bridge", "· 33"]),
    "Event":    (880, 372, 175, 58, "domain", ["Event", "· 8"]),
    "Actor":    (1230, 372, 240, 72, "domain",
                 ["Person / MilitaryUnit", "· 2"]),
    "Quote":    (640, 560, 175, 58, "prov", ["Quote", "(ContentUnit) · 1"]),
    "Source":   (1060, 600, 250, 120, "prov",
                 ["Source  (41)", "— Photograph 39", "— AudioRecording 1",
                  "— Diary 1"]),
}

# (src, dst, label, bow)  bow = perpendicular curve offset (0 = straight)
EDGES = [
    ("Story", "Thread", "hasThread", 0),
    ("Thread", "Segment", "hasSegment", 0),
    ("Segment", "Block", "hasBlock", 0),
    ("Segment", "MapState", "mapState", 0),
    ("Segment", "Event", "primaryEvent", 165),  # dip below the Block box
    ("Block", "Quote", "references", 0),
    ("Block", "Source", "references · cites", 30),
    ("MapState", "Overlay", "overlay", 0),
    ("MapState", "Place", "focusPlace", 30),
    ("MapState", "Arrow", "arrow", 0),
    ("MapState", "PhotoPin", "photoPin", 0),
    ("Arrow", "Place", "arrowFrom · arrowTo", 0),
    ("PhotoPin", "Place", "atPlace", 0),
    ("PhotoPin", "Source", "references", 150),
    ("Event", "Place", "occurredAt", 40),
    ("Event", "Actor", "hadParticipant", 0),
    ("Event", "Event", "partOf", 0),
    ("Quote", "Source", "derivedFrom", 0),
    ("Source", "Event", "depicts · documents", 60),
    ("Source", "Actor", "authoredBy", -40),
    ("Stolperstein→Event", None, None, 0),  # placeholder handled below
]


def clip(cx, cy, hw, hh, tx, ty):
    """Point on the rect border (center cx,cy, half-size hw,hh) toward (tx,ty)."""
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return cx, cy
    sx = hw / abs(dx) if dx else math.inf
    sy = hh / abs(dy) if dy else math.inf
    t = min(sx, sy)
    return cx + dx * t, cy + dy * t


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def node_svg(nid):
    cx, cy, w, h, grp, lines = NODES[nid]
    stroke, fill = GROUPS[grp]
    x, y = cx - w / 2, cy - h / 2
    out = [f'<rect x="{x:.0f}" y="{y:.0f}" width="{w}" height="{h}" rx="10" '
           f'fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>']
    n = len(lines)
    # first line bold (title), rest smaller
    ty0 = cy - (n - 1) * 9 + 5
    for i, ln in enumerate(lines):
        bold = "font-weight=\"700\"" if i == 0 else ""
        size = 17 if i == 0 else 13
        col = stroke if i == 0 else "#334155"
        out.append(f'<text x="{cx:.0f}" y="{ty0 + i*19:.0f}" text-anchor="middle" '
                   f'font-size="{size}" {bold} fill="{col}" '
                   f'font-family="DejaVu Sans, sans-serif">{esc(ln)}</text>')
    return "\n".join(out)


def edge_svg(a, b, label, bow):
    ax, ay, aw, ah, *_ = NODES[a]
    bx, by, bw, bh, *_ = NODES[b]
    if a == b:  # self loop (partOf) — a tidy hump above the node's top edge
        topy = ay - ah / 2
        sxp, exp = ax - 20, ax + 20
        path = (f'M {sxp:.0f} {topy:.0f} C {sxp-12:.0f} {topy-58:.0f} '
                f'{exp+12:.0f} {topy-58:.0f} {exp:.0f} {topy:.0f}')
        return (f'<path d="{path}" fill="none" stroke="#94a3b8" stroke-width="2" '
                f'marker-end="url(#arrow)"/>'
                f'{_label(ax, topy-48, label)}')
    sx, sy = clip(ax, ay, aw / 2, ah / 2, bx, by)
    ex, ey = clip(bx, by, bw / 2, bh / 2, ax, ay)
    mx, my = (sx + ex) / 2, (sy + ey) / 2
    if bow:
        # offset control point perpendicular to the segment
        dx, dy = ex - sx, ey - sy
        ln = math.hypot(dx, dy) or 1
        nx, ny = -dy / ln, dx / ln
        cxp, cyp = mx + nx * bow, my + ny * bow
        path = f'M {sx:.0f} {sy:.0f} Q {cxp:.0f} {cyp:.0f} {ex:.0f} {ey:.0f}'
        lx, ly = cxp, cyp
    else:
        path = f'M {sx:.0f} {sy:.0f} L {ex:.0f} {ey:.0f}'
        lx, ly = mx, my
    return (f'<path d="{path}" fill="none" stroke="#94a3b8" stroke-width="2" '
            f'marker-end="url(#arrow)"/>\n{_label(lx, ly, label)}')


def _label(x, y, text):
    w = 7.4 * len(text) + 10
    return (f'<rect x="{x-w/2:.0f}" y="{y-11:.0f}" width="{w:.0f}" height="18" '
            f'rx="4" fill="white" fill-opacity="0.92"/>'
            f'<text x="{x:.0f}" y="{y+3:.0f}" text-anchor="middle" font-size="12.5" '
            f'fill="#475569" font-style="italic" '
            f'font-family="DejaVu Sans, sans-serif">{esc(text)}</text>')


def build():
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
         f'viewBox="0 0 {W} {H}" font-family="DejaVu Sans, sans-serif">']
    s.append('<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" '
             'markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
             '<path d="M0 0 L10 5 L0 10 z" fill="#94a3b8"/></marker></defs>')
    s.append(f'<rect width="{W}" height="{H}" fill="#f8fafc"/>')
    # title
    s.append('<text x="40" y="52" font-size="30" font-weight="700" fill="#0f172a">'
             'Nijmegen Tijdmachine — Verhalen knowledge graph</text>')
    s.append('<text x="40" y="78" font-size="15" fill="#64748b">'
             'Ontology overview · classes &amp; object properties, with live '
             'instance counts · 3164 triples across 10 Turtle files</text>')

    # band guides (faint)
    bands = [("VERHALEN — narrative spine", 95, "#1d4ed8"),
             ("SCENE — companion map state", 520, "#047857"),
             ("DOMAIN — places · events · actors", 330, "#b45309"),
             ("PROVENANCE — sources", 520, "#6d28d9")]

    # add Stolperstein node (drawn as part of Place group, but separate edge)
    NODES["Stolperstein"] = (900, 900, 190, 56, "domain", ["Stolperstein", "· 155"])

    edges = [e for e in EDGES if e[1] is not None]
    edges.append(("Stolperstein", "Event", "about", 0))
    for a, b, label, bow in edges:
        s.append(edge_svg(a, b, label, bow))
    for nid in NODES:
        s.append(node_svg(nid))

    # legend
    lx, ly = 40, H - 120
    s.append(f'<rect x="{lx}" y="{ly}" width="430" height="92" rx="10" '
             f'fill="white" stroke="#cbd5e1"/>')
    s.append(f'<text x="{lx+16}" y="{ly+26}" font-size="15" font-weight="700" '
             f'fill="#0f172a">Legend</text>')
    items = [("narr", "Narrative (Story → Thread → Segment → Block)"),
             ("scene", "Scene (MapState, Overlay, Arrow, PhotoPin)"),
             ("domain", "Domain (Place, Event, Actor, Stolperstein)"),
             ("prov", "Provenance (Source, Quote)")]
    for i, (g, lab) in enumerate(items):
        st, fl = GROUPS[g]
        yy = ly + 44 + i * 16
        s.append(f'<rect x="{lx+16}" y="{yy-10}" width="16" height="12" rx="3" '
                 f'fill="{fl}" stroke="{st}" stroke-width="2"/>')
        s.append(f'<text x="{lx+40}" y="{yy}" font-size="12.5" fill="#334155">'
                 f'{esc(lab)}</text>')
    s.append(f'<text x="{W-40}" y="{H-30}" text-anchor="end" font-size="12" '
             f'fill="#94a3b8">generated by datacollect · '
             f'backend/src/main/resources/graph/*.ttl</text>')
    s.append("</svg>")
    return "\n".join(s)


if __name__ == "__main__":
    OUT_SVG.write_text(build(), encoding="utf-8")
    print("wrote", OUT_SVG)
    try:
        subprocess.run(["rsvg-convert", "-z", "2", "-o", str(OUT_PNG), str(OUT_SVG)],
                       check=True)
        print("wrote", OUT_PNG)
    except Exception as e:  # noqa: BLE001
        print("PNG render skipped:", e)
