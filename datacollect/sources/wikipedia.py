"""MediaWiki client: fetch raw wikitext of a page (defaults to nl.wikipedia)."""
import urllib.parse

from ..core import http_json

NL_API = "https://nl.wikipedia.org/w/api.php"


def wikitext(title, *, api=NL_API, timeout=60):
    q = urllib.parse.urlencode({
        "action": "query", "prop": "revisions", "rvprop": "content",
        "rvslots": "main", "titles": title, "format": "json",
    })
    page = next(iter(http_json(f"{api}?{q}", timeout=timeout)["query"]["pages"].values()))
    return page["revisions"][0]["slots"]["main"]["*"]
