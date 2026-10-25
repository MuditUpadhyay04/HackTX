# Un-Said mobile overhaul

Branch: `unsaid-overhaul` (off `main` at `c32f7ee`). Mobile only. Nothing under `backend/` is changed.

Last updated: Oct 24, 2026, 11:10 PM CDT.

## API and feature map

Read from `backend/app` on `main`. The app calls these. Shapes live in `mobile/src/lib/api.ts`.

| Call | Used for |
|---|---|
| `GET /api/home` | Riley, people, cards (held/ready, `release_label`, `remind_at`, `remind_body`), replies, reminders, self notes, photos ("your lane"), nudges, providers, clock |
| `GET /api/people/{id}/pieces` | Your words rows and the pile. Nothing is pre-selected |
| `PATCH /api/people/{id}` | Time-zone chip. Body may include `timezone`, `morning`, `language` |
| `POST /api/rants/audio` and live `ws` | Talk, mic. Falls back to the WAV upload |
| `POST /api/rants/text` | Type instead |
| `POST /api/rants/{id}/sort` | Split into person cards. `safety != ok` opens Safety with the returned resources |
| `GET /api/memory/photo?asset_id=` | "Said here before" on a photo |
| `GET /api/pieces/{id}/audio` | Listen to his own line (`authedUrl`) |
| `POST /api/photos` | Gallery photo attached when a letter is created |
| `POST /api/cards` | Preview. `when` is `her_morning` or `now` |
| `POST /api/cards/{id}/shared` | He handed off. Un-Said does not show a chat |
| `POST /api/cards/{id}/revoke` | Cancel on the waiting strip. Toast: "Kept as a draft." |
| `POST /api/replies/{id}/heard` | Opening or playing a letter |
| `POST /api/reminders/{id}/done` | Open Instagram / Messages / WhatsApp |
| `POST /api/knock/check` | Photo knock. Usually no |
| `POST /api/attention/{id}/outcome` | opened / dismissed / ignored |
| `GET` and `PATCH /api/settings` | Knocks, quiet hours, push flag |
| `POST /api/push/register` and `POST /api/push/permission` | After he holds a letter. Never at launch |
| `GET /api/safety/resources` | Safety opened from You |

Cast from the seed: Riley (`me`), Mom (`mom`, WhatsApp), Dad (`dad`, WhatsApp), Sarah (`jordan`, Messages), Michael (`priya`, Instagram). Display names are already Sarah and Michael. Inside Un-Said, Sarah has no hearts.

`GET /api/home` also returns `photos` and `nudges`. The app shows them now.

## Done

- Launch splash on `#0F0D15`: 120 pt icon, "Un-Said" underneath, then Home. Gallery stays a screen, opened from Your photos.
- Tokens unchanged in value. System font only. Illustrated portraits for Riley, Mom, Dad, Sarah, Michael (icon palette, not initials, not photos).
- Home: hero, Your words, Say it out loud, Your photos, Your lane, waiting strip with a progress line, ready-to-send, reply nudges, waiting on you. Pull to refresh. Loading and error. "+" asks who it's for, then Talk or that person's pile.
- Letters: story rings open the newest unheard letter. Empty state. Loading and error.
- You: Notes, Connect photos, Safety and support, Settings, Your people. Footer "powered by Meta AI".
- Settings: gentle / off / demo, quiet hours, push flag. Calls the real settings API. Server line kept at the bottom.
- Notes: lists `self_notes`. Watch opens the file URL.
- Gallery, photo viewer, and the knock banner. Same knock API.
- Talk: live transcript, mic, type instead, start over, split cards, "Keep it just for me", photo memory, voice back, app rail. Sorting shows skeletons. Write-back opens Talk titled "To {name}".
- Pile: line toggles, channel sheet, time-zone sheet (`PATCH`), preview. Empty state.
- Preview and hold-until-morning. Same `createCard` / handoff.
- Letter: lavender card, underline, listen, translation, Write back, "Take your time."
- Connect photos and Safety (no gradient). Safety from You loads `GET /api/safety/resources`.
- Haptics on press, tabs, toggles, hold. Stack slides in from the right. Splash and photo fade.
- EAS Update prep, not published. See below.
- `npx tsc --noEmit`, `npx expo lint`, `npx expo export` (iOS and Android), and `npx expo export --platform web` pass. Web deps: `react-dom` and `react-native-web`.

## In progress

- Screenshots of Home, Talk, Pile, Preview, and Letters on Expo web.

## Still to do

- Save those screenshots as artifacts.
- Another pass on Gallery, Photo, and Talk spacing against the reference image.
- Web presentation under `backend/web/` is out of scope. Do not edit it.

## How to run

```bash
cd mobile
cp .env.example .env
# Edit .env. The phone has to reach the API host. Do not commit .env.
npx expo start
```

`EXPO_PUBLIC_API_URL` is the backend origin with no trailing slash (local default `http://localhost:8000`). `EXPO_PUBLIC_APP_KEY` must match the backend `APP_KEY`. Leave the key empty only when that server does not require one.

Expo Go: scan the QR code from `npx expo start`. A tunnel (`npx expo start --tunnel`) is the way to reach a laptop from a phone that is not on the same network.

## EAS Update (do not publish from this VM)

Ready:

- `expo-updates` installed
- `runtimeVersion.policy` is `appVersion` (currently `1.0.0`)
- `eas.json` has a `preview` build profile with `channel: "preview"` and `environment: "preview"`
- `slug` is still `unsaid`. No `owner` field was added.

Not written yet, because there is no Expo project id in the repo. While logged in, once:

```bash
cd mobile && npx eas-cli update:configure
```

That fills `updates.url` and `extra.eas.projectId`. Then publish:

```bash
cd mobile && npx eas-cli update --branch preview --message "Un-Said overhaul" --environment preview
```

The two public env vars have to be present when the bundle is built. Either export them in the shell (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_APP_KEY`) or set them on the EAS `preview` environment. No secret values belong in the repo.

`expo-updates` is native. An existing Expo Go session loads the dev server. A phone only receives this update if it already has a preview build of this runtime (`npx eas-cli build --profile preview --platform ios` or `android`). This VM did not build or publish.

## Copy for Gurneal

Used as written from `design/COPY_AND_NAMES.md`, including proposed lines ("Only you can hear this.", "Here's who that was for.", "Held for {name}'s morning.").

Kept from the app or from `backend/web/COPY_NEEDED.md`:

- "Your lane", "Your photos" / "Find the people you miss."
- "Can't reach Un-Said's server."
- "sorting it by person…"
- "Said here before", "nothing in that was about anyone yet. it's kept, just for you."
- "we're not going to show memories right now."
- "Library", "Allow photo access"
- App-rail sheet: "When you're ready, Un-Said opens {app} with your words ready. You tap send. It never reads your chats."

New, where neither file had a line. Short stand-ins:

| Where | Line |
|---|---|
| Your words, empty | The lines you keep show up here. |
| Letters, empty | When someone writes back, it lands here. |
| Hero sheet | Who is this for? |
| Error pill | Try again |
| Notes, empty | Notes to yourself show up here. |
| A saved note | Watch |
| Pile, empty | Nothing in your words for them yet. |
| Settings | Knocks · Gentle · A quiet knock, rarely. · Off · No knocks. · Demo · Knocks a little sooner, for showing the app. |
| Settings | Quiet hours · 10:30 PM – 8:00 AM · 11:00 PM – 7:00 AM · 9:00 PM – 9:00 AM |
| Settings | Heads-up · When a letter is ready · Un-Said asks once, after you hold one. |
| Toast after settings | Saved. |
| Time-zone sheet | Their time zone · Central · Eastern · Pacific · India · UK |
| Time-zone error | That didn't save |

Permission strings now say "Un-Said". Mic: "Un-Said listens only while you talk."

Not built, on purpose, because the control would do nothing. See `BACKEND_REQUESTS.md`.

- Keep this moment
- Edit as a draft
- Connect on Instagram or Facebook does not import photos. The checkmark is only on this phone.
- Record a new note to yourself. The list can play ones the server already has.
