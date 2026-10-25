"""Turning one rant into per-person pieces, without ever writing his words.

The server numbers the sentences. Muse Spark only answers "which sentences,
for whom, in what tone". The text on every card is sliced from his transcript
here, so a sentence that wasn't in his mouth can't reach anyone.
"""

import re
from dataclasses import dataclass

TONES = [
    "missing", "overwhelmed", "tired", "lonely", "hurt", "frustrated",
    "sorry", "grateful", "proud", "loving", "worried", "hopeful",
]

# Sentences end at . ! ? … or the Devanagari danda; trailing quotes stay attached.
_SENTENCE = re.compile(r"[^.!?…।]+(?:[.!?…।]+[\"'”’)\]]*)?")

# Filler this short may share a turn with someone's words and still be played.
_FILLER_MAX_WORDS = 4


@dataclass(frozen=True)
class Segment:
    id: int
    text: str
    start: int
    end: int
    turn: int  # index into the ordered turns


def build_segments(turn_texts: list[str]) -> tuple[str, list[Segment]]:
    """Join turns into one transcript and number its sentences, keeping char offsets."""
    transcript = ""
    segments: list[Segment] = []
    for turn_index, raw in enumerate(turn_texts):
        text = raw.strip()
        if not text:
            continue
        if transcript:
            transcript += " "
        base = len(transcript)
        transcript += text
        for match in _SENTENCE.finditer(text):
            chunk = match.group(0)
            stripped = chunk.strip()
            if not stripped:
                continue
            start = base + match.start() + (len(chunk) - len(chunk.lstrip()))
            segments.append(Segment(len(segments) + 1, stripped, start, start + len(stripped), turn_index))
    return transcript, segments


def validate_pieces(raw_pieces: list, segments: list[Segment], person_ids: set[str]) -> list[dict]:
    """Keep only well-formed claims: known people, real sentence ids, each sentence used once.

    Non-consecutive ids become separate pieces rather than being glued together.
    """
    known = {s.id for s in segments}
    used: set[int] = set()
    out: list[dict] = []
    for raw in raw_pieces or []:
        if not isinstance(raw, dict) or raw.get("person") not in person_ids:
            continue
        ids = sorted({int(i) for i in raw.get("segment_ids") or [] if str(i).isdigit()})
        ids = [i for i in ids if i in known and i not in used]
        tone = raw.get("tone") if raw.get("tone") in TONES else "overwhelmed"
        run: list[int] = []
        for i in ids + [None]:
            if run and (i is None or i != run[-1] + 1):
                out.append({"person": raw["person"], "segment_ids": run, "tone": tone})
                used.update(run)
                run = []
            if i is not None:
                run.append(i)
    out.sort(key=lambda p: p["segment_ids"][0])
    return out


def piece_text(transcript: str, segments: list[Segment], ids: list[int]) -> str:
    by_id = {s.id: s for s in segments}
    return transcript[by_id[ids[0]].start : by_id[ids[-1]].end]


def audio_window(piece: dict, pieces: list[dict], segments: list[Segment], turns: list[dict]) -> tuple[int, int] | None:
    """The stretch of his audio to play for this piece, or None if it would leak.

    Audio is cut on turn boundaries (the model gives turn-level timestamps only),
    so a turn qualifies only if every sentence in it belongs to this person or is
    a few words of filler. Mom never hears the sentence he said about Sarah.
    """
    owner: dict[int, str] = {}
    for p in pieces:
        for i in p["segment_ids"]:
            owner[i] = p["person"]
    by_id = {s.id: s for s in segments}
    piece_turns = {by_id[i].turn for i in piece["segment_ids"]}
    for seg in segments:
        if seg.turn not in piece_turns:
            continue
        who = owner.get(seg.id)
        if who == piece["person"]:
            continue
        if who is None and len(seg.text.split()) <= _FILLER_MAX_WORDS:
            continue
        return None
    starts, ends = [], []
    for t in piece_turns:
        turn = turns[t] if t < len(turns) else {}
        if turn.get("startMs") is None or turn.get("endMs") is None:
            return None
        starts.append(int(turn["startMs"]))
        ends.append(int(turn["endMs"]))
    return max(0, min(starts) - 250), max(ends) + 350


def merge_windows(windows: list[tuple[int, int]]) -> list[tuple[int, int]]:
    merged: list[list[int]] = []
    for start, end in sorted(windows):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return [(s, e) for s, e in merged]


# ---------------------------------------------------------------------------
# Mock sorting, used only when MODEL_API_KEY is missing or Spark fails.
# Name matching plus "a sentence with no name belongs to whoever this turn was about".

_TONE_HINTS = [
    ("lonely", r"\b(alone|lonely)\b"),
    ("sorry", r"\b(sorry|my fault)\b"),
    ("missing", r"\b(miss|missing|yaad|think about)\b"),
    ("tired", r"\b(tired|exhausted|can't even|cant even)\b"),
    ("proud", r"\bproud\b"),
    ("grateful", r"\b(thank|thanks|grateful)\b"),
    ("loving", r"\blove\b"),
    ("worried", r"\b(worried|worry|scared)\b"),
]


_LEAD_IN_FILLER = re.compile(r"\b(and|so|then|also|oh|um|uh|but|or|like|okay|ok)\b", re.IGNORECASE)


def mock_sort(segments: list[Segment], people: list[dict]) -> dict:
    patterns = {
        p["id"]: re.compile(r"\b(" + "|".join(re.escape(a) for a in p["aliases"]) + r")\b", re.IGNORECASE)
        for p in people
        if p["aliases"]
    }
    assigned: list[tuple[Segment, str | None]] = []
    current: str | None = None
    current_turn: int | None = None
    for seg in segments:
        named = next((pid for pid, pat in patterns.items() if pat.search(seg.text)), None)
        if named:
            current = named
        elif seg.turn != current_turn:
            current = None
        current_turn = seg.turn
        # "and sarah." only says who comes next; like other filler, it belongs to nobody.
        lead_in = named is not None and not _LEAD_IN_FILLER.sub("", patterns[named].sub("", seg.text)).strip(" .,!?…")
        assigned.append((seg, None if lead_in else current))

    pieces: list[dict] = []
    for seg, person in assigned:
        if person is None:
            continue
        last = pieces[-1] if pieces else None
        if last and last["person"] == person and last["segment_ids"][-1] == seg.id - 1:
            last["segment_ids"].append(seg.id)
            last["_text"] += " " + seg.text
        else:
            pieces.append({"person": person, "segment_ids": [seg.id], "_text": seg.text})
    for piece in pieces:
        text = piece.pop("_text")
        piece["tone"] = next((tone for tone, pat in _TONE_HINTS if re.search(pat, text, re.IGNORECASE)), "overwhelmed")

    pronouns = {p["id"]: p.get("pronoun", "them") for p in people}
    reflections = [
        {"person": pid, "line": f"you still want {pronouns.get(pid, 'them')} to know."}
        for pid in dict.fromkeys(p["person"] for p in pieces)
    ]
    return {"safety": "ok", "pieces": pieces, "reflections": reflections}
