"""The letter page's link preview, typed replies in mock mode, and the safety list."""

import re

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        c.post("/api/demo/clock", json={"reset": True})
        yield c


def _card(client, person: str, text: str, when: str) -> dict:
    rant = client.post("/api/rants/text", json={"text": text}).json()
    groups = {g["person"]["id"]: g for g in client.post(f"/api/rants/{rant['id']}/sort").json()["groups"]}
    ids = [p["id"] for p in groups[person]["pieces"]]
    return client.post("/api/cards", json={"recipient_id": person, "piece_ids": ids, "when": when}).json()


def _og_title(html: str) -> str:
    return re.search(r'<meta property="og:title" content="([^"]*)"', html).group(1)


def test_link_preview_names_the_sender_only_for_an_open_letter(client):
    sent = _card(client, "jordan", "Sarah, I miss the way we used to talk.", "now")
    assert sent["status"] == "ready"
    token = sent["share"]["url"].rsplit("/", 1)[1]
    page = client.get(f"/c/{token}").text
    assert _og_title(page) == "A letter from Riley"
    assert "I miss the way" not in page  # never a sentence of the letter
    assert re.search(r'<meta property="og:image" content="https?://[^"]+/app/icon-512.png"', page)

    held = _card(client, "mom", "Mumma, I miss you.", "her_morning")
    if held["status"] == "held":  # only while it's night where she is
        held_token = held["share"]["url"].rsplit("/", 1)[1]
        assert _og_title(client.get(f"/c/{held_token}").text) == "A letter"

    assert _og_title(client.get("/c/not-a-real-token").text) == "A letter"


def test_a_typed_reply_in_mock_mode_gets_no_canned_caption(client):
    card = _card(client, "mom", "Mumma, I made dal today.", "now")
    token = card["share"]["url"].rsplit("/", 1)[1]
    client.post(f"/api/cards/{card['id']}/shared")
    assert client.post(f"/api/public/cards/{token}/reply", data={"text": "Bas teri yaad aati hai."}).status_code == 200
    reply = next(r for r in client.get("/api/home").json()["replies"] if r["transcript"] == "Bas teri yaad aati hai.")
    assert reply["translation"] is None


def test_safety_resources_are_served(client):
    resources = client.get("/api/safety/resources").json()
    assert any("988" in r["detail"] for r in resources)
