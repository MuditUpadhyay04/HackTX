# mobile/: the Un-Said app (Expo, SDK 58)

The real app for the demo. Your actual photo gallery → open a photo → the Un-Said icon → say it out loud → Un-Said splits it by person → his own lines become a letter → it leaves through WhatsApp, Messages or Instagram. Styled with Gurneal's design system in [`../design/`](../design/) (his App-UI-Final handoff). It talks to the backend in `../backend`, which is unchanged.

## Run it on your iPhone

1. Install **Expo Go** from the App Store.
2. The laptop and the iPhone must be on the same network (the laptop on your iPhone's hotspot works).
3. Start the backend: `cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000` (with `APP_KEY` set).
4. Set `mobile/.env.local` (git-ignored):
   ```
   EXPO_PUBLIC_API_URL=http://<laptop IP>:8000
   EXPO_PUBLIC_APP_KEY=<the backend's APP_KEY>
   ```
5. `cd mobile && npx expo start --lan`, then scan the QR code with the iPhone camera (or type `exp://<laptop IP>:8081` in Expo Go).
6. Allow Photos and Microphone when asked. If Windows Firewall asks about Node.js or Python, allow private networks.

Installs need `--legacy-peer-deps`; `.npmrc` sets it. Add native libraries with `npx expo install <pkg>` only.

## Screens

| Route | Screen | Spec |
|---|---|---|
| `/` | Gallery (Photos look-alike, real photos). Un-Said icon top-right → Home | user ask |
| `/photo/[id]` | One photo. Un-Said icon → Talk. After 3.5 s, the knock slides down (body A) | 3.15 |
| `/talk` | Say it out loud. Live transcript over the backend's WebSocket (Muse Voice Transcribe), connected-apps rail, then the split | 3.7 |
| `/pile/[person]` | For Mom: his lines, nothing pre-picked, channel sheet | 3.8 |
| `/preview` | The letter as she'll see it; Hold until her morning / Send now; hands off to the real app | 3.4, 3.9 |
| `/home`, `/letters`, `/you` | The three tabs | 3.1, 3.6, 3.12 |
| `/letter/[id]`, `/connect`, `/safety` | Received letter, Connect photos, Safety | 3.5, 3.13, 3.14 |

## Honest notes

- **Connect photos:** Photos is a real permission. Instagram and Facebook import aren't built in the backend; those two rows are demo toggles that connect nothing. The connected-apps rail on Talk is real in one sense only: each app can be *opened with the words ready* (WhatsApp, Messages, Instagram via clipboard, Messenger via clipboard). Un-Said never reads any chat.
- **The knock** appears inside Un-Said's own photo viewer. On top of the real Photos app it would need Meta-level OS access (the Round 2 ask).
- **Live transcript:** `expo-audio`'s AudioStream feeds 24 kHz PCM to `/api/rants/live`. If the socket fails, the WAV it also recorded is uploaded instead.
- **Not built yet:** Compose/drafts (no draft storage in the backend, so "Edit as a draft" is hidden), "Keep this moment" (no vault endpoint), recording a self-note in the app (needs `expo-camera`), the faces popup, and Dad (not a person in the backend).
- **Cast:** the backend's demo people were renamed through its API to Gurneal's cast (Riley, Mom, Sarah, Michael). IDs stay `me`, `mom`, `jordan`, `priya`.

## COPY NEEDED (strings this app shows that aren't in COPY_AND_NAMES.md)

For Gurneal. They are kept as-is until he writes the real ones.

| Where | String |
|---|---|
| Gallery | "Library" · "N photos" · "Un-Said looks through your photos with you, on this phone." · "Allow photo access" |
| Home | "Your photos" / "Find the people you miss." · ready strip "it's 8:02 AM for Mom" · "Can't reach Un-Said's server." |
| Talk | typed-mode pill "Done" · "Talk instead" · "Sorting…" · "mock transcription (no Muse key on the server)" · empty split "nothing in that was about anyone yet. it's kept, just for you." · self-note card "you left yourself a note for a night like this." · alerts "Couldn't hear that", "That didn't go through" |
| Apps rail sheet | "Connected" · "When you're ready, Un-Said opens {app} with your words ready. You tap send. It never reads your chats." · "Done" |
| Preview | chip "arrives {time}" · alert "That didn't send" |
| Letters / letter | "voice reply" (no duration yet) · footer day ("today", "on tuesday") |
| You | "Server …" and the provider line under Settings · "asleep · 5:02 AM for Mom" |
| Permissions | "Microphone access is off for Expo Go. Turn it on in Settings." |
| Talk, on a photo he's spoken on before *(proposed)* | overline "Said here before" · "{name} · {day}" under each of his lines · "Listen" / "Pause" |
| Split, on at most one card *(proposed, Mudit's line)* | "Tell them how you feel. Communication helps." |
| The knock, when exactly two people reached out this week *(proposed variant of Gurneal's body B)* | "{A} and {B} both reached out this week. Some things are easier to say here first." |
| Preview, held, the one notification ask *(proposed)* | "Want a quiet heads-up when it's {name}'s morning?" (the letter will need his tap) · "Want a quiet heads-up when {name} answers?" (it goes by itself; dev builds only) · "Yes" · "Not now" |
| Notification, a held letter's moment *(proposed)* | title "Un-Said" · "It's {time} for {name}. Send it now?" |
| Notification, her reply | "{name} left you a voice note {day}." (the knock's reply line, reused) |
| Android notification channel *(proposed)* | "Letters" |
