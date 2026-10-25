#!/usr/bin/env bash
# scripts/build-unsaid.sh: builds the real Un-Said app (HackTX repo `main`, mobile/) as a static web
# app served by this phone at /unsaid/ (public/unsaid, git-ignored), so it runs same-origin inside the
# phone's Un-Said screen: instant loads, and the phone can style its window and remember its screen.
# Un-Said's own files are not changed: the base path comes from a temporary app.config.js removed after.
#
#   UNSAID_MOBILE=~/HackTX-unsaid-main/mobile UNSAID_API=http://localhost:8000 scripts/build-unsaid.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="${UNSAID_MOBILE:-$HOME/HackTX-unsaid-main/mobile}"
API="${UNSAID_API:-http://localhost:8000}"
OUT="$HERE/public/unsaid"
[ -f "$MOBILE/app.json" ] || { echo "Un-Said mobile/ not found at $MOBILE (set UNSAID_MOBILE)"; exit 1; }
[ -d "$MOBILE/node_modules" ] || (cd "$MOBILE" && npm install --no-audit --no-fund)

CFG="$MOBILE/app.config.js"
[ -e "$CFG" ] && { echo "$CFG already exists; refusing to overwrite it"; exit 1; }
cat > "$CFG" <<'JS'
// Temporary (scripts/build-unsaid.sh in Branched-Frontend): serve the web build under /unsaid.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...(config.experiments ?? {}), baseUrl: "/unsaid" },
  web: { ...(config.web ?? {}), output: "single" },
});
JS
trap 'rm -f "$CFG"' EXIT

TMP="$(mktemp -d)"
(cd "$MOBILE" && EXPO_PUBLIC_API_URL="$API" EXPO_PUBLIC_APP_KEY="${UNSAID_APP_KEY:-}" npx expo export --platform web --output-dir "$TMP" --clear)
rm -rf "$OUT" && mkdir -p "$OUT" && cp -R "$TMP"/. "$OUT"/ && rm -rf "$TMP"
echo "Un-Said web build -> $OUT ($(du -sh "$OUT" | cut -f1)); API $API"
