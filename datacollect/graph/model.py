"""
The graph model: a small declarative DSL for the NijmegenMap ontology.

Everything the backend serves — places, sources, overlays, and the narrative
chapters (stories → threads → segments → blocks → map-states) — is authored here
as plain Python objects and emitted to Turtle by the `graph` stage (see
graph/emit.py). This module is the single source of truth; the hand-written
`.ttl` instance files are generated artefacts.

Naming is flat and uniform (the one rule that keeps catalog ↔ graph ↔ media in
sync):

    a Place   slug  ->  IRI id:<slug>
    a Source  slug  ->  IRI id:src_<slug>   media data/images/<slug>.<ext>
                                            (audio -> data/audio/<slug>.<ext>)
    an Overlay key  ->  IRI id:overlay_<key>

A source's slug is global: an image is an image, regardless of which chapter
uses it, so any block/pin just names the slug.
"""
from dataclasses import dataclass, field
from typing import Optional

# ---------------------------------------------------------------- registries
PLACES: dict = {}      # slug -> Place
SOURCES: dict = {}     # slug -> Source
OVERLAYS: dict = {}    # key  -> Overlay
CHAPTERS: list = []    # [Chapter, ...] in registration order


# ---------------------------------------------------------------- licences
# Reused CC IRIs; the short name is what Commons reports and what the credit
# tail shows when no fetched attribution is available.
class L:
    PD     = ("https://creativecommons.org/publicdomain/mark/1.0/", "Public Domain")
    CC0    = ("https://creativecommons.org/publicdomain/zero/1.0/", "CC0")
    BY_4   = ("https://creativecommons.org/licenses/by/4.0/",       "CC BY 4.0")
    BY_3   = ("https://creativecommons.org/licenses/by/3.0/",       "CC BY 3.0")
    BY_SA_4 = ("https://creativecommons.org/licenses/by-sa/4.0/",   "CC BY-SA 4.0")
    BY_SA_3 = ("https://creativecommons.org/licenses/by-sa/3.0/",   "CC BY-SA 3.0")
    BY_SA_2 = ("https://creativecommons.org/licenses/by-sa/2.0/",   "CC BY-SA 2.0")


# ---------------------------------------------------------------- domain nodes
@dataclass
class Place:
    """A located point reused by chapters (focusPlace, arrowFrom/To, occurredAt)."""
    slug: str
    label: str
    lat: float
    long: float
    cls: str = "Place"          # Place | Building | Bridge
    same_as: Optional[str] = None   # Wikidata Q-id, e.g. "Q1798831"

    def __post_init__(self):
        PLACES[self.slug] = self


@dataclass
class Source:
    """A media source (Photograph / AudioRecording / Diary). The slug is the
    global media key; `commons` (a Commons "File:" title) drives the media stage,
    or `path` points at a file produced by another stage (e.g. korfmacher)."""
    slug: str
    caption: str
    kind: str = "Photograph"        # Photograph | AudioRecording | Diary
    commons: Optional[str] = None   # Commons "File:…" title to fetch
    path: Optional[str] = None      # explicit mediaPath (overrides slug-derived)
    ext: str = "jpg"
    license: Optional[tuple] = None  # one of L.*
    rights: Optional[str] = None     # "a" free | "b" attributed | "c" permission
    creator: Optional[str] = None
    about: Optional[str] = None      # event slug this source depicts/documents
    authored_by: Optional[str] = None  # actor slug (diaries etc.)
    same_as: Optional[str] = None
    transcode: Optional[str] = None  # audio: fetch this derivative ext from a WAV/…

    def __post_init__(self):
        SOURCES[self.slug] = self

    @property
    def media_path(self) -> Optional[str]:
        """Slug-derived media path, or an explicit override, or None for sources
        with no file of their own (e.g. a diary referenced only by quotes)."""
        if self.path:
            return self.path
        if not self.commons:
            return None
        folder = "audio" if self.kind == "AudioRecording" else "images"
        return f"data/{folder}/{self.slug}.{self.ext}"


@dataclass
class Overlay:
    """A polygon overlay the frontend knows how to draw (key -> OverlayDef)."""
    key: str
    label: str

    def __post_init__(self):
        OVERLAYS[self.key] = self


# ---- narrative model -------------------------------------------------------
@dataclass
class Event:
    slug: str
    label: str
    date: Optional[str] = None       # ISO date "YYYY-MM-DD"
    at: tuple = ()                   # place slugs (occurredAt)
    part_of: Optional[str] = None    # parent event slug
    participants: tuple = ()         # organization/person slugs
    same_as: Optional[str] = None


@dataclass
class Quote:
    slug: str
    verbatim: str
    derived_from: str                # source slug (e.g. a diary)
    about: Optional[str] = None      # event slug
    locator: Optional[str] = None
    lang: str = "nl"


@dataclass
class Actor:
    """A Person / Organization / MilitaryUnit referenced by events or sources."""
    slug: str
    label: str
    cls: str = "Person"              # Person | Organization | MilitaryUnit
    lang: str = "nl"
    same_as: Optional[str] = None


@dataclass
class Arrow:
    frm: str                         # place slug
    to: str                          # place slug
    label: str
    curve: float = 0.0


@dataclass
class Pin:
    place: str                       # place slug
    src: str                         # source slug (the drawing/photo)
    text: str


@dataclass
class Map:
    """A segment's companion-map state."""
    base: Optional[int] = None       # historical base-map year
    focus: tuple = ()                # place slugs
    overlay: Optional[str] = None    # explicit overlay key (limes/ww2)
    level: Optional[int] = None      # overlayLevel (ww2 step OR growth year)
    dim: bool = False                # overlayDim (anchor cue)
    fort: Optional[int] = None       # fortLevel year
    arrows: tuple = ()               # Arrow
    pins: tuple = ()                 # Pin
    memorial: bool = False
    wall: bool = False
    heritage: bool = False           # show the Wikidata heritage layer
    heritage_cats: tuple = ()        # category substrings to include (empty = all)
    # Period filter: drop monuments with a KNOWN inception outside the range
    # (undated ones always pass, so marquee medieval churches aren't lost).
    heritage_before: Optional[int] = None
    heritage_after: Optional[int] = None


# Block kinds map 1:1 to ontology subclasses of nmg:Block.
@dataclass
class Block:
    kind: str                        # Narrative|Image|Gallery|Audio|Quote|MemorialWall
    text: Optional[str] = None
    src: Optional[str] = None        # source slug (Image/Gallery/Audio)
    ref: Optional[str] = None        # content-unit slug (Quote)
    about: Optional[str] = None      # event slug
    cites: Optional[str] = None      # source slug
    # Text pulled from a fetched dataset at build time, NOT authored here:
    # (geojson filename, match-property, match-value, text-property).
    fetch: Optional[tuple] = None


def Narr(text, *, about=None, cites=None):
    return Block("Narrative", text=text, about=about, cites=cites)

def Img(src):       return Block("Image", src=src)
def Gallery(src):   return Block("Gallery", src=src)
def Audio(src):     return Block("Audio", src=src)
def QuoteB(ref):    return Block("Quote", ref=ref)
def MemorialWall(): return Block("MemorialWall")

def Toelichting(periode):
    """A NarrativeBlock whose text is the gemeente's CHW_VESTINGWERKEN
    TOELICHTING for `periode`, resolved from vestingwerken.geojson at build time
    (so the source text is never copied into the codebase)."""
    return Block("Narrative",
                 fetch=("vestingwerken.geojson", "PERIODE", periode, "TOELICHTING"))


@dataclass
class Segment:
    key: str                         # -> id:seg_<key>, id:map_<key>, id:block_<key>_<n>
    order: int
    tick: str
    blocks: tuple
    map: Optional[Map] = None
    event: Optional[str] = None      # primaryEvent slug


@dataclass
class Thread:
    key: str                         # -> id:thread_<key>
    label: str
    order: int
    segments: tuple


@dataclass
class Story:
    slug: str                        # -> id:story_<slug>
    label: str
    intro: str
    era: str
    year: int
    order: int
    tag: Optional[str] = None


@dataclass
class Chapter:
    filename: str                    # e.g. "roman.ttl"
    comment: str                     # header comment line
    story: Story
    threads: tuple
    actors: tuple = ()               # Actor defined in this file
    events: tuple = ()               # Event defined in this file
    quotes: tuple = ()               # Quote defined in this file

    def __post_init__(self):
        CHAPTERS.append(self)
