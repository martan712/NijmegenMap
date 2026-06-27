"""Small text helpers shared across sources."""
import html as _html
import re

_TAGS = re.compile(r"(?is)<[^>]+>")


def clean_html(s):
    """Strip tags, unescape entities, collapse whitespace."""
    return re.sub(r"\s+", " ", _html.unescape(_TAGS.sub(" ", s or ""))).strip()
