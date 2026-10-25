# Un-Said demo runbook (local demo, nothing hosted)

The app is not deployed anywhere. For the demo the **backend runs on the laptop** and the
phone talks to it over the same Wi-Fi/hotspot (or through a tunnel). There are two ways to get
the app on the phone:

- **Path A, Expo Go (fastest, no Expo/Apple login):** `npx expo start`, scan the QR code.
- **Path B, EAS preview build + EAS Update:** a real installable build (needed for remote push).
  Needs Nick's Expo login, and for iOS a paid Apple Developer account.

Steps marked 🔐 need a login only Nick can do.

---

## 0. One-time setup on the laptop (macOS)

```sh
# Python side: uv (https://docs.astral.sh/uv/)
brew install uv            # or: curl -LsSf https://astral.sh/uv/install.sh | sh
# JS side: Node 20+ and the app's packages
cd mobile && npm install   # .npmrc already sets legacy-peer-deps
```

## 1. Run the backend locally

Pick a demo key. It is just a shared secret between the app and the backend.

```sh
cd backend
cp .env.example .env        # first time only; every key in it is optional
# put the key in backend/.env:   APP_KEY=unsaid-demo-2026
# (optional) MODEL_API_KEY=... for real Muse AI; without it the backend uses clearly labeled mock AI
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- The env var name is **`APP_KEY`** (backend/app/config.py). It has **no default**: if it is empty,
  the backend accepts every request. The app sends it as the `X-App-Key` header (and `?key=` on
  media and the live-transcript WebSocket), which is exactly what backend/app/auth.py checks.
- `--host 0.0.0.0` matters: without it the phone can't reach the laptop.
- Data lives in `backend/data/` (SQLite + media). Delete that folder to reset the demo cast.

Check it from the laptop:

```sh
curl -i http://localhost:8000/api/home                                   # 401 if APP_KEY is set (good)
curl -s -H "X-App-Key: unsaid-demo-2026" http://localhost:8000/api/home | head -c 300   # 200 + JSON
```

## 2. Point the app at the laptop

```sh
ipconfig getifaddr en0      # Wi-Fi IP, e.g. 192.168.1.23 (try en1 if empty; on iPhone hotspot it's usually 172.20.10.x)
```

Create `mobile/.env.local` (git-ignored):

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.23:8000     # your LAN IP, no trailing slash
EXPO_PUBLIC_APP_KEY=unsaid-demo-2026             # must equal backend APP_KEY
```

Sanity check **from the phone's Safari**: open `http://192.168.1.23:8000/api/home?key=unsaid-demo-2026`.
JSON = good. Spinner/timeout = firewall or different network (macOS: System Settings → Network →
Firewall → allow Python/uvicorn incoming connections).

`EXPO_PUBLIC_*` values are baked in when the JS is bundled. After editing `.env.local`, restart
Metro with `npx expo start -c`.

## 3. Path A: Expo Go (fastest demo, no login)

```sh
cd mobile
npx expo start              # LAN mode; scan the QR with the iPhone camera → opens in Expo Go
npx expo start -c           # same, clearing the bundler cache (after env changes)
```

Different networks (venue Wi-Fi blocks device-to-device traffic, etc.):

```sh
npx expo start --tunnel     # tunnels METRO (the JS bundle) only, NOT the backend on :8000
```

`--tunnel` does not make the API reachable. Tunnel the backend too, and use its https URL:

```sh
brew install cloudflared
cloudflared tunnel --url http://localhost:8000      # prints https://<random>.trycloudflare.com
# or: ngrok http 8000                               # prints https://<random>.ngrok-free.app
```

Then set `EXPO_PUBLIC_API_URL=https://<random>.trycloudflare.com` in `mobile/.env.local` and
`npx expo start --tunnel -c`. Keep `APP_KEY` set whenever the backend is exposed through a tunnel.

Expo Go limits: no remote push (local notifications still work), mic/photos permissions show as
"Expo Go".

## 4. Path B: EAS preview build + EAS Update

### 4.1 🔐 Log in and link the project (one time)

```sh
cd mobile
npx eas-cli@latest login            # 🔐 Nick's Expo account
npx eas-cli@latest init             # creates the EAS project, writes extra.eas.projectId (+ owner) to app.json
npx eas-cli@latest update:configure # writes updates.url to app.json; keeps runtimeVersion {policy: appVersion}
```

These two commands edit `mobile/app.json`. Commit that change. What they add (for whoever owns
app.json; nothing else in app.json needs to change for EAS):

```jsonc
"owner": "<nick's expo username>",                                   // eas init (if needed)
"extra": { "eas": { "projectId": "<uuid>" } },                       // eas init
"updates": { "url": "https://u.expo.dev/<uuid>", "fallbackToCacheTimeout": 0 }  // update:configure
// runtimeVersion stays { "policy": "appVersion" } (already set, valid for SDK 58)
```

Already in place: `expo-updates ~58.0.18` is a dependency and in `plugins`; `eas.json` preview
profile uses `channel: preview` + `environment: preview`.

### 4.2 🔐 Put the two app vars in the EAS "preview" environment

`EXPO_PUBLIC_*` vars end up in the app bundle, so they must be `plaintext` (or `sensitive`), not `secret`.

```sh
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL \
  --value "https://<backend tunnel>.trycloudflare.com" --visibility plaintext
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_APP_KEY \
  --value "unsaid-demo-2026" --visibility plaintext
# change later: npx eas-cli@latest env:update --environment preview --variable-name EXPO_PUBLIC_API_URL ...
npx eas-cli@latest env:list --environment preview
```

**Use an https tunnel URL here, not a LAN `http://` IP.** A preview build is a release build: iOS
App Transport Security blocks plain-`http` requests unless app.json allows it (see 4.6), and a LAN
IP changes every time the laptop changes network. Note that a quick `trycloudflare.com` URL also
changes every time cloudflared restarts; if it does, just `env:update` and run `eas update` again
(4.5), no rebuild needed. A named Cloudflare tunnel or an ngrok reserved domain avoids that.

### 4.3 🔐 Register the demo iPhone (internal distribution, iOS)

```sh
npx eas-cli@latest device:create    # gives a link/QR; open it ON THE iPHONE and install the profile
```

Do this **before** building. Internal-distribution (ad hoc) builds only install on registered devices.
On iOS 16+, also turn on Settings → Privacy & Security → **Developer Mode** on the phone.

### 4.4 🔐 Build the preview app

```sh
npx eas-cli@latest build --profile preview --platform ios       # 🔐 asks to log in to the Apple Developer account
npx eas-cli@latest build --profile preview --platform android   # optional, gives an installable .apk
```

- iOS needs a **paid Apple Developer Program account** ($99/yr). EAS creates the certificate and ad
  hoc provisioning profile for bundle id `app.unsaid.demo` (it must be free to register on that team).
- When it finishes, open the build page link (or scan its QR) on the iPhone to install.
- Builds take ~10-20 min plus queue time on the free plan. Start this early.

### 4.5 🔐 Ship JS changes without rebuilding

```sh
npx eas-cli@latest update --branch preview --environment preview --message "demo polish"
```

- `--environment preview` is required on SDK 55+ and uses the EAS env vars (local `.env*` files are ignored).
- The `preview` build listens on channel `preview`, which maps to branch `preview` (created on first update).
- Updates only reach builds with the same runtime version. With the `appVersion` policy that means the
  same `expo.version` in app.json (`1.0.0`). Only bump `version` together with a new build. Any native
  change (new native package, plugin, permission, infoPlist, orientation) needs a new build, not an update.
- The app fetches the update on launch (`fallbackToCacheTimeout: 0` = it shows the cached bundle first),
  so **force-quit and reopen the app twice** to see a new update.

### 4.6 Optional app.json additions (native, need a rebuild; app.json owner decides)

Only if the EAS build must talk to a plain-`http` LAN backend instead of an https tunnel:

```jsonc
"ios": {
  "infoPlist": {
    "NSAppTransportSecurity": { "NSAllowsArbitraryLoads": true },
    "NSLocalNetworkUsageDescription": "Un-Said talks to the demo server on this network."
  }
}
```

Expo Go (Path A) doesn't need these.

## 5. Command list after Nick logs in (copy/paste)

```sh
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest update:configure
git add app.json && git commit -m "Link Un-Said to EAS project" && git push

# terminal 2: backend + tunnel
cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
# terminal 3
cloudflared tunnel --url http://localhost:8000

npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL --value "https://<tunnel>" --visibility plaintext
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_APP_KEY --value "<APP_KEY>" --visibility plaintext
npx eas-cli@latest device:create
npx eas-cli@latest build --profile preview --platform ios
npx eas-cli@latest update --branch preview --environment preview --message "demo"
```

## 6. Demo-day checklist

- [ ] Laptop and phone on the same network (iPhone hotspot is the most reliable), or tunnels running
- [ ] Backend running with `APP_KEY`, `curl -H "X-App-Key: …" /api/home` returns 200
- [ ] Phone Safari can open `<API_URL>/api/home?key=<APP_KEY>`
- [ ] App opened once, Photos + Microphone allowed
- [ ] Laptop set to not sleep (`caffeinate -dis` in a spare terminal)
- [ ] If the tunnel URL changed: `env:update` + `eas update` (Path B) or edit `.env.local` + `expo start -c` (Path A)

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Can't reach Un-Said's server." | Wrong `EXPO_PUBLIC_API_URL`, phone on another network, firewall, or backend not on `0.0.0.0`. Test in phone Safari. |
| 401 `app key required` | `EXPO_PUBLIC_APP_KEY` ≠ backend `APP_KEY`. Restart Metro with `-c` after changing it. |
| Expo Go QR won't load | Use `npx expo start --tunnel`. |
| Build installs but shows old JS | Force-quit and reopen twice; check `eas update:list` and that the update's runtime version is `1.0.0`. |
| iOS build "device not registered" | `eas device:create` on the phone, then rebuild (`eas build` asks to include the new device). |
