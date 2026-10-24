"""A rant goes in; pieces for each person come out, or the safety screen does."""

import json
import logging

from . import audio, db, safety, sorting, store, timeutil
from .ai import spark
from .config import settings

log = logging.getLogger("unsaid.rants")

# Tones that bring back the video he left himself "for the next hard day".
SELF_NOTE_TONES = {"overwhelmed", "lonely", "tired", "hurt"}


def language_bias() -> list[str]:
    home = store.me()["language"]
    return ["English"] if home.lower() == "english" else ["English", home]


def keywords() -> list[str]:
    words: list[str] = []
    for p in store.list_people():
        words += [p["name"], *p["aliases"]]
    return list(dict.fromkeys(w for w in words if len(w) > 2))[:50]


def save_rant(turns: list[dict], pcm: bytes | None, provider: str) -> dict:
    turns = [t for t in turns if (t.get("text") or "").strip()]
    if not turns:
        raise ValueError("nothing was heard")
    transcript, _ = sorting.build_segments([t["text"] for t in turns])
    rant_id = db.new_id("rant")
    audio_path = store.save_media("rants", f"{rant_id}.wav", audio.pcm_to_wav(pcm)) if pcm else None
    with db.tx() as c:
        c.execute(
            "INSERT INTO rants (id, created_at, provider, transcript, turns, audio_path) VALUES (?, ?, ?, ?, ?, ?)",
            (rant_id, db.iso(timeutil.now_utc()), provider, transcript, json.dumps(turns, ensure_ascii=False), audio_path),
        )
    return get_rant(rant_id)


def get_rant(rant_id: str) -> dict:
    with db.tx() as c:
        row = c.execute("SELECT * FROM rants WHERE id = ?", (rant_id,)).fetchone()
    if not row:
        raise KeyError(rant_id)
    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "provider": row["provider"],
        "transcript": row["transcript"],
        "turns": json.loads(row["turns"]),
        "has_audio": bool(row["audio_path"]),
        "safety": row["safety"],
        "sorted_by": row["sorted_by"],
    }


async def sort_rant(rant_id: str) -> dict:
    with db.tx() as c:
        row = c.execute("SELECT * FROM rants WHERE id = ?", (rant_id,)).fetchone()
    if not row:
        raise KeyError(rant_id)
    if row["sorted_at"]:
        return sort_result(rant_id)

    turns = json.loads(row["turns"])
    transcript, segments = sorting.build_segments([t["text"] for t in turns])
    people = store.list_people()
    raw, sorted_by = None, "mock"
    if settings.muse_enabled:
        try:
            raw = await spark.sort_rant(segments, store.me(), people)
            sorted_by = "meta"
        except spark.SparkError as exc:
            log.warning("spark sort failed, using mock: %s", exc)
    if raw is None:
        raw = sorting.mock_sort(segments, people)

    flag = safety.combine(raw.get("safety"), transcript)
    now = db.iso(timeutil.now_utc())
    if flag != safety.OK:
        with db.tx() as c:
            c.execute("UPDATE rants SET safety = ?, sorted_by = ?, sorted_at = ? WHERE id = ?", (flag, sorted_by, now, rant_id))
        return sort_result(rant_id)

    person_ids = {p["id"] for p in people}
    pieces = sorting.validate_pieces(raw.get("pieces"), segments, person_ids)
    with db.tx() as c:
        for p in pieces:
            window = sorting.audio_window(p, pieces, segments, turns) if row["audio_path"] else None
            c.execute(
                "INSERT INTO pieces (id, rant_id, person_id, text, tone, audio_start_ms, audio_end_ms, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    db.new_id("piece"), rant_id, p["person"],
                    sorting.piece_text(transcript, segments, p["segment_ids"]), p["tone"],
                    window[0] if window else None, window[1] if window else None, now,
                ),
            )
        lines = _reflections(raw.get("reflections"), {p["person"] for p in pieces}, people)
        for person_id, line in lines.items():
            c.execute("INSERT INTO reflections (rant_id, person_id, line) VALUES (?, ?, ?)", (rant_id, person_id, line))
        c.execute("UPDATE rants SET safety = 'ok', sorted_by = ?, sorted_at = ? WHERE id = ?", (sorted_by, now, rant_id))
    return sort_result(rant_id)


def _reflections(raw: list | None, with_pieces: set[str], people: list[dict]) -> dict[str, str]:
    """Unsaid's one line per person. Short, lowercase, and only for people he spoke about."""
    out: dict[str, str] = {}
    for item in raw or []:
        if not isinstance(item, dict) or item.get("person") not in with_pieces:
            continue
        line = " ".join(str(item.get("line", "")).split()).lower().replace("!", ".")
        if 0 < len(line) <= 90:
            out.setdefault(item["person"], line)
    pronouns = {p["id"]: p["pronoun"] for p in people}
    for person_id in with_pieces - out.keys():
        out[person_id] = f"you still want {pronouns.get(person_id, 'them')} to know."
    return out


def sort_result(rant_id: str) -> dict:
    rant = get_rant(rant_id)
    if rant["safety"] and rant["safety"] != safety.OK:
        return {"rant": rant, "safety": rant["safety"], "resources": safety.RESOURCES, "groups": [], "self_note": None}

    now = timeutil.now_utc()
    with db.tx() as c:
        new = c.execute("SELECT * FROM pieces WHERE rant_id = ? ORDER BY rowid", (rant_id,)).fetchall()
        lines = {r["person_id"]: r["line"] for r in c.execute("SELECT * FROM reflections WHERE rant_id = ?", (rant_id,))}
        kept = {
            r["person_id"]: r["n"]
            for r in c.execute("SELECT person_id, COUNT(*) AS n FROM pieces WHERE status = 'kept' GROUP BY person_id")
        }
        note = c.execute("SELECT * FROM self_notes ORDER BY created_at DESC LIMIT 1").fetchone()

    groups = []
    for person in store.list_people():
        mine = [r for r in new if r["person_id"] == person["id"]]
        if not mine:
            continue
        groups.append({
            "person": store.person_out(person, now),
            "pieces": [store.piece_out(r) for r in mine],
            "kept_total": kept.get(person["id"], 0),
            "tone": mine[0]["tone"],
            "reflection": lines.get(person["id"], ""),
        })
    tones = {r["tone"] for r in new}
    return {
        "rant": rant,
        "safety": safety.OK,
        "resources": [],
        "groups": groups,
        "self_note": store.self_note_out(note) if note and tones & SELF_NOTE_TONES else None,
    }
