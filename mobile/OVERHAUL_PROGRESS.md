# Un-Said mobile overhaul — handoff

Stopped at Gurneal's request, 11:19 PM CDT, Oct 24, 2026. No further design or feature work in this run.

Branch: `unsaid-overhaul`, off `main` at `c32f7ee`. Mobile only. Nothing under `backend/` was changed.

## Commits

- App overhaul: `259c00bc8e13d5fa552f7829d4841245ed852435`
- Handoff document: `4cf607183f6a5a4d2fd956360d363173bce6fead`
- The tip of `unsaid-overhaul` is the commit that added this SHA line, directly on top of `4cf6071`.

Draft PR: https://github.com/MuditUpadhyay04/HackTX/pull/1

## API and feature map

Read from `backend/app` on `main`. Client shapes are in `mobile/src/lib/api.ts`. The UI did not change request or response shapes.

| Call | Used for |
|---|---|
| `GET /api/home` | Riley, people, cards (`release_label`, `remind_at`, `remind_body`, `release_at`, `created_at`), replies, reminders, self notes, `photos` (Your lane), `nudges`, providers, clock |
| `GET /api/people/{id}/pieces` | Your words rows and the pile. Nothing is pre-selected |
| `PATCH /api/people/{id}` | Time-zone chip. Body may include `timezone`, `morning`, `language`. No `channel` field |
| `POST /api/rants/audio` and the live websocket | Talk. Falls back to the WAV upload |
| `POST /api/rants/text` | Type instead |
| `POST /api/rants/{id}/sort` | Person cards. `safety != ok` opens Safety with the resources in the response |
| `GET /api/memory/photo?asset_id=` | "Said here before" on a photo |
| `GET /api/pieces/{id}/audio` | His own line, via `authedUrl` |
| `POST /api/photos` | Gallery photo attached when a letter is created |
| `POST /api/cards` | Preview. `when` is `her_morning` or `now` |
| `POST /api/cards/{id}/shared` | Handoff. Un-Said does not show a chat |
| `POST /api/cards/{id}/revoke` | Cancel on the waiting strip. Toast: "Kept as a draft." |
| `POST /api/replies/{id}/heard` | Opening or playing a letter |
| `POST /api/reminders/{id}/done` | Open Instagram / Messages / WhatsApp |
| `POST /api/knock/check` | Photo knock. Usually no |
| `POST /api/attention/{id}/outcome` | opened, dismissed, or ignored |
| `GET` and `PATCH /api/settings` | Knocks, quiet hours, push flag |
| `POST /api/push/register` and `POST /api/push/permission` | After he holds a letter. Never at launch |
| `GET /api/safety/resources` | Safety opened from You |

Cast in the seed: Riley (`me`), Mom (`mom`, WhatsApp), Dad (`dad`, WhatsApp), Sarah (`jordan`, Messages), Michael (`priya`, Instagram). Inside Un-Said, Sarah has no hearts.

## Done, by screen

- **Launch** (`src/app/index.tsx`). `#0F0D15`, 120 pt icon, "Un-Said" 20 pt under it, then `router.replace("/home")`. Reduced motion is a short fade.
- **Home**. Wordmark, portrait, headline, hero card, Your words from pieces, Say it out loud, Your photos, Your lane (`home.photos`), waiting strip with a progress line, ready-to-send, reply nudges, waiting on you. Pull to refresh. Loading and error. "+" opens "Who is this for?" then Talk or that pile.
- **Letters**. Header, story rings (unread ring, tap opens the newest unheard), rows, empty state, loading and error.
- **You**. 72 pt portrait, Riley, Notes, Connect photos, Safety and support, Settings, Your people, "powered by Meta AI".
- **Settings** (new). Gentle / Off / Demo, three quiet-hour presets, push flag. Real `GET`/`PATCH /api/settings`. Server line kept at the bottom.
- **Notes** (new). Lists `self_notes`. Watch opens the media URL. No recorder.
- **Letter**. Shared lavender card, accent underline, listen row, translation under the card, Write back opens Talk as "To {name}". "Take your time." No "Keep this moment" (no API).
- **Safety**. No gradient. Loads `GET /api/safety/resources` when opened from You. Rant path still uses the resources passed from sort. Link labels capitalized for display. Feature ids on the pills. Concern line when a rant sent him here.
- **Connect**. Same three rows. The four privacy lines are split. Instagram and Facebook still only toggle on this phone.
- **Shared UI**. Tokens unchanged in value. System font only. Illustrated portraits (Riley, Mom, Dad, Sarah, Michael). Press scale, haptics, tab haptic, stack slide from the right. Letter card underline. Sheet component.
- **EAS**. `expo-updates` installed. `runtimeVersion.policy` is `appVersion` (`1.0.0`). `eas.json` preview profile has `channel: "preview"` and `environment: "preview"`. `slug` is still `unsaid`. No `owner`. Not configured with a project id and not published.
- **Checks on `259c00b`**. `npx tsc --noEmit`, `npx expo lint`, `npx expo export` (iOS and Android), and `npx expo export --platform web` passed. Web packages added: `react-dom`, `react-native-web`.

## Half-done

- **Gallery** (`src/app/gallery.tsx`). Moved off the launch screen. Same grid, permission ask, and Un-Said icon back to Home. Not re-laid against a Photos reference beyond type color and a haptic.
- **Photo + knock**. Same full-screen viewer and banner. Added a haptic when a knock drops in. Banner layout is the previous one.
- **Talk**. Same record, type, split, private save, photo memory, voice playback, and app rail. Added write-back title and channel line, sorting skeletons, a mic ring, and the caption "sorting it by person…". Not matched side-by-side to the reference image.
- **Pile**. Toggles, channel sheet, preview, and empty state work. Time-zone sheet calls `PATCH` and is the new part. Channel choice is not saved on the person. "Edit as a draft" is not a separate screen.
- **Preview**. Same letter, hold-until-morning, send, and heads-up ask. Only a success haptic was added. The underline comes from the shared letter card.
- **Screenshots**. Not saved. A headless capture was started and then this run was stopped. Do not treat any partial PNG as a review artifact.
- **`updates.url` and `extra.eas.projectId`**. Still absent. `eas update:configure` has to be run by someone who is logged in.

## What remains, in order

1. **Gallery, Photo + knock, Talk, Pile, Preview.** Put them next to `design/assets/ui-reference/unsaid-ui-reference.png`. Gallery is no longer the first screen (splash goes to Home; Your photos opens the gallery). Decide if the demo should open on the gallery instead. Talk's side rail still overlaps the transcript. Pile channel does not persist. Preview was not re-laid.
2. **Home, Letters, You.** Home is the most finished. Check the hero at 402 pt, the waiting-strip progress (it uses `created_at` and `release_at`), and empty copy. Letters has no replies in a fresh seed, so the empty state is what you will see. You is a row list, not a second visual pass.
3. **Letter, Connect, Safety.** Letter has no "Keep this moment". Connect does not import Instagram or Facebook. Safety is calm and wired. None of the three were screenshot-checked.
4. **Phone test.** See How to run and EAS below.
5. **`backend/web/`**. Out of scope. Do not edit it.

## How to run

```bash
cd mobile
cp .env.example .env
# Set the two vars below. Do not commit .env.
npx expo start
```

- `EXPO_PUBLIC_API_URL` — backend origin, no trailing slash. Local default in code is `http://localhost:8000`. The phone must be able to reach that host. `npx expo start --tunnel` if it is not on the same network.
- `EXPO_PUBLIC_APP_KEY` — must match the backend `APP_KEY`. Leave it empty only when that server does not require a key.

Backend, from `backend/`: `uv run uvicorn app.main:app --reload --port 8000`. Without Muse keys it runs on mock transcription. Fresh seed shows Riley, Mom, Dad, Sarah, Michael, four lane photos, Sarah's line "I miss the way we used to talk.", Dad's "I never said thank you.", and Michael's reminder "3 reels this week".

Expo Go loads the dev server. It does not load an EAS Update.

## EAS Update (do not publish from a machine that is not logged in)

Once, while logged in:

```bash
cd mobile && npx eas-cli update:configure
```

That writes `updates.url` and `extra.eas.projectId`. Then:

```bash
cd mobile && npx eas-cli update --branch preview --message "Un-Said overhaul" --environment preview
```

`EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_APP_KEY` must be in the shell or in the EAS `preview` environment when the bundle is built. No secret values are in the repo.

`expo-updates` is native. The phone receives the update only from a preview build of runtime `1.0.0` (`npx eas-cli build --profile preview --platform ios` or `android`). This run did not build or publish.

## Copy questions for Gurneal

Used as written from `design/COPY_AND_NAMES.md`, including proposed lines.

Kept from the existing app or from `backend/web/COPY_NEEDED.md`: "Your lane", "Your photos" / "Find the people you miss.", "Can't reach Un-Said's server.", "sorting it by person…", "Said here before", "nothing in that was about anyone yet. it's kept, just for you.", "we're not going to show memories right now.", "Library", "Allow photo access", and the app-rail sheet ("When you're ready, Un-Said opens {app} with your words ready. You tap send. It never reads your chats.").

Stand-ins, because neither copy file had a line:

| Where | Line |
|---|---|
| Your words, empty | The lines you keep show up here. |
| Letters, empty | When someone writes back, it lands here. |
| Hero sheet | Who is this for? |
| Error pill | Try again |
| Notes, empty | Notes to yourself show up here. |
| A saved note | Watch |
| Pile, empty | Nothing in your words for them yet. |
| Settings | Knocks. Gentle: "A quiet knock, rarely." Off: "No knocks." Demo: "Knocks a little sooner, for showing the app." |
| Settings | Quiet hours. "10:30 PM – 8:00 AM", "11:00 PM – 7:00 AM", "9:00 PM – 9:00 AM" |
| Settings | Heads-up. "When a letter is ready". "Un-Said asks once, after you hold one." |
| Toast | Saved. |
| Time zone | Their time zone. Central, Eastern, Pacific, India, UK |
| Time-zone error | That didn't save |

Permission strings now say "Un-Said". Microphone: "Un-Said listens only while you talk."

Not on screen, so they are not dead controls. See `mobile/BACKEND_REQUESTS.md`.

- Keep this moment
- Edit as a draft
- Real Instagram or Facebook photo import, and face clustering
- Recording a new note (`POST /api/self-notes` exists; the app does not capture video)
- A "Delivered" beat on the waiting strip
- `release_label` always says "her time", including for Dad
