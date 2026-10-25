"""Muse Spark over Meta Model API's Chat Completions, with schema-constrained output.

Spark has two jobs here: point at sentences (never write them), and translate
words he already approved. It also writes Unsaid's one short reflection line.
"""

import json
import logging

import httpx

from ..config import settings
from ..sorting import TONES
from . import gemini

log = logging.getLogger("unsaid.spark")

SAFETY_VALUES = ["ok", "self_harm", "harm_to_others", "abuse_or_control"]

# Who answered the last Spark call: "meta", or "gemini (fallback)" when Meta refused this host.
served_by = {"spark": "meta"}


class SparkError(RuntimeError):
    pass


async def chat_json(system: str, user: str, schema: dict, name: str, effort: str = "low", max_tokens: int = 4000) -> dict:
    """Muse Spark first. When Spark doesn't answer (refused from this host, down, or unreachable)
    and a Gemini key is set, Gemini answers the same prompt and schema, and providers() says so."""
    try:
        result = await _muse(system, user, schema, name, effort, max_tokens)
    except SparkError as exc:
        if not settings.gemini_enabled:
            raise
        # Our Vultr VM gets model_not_found for Spark with a key that works from a laptop.
        log.warning("%s; gemini is answering instead", exc)
        try:
            result = await gemini.chat_json(system, user, schema, max_tokens=max_tokens)
        except gemini.GeminiError as gexc:
            raise SparkError(f"{exc}, and the gemini fallback failed: {gexc}") from gexc
        served_by["spark"] = "gemini (fallback)"
        return result
    served_by["spark"] = "meta"
    return result


async def _muse(system: str, user: str, schema: dict, name: str, effort: str, max_tokens: int) -> dict:
    body = {
        "model": settings.spark_model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "response_format": {"type": "json_schema", "json_schema": {"name": name, "schema": schema}},
        "reasoning_effort": effort,
        "max_tokens": max_tokens,
    }
    headers = {"Authorization": f"Bearer {settings.model_api_key}"}
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60, connect=10)) as client:
            for attempt in range(2):
                resp = await client.post(f"{settings.model_api_base}/chat/completions", json=body, headers=headers)
                if resp.status_code in (429, 500, 502, 503, 504) and attempt == 0:
                    log.warning("spark %s, retrying once", resp.status_code)
                    continue
                break
    except httpx.HTTPError as exc:
        raise SparkError(f"spark unreachable: {exc.__class__.__name__}") from exc
    if resp.status_code != 200:
        raise SparkError(f"spark {resp.status_code}: {resp.text[:300]}")
    try:
        content = resp.json()["choices"][0]["message"]["content"]
        return json.loads(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise SparkError(f"unreadable spark response: {exc}") from exc


def _people_block(me: dict, people: list[dict]) -> str:
    lines = [f"The speaker is {me['name']}."]
    for p in people:
        aliases = ", ".join(p["aliases"]) or p["name"]
        lines.append(f'- id "{p["id"]}": {p["name"]}, the speaker\'s {p["relation"]} (may be called: {aliases})')
    return "\n".join(lines)


SAFETY_RULES = """safety: "ok" for ordinary feelings: sadness, homesickness, tiredness, frustration, guilt, arguments, missing someone.
   "self_harm" if the speaker expresses wanting to die, to hurt themselves, or that life isn't worth living.
   "harm_to_others" if the speaker threatens to hurt someone.
   "abuse_or_control" if someone is hurting, threatening, monitoring, isolating, or controlling the speaker."""

SORT_SYSTEM = """You sort one person's private voice note into the people it is about.
You never write, rewrite, summarize, or translate their words. You only point at numbered sentences.

{people}

Return:
1. """ + SAFETY_RULES + """
2. pieces: group consecutive sentences that are one thought about, or meant for, one person from the list.
   Use only the ids above. Each sentence belongs to at most one piece. Leave out filler that isn't about anyone.
   A sentence with no name usually continues the person the previous sentence was about.
   Split a person's sentences into separate pieces when the thought changes.
   tone: the speaker's feeling in that piece.
3. reflections: for each person who has a piece, one lowercase line of at most 12 words, addressed to the
   speaker as "you", restating only what the speaker said or wants about that person.
   No advice. No claims about the other person's feelings. No exclamation marks.
   Good: "you couldn't pick up. you still want her to know." """


def _sort_schema(person_ids: list[str]) -> dict:
    return {
        "type": "object",
        "properties": {
            "safety": {"type": "string", "enum": SAFETY_VALUES},
            "pieces": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "person": {"type": "string", "enum": person_ids},
                        "segment_ids": {"type": "array", "items": {"type": "integer"}},
                        "tone": {"type": "string", "enum": TONES},
                    },
                    "required": ["person", "segment_ids", "tone"],
                    "additionalProperties": False,
                },
            },
            "reflections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "person": {"type": "string", "enum": person_ids},
                        "line": {"type": "string"},
                    },
                    "required": ["person", "line"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["safety", "pieces", "reflections"],
        "additionalProperties": False,
    }


async def sort_rant(segments: list, me: dict, people: list[dict]) -> dict:
    system = SORT_SYSTEM.format(people=_people_block(me, people))
    user = json.dumps({"sentences": [{"id": s.id, "text": s.text} for s in segments]}, ensure_ascii=False)
    return await chat_json(system, user, _sort_schema([p["id"] for p in people]), "RantSort", effort="low")


async def classify_safety(text: str) -> str:
    """Safety alone, for the eval script and for replies."""
    schema = {
        "type": "object",
        "properties": {"safety": {"type": "string", "enum": SAFETY_VALUES}},
        "required": ["safety"],
        "additionalProperties": False,
    }
    system = "Classify one person's private voice note for safety. Return:\n" + SAFETY_RULES
    result = await chat_json(system, json.dumps({"note": text}, ensure_ascii=False), schema, "Safety", effort="low", max_tokens=2000)
    return result.get("safety", "self_harm")


TRANSLATE_SYSTEM = """Translate the user's words into {language}, as they would naturally be said aloud in a family.
Keep the meaning exact. Do not add, remove, soften, or explain anything. Keep names as they are.
If a sentence is already in {language}, keep it unchanged."""


async def translate(text: str, language: str) -> str:
    schema = {
        "type": "object",
        "properties": {"translation": {"type": "string"}},
        "required": ["translation"],
        "additionalProperties": False,
    }
    result = await chat_json(TRANSLATE_SYSTEM.format(language=language), text, schema, "Translation", effort="minimal", max_tokens=2000)
    return str(result.get("translation", "")).strip()
