"""Gemini's translation check stays off the send path and stays quiet when it can't help."""

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.ai import gemini
from app.config import settings
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        yield c


def _mom_pieces(client) -> list[str]:
    rant = client.post("/api/rants/text", json={"text": "mom keeps calling and i keep letting it ring. no emergency. i just miss you."}).json()
    groups = client.post(f"/api/rants/{rant['id']}/sort").json()["groups"]
    mom = next(g for g in groups if g["person"]["id"] == "mom")
    return [p["id"] for p in mom["pieces"]]


def test_echo_is_quiet_without_keys(client):
    ids = _mom_pieces(client)
    res = client.post("/api/letters/echo", json={"recipient_id": "mom", "piece_ids": ids})
    assert res.status_code == 200
    assert res.json() == {"echo": None, "provider": "off"}
    home = client.get("/api/home").json()
    assert home["providers"]["gemini"] == "off"


def test_echo_rejects_someone_elses_lines(client):
    ids = _mom_pieces(client)
    res = client.post("/api/letters/echo", json={"recipient_id": "jordan", "piece_ids": ids})
    assert res.status_code == 400


def test_a_chatty_reading_is_dropped():
    assert gemini._too_long("i miss you", "i miss you and also here is a paragraph of advice " * 6)


def test_echo_parses_a_reading_and_ignores_placeholders(monkeypatch):
    class FakeResp:
        status_code = 200

        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": json.dumps({"reads_as": "i just miss you"})}]}}]}

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def post(self, *args, **kwargs):
            return FakeResp()

    monkeypatch.setattr(httpx, "AsyncClient", FakeClient)
    object.__setattr__(settings, "gemini_api_key", "test-key")
    try:
        import asyncio
        assert asyncio.run(gemini.echo("i just miss you", "बस याद आती है", "Hindi")) == "i just miss you"
        assert asyncio.run(gemini.echo("i just miss you", "[Hindi translation appears here]", "Hindi")) is None
    finally:
        object.__setattr__(settings, "gemini_api_key", "")
