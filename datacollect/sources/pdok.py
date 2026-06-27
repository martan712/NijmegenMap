"""Dutch PDOK Locatieserver geocoder: address -> (lat, lon)."""
import re
import sys
import time
import urllib.parse

from ..core import http_json

FREE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free"


def geocode(addr, cache, *, suffix=", Nijmegen", timeout=60, polite=0.1):
    """Geocode an address to (lat, lon), or None. `cache` (a dict) memoises
    lookups and is updated in place. Sleeps `polite` seconds per live call."""
    if addr in cache:
        return cache[addr]
    q = urllib.parse.urlencode({"q": f"{addr}{suffix}", "fq": "type:adres",
                                "rows": "1", "fl": "centroide_ll"})
    try:
        docs = http_json(f"{FREE}?{q}", timeout=timeout)["response"]["docs"]
        ll = re.search(r"POINT\(([\d.]+) ([\d.]+)\)", docs[0]["centroide_ll"]) if docs else None
        cache[addr] = (ll.group(2), ll.group(1)) if ll else None  # (lat, lon)
    except Exception as e:  # noqa: BLE001
        print(f"  ! geocode failed for {addr!r}: {e}", file=sys.stderr)
        cache[addr] = None
    time.sleep(polite)
    return cache[addr]
