from app.ai.transcribe import MOCK_RANT
from app.sorting import audio_window, build_segments, mock_sort, piece_text, validate_pieces

PEOPLE = [
    {"id": "mom", "aliases": ["Mom", "Mumma", "Ma"], "pronoun": "her"},
    {"id": "jordan", "aliases": ["Jordan"], "pronoun": "her"},
    {"id": "priya", "aliases": ["Priya"], "pronoun": "her"},
]
TURNS = [
    {"turnId": 1, "startMs": 0, "endMs": 4000, "text": MOCK_RANT[0]},
    {"turnId": 2, "startMs": 4800, "endMs": 10000, "text": MOCK_RANT[1]},
    {"turnId": 3, "startMs": 10800, "endMs": 14000, "text": MOCK_RANT[2]},
]


def segments():
    return build_segments([t["text"] for t in TURNS])


def test_segments_are_exact_slices_of_the_transcript():
    transcript, segs = segments()
    assert [s.text for s in segs] == [
        "I don't know, man.",
        "Jordan said I don't get her, and maybe she's right.",
        "Mumma called three times today and I said I'm busy.",
        "I'm not busy.",
        "Mujhe bas ghar ki yaad aa rahi hai.",
        "And Priya keeps sending reels and I can't even laugh right now.",
    ]
    for s in segs:
        assert transcript[s.start : s.end] == s.text
    assert [s.turn for s in segs] == [0, 0, 1, 1, 1, 2]


def test_validate_drops_bad_claims_and_splits_gaps():
    _, segs = segments()
    raw = [
        {"person": "mom", "segment_ids": [3, 5], "tone": "missing"},      # gap -> two pieces
        {"person": "stranger", "segment_ids": [1], "tone": "hurt"},      # unknown person
        {"person": "jordan", "segment_ids": [2, 99], "tone": "nope"},    # bad id, bad tone
        {"person": "priya", "segment_ids": [3, 6], "tone": "tired"},     # 3 already used
    ]
    pieces = validate_pieces(raw, segs, {"mom", "jordan", "priya"})
    assert pieces == [
        {"person": "jordan", "segment_ids": [2], "tone": "overwhelmed"},
        {"person": "mom", "segment_ids": [3], "tone": "missing"},
        {"person": "mom", "segment_ids": [5], "tone": "missing"},
        {"person": "priya", "segment_ids": [6], "tone": "tired"},
    ]


def test_piece_text_is_verbatim_across_sentences():
    transcript, segs = segments()
    assert piece_text(transcript, segs, [3, 4]) == "Mumma called three times today and I said I'm busy. I'm not busy."


def test_mock_sort_matches_the_demo_script():
    _, segs = segments()
    result = mock_sort(segs, PEOPLE)
    assert [(p["person"], p["segment_ids"]) for p in result["pieces"]] == [
        ("jordan", [2]),
        ("mom", [3, 4, 5]),
        ("priya", [6]),
    ]
    assert result["safety"] == "ok"


def test_audio_window_never_leaks_another_persons_words():
    _, segs = segments()
    pieces = [
        {"person": "jordan", "segment_ids": [2]},
        {"person": "mom", "segment_ids": [3, 4]},
        {"person": "mom", "segment_ids": [5]},
        {"person": "priya", "segment_ids": [6]},
    ]
    # Mom's turn is all hers: playable, padded.
    assert audio_window(pieces[1], pieces, segs, TURNS) == (4550, 10350)
    # Jordan's turn holds only short filler besides her line: playable.
    assert audio_window(pieces[0], pieces, segs, TURNS) == (0, 4350)
    # If Mom's line sat in Jordan's turn, Jordan's audio would be withheld.
    mixed = [{"person": "jordan", "segment_ids": [1]}, {"person": "mom", "segment_ids": [2]}]
    assert audio_window(mixed[0], mixed, segs, TURNS) is None


def test_audio_window_needs_turn_times():
    _, segs = segments()
    pieces = [{"person": "mom", "segment_ids": [3]}]
    untimed = [{"text": t["text"]} for t in TURNS]
    assert audio_window(pieces[0], pieces, segs, untimed) is None
