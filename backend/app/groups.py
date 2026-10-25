"""People, grouped by who they are to him, each with the photos of them.

There is no face recognition anywhere in Un-Said. A photo belongs to a person
because he gave it to them: `photos.person_id` (a photo he attached to a letter
or brought in for them) and `photo_links` (a gallery photo he talked about them
on, or sent them; device asset ids, which only his phone can open).
"""

from datetime import datetime

from . import db, store

# people.relation (free text) -> one of these groups. Family is mom, dad, brother, sister.
GROUPS = ["mom", "dad", "brother", "sister", "best_friend", "partner", "other"]
FAMILY = {"mom", "dad", "brother", "sister"}

_RELATION_GROUP = {
    "mom": "mom", "mother": "mom", "mum": "mom", "mama": "mom",
    "dad": "dad", "father": "dad", "papa": "dad",
    "brother": "brother", "bro": "brother",
    "sister": "sister", "sis": "sister",
    "best friend": "best_friend", "bestfriend": "best_friend", "best_friend": "best_friend",
    "girlfriend": "partner", "boyfriend": "partner", "partner": "partner", "wife": "partner",
    "husband": "partner", "fiance": "partner", "fiancee": "partner",
}


def group_of(relation: str | None) -> str:
    return _RELATION_GROUP.get((relation or "").strip().lower().replace("-", " "), "other")


def people_groups(now: datetime) -> dict:
    people = store.list_people()
    with db.tx() as c:
        photos = c.execute(
            "SELECT * FROM photos WHERE person_id IS NOT NULL ORDER BY taken_at DESC, created_at DESC"
        ).fetchall()
        links = c.execute("SELECT asset_id, person_id FROM photo_links ORDER BY last_at DESC").fetchall()
    by_person: dict[str, list[dict]] = {}
    for row in photos:
        by_person.setdefault(row["person_id"], []).append(store.photo_out(row))
    assets: dict[str, list[str]] = {}
    for row in links:
        assets.setdefault(row["person_id"], []).append(row["asset_id"])

    out = []
    for p in people:
        out.append({
            "person": store.person_out(p, now),
            "group": group_of(p["relation"]),
            "family": group_of(p["relation"]) in FAMILY,
            "photos": by_person.get(p["id"], []),
            "asset_ids": assets.get(p["id"], []),
        })
    present = {entry["group"] for entry in out}
    return {
        "groups": [g for g in GROUPS if g in present],
        "has_family": bool(present & FAMILY),
        "people": out,
    }
