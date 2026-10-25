#!/usr/bin/env bash
# scripts/build-try.sh: the "Try Un-Said" web build that judges open from a QR code on their own phones.
# The same app as the Fold demo, with EXPO_PUBLIC_TRY_MODE=1 (privacy page first, a sandbox per browser,
# nothing sends) and demo data only, served under /try. Un-Said's own files are not changed: the base
# path comes from a temporary app.config.js removed on exit.
#
#   EXPO_PUBLIC_API_URL=https://45-32-200-63.sslip.io EXPO_PUBLIC_APP_KEY=... scripts/build-try.sh <out dir>
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:?usage: scripts/build-try.sh <output dir>}"
: "${EXPO_PUBLIC_API_URL:?set EXPO_PUBLIC_API_URL to the backend (https in production)}"
[ -d "$HERE/node_modules" ] || (cd "$HERE" && npm install --no-audit --no-fund)

CFG="$HERE/app.config.js"
[ -e "$CFG" ] && { echo "$CFG already exists; refusing to overwrite it"; exit 1; }
cat > "$CFG" <<'JS'
// Temporary (scripts/build-try.sh): serve the try build under /try.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...(config.experiments ?? {}), baseUrl: "/try" },
  web: { ...(config.web ?? {}), output: "single" },
});
JS
TMP="$(mktemp -d)"
trap 'rm -f "$CFG"; rm -rf "$TMP"' EXIT

(cd "$HERE" && EXPO_PUBLIC_TRY_MODE=1 EXPO_PUBLIC_DEMO_DATA=1 \
  EXPO_PUBLIC_API_URL="$EXPO_PUBLIC_API_URL" EXPO_PUBLIC_APP_KEY="${EXPO_PUBLIC_APP_KEY:-}" \
  npx expo export --platform web --output-dir "$TMP" --clear)

# index.html for phones: the page title, theme colour, safe areas (viewport-fit=cover), the real
# viewport height on iOS (100dvh), a visible focus ring, and an inline splash so a slow cellular
# load shows Un-Said at once instead of a blank page. TRY (needs Gurneal's OK): "Try Un-Said".
node - "$TMP/index.html" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
let html = fs.readFileSync(file, "utf8");
html = html.replace(/<title>[^<]*<\/title>/, "<title>Try Un-Said</title>");
if (!/<title>/.test(html)) html = html.replace("</head>", "<title>Try Un-Said</title></head>");
html = html.replace(/<meta name="viewport"[^>]*>/, "");
const head = [
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
  '<meta name="theme-color" content="#FFFFFF" />',
  '<meta name="description" content="A preview of Un-Said for HackTX judges." />',
  "<style>",
  "html,body{height:100%;height:100dvh;margin:0;background:#FFFFFF;overscroll-behavior:none;-webkit-text-size-adjust:100%}",
  "#root{display:flex;min-height:100%;min-height:100dvh}",
  "input,textarea{font-size:max(16px,1em)}",
  ":focus-visible{outline:3px solid #5B45D6;outline-offset:2px}",
  "#try-splash{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#FFFFFF;color:#1D1742;font:800 28px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;z-index:0}",
  "#try-splash i{width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#677FEF,#8776DF 45%,#AD8FED 75%,#AD78D4)}",
  "#root:not(:empty)~#try-splash{display:none}",
  "</style>",
].join("");
html = html.replace("</head>", `${head}</head>`);
// The splash sits after #root so the CSS rule above hides it as soon as the app renders.
html = html.replace(/(<div id="root"><\/div>)/, '$1<div id="try-splash" aria-hidden="true"><i></i>Un-Said</div>');
fs.writeFileSync(file, html);
NODE

rm -rf "$OUT" && mkdir -p "$OUT" && cp -R "$TMP"/. "$OUT"/
echo "Try Un-Said -> $OUT ($(du -sh "$OUT" | cut -f1)); API $EXPO_PUBLIC_API_URL"
