"""Try-it guests: a private sandbox per X-Guest-Id, nothing sent, the main app untouched."""

import os
import time
import uuid

import pytest
from fastapi.testclient import TestClient

from app import guests
from app.config import settings
from app.main import app


def gid() -> str:
    return uuid.uuid4().hex


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        yield c


def as_guest(guest: str) -> dict:
    return {"X-Guest-Id": guest}


def _rant(client, text: str, headers: dict | None = None) -> str:
    return client.post("/api/rants/text", json={"text": text}, headers=headers or {}).json()["id"]


def test_each_guest_has_a_private_seeded_sandbox(client):
    a, b = gid(), gid()
    home = client.get("/api/home", headers=as_guest(a)).json()
    assert [p["name"] for p in home["people"]][:3] == ["Mom", "Sarah", "Michael"]
    assert (settings.data_dir / "guests" / a / "unsaid.db").exists()
    assert client.get("/api/settings", headers=as_guest(a)).json()["knock_mode"] == "try"
    assert client.get("/api/settings").json()["knock_mode"] != "try"  # the main app keeps its own

    ra = _rant(client, "Sarah, I miss us.", as_guest(a))
    rb = _rant(client, "Mumma, I miss your dal.", as_guest(b))
    rmain = _rant(client, "Michael, that reel was funny.")
    assert client.get(f"/api/rants/{ra}", headers=as_guest(a)).status_code == 200
    assert client.get(f"/api/rants/{ra}", headers=as_guest(b)).status_code == 404
    assert client.get(f"/api/rants/{ra}").status_code == 404
    assert client.get(f"/api/rants/{rb}", headers=as_guest(a)).status_code == 404
    assert client.get(f"/api/rants/{rmain}", headers=as_guest(a)).status_code == 404
    assert client.get(f"/api/rants/{rmain}").status_code == 200

    sort = client.post(f"/api/rants/{ra}/sort", headers=as_guest(a)).json()
    assert [g["person"]["id"] for g in sort["groups"]] == ["jordan"]


def test_guests_see_the_shared_photos_without_copies(client):
    g = gid()
    photos = client.get("/api/photos", headers=as_guest(g)).json()
    urls = [p["url"] for p in (photos if isinstance(photos, list) else photos.get("photos", []))]
    jpgs = [u for u in urls if u.endswith(".jpg")]
    assert jpgs and all(u.startswith("/media/") for u in jpgs)
    assert client.get(jpgs[0]).status_code == 200
    own = settings.data_dir / "guest_media" / g / "photos"
    assert not any(p.suffix == ".jpg" for p in own.glob("*")) if own.exists() else True


def test_the_try_knock_comes_after_five_seconds(client):
    g = gid()
    photos = client.get("/api/photos", headers=as_guest(g)).json()
    url = next(p["url"] for p in (photos if isinstance(photos, list) else photos.get("photos", [])) if p["url"].endswith(".jpg"))
    early = client.post("/api/knock/check", json={"asset_id": url, "dwell_ms": 4900, "session_id": "s"}, headers=as_guest(g)).json()
    assert early["knock"] is False
    knock = client.post("/api/knock/check", json={"asset_id": url, "dwell_ms": 5000, "session_id": "s"}, headers=as_guest(g)).json()
    assert knock["knock"] is True
    assert knock["body"] == "Let them know you're thinking about them."
    assert knock["prompt"] == "Send the words you're keeping to yourself. They're waiting for your answer."


def test_nothing_is_sent_from_the_try_app(client):
    g = gid()
    detail = {"detail": "This is a preview. Nothing is sent from the try-it app."}
    r = client.post("/api/cards", json={"recipient_id": "mom", "piece_ids": ["x"], "when": "now"}, headers=as_guest(g))
    assert r.status_code == 403 and r.json() == detail
    for path in ("/api/cards/card_x/shared", "/api/cards/card_x/revoke", "/api/demo/reset", "/api/push/register"):
        assert client.post(path, json={}, headers=as_guest(g)).status_code == 403
    assert client.get("/api/demo/state", headers=as_guest(g)).status_code == 403


def test_bad_guest_ids_are_refused(client):
    for bad in ("short", "Z" * 32, gid() + "0", "../" + gid()[:29]):
        assert client.get("/api/home", headers={"X-Guest-Id": bad}).status_code == 400


def test_sorting_is_rate_limited_per_guest(client, monkeypatch):
    g = gid()
    monkeypatch.setattr(guests, "SORTS_PER_HOUR", 2)
    rant = _rant(client, "Sarah, I miss us.", as_guest(g))
    assert client.post(f"/api/rants/{rant}/sort", headers=as_guest(g)).status_code == 200
    assert client.post(f"/api/rants/{rant}/sort", headers=as_guest(g)).status_code == 200
    third = client.post(f"/api/rants/{rant}/sort", headers=as_guest(g))
    assert third.status_code == 429 and "Take a breath" in third.json()["detail"]
    assert client.post(f"/api/rants/{rant}/sort", headers=as_guest(gid())).status_code in (200, 404)  # others unaffected


def test_old_and_extra_guests_are_removed(client, monkeypatch):
    old, new = gid(), gid()
    client.get("/api/home", headers=as_guest(old))
    client.get("/api/home", headers=as_guest(new))
    stale = time.time() - guests.MAX_AGE_S - 60
    (settings.data_dir / "guests" / old / ".seen").write_text(str(int(stale)))
    guests.prune()
    assert not (settings.data_dir / "guests" / old).exists()
    assert not (settings.data_dir / "guest_media" / old).exists()
    assert (settings.data_dir / "guests" / new).exists()
    assert (settings.data_dir / "unsaid.db").exists()  # the main app is never touched

    monkeypatch.setattr(guests, "MAX_GUESTS", 2)
    guests.prune()
    assert len([d for d in (settings.data_dir / "guests").iterdir() if guests.valid(d.name)]) <= 1
    # A pruned guest just starts over, seeded again.
    assert client.get("/api/home", headers=as_guest(old)).status_code == 200


def test_without_the_header_nothing_changes(client):
    assert client.get("/api/home").status_code == 200
    assert client.post("/api/demo/reset").status_code == 200
    assert os.path.basename(str(settings.db_path)) == "unsaid.db" and "guests" not in str(settings.db_path)


def test_simultaneous_first_requests_seed_once(client):
    import concurrent.futures

    g = gid()
    with concurrent.futures.ThreadPoolExecutor(8) as pool:
        codes = list(pool.map(lambda _: client.get("/api/home", headers=as_guest(g)).status_code, range(8)))
    assert codes == [200] * 8
    assert (settings.data_dir / "guests" / g / ".seeded").exists()
    assert len(client.get("/api/home", headers=as_guest(g)).json()["people"]) >= 3


def test_a_half_made_guest_is_rebuilt(client):
    g = gid()
    folder = settings.data_dir / "guests" / g
    folder.mkdir(parents=True)
    (folder / "unsaid.db").write_bytes(b"not a database")  # a crash mid-seed: no .seeded marker
    assert client.get("/api/home", headers=as_guest(g)).status_code == 200
    assert (folder / ".seeded").exists()


def test_guest_media_paths_stay_inside_their_folder(client):
    from app import store
    from app.config import GUEST

    token = GUEST.set(gid())
    try:
        with pytest.raises(ValueError):
            store.media_path("../../unsaid.db")
        with pytest.raises(ValueError):
            store.save_media("../escape", "x.txt", b"x")
    finally:
        GUEST.reset(token)


def test_guest_uploads_are_capped(client):
    g = gid()
    big = client.post("/api/rants/audio", headers={**as_guest(g), "Content-Length": str(6 * 1024 * 1024)}, content=b"x")
    assert big.status_code == 413
    import io
    import struct
    import wave

    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(24000)
        w.writeframes(struct.pack("<h", 0) * 24000 * 61)  # 61 s
    long = client.post("/api/rants/audio", headers=as_guest(g), files={"file": ("r.wav", buf.getvalue(), "audio/wav")})
    assert long.status_code == 413 and "under a minute" in long.json()["detail"]


def test_a_guest_gets_a_kind_503_when_every_model_is_down(client, monkeypatch):
    from app import rants
    from app.ai import spark

    async def down(*args, **kwargs):
        raise spark.SparkError("all models down")

    g = gid()
    rant = _rant(client, "Sarah, I miss us.", as_guest(g))
    monkeypatch.setattr(spark, "sort_rant", down)
    object.__setattr__(settings, "model_api_key", "test-key")
    try:
        r = client.post(f"/api/rants/{rant}/sort", headers=as_guest(g))
        assert r.status_code == 503 and r.json()["detail"] == guests.MODELS_DOWN
        main_rant = _rant(client, "Sarah, I miss us.")
        assert client.post(f"/api/rants/{main_rant}/sort").status_code == 200  # the main app keeps its mock fallback
    finally:
        object.__setattr__(settings, "model_api_key", "")
    assert rants.GuestModelsDown


def test_unexpected_errors_are_a_kind_503_for_guests(client, monkeypatch):
    from app import store

    def boom():
        raise RuntimeError("boom")

    monkeypatch.setattr(store, "list_people", boom)
    with TestClient(app, raise_server_exceptions=False) as c:
        r = c.get("/api/people", headers=as_guest(gid()))
    assert r.status_code == 503 and r.json()["detail"] == guests.HICCUP


def test_live_socket_runs_in_the_guest_sandbox(client):
    g = gid()
    with client.websocket_connect(f"/api/rants/live?guest={g}") as ws:
        ws.send_json({"type": "start", "asset_id": None})
        assert ws.receive_json()["type"] == "ready"
        ws.send_bytes(b"\x00\x00" * 24000)
        ws.send_json({"type": "stop"})
        while (event := ws.receive_json())["type"] != "done":
            pass
    rant_id = event["rant"]["id"]
    assert client.get(f"/api/rants/{rant_id}", headers=as_guest(g)).status_code == 200
    assert client.get(f"/api/rants/{rant_id}").status_code == 404
    from starlette.websockets import WebSocketDisconnect

    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/api/rants/live?guest=nothex") as ws:
            ws.receive_json()


def test_cors_preflight_allows_the_guest_header_and_health_is_unchanged(client):
    pre = client.options("/api/home", headers={
        "Origin": "https://try.45-32-200-63.sslip.io",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "x-guest-id,x-app-key",
    })
    assert pre.status_code == 200
    assert "x-guest-id" in pre.headers["access-control-allow-headers"].lower()
    refused = client.get("/api/home", headers={"X-Guest-Id": "bad", "Origin": "https://try.45-32-200-63.sslip.io"})
    assert refused.status_code == 400 and refused.headers.get("access-control-allow-origin")
    plain = client.get("/api/health").json()
    assert client.get("/api/health", headers=as_guest(gid())).json() == plain


def test_a_new_guest_is_ready_fast(client):
    client.get("/api/home", headers=as_guest(gid()))  # the template is built once per process
    started = time.perf_counter()
    assert client.get("/api/home", headers=as_guest(gid())).status_code == 200
    assert time.perf_counter() - started < 0.6  # copy, not reseed (generous for CI; ~50 ms locally)
