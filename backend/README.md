# backend/

**Owner:** Mudit Upadhyay (@MuditUpadhyay04)

Server, APIs, and Meta / Muse integrations for Unsaid. Changes here are watched every 10 minutes, and the frontend is updated to match.

This is the working product for [`docs/demo/Demo_Script_v2.md`](../docs/demo/Demo_Script_v2.md) §6: everything from the knock to Mom's 8 AM runs for real. One FastAPI service serves three things:

| URL | What it is |
|---|---|
| `/app/` | The student's app (mobile web; add it to the iPhone home screen for full-screen recording). Shots 6–10, 15, 17, 18. |
| `/c/<token>` | The page Mom (or Sarah) opens from the link. No app, no account. Shot 12. |
| `/api/...` | JSON + one WebSocket, for the app above and for Gurneal's frontend later. |

Without keys it runs end to end on **clearly labeled mock AI** (a "mock ai" pill shows in the app), so you can build and rehearse before the Muse key arrives.

## Run it locally

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/app/?demo=1 (`?demo=1` adds the demo controls). The mic needs `localhost` or HTTPS, so test on a phone through the deployed URL.

Keys go in `backend/.env` (copy [`.env.example`](.env.example)). Everything is optional:

| Variable | Turns on |
|---|---|
| `MODEL_API_KEY` | Muse Voice Transcribe (live transcript) and Muse Spark (sorting, safety, translation). Without it: mock. |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE` | Mom's 8 AM arrives by itself on WhatsApp. Without them: the app asks *"it's 8:00 AM for Mom. send it now?"* and opens WhatsApp with the link. |
| `APP_KEY` | Locks the student app and demo controls. **Set it on any public deploy.** Open the app once with `?key=<APP_KEY>`. Card links stay public by token. |
| `SEED_*` | The cast's phone numbers and Instagram handle (or set them later in the demo panel). |
| `PUSH_DRY_RUN` | `1` logs pushes instead of sending them to Expo (rehearsals). |
| `EXPO_ACCESS_TOKEN` | Only if you turn on Expo's enhanced push security. |

## Deploy (Render)

1. Push this repo to GitHub.
2. Render dashboard → **New → Blueprint** → pick the repo. It reads [`/render.yaml`](../render.yaml).
3. Fill the prompted values: `MODEL_API_KEY`, the WhatsApp pair, and the phone numbers. `APP_KEY` is generated; copy it from the service's Environment tab.
4. Open `https://<service>.onrender.com/app/?key=<APP_KEY>&demo=1` on your iPhone → Share → **Add to Home Screen**. Opened from the home screen, it runs full screen with no Safari bars, which is what you want for screen recording. (The home-screen app has its own storage, so it asks for the key once.)

**Before recording, upgrade.** The free plan sleeps after 15 idle minutes and wipes its disk, losing uploaded photos and Mom's voice note. Switch the service to a paid instance (Starter is the cheapest) and uncomment the `disk` block in `render.yaml` (1 GB at `/data`). Spin-up from sleep also takes about a minute, which you don't want in front of judges.

## Recording runbook (Demo_Script_v2 shots)

| Shot | Do this |
|---|---|
| Before | Demo panel → **people**: set real numbers for you, Mom, Dad and Sarah, and Michael's Instagram. Home → **+ add a photo**: the real kitchen photo, tagged Mom. |
| Sat 9:30 PM Austin | Demo panel → **mom's voice note** → copy the link → send it to Mom. She opens it and holds the mic: *"Beta, koi emergency nahi hai…"*. Then tap **make latest reply tuesday** so the knock says *"on tuesday"*. |
| 6 | Demo panel → clock **set** to `2026-10-24 18:32` (Mom shows 🌙 5:02 AM). Open home: the knock slides down: *"Mom left you a voice note on tuesday."* |
| 7 | Tap it → her photo opens and her note plays, with the English caption under it. |
| 8 | Hold the mic and say the rant from §4. The transcript writes itself live (Muse Voice Transcribe). |
| 9 | Let go → three cards: Mom, Sarah (*+2 from before*), Michael. Every word is a slice of his transcript. |
| 10 | Tap Mom → *"…hold this until her 8 AM?"* → **send when it's her morning** → *Mom · waiting · 8:00 AM her time*. |
| 11 | Demo panel → **+3 hours**. The scheduler releases the card exactly as it would at her real 8 AM. |
| 12 | With the WhatsApp keys, Mom's phone gets *"hi. Riley left you something…"*. Without them, tap the *"send it now?"* nudge. She opens the link: photo, his voice (her turn only), his words, the Hindi caption, **hold to reply**, **call Riley**. |
| 15 | Back in the app: rant again or open Sarah's card → *"3 things you never told her."* Nothing is pre-checked. Pick the two older lines → **send to Sarah in messages** → Messages opens with the note. |
| 17 | Home → **for the next hard day** → record → saved *to: me*. It comes back above the cards the next time a rant sounds tired or lonely. |
| 18 | Home → *Michael · waiting on you: 3 reels this week* → **open instagram**. |
| Reset | Demo panel → **reset activity** clears rants, cards, replies, and notes, but keeps people, photos, the clock, and Mom's link. **real time** puts the clock back. |

## WhatsApp Cloud API (Mom's 8 AM)

1. developers.facebook.com → create an app → add **WhatsApp**. It comes with a free test number; copy its **Phone number ID** and a token (use a System User token, since the temporary one expires in 24 h).
2. Add Mom's number as a test recipient. She verifies it with a code. The test number can message up to 5 recipients.
3. Create a message template named `unsaid_left_you_something`, language English, with this body:
   `hi. {{1}} left you something. open it whenever you have a minute: {{2}} (sent with Un-Said)`
   Variables can't be the first or last thing in a template, hence the words around them. **Submit it first thing**; review can take minutes or a day.
4. Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_TEMPLATE`. If a send fails, the card falls back to *"send it now?"* and the error is on the card (`delivery_error`).

## How the AI is used (and where it isn't)

| Job | How |
|---|---|
| Live transcript, Hindi + English in one breath | Muse Voice Transcribe realtime (`wss://api.meta.ai/v1/asr/realtime`), `ENDPOINTING` mode, `languageBias: ["English", "Hindi"]`. The browser streams 24 kHz PCM to our server, which relays it; the key never reaches the browser. If the socket fails, the browser uploads its own WAV to the file endpoint. |
| Sorting one rant by person | The **server** numbers the sentences. **Muse Spark** (`muse-spark-1.3`, schema-constrained JSON, `reasoning_effort: low`) only returns `{person, sentence ids, tone}`. The server slices the text from his transcript, so **Spark can't write a word on any card.** Bad ids, unknown people, and reused sentences are dropped. |
| His voice for Mom, her turn only | Audio is cut on Voice Transcribe's turn timestamps. A turn plays only if every sentence in it is Mom's (or a few words of filler). If Sarah's line shared that breath, Mom gets text only. |
| Safety gate | Runs before any card forms: Spark's classification **plus** a phrase list (including transliterated Hindi). The stricter layer wins; unknown output counts as a concern. A concern means no cards, only 988 / 1-800-799-7233 / 911. |
| Her language | Spark translates the words he approved, on Mom's card. Her reply is transcribed and captioned in English for him. |
| Unsaid's one line | Spark writes one short lowercase line restating what he said ("you still want her to know."), prompted to 12 words and capped at 90 characters. The question after it ("hold this until her 8 AM?") is code. |
| **Not AI** | Her morning (time zones and quiet hours), delivery, every word he sends, who it goes to. |

## API (for the frontend)

All `/api/*` routes except `/api/public/*` and `/api/health` need the `X-App-Key` header (or `?key=`) when `APP_KEY` is set. Feature IDs follow Demo_Script_v2 §6.

| Feature ID | Call | Notes |
|---|---|---|
| (home) | `GET /api/home` | People with local time and asleep flag, photos, nudges, cards, replies, reminders, self notes, providers, clock. Poll it. |
| `unheard-reply-nudge` | in `home.nudges` (`kind: "reply"`), then `POST /api/replies/{id}/heard` | *"Mom left you a voice note on tuesday."* |
| `recipient-timezone-set` | `PATCH /api/people/{id}` | `{timezone, handle, language, morning, quiet_start, quiet_end}` |
| (photos) | `GET/POST /api/photos`, `DELETE /api/photos/{id}` | Multipart upload: `file`, `person_id`, `caption`. |
| `rant-record` | `WS /api/rants/live` | Protocol in [`app/routes/live.py`](app/routes/live.py): `start` → `ready` → PCM frames → `partial`/`turn` → `stop` → `done`. |
| `rant-type` / fallback | `POST /api/rants/text`, `POST /api/rants/audio` | Typed text, or a 24 kHz mono WAV. |
| `rant-split` | `POST /api/rants/{id}/sort` | `{safety, resources, groups: [{person, pieces, kept_total, tone, reflection}], self_note}`. Idempotent. |
| (stack) | `GET /api/people/{id}/pieces`, `POST /api/pieces/{id}/discard` | Everything kept for that person, oldest first. |
| `unsend-hold-until-morning` | `POST /api/cards` `{recipient_id, piece_ids, photo_id, when: "her_morning"}` | Held until her morning if she's asleep; sent now if she's awake. |
| `unsend-share-sms` | `POST /api/cards` `{…, when: "now"}`, then `card.share.sms_ios` / `sms_android` / `whatsapp` / `instagram`, then `POST /api/cards/{id}/shared` | We can't see the send itself, so we record the handoff. |
| (cancel) | `POST /api/cards/{id}/revoke` | Only before it's released. |
| `reply-page-record` | `GET /api/public/cards/{token}`, `POST /api/public/cards/{token}/reply` | No auth. The token is the key. Held, revoked, and expired cards don't open. |
| `call-start` | `call_url` on the public card | `wa.me/<his number>` for WhatsApp recipients. |
| `self-note-record` | `POST /api/self-notes` | Multipart `file` (webm/mp4/mov). |
| (waiting on you) | `GET` via home, `POST /api/reminders`, `POST /api/reminders/{id}/done` | `handoff` opens Instagram, WhatsApp, or Messages. |
| (demo) | `/api/demo/state`, `/clock`, `/release-due`, `/cards/{id}/release-now`, `/replies/{id}/backdate`, `/mock-reply`, `/reset`, `/attention/reset` | Same key. |
| (photo memory) | `GET /api/memory/photo?asset_id=`, `GET /api/pieces/{id}/audio` | See [Memory, knocks and push](#memory-knocks-and-push). Rants take an optional `asset_id`. |
| (the knock) | `POST /api/knock/check`, `POST /api/knock/{id}/outcome`, `GET/PATCH /api/settings` | Almost always `{knock: false, reason}`. |
| (push) | `POST /api/push/register`, `POST /api/push/permission` | Held cards in `/api/home` carry `remind_at` and `remind_body` when they'll need his tap. |

[`docs/BACKEND_REQUESTS.md`](../docs/BACKEND_REQUESTS.md) Request 1 (photo connectors and face grouping) is **not built**. Its own notes say it can stay mock for the demo, and it isn't in Demo_Script_v2.

## Memory, knocks and push

Un-Said speaks rarely, and less once people are talking to each other. Everything here says no by default.

**Photo memory.** When he talks on a gallery photo, the rant carries the photo's `asset_id` (JSON `asset_id` on `/api/rants/text`, form field `asset_id` on `/api/rants/audio`, `asset_id` in the live socket's `start` message). Sorting links the photo to everyone he spoke about. Nothing is learned from the pixels, only from what he said while looking at it.

- `GET /api/memory/photo?asset_id=` → `{people: [{person, times, letters, kept, first_at, last_at}], previous: [his earlier lines on this photo, newest first, each with person_name and day], kept_by_person}`. The app shows these as "Said here before", in his own voice.
- `GET /api/pieces/{id}/audio` → a WAV of his voice for one line. It exists only if that whole turn was about one person.
- Sort groups gain `history` (`earlier_count`, `first_at`, `last_spoken_at`) and `encourage`. *"Tell them how you feel. Communication helps."* appears on at most one card, and only when:
  - he's said things to that person before;
  - nothing to them is held, or went out in the last 7 days;
  - it wasn't shown for them in the last 72 h;
  - the rant was safe.

  It's decided once per rant, so sorting again doesn't change it.

**The knock** (`app/attention.py`, a pure policy, tested with a moving clock). The app calls `POST /api/knock/check {asset_id, dwell_ms, zoomed, revisit, session_id}` about 3, 4 and 6 seconds into a photo. The answer is almost always `{knock: false, reason}`.

| Gentle mode (the default) | |
|---|---|
| A photo he's talked on | after 4 s, or right away on a zoom or a second visit |
| Any other photo | only the first knock ever, after 6 s |
| Caps | 1 per app session, 2 a day, 3 h apart. A knock about her unheard reply may skip the 3 h gap, never the caps. |
| Backing off | dismissed: 72 h of quiet for that person. Dismissed twice in a row: no knocks for 7 days. Opening one resets it. |
| Safety | nothing for 24 h after a safety concern |
| What it says | her unheard reply (*"Mom left you a voice note today."*), else body B when 2+ people reached out this week, else body A |

The app reports what happened with `POST /api/knock/{id}/outcome {outcome: opened | dismissed | ignored}`. `PATCH /api/settings {knock_mode}` takes `gentle`, `off` (never), or `demo` (after 3 s, no caps, for recording). `POST /api/demo/attention/reset` clears the ledger.

**Push** (`app/push.py`, through the Expo Push API). Only three things can push:

| Kind | When | Says |
|---|---|---|
| `reply` | her reply arrives | *"Mom left you a voice note today."* |
| `ready` | a held letter's moment comes and it needs his tap (no WhatsApp Cloud API) | *"It's 8:00 AM for Mom. Send it now?"* |
| `drift` | At most weekly, and only when all hold: words have waited 5+ days, he's been away 3+ days, it's 6–9 PM his time, and there's been no safety concern in 7 days. Each one he doesn't open doubles the wait (1, 2, 4 weeks). | body A or B, with no sound |

- **Quiet hours.** Every push waits out his quiet hours (22:30–08:00 his time, in `/api/settings`).
- **Re-checked when due.** A reply he already heard, or a letter he already sent, is dropped.
- **Sent once.** A token Expo reports as `DeviceNotRegistered` is never used again.
- **Off switch.** `push_enabled: false` stops all of it.

`POST /api/push/register {token, platform}` takes an `ExponentPushToken[…]`. `POST /api/push/permission {granted}` records that he was asked, so he's never asked again (`settings.permission_asked`).

**Expo Go can't receive remote push** (SDK 53 and later, [Expo FAQ](https://docs.expo.dev/push-notifications/faq/)). So `mobile/src/lib/push.ts`:

- Never asks at launch. It asks once, right after he holds a letter, and only if it can deliver something.
- In Expo Go, schedules a **local** notification at each held letter's `remind_at`. The time is shifted onto the phone's clock, so the demo clock works too. The notification is cancelled if he sends or cancels the letter first.
- In a development or store build with an EAS projectId (`npx eas-cli init`, then a dev build), registers its token, and the server sends all three kinds.

## Tests and the safety eval

```bash
uv run pytest                        # 57 tests: sorting, time zones, safety, memory, knocks, push, the whole evening end to end
uv run python scripts/eval_safety.py # 30 fixture rants through the gate
```

Today, with the phrase layer only (no key): **9/10 concerning rants routed to resources, 0/20 ordinary rants blocked.** The miss is the subtle one ("there's no point… I don't see a reason to keep going"), which is what Spark's layer is for. Re-run with `MODEL_API_KEY` set and only put that number on the Devpost.

## Honest limits

- The demo's knock appears **inside Unsaid**. A notification on top of the Photos app is the film's composite and the Round 2 ask.
- Sarah's and Michael's replies happen in Messages and Instagram, where Unsaid can't see them.
- In Expo Go there's no remote push: only the local reminder for a held letter. Her reply and the weekly nudge need a development build with an EAS projectId.
- One user per deploy (the demo cast). Card links are unguessable tokens that expire in 30 days and can be revoked; they aren't identity checks.
- Audio is sliced on turn boundaries (Voice Transcribe has no word timestamps), so pause between people when you talk.
