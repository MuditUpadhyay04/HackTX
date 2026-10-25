"""Photo memory: which people a photo is about, learned only from what he said
while looking at it (and the letters he sent with it). No face recognition.

It powers "you said this here before" on a photo, the knock that only comes
for photos of people he has words for, and his own voice played back to him.
"""

from datetime import datetime

from . import audio, db, store, timeutil, voice

ASSET_ID_MAX = 300
PREVIOUS_LIMIT = 12


def clean_asset_id(value: str | None) -> str | None:
    """A server photo's URL (demo-data mode) is keyed by its path after /media/, so it matches on any host."""
    value = (value or "").strip()
    if "/media/" in value and "://" in value:
        value = "/media/" + value.split("/media/", 1)[1].split("?", 1)[0]
    return value[:ASSET_ID_MAX] or None


def link(asset_id: str | None, person_ids: list[str], now: datetime, *, letter: bool = False) -> None:
    """A recording on this photo was about these people (or a letter to them carried it)."""
    if not asset_id or not person_ids:
        return
    times, letters = (0, 1) if letter else (1, 0)
    with db.tx() as c:
        for person_id in dict.fromkeys(person_ids):
            c.execute(
                "INSERT INTO photo_links (asset_id, person_id, times, letters, first_at, last_at) VALUES (?, ?, ?, ?, ?, ?) "
                "ON CONFLICT (asset_id, person_id) DO UPDATE SET times = times + excluded.times, "
                "letters = letters + excluded.letters, last_at = excluded.last_at",
                (asset_id, person_id, times, letters, db.iso(now), db.iso(now)),
            )


def times_before(asset_id: str | None, person_id: str, rant_id: str) -> int:
    """Earlier recordings on this photo that were about this person (not counting this rant)."""
    if not asset_id:
        return 0
    with db.tx() as c:
        row = c.execute(
            "SELECT COUNT(DISTINCT r.id) FROM rants r JOIN pieces p ON p.rant_id = r.id "
            "WHERE r.asset_id = ? AND p.person_id = ? AND r.id != ?",
            (asset_id, person_id, rant_id),
        ).fetchone()
    return row[0]


def kept_counts() -> dict[str, int]:
    with db.tx() as c:
        return {
            r["person_id"]: r["n"]
            for r in c.execute("SELECT person_id, COUNT(*) AS n FROM pieces WHERE status = 'kept' GROUP BY person_id")
        }


def photo_memory(asset_id: str, now: datetime) -> dict:
    me = store.me()
    people = {p["id"]: p for p in store.list_people()}
    kept = kept_counts()
    with db.tx() as c:
        links = c.execute(
            "SELECT * FROM photo_links WHERE asset_id = ? ORDER BY last_at DESC, times DESC", (asset_id,)
        ).fetchall()
        previous = c.execute(
            "SELECT p.* FROM pieces p JOIN rants r ON r.id = p.rant_id "
            "WHERE r.asset_id = ? AND p.status != 'discarded' ORDER BY p.created_at DESC, p.rowid DESC LIMIT ?",
            (asset_id, PREVIOUS_LIMIT),
        ).fetchall()
        # "Take that step." shows on this photo while his latest rant chose someone this photo is about.
        latest = c.execute(
            "SELECT step_person FROM rants WHERE sorted_at IS NOT NULL ORDER BY sorted_at DESC, rowid DESC LIMIT 1"
        ).fetchone()
    step_person = latest["step_person"] if latest else None
    linked = {r["person_id"] for r in links}
    return {
        "step": (
            {"line": voice.TAKE_THAT_STEP, "person_id": step_person}
            if step_person and step_person in linked and step_person in people else None
        ),
        "asset_id": asset_id,
        "people": [
            {
                "person": store.person_out(people[link_row["person_id"]], now),
                "times": link_row["times"],
                "letters": link_row["letters"],
                "first_at": link_row["first_at"],
                "last_at": link_row["last_at"],
                "kept": kept.get(link_row["person_id"], 0),
            }
            for link_row in links
            if link_row["person_id"] in people
        ],
        "previous": [
            {
                **store.piece_out(row),
                "person_name": people[row["person_id"]]["name"] if row["person_id"] in people else "",
                "day": timeutil.day_phrase(db.parse_iso(row["created_at"]), now, me["timezone"]),
            }
            for row in previous
        ],
        "kept_by_person": kept,
    }


def piece_audio(piece_id: str) -> bytes | None:
    """His own voice for one piece: the stretch of the rant it came from, as WAV."""
    with db.tx() as c:
        row = c.execute(
            "SELECT p.audio_start_ms, p.audio_end_ms, r.audio_path FROM pieces p JOIN rants r ON r.id = p.rant_id WHERE p.id = ?",
            (piece_id,),
        ).fetchone()
    if not row or row["audio_start_ms"] is None or not row["audio_path"]:
        return None
    path = store.media_path(row["audio_path"])
    if not path.exists():
        return None
    pcm, _ = audio.wav_to_pcm(path.read_bytes())
    return audio.pcm_to_wav(audio.slice_ms(pcm, row["audio_start_ms"], row["audio_end_ms"]))
