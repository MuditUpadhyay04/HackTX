"""A rant goes in; pieces for each person come out, or the safety screen does."""

import json
import logging
from datetime import datetime, timedelta

from . import attention, audio, db, memory, safety, sorting, store, timeutil, voice
from .ai import spark
from .config import settings

log = logging.getLogger("unsaid.rants")

# Tones that bring back the video he left himself "for the next hard day".
SELF_NOTE_TONES = {"overwhelmed", "lonely", "tired", "hurt"}

# "Tell them how you feel." stays quiet if he already reached out to them this recently.
RECENTLY_SENT = timedelta(days=7)


def language_bias() -> list[str]:
    home = store.me()["language"]
    return ["English"] if home.lower() == "english" else ["English", home]


def keywords() -> list[str]:
    words: list[str] = []
    for p in store.list_people():
        words += [p["name"], *p["aliases"]]
    return list(dict.fromkeys(w for w in words if len(w) > 2))[:50]


def save_rant(turns: list[dict], pcm: bytes | None, provider: str, asset_id: str | None = None) -> dict:
    """asset_id: the device photo he was looking at while he talked, if any."""
    turns = [t for t in turns if (t.get("text") or "").strip()]
    if not turns:
        raise ValueError("nothing was heard")
    transcript, _ = sorting.build_segments([t["text"] for t in turns])
    rant_id = db.new_id("rant")
    audio_path = store.save_media("rants", f"{rant_id}.wav", audio.pcm_to_wav(pcm)) if pcm else None
    with db.tx() as c:
        c.execute(
            "INSERT INTO rants (id, created_at, provider, transcript, turns, audio_path, asset_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                rant_id, db.iso(timeutil.now_utc()), provider, transcript, json.dumps(turns, ensure_ascii=False),
                audio_path, memory.clean_asset_id(asset_id),
            ),
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
        "asset_id": row["asset_id"],
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
    now_dt = timeutil.now_utc()
    now = db.iso(now_dt)
    if flag != safety.OK:
        with db.tx() as c:
            c.execute("UPDATE rants SET safety = ?, sorted_by = ?, sorted_at = ? WHERE id = ?", (flag, sorted_by, now, rant_id))
        return sort_result(rant_id)

    person_ids = {p["id"] for p in people}
    pieces = sorting.validate_pieces(raw.get("pieces"), segments, person_ids)
    spoken_about = [p["id"] for p in people if any(piece["person"] == p["id"] for piece in pieces)]
    # Decided once, before this rant's pieces exist, and kept, so sorting twice says the same thing.
    encourage = _choose_encourage(rant_id, row["asset_id"], spoken_about, now_dt)
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
        c.execute(
            "UPDATE rants SET safety = 'ok', sorted_by = ?, sorted_at = ?, encourage_person = ? WHERE id = ?",
            (sorted_by, now, encourage, rant_id),
        )
    memory.link(row["asset_id"], spoken_about, now_dt)
    if encourage:
        attention.record("encourage", now_dt, person_id=encourage, asset_id=row["asset_id"])
    return sort_result(rant_id)


def _choose_encourage(rant_id: str, asset_id: str | None, spoken_about: list[str], now: datetime) -> str | None:
    """Who, if anyone, hears "Tell them how you feel. Communication helps." after this rant.

    At most one person, and only if he has said something to them before (kept lines,
    or an earlier recording on this same photo), nothing to them is waiting or went out
    this week, and the line hasn't been shown for them in 72 h. Most words held wins.
    """
    best: tuple[int, str] | None = None
    for person_id in spoken_about:
        with db.tx() as c:
            kept_before = c.execute(
                "SELECT COUNT(*) FROM pieces WHERE person_id = ? AND status = 'kept' AND (rant_id IS NULL OR rant_id != ?)",
                (person_id, rant_id),
            ).fetchone()[0]
            busy = c.execute(
                "SELECT COUNT(*) FROM cards WHERE recipient_id = ? AND (status IN ('held', 'releasing', 'ready') "
                "OR (status = 'released' AND released_at >= ?))",
                (person_id, db.iso(now - RECENTLY_SENT)),
            ).fetchone()[0]
        here_before = memory.times_before(asset_id, person_id, rant_id)
        if not (kept_before or here_before) or busy:
            continue
        if attention.shown_recently("encourage", person_id, attention.ENCOURAGE_COOLDOWN, now):
            continue
        weight = kept_before + here_before
        if best is None or weight > best[0]:
            best = (weight, person_id)
    return best[1] if best else None


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
        row = c.execute("SELECT sorted_at, encourage_person FROM rants WHERE id = ?", (rant_id,)).fetchone()
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
            "history": _history(person["id"], rant_id, row["sorted_at"]),
            "encourage": voice.ENCOURAGE if person["id"] == row["encourage_person"] else None,
        })
    tones = {r["tone"] for r in new}
    return {
        "rant": rant,
        "safety": safety.OK,
        "resources": [],
        "groups": groups,
        "self_note": store.self_note_out(note) if note and tones & SELF_NOTE_TONES else None,
    }


def _history(person_id: str, rant_id: str, cutoff: str | None) -> dict:
    """What he had said about this person before this rant (stable across re-sorts)."""
    with db.tx() as c:
        row = c.execute(
            "SELECT COUNT(*) AS n, MIN(created_at) AS first, MAX(created_at) AS last FROM pieces "
            "WHERE person_id = ? AND status != 'discarded' AND (rant_id IS NULL OR rant_id != ?) AND created_at <= ?",
            (person_id, rant_id, cutoff or db.iso(timeutil.now_utc())),
        ).fetchone()
    return {"earlier_count": row["n"], "first_at": row["first"], "last_spoken_at": row["last"]}
