"""Connect photos (DESIGN_SPEC 3.13), demo build.

There is no face recognition in Un-Said and no Meta Graph API connection here.
Connecting a source imports a small set of fictional demo photos (app/seed_media/import)
that are already put into groups ("clusters"), each with a suggested person, the way an
on-device grouping would hand them over. Nothing is linked to anyone until he says so:
accepting a suggestion, or picking who an unknown group is, sets photos.person_id, and
then the photos show up on that person in the People tab. "not them" takes one photo out.
"""

from datetime import datetime
from pathlib import Path

from . import db, store

SOURCES = {"photos": "Photos", "instagram": "Instagram", "facebook": "Facebook"}
IMPORT_MEDIA = Path(__file__).parent / "seed_media" / "import"

# cluster id -> the person it is suggested to be (None: "Name this person")
CLUSTERS = {"c_mom": "mom", "c_sarah": "jordan", "c_michael": "priya", "c_unknown": None}
_FILE_CLUSTER = {"mom": "c_mom", "sarah": "c_sarah", "michael": "c_michael", "unknown": "c_unknown"}


def connected() -> dict[str, bool]:
    return {s: db.kv_get(f"connect_{s}") == "1" for s in SOURCES}


def connect(source: str, now: datetime) -> int:
    """Marks the source connected and imports its demo photos (insert-if-missing). Returns how many were new."""
    added = 0
    with db.tx() as c:
        _drop_stale_imports(c)
        for f in sorted(IMPORT_MEDIA.glob(f"{source}_*.jpg")):
            who = f.stem.split("_")[1]
            pid = f"photo_imp_{f.stem}"
            rel = f"photos/imp_{f.name}"
            dest = store.media_path(rel)
            if not dest.exists() or dest.stat().st_size != f.stat().st_size:  # missing, or an older drawn version
                store.save_media("photos", f"imp_{f.name}", f.read_bytes())
            added += c.execute(
                "INSERT OR IGNORE INTO photos (id, person_id, path, caption, taken_at, created_at, source, cluster, removed) "
                "VALUES (?, NULL, ?, '', NULL, ?, ?, ?, 0)",
                (pid, rel, db.iso(now), source, _FILE_CLUSTER[who]),
            ).rowcount
    db.kv_set(f"connect_{source}", "1")
    if added:
        db.kv_set("faces_dismissed", "")
    return added


def _drop_stale_imports(c) -> None:
    """Imports from an older build whose file is gone from app/seed_media/import (the drawn ones)."""
    current = {f"photo_imp_{f.stem}" for f in IMPORT_MEDIA.glob("*.jpg")}
    for row in c.execute("SELECT id, path FROM photos WHERE id LIKE 'photo_imp_%'").fetchall():
        if row["id"] not in current:
            c.execute("DELETE FROM photos WHERE id = ?", (row["id"],))
            store.media_path(row["path"]).unlink(missing_ok=True)


def refresh_imports() -> None:
    """On start: drop stale imports, and re-import any connected source's current photos."""
    with db.tx() as c:
        _drop_stale_imports(c)
    from . import timeutil
    for s, on in connected().items():
        if on:
            connect(s, timeutil.now_utc())


def clusters(now: datetime) -> list[dict]:
    people = {p["id"]: p for p in store.list_people()}
    with db.tx() as c:
        rows = c.execute(
            "SELECT * FROM photos WHERE cluster IS NOT NULL AND removed = 0 ORDER BY source, id"
        ).fetchall()
    out = []
    for cid, suggested in CLUSTERS.items():
        photos = [r for r in rows if r["cluster"] == cid]
        if not photos:
            continue
        if suggested and suggested not in people:
            suggested = None
        linked = {r["person_id"] for r in photos if r["person_id"]}
        out.append({
            "id": cid,
            "suggested": store.person_out(people[suggested], now) if suggested else None,
            "linked_person_id": next(iter(linked)) if len(linked) == 1 and all(r["person_id"] for r in photos) else None,
            "count": len(photos),
            "sources": [SOURCES[s] for s in SOURCES if any(r["source"] == s for r in photos)],
            "photos": [store.photo_out(r) for r in photos],
        })
    return out


def link(cluster: str, person_id: str) -> int:
    with db.tx() as c:
        return c.execute(
            "UPDATE photos SET person_id = ? WHERE cluster = ? AND removed = 0", (person_id, cluster)
        ).rowcount


def not_them(photo_id: str) -> bool:
    with db.tx() as c:
        return bool(c.execute(
            "UPDATE photos SET removed = 1, person_id = NULL WHERE id = ? AND cluster IS NOT NULL", (photo_id,)
        ).rowcount)


def pending(now: datetime) -> list[dict]:
    """Groups he hasn't put a name to yet: what the "We found N people" sheet shows."""
    return [c for c in clusters(now) if not c["linked_person_id"]]
