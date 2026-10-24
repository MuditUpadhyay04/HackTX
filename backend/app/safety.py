"""The safety gate. Runs before any piece forms or any memory surfaces.

Two layers: Muse Spark's classification, and this deterministic phrase list,
which can only ever add a concern, never remove one. When in doubt, resources.
"""

import re

OK = "ok"
FLAGS = ("self_harm", "harm_to_others", "abuse_or_control")

RESOURCES = [
    {
        "name": "988 Suicide & Crisis Lifeline",
        "detail": "Call or text 988",
        "links": [{"label": "call 988", "href": "tel:988"}, {"label": "text 988", "href": "sms:988"}],
    },
    {
        "name": "National Domestic Violence Hotline",
        "detail": "Call 1-800-799-7233 · Text START to 88788",
        "links": [
            {"label": "call 1-800-799-7233", "href": "tel:18007997233"},
            {"label": "text START to 88788", "href": "sms:88788?body=START"},
        ],
    },
    {
        "name": "Immediate danger",
        "detail": "Call 911",
        "links": [{"label": "call 911", "href": "tel:911"}],
    },
]

# Phrases, matched on word boundaries, case-insensitive. Includes transliterated
# Hindi because rants code-switch.
_PHRASES = {
    "self_harm": [
        "kill myself", "killing myself", "end my life", "end it all", "want to die", "wanna die",
        "don't want to be here anymore", "dont want to be here anymore", "don't want to live",
        "dont want to live", "no reason to live", "better off without me", "hurt myself",
        "hurting myself", "cut myself", "suicide", "suicidal", "can't go on", "cant go on",
        "not worth living", "disappear forever",
        "marna chahta", "marna chahti", "mar jaana chahta", "mar jana chahta", "jeena nahi chahta",
        "jeena nahi chahti", "khud ko khatam", "zindagi khatam",
    ],
    "harm_to_others": [
        "kill him", "kill her", "kill them", "want to hurt him", "want to hurt her", "make her pay",
        "make him pay", "going to hurt him", "going to hurt her", "beat him up", "beat her up",
    ],
    "abuse_or_control": [
        "hits me", "slapped me", "pushed me", "choked me", "afraid of him", "afraid of her",
        "scared of him", "scared of her", "checks my phone", "tracks my location", "won't let me see",
        "wont let me see", "won't let me leave", "wont let me leave", "not allowed to see my",
        "took my money", "takes my money", "threatened me", "threatens me", "threatens to",
    ],
}

_PATTERNS = {
    flag: re.compile(r"\b(" + "|".join(re.escape(p) for p in phrases) + r")\b", re.IGNORECASE)
    for flag, phrases in _PHRASES.items()
}


def keyword_flag(text: str) -> str | None:
    normalized = text.replace("’", "'")
    for flag in FLAGS:
        if _PATTERNS[flag].search(normalized):
            return flag
    return None


def combine(model_flag: str | None, text: str) -> str:
    """The stricter of the two layers wins. Unknown model output counts as a concern."""
    phrase = keyword_flag(text)
    if phrase:
        return phrase
    if model_flag in (None, OK):
        return OK
    return model_flag if model_flag in FLAGS else "self_harm"
