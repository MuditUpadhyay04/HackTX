from app.ai.transcribe import MOCK_RANT
from app.sorting import audio_window, build_segments, mock_sort, piece_text, validate_pieces

PEOPLE = [
    {"id": "mom", "aliases": ["Mom", "Mumma", "Ma"], "pronoun": "her"},
    {"id": "dad", "aliases": ["Dad", "Papa", "Pa"], "pronoun": "him"},
    {"id": "jordan", "aliases": ["Sarah"], "pronoun": "her"},
    {"id": "priya", "aliases": ["Michael", "Mike"], "pronoun": "him"},
]
TURNS = [
    {"turnId": 1, "startMs": 0, "endMs": 9000, "text": MOCK_RANT[0]},
    {"turnId": 2, "startMs": 9800, "endMs": 20000, "text": MOCK_RANT[1]},
    {"turnId": 3, "startMs": 20800, "endMs": 27000, "text": MOCK_RANT[2]},
]


def segments():
    return build_segments([t["text"] for t in TURNS])


def test_segments_are_exact_slices_of_the_transcript():
    transcript, segs = segments()
    assert [s.text for s in segs] == [
        "i don't know.",
        "mom keeps calling and i keep letting it ring and then i send her one letter back.",
        "she made dal on sunday and i didn't even say thank you.",
        "i miss her.",
        "i just don't know how to call when it's been this long.",
        "and sarah.",
        "she said please just say something and i said i don't feel like talking.",
        "that's not true.",
        "i miss the way we used to talk.",
        "i'm sorry i bailed on barton springs.",
        "i'm not mad at her, i'm just tired all the time.",
        "and michael keeps sending me reels and i haven't sent one back in like two weeks.",
        "i still think about the sunrise on 290.",
        "i want to do that again.",
    ]
    for s in segs:
        assert transcript[s.start : s.end] == s.text
    assert [s.turn for s in segs] == [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2]


def test_code_switched_sentences_split_on_the_danda_too():
    transcript, segs = build_segments(["Mumma called again. मुझे घर की याद आ रही है। I'm not busy."])
    assert [s.text for s in segs] == ["Mumma called again.", "मुझे घर की याद आ रही है।", "I'm not busy."]
    for s in segs:
        assert transcript[s.start : s.end] == s.text


def test_validate_drops_bad_claims_and_splits_gaps():
    _, segs = segments()
    raw = [
        {"person": "mom", "segment_ids": [2, 4], "tone": "missing"},     # gap -> two pieces
        {"person": "stranger", "segment_ids": [1], "tone": "hurt"},     # unknown person
        {"person": "jordan", "segment_ids": [7, 99], "tone": "nope"},   # bad id, bad tone
        {"person": "priya", "segment_ids": [4, 12], "tone": "tired"},   # 4 already used
    ]
    pieces = validate_pieces(raw, segs, {"mom", "jordan", "priya"})
    assert pieces == [
        {"person": "mom", "segment_ids": [2], "tone": "missing"},
        {"person": "mom", "segment_ids": [4], "tone": "missing"},
        {"person": "jordan", "segment_ids": [7], "tone": "overwhelmed"},
        {"person": "priya", "segment_ids": [12], "tone": "tired"},
    ]


def test_piece_text_is_verbatim_across_sentences():
    transcript, segs = segments()
    assert piece_text(transcript, segs, [9, 10]) == "i miss the way we used to talk. i'm sorry i bailed on barton springs."


def test_mock_sort_matches_the_design_spec_split():
    # DESIGN_SPEC 3.7: Mom "mom keeps calling ... been this long.", Sarah "she said please
    # just say something ... tired all the time.", Michael "michael keeps sending me reels ...
    # do that again." Filler ("i don't know.", "and sarah.") belongs to nobody.
    transcript, segs = segments()
    result = mock_sort(segs, PEOPLE)
    assert [(p["person"], p["segment_ids"], p["tone"]) for p in result["pieces"]] == [
        ("mom", [2, 3, 4, 5], "missing"),
        ("jordan", [7, 8, 9, 10, 11], "sorry"),
        ("priya", [12, 13, 14], "missing"),
    ]
    assert piece_text(transcript, segs, [7, 8, 9, 10, 11]).startswith("she said please just say something")
    assert result["safety"] == "ok"


def test_a_short_line_with_a_name_is_kept_unless_it_is_only_a_lead_in():
    _, segs = build_segments(["I miss Mom.", "and sarah. she never texts first."])
    result = mock_sort(segs, PEOPLE)
    assert [(p["person"], p["segment_ids"]) for p in result["pieces"]] == [("mom", [1]), ("jordan", [3])]


def test_audio_window_never_leaks_another_persons_words():
    _, segs = segments()
    pieces = [
        {"person": "mom", "segment_ids": [2, 3]},
        {"person": "mom", "segment_ids": [4, 5]},
        {"person": "jordan", "segment_ids": [7, 8, 9, 10, 11]},
        {"person": "priya", "segment_ids": [12, 13, 14]},
    ]
    # Mom's turn is all hers apart from three words of filler: playable, padded.
    assert audio_window(pieces[0], pieces, segs, TURNS) == (0, 9350)
    # Sarah's turn opens with "and sarah." (filler): playable.
    assert audio_window(pieces[2], pieces, segs, TURNS) == (9550, 20350)
    # If one of Mom's lines sat in Sarah's turn, Sarah's audio would be withheld.
    mixed = [{"person": "jordan", "segment_ids": [7]}, {"person": "mom", "segment_ids": [8]}]
    assert audio_window(mixed[0], mixed, segs, TURNS) is None


def test_audio_window_needs_turn_times():
    _, segs = segments()
    pieces = [{"person": "mom", "segment_ids": [2]}]
    untimed = [{"text": t["text"]} for t in TURNS]
    assert audio_window(pieces[0], pieces, segs, untimed) is None
