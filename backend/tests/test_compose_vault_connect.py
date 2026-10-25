"""Task 6 (Oct 25 2026): Compose drafts and written lines, "Edit as a draft", the channel that sticks,
the pronoun in the release label, "Keep this moment", self-note length, and Connect photos (demo)."""

from fastapi.testclient import TestClient

import app.main  # noqa: F401  (initializes and seeds the test database)
from app import db, store

import pytest

client = TestClient(app.main.app)


@pytest.fixture
def alex():
    """A throwaway person, so these tests never touch the seeded cast the flow tests rely on."""
    with db.tx() as c:
        c.execute("INSERT OR REPLACE INTO people (id, name, relation, pronoun, channel, timezone) "
                  "VALUES ('alex', 'Alex', 'brother', 'him', 'whatsapp', 'America/New_York')")
    yield "alex"
    with db.tx() as c:
        for t in ("pieces", "drafts", "reminders"):
            c.execute(f"DELETE FROM {t} WHERE person_id = 'alex'")
        cards = [r[0] for r in c.execute("SELECT id FROM cards WHERE recipient_id = 'alex'")]
        for cid in cards:
            c.execute("DELETE FROM replies WHERE card_id = ?", (cid,))
        c.execute("DELETE FROM cards WHERE recipient_id = 'alex'")
        c.execute("DELETE FROM people WHERE id = 'alex'")


def test_a_draft_saves_privately_and_empty_deletes_it(alex):
    assert client.put("/api/drafts/alex", json={"text": "I keep starting this."}).status_code == 200
    drafts = {d["person_id"]: d["text"] for d in client.get("/api/drafts").json()}
    assert drafts["alex"] == "I keep starting this."
    client.put("/api/drafts/alex", json={"text": "   "})
    assert "alex" not in {d["person_id"] for d in client.get("/api/drafts").json()}
    assert client.put("/api/drafts/nobody", json={"text": "x"}).status_code == 404


def test_written_lines_become_pieces_verbatim_and_replace_the_old_ones(alex):
    first = client.post("/api/people/alex/pieces", json={"text": "An old line."}).json()
    keep = [first[0]["id"]]
    client.put("/api/drafts/alex", json={"text": "half"})
    res = client.post("/api/people/alex/pieces", json={"text": "First line.\n\n  Second line. \n", "replaces": keep})
    assert res.status_code == 200
    made = res.json()
    assert [p["text"] for p in made] == ["First line.", "Second line."]
    assert all(p["person_id"] == "alex" and p["audio_url"] is None for p in made)
    with db.tx() as c:
        status = c.execute("SELECT status FROM pieces WHERE id = ?", (keep[0],)).fetchone()["status"]
    assert status == "discarded"
    assert "alex" not in {d["person_id"] for d in client.get("/api/drafts").json()}  # the draft became the letter
    assert client.post("/api/people/alex/pieces", json={"text": "\n\n"}).status_code == 400


def test_the_channel_change_persists(alex):
    assert client.patch("/api/people/alex", json={"channel": "imessage"}).json()["channel"] == "imessage"
    assert store.get_person("alex")["channel"] == "imessage"
    assert client.patch("/api/people/alex", json={"channel": "fax"}).status_code == 400


def test_release_label_follows_the_pronoun(alex):
    from datetime import datetime, timezone

    from app import store as st
    now = datetime(2026, 10, 25, 7, 0, tzinfo=timezone.utc)  # 3 AM in New York: asleep, so it's held
    with db.tx() as c:
        c.execute("INSERT INTO cards (id, recipient_id, lines, status, release_at, token, created_at, expires_at) VALUES "
                  "('card_alex', 'alex', '[]', 'held', '2026-10-25T12:00:00+00:00', 'tok_alex', ?, ?)",
                  (now.isoformat(), now.isoformat()))
        row = c.execute("SELECT * FROM cards WHERE id = 'card_alex'").fetchone()
    label = st.card_out(row, now, with_share=False)["release_label"]
    assert label.endswith("his time") and "her time" not in label


def test_keep_this_moment(alex):
    with db.tx() as c:
        c.execute("INSERT INTO cards (id, recipient_id, lines, status, token, created_at, expires_at) VALUES "
                  "('card_alex_k', 'alex', '[]', 'released', 'tok_alex_k', '2026-10-24T00:00:00+00:00', "
                  "'2026-11-24T00:00:00+00:00')")
        c.execute("INSERT INTO replies (id, card_id, from_person_id, transcript, created_at) VALUES "
                  "('reply_alex', 'card_alex_k', 'alex', 'Proud of you.', '2026-10-24T01:00:00+00:00')")
    rid = "reply_alex"
    assert next(r for r in client.get("/api/home").json()["replies"] if r["id"] == rid)["kept_at"] is None
    kept = client.post(f"/api/replies/{rid}/keep").json()
    assert kept["kept_at"]
    assert client.post(f"/api/replies/{rid}/keep").json()["kept_at"] == kept["kept_at"]  # idempotent
    assert client.post("/api/replies/nope/keep").status_code == 404


def test_a_self_note_keeps_its_length():
    res = client.post(
        "/api/self-notes", files={"file": ("n.mp4", b"\x00" * 64, "video/mp4")}, data={"duration_ms": "4200"}
    )
    assert res.status_code == 200
    assert res.json()["duration_ms"] == 4200 and res.json()["label"] == "for the next hard day"


def test_connect_imports_demo_groups_and_links_only_when_he_says():
    assert client.get("/api/connect").json()["connected"] == {"photos": False, "instagram": False, "facebook": False}
    res = client.post("/api/connect/instagram").json()
    assert res["connected"]["instagram"] and res["added"] == 5
    assert client.post("/api/connect/instagram").json()["added"] == 0  # idempotent
    client.post("/api/connect/facebook")
    faces = client.get("/api/faces").json()
    by_id = {c["id"]: c for c in faces["clusters"]}
    assert by_id["c_michael"]["count"] == 2 and by_id["c_michael"]["suggested"]["name"] == "Michael"
    assert by_id["c_michael"]["sources"] == ["Instagram"]
    assert by_id["c_mom"]["sources"] == ["Facebook"] and by_id["c_sarah"]["count"] == 4
    assert by_id["c_unknown"]["suggested"] is None
    assert set(faces["pending"]) == {"c_mom", "c_sarah", "c_michael", "c_unknown"}

    def michael_photos():
        people = client.get("/api/people/groups").json()["people"]
        return [p for e in people if e["person"]["id"] == "priya" for p in e["photos"]]

    before = len(michael_photos())  # nothing linked yet
    assert client.post("/api/faces/c_michael/link", json={"person_id": "priya"}).json()["linked"] == 2
    assert len(michael_photos()) == before + 2
    one = by_id["c_michael"]["photos"][0]["id"]
    assert client.post(f"/api/faces/photos/{one}/not-them").status_code == 200
    assert len(michael_photos()) == before + 1
    faces = client.get("/api/faces").json()
    assert "c_michael" not in faces["pending"]
    assert client.get(by_id["c_mom"]["photos"][0]["url"]).status_code == 200
    assert client.post("/api/faces/c_unknown/link", json={"person_id": "me"}).status_code == 404
    # "Name this person": the unsuggested group, named by him
    assert client.post("/api/faces/c_unknown/link", json={"person_id": "priya"}).json()["linked"] == 3
    assert len(michael_photos()) == before + 4
    client.post("/api/faces/dismiss")
    assert client.get("/api/faces").json()["dismissed"] is True


def test_talk_from_a_person_page_files_unaddressed_words_under_them():
    plain = client.post("/api/rants/text", json={"text": "Long day. Nothing went right."}).json()
    assert client.post(f"/api/rants/{plain['id']}/sort").json()["groups"] == []  # nobody named, no hint: just for him

    rant = client.post("/api/rants/text", json={"text": "I keep thinking about the lake. You were right."}).json()
    res = client.post(f"/api/rants/{rant['id']}/sort", json={"person_id": "priya"}).json()
    assert [g["person"]["id"] for g in res["groups"]] == ["priya"]
    assert res["groups"][0]["pieces"][0]["text"] == "I keep thinking about the lake. You were right."
    # the hint never overrides a sort that found someone, and "me" is not a recipient
    named = client.post("/api/rants/text", json={"text": "Mumma, I'm sorry I missed your call."}).json()
    res = client.post(f"/api/rants/{named['id']}/sort", json={"person_id": "priya"}).json()
    assert [g["person"]["id"] for g in res["groups"]] == ["mom"]
    other = client.post("/api/rants/text", json={"text": "Just tired."}).json()
    assert client.post(f"/api/rants/{other['id']}/sort", json={"person_id": "me"}).json()["groups"] == []


def test_start_swaps_old_drawn_imports_for_the_current_demo_photos():
    from app import connect

    client.post("/api/connect/photos")
    old = store.save_media("photos", "imp_photos_mom_1.jpg", b"\xff\xd8drawn")  # same name, older drawn file
    stale = store.save_media("photos", "imp_photos_unknown_1.jpg", b"\xff\xd8drawn")
    with db.tx() as c:
        c.execute("INSERT OR IGNORE INTO photos (id, person_id, path, caption, created_at, source, cluster, removed) "
                  "VALUES ('photo_imp_photos_unknown_1', NULL, ?, '', '2026-10-25T00:00:00+00:00', 'photos', 'c_unknown', 0)", (stale,))
    connect.refresh_imports()
    with db.tx() as c:
        assert c.execute("SELECT 1 FROM photos WHERE id = 'photo_imp_photos_unknown_1'").fetchone() is None
    assert store.media_path(old).stat().st_size == (connect.IMPORT_MEDIA / "photos_mom_1.jpg").stat().st_size
