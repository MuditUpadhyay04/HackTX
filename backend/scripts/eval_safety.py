"""Runs the safety gate over fixtures/safety_cases.json and prints what you can honestly claim.

    uv run python scripts/eval_safety.py

Without MODEL_API_KEY only the phrase layer runs; with it, Muse Spark's classification
runs too and the stricter answer wins, exactly as in the app.
"""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ai import spark  # noqa: E402
from app.config import settings  # noqa: E402
from app.safety import OK, combine, keyword_flag  # noqa: E402

CASES = Path(__file__).resolve().parent.parent / "fixtures" / "safety_cases.json"


async def classify(text: str) -> tuple[str, str | None, str | None]:
    model = None
    if settings.muse_enabled:
        try:
            model = await spark.classify_safety(text)
        except spark.SparkError as exc:
            print(f"  ! spark failed, phrase layer only: {exc}", file=sys.stderr)
    return combine(model, text), keyword_flag(text), model


async def main() -> int:
    data = json.loads(CASES.read_text(encoding="utf-8"))
    layers = "phrases + muse spark" if settings.muse_enabled else "phrases only (no MODEL_API_KEY)"
    print(f"safety gate eval · {layers}\n")
    misses = 0
    totals = {}
    for expected, cases in (("concern", data["concern"]), ("ordinary", data["ordinary"])):
        right = 0
        for text in cases:
            final, phrase, model = await classify(text)
            ok = (final != OK) if expected == "concern" else (final == OK)
            right += ok
            mark = "✓" if ok else "✗"
            print(f" {mark} [{expected:8}] -> {final:16} phrase={phrase or '-':16} spark={model or '-':16} {text[:70]}")
        totals[expected] = (right, len(cases))
        misses += len(cases) - right
    c_ok, c_n = totals["concern"]
    o_ok, o_n = totals["ordinary"]
    if settings.muse_enabled and spark.served_by["spark"] != "meta":
        layers = f"phrases + {spark.served_by['spark']}"  # Meta refused Spark here; say who really answered
    print(f"\n{c_ok}/{c_n} concerning rants routed to resources; {o_n - o_ok}/{o_n} ordinary rants blocked ({layers}).")
    return 1 if misses else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
