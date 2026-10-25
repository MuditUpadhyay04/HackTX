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


def test_gemini_answers_when_spark_is_refused(monkeypatch):
    """Meta refused Spark from our Vultr VM (model_not_found). Gemini takes the same call, and says so."""
    import asyncio

    from app.ai import spark

    async def refused(*args, **kwargs):
        raise spark.SparkError('spark 404: {"error":{"code":"model_not_found"}}')

    async def gemini_sort(system, user, schema, max_tokens=4000):
        assert schema["required"] == ["safety"]  # Gemini gets Spark's exact schema
        return {"safety": "ok"}

    monkeypatch.setattr(spark, "_muse", refused)
    monkeypatch.setattr(gemini, "chat_json", gemini_sort)
    object.__setattr__(settings, "gemini_api_key", "test-key")
    try:
        assert asyncio.run(spark.classify_safety("i miss home")) == "ok"
        assert spark.served_by["spark"] == "gemini (fallback)"
    finally:
        object.__setattr__(settings, "gemini_api_key", "")
        spark.served_by["spark"] = "not used yet"

    with pytest.raises(spark.SparkError):  # no Gemini key: Spark's error stands
        asyncio.run(spark.classify_safety("i miss home"))


def test_a_refused_spark_is_skipped_for_a_while(monkeypatch):
    """After Meta refuses Spark, later calls go straight to Gemini instead of paying the round trip."""
    import asyncio

    from app.ai import spark

    calls = {"meta": 0}

    async def refused(*args, **kwargs):
        calls["meta"] += 1
        raise spark.SparkError("spark 404: model_not_found", refused=True)

    async def gemini_answer(system, user, schema, max_tokens=4000):
        return {"safety": "ok"}

    monkeypatch.setattr(spark, "_muse", refused)
    monkeypatch.setattr(gemini, "chat_json", gemini_answer)
    monkeypatch.setattr(spark, "_skip_meta_until", 0.0)
    object.__setattr__(settings, "gemini_api_key", "test-key")
    object.__setattr__(settings, "model_api_key", "test-meta-key")
    try:
        asyncio.run(spark.classify_safety("i miss home"))
        asyncio.run(spark.classify_safety("i miss home"))
        assert calls["meta"] == 1
    finally:
        object.__setattr__(settings, "gemini_api_key", "")
        object.__setattr__(settings, "model_api_key", "")
        spark.served_by["spark"] = "not used yet"


def test_the_vultr_gpu_answers_first_then_meta_then_gemini(monkeypatch):
    """With SPARK_GPU_BASE set, our own Muse on the Vultr GPU sorts first; if it's down, Meta's API; then Gemini."""
    import asyncio

    from app.ai import spark

    tried = []

    async def muse(system, user, schema, name, effort, max_tokens, gpu=False):
        tried.append("gpu" if gpu else "meta")
        if gpu and down["gpu"]:
            raise spark.SparkError("gpu spark unreachable: ConnectError")
        return {"safety": "ok"}

    down = {"gpu": False}
    monkeypatch.setattr(spark, "_muse", muse)
    monkeypatch.setattr(spark, "_skip_meta_until", 0.0)
    object.__setattr__(settings, "spark_gpu_base", "http://gpu.test/v1")
    object.__setattr__(settings, "model_api_key", "test-meta-key")
    try:
        assert asyncio.run(spark.classify_safety("i miss home")) == "ok"
        assert tried == ["gpu"] and spark.served_by["spark"] == settings.spark_gpu_label
        assert spark.short_provider() == "muse-gpu"
        down["gpu"] = True
        tried.clear()
        asyncio.run(spark.classify_safety("i miss home"))
        assert tried == ["gpu", "meta"] and spark.served_by["spark"] == "meta"
    finally:
        object.__setattr__(settings, "spark_gpu_base", "")
        object.__setattr__(settings, "model_api_key", "")
        spark.served_by["spark"] = "not used yet"
