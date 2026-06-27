"""One HTTP getter for every source: a shared User-Agent, optional retries, and
optional detection of WMS/WFS XML error bodies. Sources build on this rather
than touching urllib directly."""
import json
import time
import urllib.request

UA = "NijmegenMap/1.0 (historical map project; martanvanderstraaten@gmail.com)"


def http_get(url, *, timeout=60, headers=None, tries=1, retry_delay=1.5,
             detect_xml_error=False):
    """GET url -> bytes. With tries>1, retries on any error after retry_delay.
    With detect_xml_error, a leading "<?xml" body (a WMS/WFS error page) is
    raised as a failure carrying the server's message."""
    hdrs = {"User-Agent": UA}
    if headers:
        hdrs.update(headers)
    last = None
    for _ in range(max(1, tries)):
        try:
            req = urllib.request.Request(url, headers=hdrs)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
            if detect_xml_error and data[:5] == b"<?xml":
                raise RuntimeError(data[:120].decode("utf-8", "replace").strip())
            return data
        except Exception as ex:  # noqa: BLE001
            last = ex
            if tries > 1:
                time.sleep(retry_delay)
    raise last


def http_json(url, *, timeout=40, headers=None):
    return json.loads(http_get(url, timeout=timeout, headers=headers))
