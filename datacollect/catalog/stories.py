"""Story-media catalog. Each StoryMedia declares one Verhalen story's media; add
a story by appending another StoryMedia."""
from ..stages.stories import StoryMedia

StoryMedia(
    story="ww2",
    # One hero photo per narrative segment.
    photos={
        "bezetting":    "File:Een Duitse Panzerkampfwagen IV tank rijdt door de Sint Annastraat 2000-1517-005.jpg",
        "deportatie":   "File:De met hakenkruisen besmeurde Nieuwe Synagoge, F67436.jpg",
        "bombardement": "File:Bombardement Nijmegen - Fotodienst der NSB - NIOD - 211720.jpeg",
        "marketgarden": "File:A fleet of Allied aircraft flies overhead as paratroopers of the Allied Airborne Command float groundward in the invasion of the Netherlands, still another step towards the liberation of Europe HD-SN-99-02724.jpg",
        "bruggenomen":  "File:Britse troepen passeren de brug bij Nijmegen, NG-2004-40-36.jpg",
        "frontstad":    "File:Een geallieerde verkeersregelaar op de hoek van de St. Annastraat en de Van Triestraat in Nijmegen. - FO 1300158 - RAA WO2.jpg",
        "bevrijding":   "File:Bevrijdingsfeesten met een wagenspel F65284.jpeg",
    },
    # The public-domain Radio Oranje broadcast of 19 Sep 1944; WAV original is
    # huge, so the .ogg transcode is pulled instead.
    audio={
        ("audio/radio-oranje-19sep1944", "ogg"):
            "File:Radio Oranje 19-sep.-1944 REPORTAGE OVER BEVRIJDING EINDHOVEN, ARNHEM EN NIJMEGEN.wav",
    },
)
