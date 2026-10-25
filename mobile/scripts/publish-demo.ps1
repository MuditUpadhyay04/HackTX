# Publishes the Un-Said demo to Expo's servers (EAS Update), so Expo Go on the Fold loads it from there:
# no laptop, no shared Wi-Fi, no IP that changes. The app talks to the backend in .env.local (Vultr).
#
#   cd mobile
#   $env:EXPO_TOKEN = "<token from expo.dev -> Access tokens>"   # or: npx eas-cli login
#   powershell -ExecutionPolicy Bypass -File scripts\publish-demo.ps1
#
# The first run links the project to your Expo account (eas init writes extra.eas.projectId to app.json).
# A temporary app.config.js sets the runtime to Expo Go's ("exposdk:58.0.0") for this publish only.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (Test-Path "app.config.js") { throw "mobile/app.config.js already exists; remove it first (this script writes a temporary one)." }

$app = Get-Content app.json -Raw | ConvertFrom-Json
$projectId = $null
if ($app.expo.extra -and $app.expo.extra.eas) { $projectId = $app.expo.extra.eas.projectId }
if (-not $projectId) {
  Write-Host "Linking this project to your Expo account (eas init)..."
  npx --yes eas-cli init --non-interactive --force
  if ($LASTEXITCODE -ne 0) { throw "eas init failed. Set EXPO_TOKEN or run: npx eas-cli login" }
  $app = Get-Content app.json -Raw | ConvertFrom-Json
  $projectId = $app.expo.extra.eas.projectId
}
Write-Host "Project: $projectId"

$sdk = (Get-Content node_modules/expo/package.json -Raw | ConvertFrom-Json).version.Split(".")[0]
@"
// Temporary (scripts/publish-demo.ps1): an update Expo Go SDK $sdk can open.
module.exports = ({ config }) => ({
  ...config,
  runtimeVersion: "exposdk:$sdk.0.0",
  updates: { ...(config.updates ?? {}), url: "https://u.expo.dev/$projectId" },
});
"@ | Set-Content -Encoding utf8 app.config.js

try {
  npx --yes eas-cli update --channel demo --message "Un-Said judge demo" --platform android --non-interactive
  if ($LASTEXITCODE -ne 0) { throw "eas update failed (see above)." }
} finally {
  Remove-Item app.config.js -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Published. On the Fold, open Expo Go and either:"
Write-Host "  - scan the QR code on the update's page at https://expo.dev (Projects -> unsaid -> Updates -> demo), or"
Write-Host "  - open this link in the phone's browser: exp://u.expo.dev/$projectId`?channel-name=demo&runtime-version=exposdk:$sdk.0.0"
