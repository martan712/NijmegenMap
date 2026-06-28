"""One HTTP getter for every source: a shared User-Agent, optional retries, and
optional detection of WMS/WFS XML error bodies. Sources build on this rather
than touching urllib directly."""
import gzip
import json
import time
import urllib.error
import urllib.request

UA = "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"

# Advertise gzip. urllib otherwise defaults to "Accept-Encoding: identity"
# (asking for an UNcompressed body, since it won't auto-decompress), and
# Wikimedia's WDQS edge runs an emergency Varnish rule that aggressively
# rate-limits (1 req/min) clients demanding uncompressed responses during an
# outage — which is why the pipeline got 429s where curl (gzip-friendly) did
# not. We send gzip and decompress below; servers that can't gzip just reply
# uncompressed.
ACCEPT_ENCODING = "gzip"


def http_get(url, *, timeout=60, headers=None, tries=1, retry_delay=1.5,
             detect_xml_error=False):
    """GET url -> bytes. With tries>1, retries on any error after retry_delay.
    With detect_xml_error, a leading "<?xml" body (a WMS/WFS error page) is
    raised as a failure carrying the server's message."""
    hdrs = {"User-Agent": UA, "Accept-Encoding": ACCEPT_ENCODING}
    if headers:
        hdrs.update(headers)
    last = None
    for _ in range(max(1, tries)):
        try:
            req = urllib.request.Request(url, headers=hdrs)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    data = gzip.decompress(data)
            if detect_xml_error and data[:5] == b"<?xml":
                raise RuntimeError(data[:120].decode("utf-8", "replace").strip())
            return data
        except urllib.error.HTTPError as ex:
            last = ex
            # 429 Too Many Requests: honour the server's Retry-After (WDQS sets a
            # ~60s window during outages); a flat retry_delay would just re-hit it.
            if ex.code == 429 and tries > 1:
                try:
                    wait = int(ex.headers.get("Retry-After") or 0)
                except ValueError:
                    wait = 0
                print(f"    429 rate-limited; waiting {max(wait, 60) + 2}s…")
                time.sleep(max(wait, 60) + 2)
            elif tries > 1:
                time.sleep(retry_delay)
        except Exception as ex:  # noqa: BLE001
            last = ex
            if tries > 1:
                time.sleep(retry_delay)
    raise last


def http_json(url, *, timeout=40, headers=None, **kw):
    return json.loads(http_get(url, timeout=timeout, headers=headers, **kw))
