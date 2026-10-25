"""
scripts/fill-unsaid-demo.py: fills Un-Said's demo backend so no screen opens on an empty state.

Uses only Un-Said's own API (backend/app/routes), so it works against a local or deployed backend:
  - resets his activity (keeps people and photos, reseeds Sarah's lines, the Tuesday card, Michael's reminder)
  - connects Photos, Instagram photos and Facebook photos (Connect fills in; the face groups wait to be named)
  - writes Riley's lines for Mom and Michael (Your words, each person's pile, Preview)
  - Mom's voice-note reply to the Tuesday card (the Un-said tab)
  - a "for the next hard day" video note to himself (Notes to yourself)

  python3 scripts/fill-unsaid-demo.py [--api http://127.0.0.1:8000] [--key APP_KEY]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import urllib.request
import uuid
from pathlib import Path

# Riley's lines, in his voice, from the story (docs/CLAUDE_PROMPT.md: Mom's "k", Michael's "im good bro").
LINES = {
    "mom": [
        "I'm sorry all I sent you was k. You deserved so much more than that.",
        "I did eat. Not well, but I did. I just didn't know how to tell you I'm not okay.",
        "I love you too, Ma. I should say it every time you do.",
    ],
    "priya": [  # Michael (Best Friend); the id predates the cast names
        "I'm not good, bro. I've been saying I'm tired because it's easier than the truth.",
        "I think about the night we ran out of gas on 290 all the time. Let's do it again.",
    ],
}

SELF_NOTE_LABEL = "for the next hard day"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default=os.environ.get("UNSAID_API", "http://127.0.0.1:8000"))
    ap.add_argument("--key", default=os.environ.get("UNSAID_APP_KEY", ""))
    ap.add_argument("--repo", default=os.environ.get("UNSAID_REPO", str(Path.home() / "HackTX-unsaid-main")))
    a = ap.parse_args()
    api = a.api.rstrip("/")
    headers = {"X-App-Key": a.key} if a.key else {}

    def call(method: str, path: str, body=None, raw: bytes | None = None, ctype: str | None = None):
        data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
        h = dict(headers)
        if data is not None:
            h["Content-Type"] = ctype or "application/json"
        req = urllib.request.Request(api + path, data=data, method=method, headers=h)
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read() or b"null")

    print("health:", call("GET", "/api/health"))
    call("POST", "/api/demo/reset")
    print("reset his activity (fixtures reseeded)")

    for source in ("photos", "instagram", "facebook"):
        r = call("POST", f"/api/connect/{source}")
        print(f"connected {source}: +{r.get('added')}")
    # left unnamed on purpose: naming the face groups is a step of the demo
    faces = call("GET", "/api/faces")
    print(f"face groups: {len(faces.get('clusters', []))}")

    for pid, lines in LINES.items():
        out = call("POST", f"/api/people/{pid}/pieces", {"text": "\n\n".join(lines)})
        print(f"lines for {pid}: {len(out)}")

    reply = call("POST", "/api/demo/mock-reply")
    print("Mom's reply:", reply.get("id"))

    video = make_self_note(Path(a.repo) / "mobile" / "assets" / "people" / "son.jpg")
    if video:
        boundary = uuid.uuid4().hex
        parts = [
            f'--{boundary}\r\nContent-Disposition: form-data; name="label"\r\n\r\n{SELF_NOTE_LABEL}\r\n'.encode(),
            f'--{boundary}\r\nContent-Disposition: form-data; name="duration_ms"\r\n\r\n8000\r\n'.encode(),
            f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="note.mp4"\r\nContent-Type: video/mp4\r\n\r\n'.encode()
            + video.read_bytes() + b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
        note = call("POST", "/api/self-notes", raw=b"".join(parts), ctype=f"multipart/form-data; boundary={boundary}")
        print("note to himself:", note.get("id"))
    else:
        print("note to himself: skipped (ffmpeg or son.jpg missing)")
    print("done")


def make_self_note(still: Path) -> Path | None:
    """An 8 s portrait clip of Riley (a slow push-in on his headshot), H.264 so every browser plays it."""
    if not still.exists():
        return None
    out = Path(tempfile.gettempdir()) / "unsaid-self-note.mp4"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(still), "-t", "8",
        "-vf", "scale=1080:-2,crop=720:960,zoompan=z='min(zoom+0.0006,1.12)':d=200:s=720x960:fps=25,format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-movflags", "+faststart", str(out),
    ]
    try:
        subprocess.run(cmd, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError) as e:
        print("ffmpeg failed:", e, file=sys.stderr)
        return None
    return out


if __name__ == "__main__":
    main()
