"""Wikimedia Commons client: resolve a File: title to image URLs and parse its
attribution. Used by image sets and story media."""
import urllib.parse

from ..core import clean_html, http_json

API = "https://commons.wikimedia.org/w/api.php"


def imageinfo(title, *, thumbwidth=None, iiprop="url|extmetadata", timeout=40):
    """First imageinfo record for a Commons File: title. Pass thumbwidth to also
    get a scaled `thumburl`."""
    q = {"action": "query", "format": "json", "titles": title,
         "prop": "imageinfo", "iiprop": iiprop}
    if thumbwidth:
        q["iiurlwidth"] = str(thumbwidth)
    d = http_json(API + "?" + urllib.parse.urlencode(q), timeout=timeout)
    return next(iter(d["query"]["pages"].values()))["imageinfo"][0]


def attribution(ii):
    """(artist, licence) from an imageinfo extmetadata block — artist defaults to
    'onbekend', licence to '' when absent."""
    ext = ii.get("extmetadata", {})
    artist = clean_html(ext.get("Artist", {}).get("value", "")) or "onbekend"
    lic = ext.get("LicenseShortName", {}).get("value", "")
    return artist, lic


def filepath_thumb(filename, width=320):
    """A Special:FilePath thumbnail URL for a raw filename (no imageinfo call)."""
    name = filename.replace(" ", "_")
    return (f"https://commons.wikimedia.org/wiki/Special:FilePath/"
            f"{urllib.parse.quote(name)}?width={width}")


def transcode_url(original, ext):
    """The /transcoded/ derivative URL for a media original (e.g. WAV -> ogg)."""
    name = original.rsplit("/", 1)[-1]
    return f'{original.replace("/commons/", "/commons/transcoded/")}/{name}.{ext}'
