# Un-Said

*For the words we never said. Until today.*

Un-Said is a quiet place to say what you haven't said yet, and a gentle way to get it to the person it's for.

You're scrolling your photos late at night and stop on one of you and Mom. Un-Said asks you, once, if you've told her. You talk. **Muse Voice Transcribe** writes it down as you speak, Hindi and English in the same breath. **Muse Spark** sorts what you said by person, pointing at your sentences without rewriting any of them. The letter waits until it's morning where she is, then goes out through **WhatsApp**, Messages or Instagram, with your words and your voice. Her voice reply comes back to you.

HackTX 2026 · Meta track: *Bringing People Closer Together with AI* · Gurneal Chandi and Mudit Upadhyay

## What's in here

| Folder | What it is | Who owns it |
|---|---|---|
| [`mobile/`](mobile/) | The Un-Said app (Expo SDK 58; runs on an iPhone through Expo Go) | Gurneal: how it looks (`src/app`, `src/components`, `src/theme`) · Mudit: what it does (`src/lib`) |
| [`backend/`](backend/) | FastAPI: the Muse relay and sorting, the safety gate, hold until her morning, Mom's letter page, the demo panel | Mudit |
| [`design/`](design/) | Gurneal's design system: tokens, cast, copy, icon, reference screens | Gurneal |
| [`docs/`](docs/) | Product spec, demo scripts, team notes, archive | Everyone |
| [`deploy/aws/`](deploy/aws/) | AWS deploy: one Lightsail instance, Docker Compose, Caddy HTTPS on `<ip>.sslip.io` | Mudit |
| [`render.yaml`](render.yaml) | Render blueprint for the backend | Mudit |

## Run it

**Backend** (Python 3.13, [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Keys go in `backend/.env` (copy `backend/.env.example`). Without them, everything still runs on clearly labeled mock AI.

**App** (Node 20+, Expo Go on the iPhone, phone and laptop on the same network):

```bash
cd mobile
npm install
# mobile/.env.local:
#   EXPO_PUBLIC_API_URL=http://<laptop IP>:8000
#   EXPO_PUBLIC_APP_KEY=<the backend's APP_KEY>
npx expo start --lan     # then scan the QR code with the iPhone camera
```

Expo Go needs the Expo CLI signed in as the same account as the phone. If `npx expo login` can't open a browser, create a token at expo.dev → Settings → Access tokens and set `EXPO_TOKEN` in that terminal.

**Check the keys** before any demo: `cd backend && uv run python scripts/check_keys.py` (PASS/FAIL per key, secrets never printed).

**Deploy** with HTTPS, which Mom's "Hold to reply" mic needs: [`deploy/aws/README.md`](deploy/aws/README.md) (about 15 minutes, $7/month), or `render.yaml` on a paid plan with a disk.

More: [`backend/README.md`](backend/README.md) · [`mobile/README.md`](mobile/README.md)

## How we work, so nobody blocks anybody

- **`main` always runs.** Work on a branch, then merge small and often.
- **Gurneal owns the look:** `mobile/src/app/`, `mobile/src/components/`, `mobile/src/theme/` and `design/`.
- **Mudit owns the behavior:** `backend/` and `mobile/src/lib/` (the API client and data hooks).
- **Screens call hooks from `src/lib/` and never `fetch` directly.** When you restyle a screen, keep its hook calls and their arguments.
- **Backend changes are additive.** Nothing the app uses gets renamed or removed without a heads-up.
- **Copy is Gurneal's** ([`design/COPY_AND_NAMES.md`](design/COPY_AND_NAMES.md)). Any string that isn't there goes on the COPY NEEDED list in `mobile/README.md`.
- **Keys never go in git.** `backend/.env` and `mobile/.env.local` are ignored.

## Docs

| | |
|---|---|
| [`docs/demo/Demo_Script_v2.md`](docs/demo/Demo_Script_v2.md) | The 2:20 demo, shot by shot |
| [`docs/product/`](docs/product/) | Gurneal's product spec, deck and the first demo script |
| [`docs/notes/claude-grok-collab.md`](docs/notes/claude-grok-collab.md) | How we got here: the three-AI review and the inter-app film |
| [`docs/BACKEND_REQUESTS.md`](docs/BACKEND_REQUESTS.md) | Requests from the UI to the backend |
| [`docs/archive/nextjs-frontend/`](docs/archive/nextjs-frontend/) | The earlier Next.js "iPhone Duo" plan, replaced by `mobile/` |
