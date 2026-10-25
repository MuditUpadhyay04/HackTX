#!/usr/bin/env bash
# scripts/demo.sh: one command for the demo. Starts Un-Said's backend (mock AI unless backend/.env
# has keys), builds Un-Said into the phone if it isn't there yet (or with --rebuild), then runs the
# phone at http://localhost:3000/device. Ctrl+C stops everything.
#
#   scripts/demo.sh            # UNSAID_REPO defaults to ~/HackTX-unsaid-main (Un-Said, branch demo-fill)
#   scripts/demo.sh --rebuild  # pull Un-Said's latest demo-fill branch and rebuild it first
#   scripts/demo.sh --no-fill  # keep the backend's data as it is (default: refill the demo data)
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${UNSAID_REPO:-$HOME/HackTX-unsaid-main}"
[ -d "$REPO/backend" ] || { echo "Un-Said not found at $REPO. Run: git worktree add $REPO origin/main"; exit 1; }

REBUILD=0; FILL=1
for a in "$@"; do case "$a" in --rebuild) REBUILD=1;; --no-fill) FILL=0;; esac; done
BRANCH="${UNSAID_BRANCH:-demo-fill}"
if [ "$REBUILD" = 1 ]; then git -C "$REPO" fetch -q origin && git -C "$REPO" checkout -q -B "$BRANCH" "origin/$BRANCH"; fi
if [ "$REBUILD" = 1 ] || [ ! -f "$HERE/public/unsaid/index.html" ]; then
  UNSAID_MOBILE="$REPO/mobile" "$HERE/scripts/build-unsaid.sh"
fi

pids=()
cleanup() { for p in ${pids[@]+"${pids[@]}"}; do kill "$p" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM

if ! curl -sf http://127.0.0.1:8000/api/health >/dev/null; then
  [ -f "$REPO/backend/.env" ] || sed -e 's/^CORS_ORIGINS=.*/CORS_ORIGINS=*/' -e 's/^PUSH_DRY_RUN=.*/PUSH_DRY_RUN=1/' "$REPO/backend/.env.example" > "$REPO/backend/.env"
  (cd "$REPO/backend" && uv sync -q && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000) &
  pids+=($!)
  for _ in $(seq 1 30); do curl -sf http://127.0.0.1:8000/api/health >/dev/null && break; sleep 1; done
fi
echo "Un-Said backend: $(curl -s http://127.0.0.1:8000/api/health)"
# fill every Un-Said screen with the demo's content (no empty states)
if [ "$FILL" = 1 ]; then UNSAID_REPO="$REPO" python3 "$HERE/scripts/fill-unsaid-demo.py"; fi

if ! curl -sf -o /dev/null http://localhost:3000/device; then
  (cd "$HERE" && npm run dev) &
  pids+=($!)
fi
echo "Phone: http://localhost:3000/device"
wait
