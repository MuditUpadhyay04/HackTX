# Un-Said mobile overhaul — handoff

Branch: `unsaid-overhaul`, off `main` at `c32f7ee`. Mobile only until Pass 5, which adds the card-video endpoint in `backend/` and one line in `backend/web/card.js`.

- Pass 1 (Grok, stopped at Gurneal's request 11:19 PM CDT Oct 24): restyle of every screen. See "Done, by screen".
- Pass 3 (Grok, Oct 24): every screen re-lays out live for any window size and orientation (the iPhone Duo foldable's outer and inner displays, landscape, half-open, Split View). See "Pass 3".
- Pass 2 (Grok, Oct 24): phone-portrait finish of the demo path (Talk, Gallery, Photo + knock, Pile, Preview), second pass on Home / Letters / You, Android adaptive icon, web-build fix, verification and screenshots. See "Pass 2".

- Pass 5 (Grok, Oct 25): **video sending.** See "Pass 5: video with a letter".
- Pass 4 (Grok, Oct 24, ~11:55 PM CDT): **no dark mode.** Nick asked for white with light accents. See "Pass 4: light theme".

The app is for a **local demo**, not a hosted deployment. See "Local demo" below.

## Commits

- App overhaul: `259c00bc8e13d5fa552f7829d4841245ed852435`
- Handoff document: `4cf607183f6a5a4d2fd956360d363173bce6fead`, `13abbe4`, `6703bf4`
- Pass 2 (phone portrait): `938b7cf`
- Pass 3 (foldable / any window size): the commit that adds the "Pass 3" section (see `git log`)

Draft PR: https://github.com/MuditUpadhyay04/HackTX/pull/1 (not merged).

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
| `POST /api/cards/{id}/video` | Preview "Add a video" (multipart `file`, mp4/mov/webm, 80 MB cap). Sent after the card is made, before the handoff. Card JSON gains `video_url` |
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

- **Launch** (`src/app/index.tsx`). White (was `#0F0D15` before Pass 4), 120 pt icon, "Un-Said" 20 pt under it, then `router.replace("/home")`. Reduced motion is a short fade.
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

## Pass 2 — phone portrait (about 402×874)

Same features and API calls. Visual and layout work only, against `design/` tokens and `design/assets/ui-reference/unsaid-ui-reference.png`.

- **Talk** (`src/app/talk.tsx`). The app rail no longer floats over the transcript. The transcript is a full-width column at the 24 pt inset. The rail is now a compact tool row (32 pt glyphs, connected dots, same sheet on tap) above a hairline at the top of the dock, like the reference's mic / paperclip row, with "Type instead" trailing. The dock is in the layout flow, not absolutely positioned, so text can't run under it, and on iOS a `KeyboardAvoidingView` lifts the "Done" pill above the keyboard in type mode. "Said here before" sits in a surface card. The empty transcript shows the caret, as in the reference.
- **Gallery**. Tile size comes from `useWindowDimensions` (no stale `Dimensions` at import). Back chevron next to "Library" (back, or Home if there is no history). The permission ask is centered with an icon tile. Same grid, paging, and Un-Said icon.
- **Photo + knock**. A top scrim for legibility, centered date, accessible labels, back falls back to Gallery. The knock banner has a hairline border, the letter shadow, and a 3-line body clamp.
- **Pile**. The header card puts "Change" on the trailing edge (no wrapping into the channel line), with a hairline above the time chip. Lines are separated by hairlines and are accessible checkboxes. The dock is in the layout flow with a hairline and the caption "You decide when it leaves." under "Preview letter" (COPY_AND_NAMES 3.3). The empty state is a surface card.
- **Preview**. The dock is in the layout flow with a hairline. The delivery card has a moon well, a hairline, and 44 pt choice rows. Held state is a centered card with a check. Loading shows a letter-sized skeleton instead of an empty screen.
- **Letter card** (shared). The accent underline now starts under the start of the last line, as in the reference ("you too."), instead of hanging off the right edge.
- **Home**. Hero height follows the window width (370×288 at 402 pt, never below 248). The waiting strip and its progress line were checked with a held letter for Sarah ("arrives 8:00 AM her time"); progress uses `created_at` → `release_at` against the server clock.
- **Letters**. Empty state is a dashed card with a mail icon and the stand-in line.
- **You**. The rows are now grouped `un-surface` blocks with hairline dividers (spec 3.12). The 72 pt portrait has the gradient ring and sits beside "Riley".
- **Letter, Connect, Safety**. Screenshot-checked at 402×874. No layout bugs found. No changes.
- **Android adaptive icon** (`app.json`). The foreground was the full-bleed square art, which Android masks and crops, and the monochrome icon was Expo's default chevron. Now: `android-icon-foreground.png` is the white “ glyph inside the safe zone, `android-icon-background.png` is the icon's gradient with the glyph removed, `monochromeImage` is the glyph, and `backgroundColor` is now `#FFFFFF` (Pass 4).
- **Web build**. `usePushSetup` crashed the web bundle (`getLastNotificationResponse` isn't on web), so every screen rendered blank. It now returns early on web. Native behavior is unchanged.
- **Launch**. Still opens on Home (splash → Home). Whether the demo should open on the gallery instead is **still an open decision** for Gurneal.

### Checks (pass 2)

Node 22 (Expo SDK 58 needs Node 22.13 or newer). `npm ci`, `npx tsc --noEmit`, `npx expo lint`, and `npx expo export --platform ios|android|web` all passed.

Screenshots of the web build against the local backend (Playwright headless Chromium, 402×874, 2×) were saved on Grok's box in `/workspace/unsaid-shots/` (`phone-*.png`, `p1-*.png`). They are not committed. Web is a stand-in for the phone: native-only pieces (media library, haptics, push, the iOS action sheet) don't run there.

## Pass 3 — foldable and any window size (iPhone Duo)

Target: the iPhone Duo (5.4" outer and 7.6" inner displays, landscape, half-open poses, Split View). **No device size is hardcoded.** Every rule reads the live window from `useWindowDimensions`, so folding, unfolding, rotating, or resizing a Split View pane re-lays out the screen in place.

- **`src/lib/useLayout.ts`** (new). It returns `size: "compact" | "expanded"` (expanded at a window width of 600 pt or more), `landscape`, `short` (height < 520), `usableWidth` (width minus the left and right safe areas), the insets, and `column(max)`, a centered content column that clears the left and right safe areas (`READING_MAX` 640, `SPLIT_MAX` 1080).
- **`app.json`**: `orientation` is now `"default"` (it was `"portrait"`). `expo-screen-orientation` wasn't needed. iOS modals are portrait-only by default, so `Sheet` and the app-rail sheet pass `supportedOrientations` (all orientations).
- **Safe areas**: `NavBar`, sheets, the Talk/Pile/Preview docks, the Gallery header and grid, and the Photo chrome and knock banner all add `insets.left`/`insets.right`, so a side camera or rounded corner in landscape never clips content. Nothing assumes a notch or a Dynamic Island: all of it comes from `useSafeAreaInsets`.
- **Width caps**: the Letters, You, Settings, Notes, Connect, Safety, and Letter screens use a centered 640 pt column. The letter card is at most 480 pt wide and centered. Sheets and the knock banner are at most 560 and 480 pt wide.
- **Two columns when expanded**:
  - Home: the headline and hero on the left, the lists on the right. The hero height follows its pane and shrinks on short windows.
  - Pile: the person card and "Preview letter" on the left, the lines on the right.
  - Preview: the letter on the left, the delivery choice and button on the right.
  - Talk: the transcript on the left, and the tool row and mic in a 340 pt side panel. The split's person cards sit two across.
- **Gallery**: the column count follows the width (3 at about 402 pt, about 6 at 820–874 pt), and the list remounts when the column count changes.
- **Phone portrait is unchanged**: compact mode is the Pass 2 layout. This was re-checked at 402×874.

### Checks (pass 3)

`npx tsc --noEmit`, `npx expo lint`, and `npx expo export --platform ios|android|web` all passed. `expo config` shows `orientation: 'default'`.

Screenshots are from the web build at **approximate stand-in sizes**, not real Duo measurements, saved on Grok's box in `/workspace/unsaid-shots/`:

- `phone-*.png`: 402×874, outer display portrait.
- `duo-landscape-*.png`: 874×402, outer display on its side.
- `duo-inner-*.png`: 820×980, inner display unfolded.

They are not committed. Still untested on a real foldable: half-open (tabletop) posture, Split View resizing, and rotation animation. Web can't simulate those; check them on the device.

## What remains, in order

1. **Phone test** on a real device through Expo Go (see Local demo). Check the Talk keyboard lift, the knock banner, and the gallery with real photos — web can't show those. On the Duo, also check folding and unfolding mid-screen, landscape with the keyboard up in Talk, tabletop posture, and Split View.
2. **Launch decision**: Home (current) or the gallery first.
3. **Backend-dependent features** listed in `mobile/BACKEND_REQUESTS.md`: Keep this moment, Edit as a draft, saving the pile's channel on the person, real Instagram/Facebook import, recording a self note, a "Delivered" beat on the waiting strip, and `release_label` saying "her time" for everyone.
4. **EAS** (Nick, after logging into Expo): configure, preview build, and update. See below.
5. **`backend/web/`**. Out of scope. Do not edit it.

## Local demo (no hosted backend)

1. Backend on the laptop, listening on the network:

   ```bash
   cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

   Without Muse keys it uses mock transcription. Fresh seed: Riley, Mom, Dad, Sarah, Michael.

2. Point the app at the laptop's LAN IP (phone and laptop on the same Wi-Fi):

   ```bash
   cd mobile
   cp .env.example .env
   # EXPO_PUBLIC_API_URL=http://<laptop-LAN-IP>:8000   (macOS: ipconfig getifaddr en0)
   # EXPO_PUBLIC_APP_KEY=<backend APP_KEY, or empty if the backend has none>
   npx expo start
   ```

   Scan the QR code with Expo Go. If the phone can't reach the laptop's Metro server, `npx expo start --tunnel` tunnels the JS bundle. The tunnel does not carry the backend: the phone still has to reach `EXPO_PUBLIC_API_URL`, so keep both on the same Wi-Fi (or put the backend behind its own tunnel and use that URL). Don't commit `.env`.

3. Web preview on the laptop: `npx expo start --web` (uses `http://localhost:8000` by default).

## EAS (Nick runs these after `npx eas-cli login`)

```bash
cd mobile
npx eas-cli update:configure          # writes updates.url and extra.eas.projectId; commit those
npx eas-cli build --profile preview --platform ios      # or android; runtime 1.0.0
npx eas-cli update --branch preview --message "Un-Said overhaul" --environment preview
```

Set `EXPO_PUBLIC_API_URL` (the laptop's LAN IP for the demo) and `EXPO_PUBLIC_APP_KEY` in the shell or the EAS `preview` environment before building or updating; they are baked into the bundle. A preview build only receives updates for the same runtime (`1.0.0`). Expo Go does not load EAS Updates. Note: a standalone iOS build may block plain `http://` to a LAN IP (App Transport Security); Expo Go does not, so Expo Go is the simplest path for a local demo. Nothing was built or published by Grok.

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


## Pass 4: light theme (Oct 24, 2026)

Nick: "no dark mode, get rid of the black and change to white with light accents." This overrides the dark palette from Gurneal's original tokens for the app; `design/` itself was not touched.

- `src/theme/tokens.ts` neutrals flipped: `bg #FFFFFF`, `stage #F4F2FB`, `surface #F6F4FD`, `surfaceRaised #EEEAFB`, `hairline #E4E0F0`, text `#1D1742` / `#3B3570` / `#5F5A78` / `#66617E`, `danger #D70015`. Brand accents (blue `#4F62F4`, violet `#A890F6`, indigo `#4046EE`, the pill gradient and hero card gradient) are unchanged.
- New tokens: `onAccent` (white text/icons on the blue gradients), `accent #5B45D6` (violet text and small icons; plain `#A890F6` is only 2.6:1 on white), `tint` (violet at 16% for chips, wells, app glyphs), `scrim` (ink at 28% behind sheets), `shadow.card`.
- Contrast (WCAG AA, 4.5:1) checked for every text token on bg, surface and surfaceRaised: text 14.2+, text2 9.2+, text3 5.5+, text4 4.6+, accent 5.4+. White on the pill gradient is 4.8 to 6.3 except the violet end.
- Hard-coded dark colors removed: portrait backdrop, sheet scrims, gallery and photo viewer (`#000` -> white, Photos-style light chrome; the photo's top fade is now white), hero "+" tile, Photos glyph wells. Shadows softened to indigo at low opacity.
- `app.json`: `userInterfaceStyle: "light"`, splash/Android icon/background `#FFFFFF`. Root `StatusBar style="dark"`.

## Pass 5: video with a letter (Oct 25, 2026)

Nick asked for a video-sending feature. This is the first backend change on the branch (additive only).

- Mobile: `src/components/video.tsx` (`VideoAttach`, `pickVideo`). Preview shows "Add a video" -> a sheet with "Record a video" (camera) or "Choose from library". `expo-image-picker` with `mediaTypes: ["videos"]`, `videoMaxDuration: 60`, medium quality; iOS library picks can be trimmed. Attached: a muted `expo-video` thumbnail, the length, and Remove. On send, `api.uploadCardVideo` posts it to the new card before `markShared`/`handOff`, so the link in WhatsApp / Messages / Instagram opens a page that plays it. If the upload fails the letter still goes (toast).
- Packages (via `npx expo install`, SDK 58): `expo-image-picker ~58.0.10`, `expo-video ~58.0.12`. Both are in Expo Go.
- `app.json`: `expo-image-picker` plugin with camera, microphone and photo-library usage strings (NSCameraUsageDescription, NSMicrophoneUsageDescription, NSPhotoLibraryUsageDescription); `expo-video` plugin.
- Backend: `POST /api/cards/{card_id}/video` in `routes/student.py` (reuses `VIDEO_TYPES`, `MAX_VIDEO`, `_read_limited`; 415 / 404 / 409 for a revoked card), file saved to `media/videos/{card_id}.{ext}`, new `cards.video_path` column via `db.MIGRATIONS`. `video_url` is returned by `GET /api/cards/{id}` (`store.card_out`) and `GET /api/public/cards/{token}`. `web/card.js` renders a `<video controls playsinline>` under the photo (one line). Test: `tests/test_public.py::test_a_video_rides_with_the_letter_to_her_page`.
- Not done: attaching the video file itself to the native share sheet. The handoff opens WhatsApp/Messages with the link (the link plays the video); a file attach would replace that deep link with the generic share sheet.

## Pass 6: QA fixes on 1843560 (Oct 25, 2026)

QA (HackTx2) on 1843560. Items 7 and 8 are copy and wait for Gurneal; 14 needed no change.

- Preview hold follows sleep, not channel (QA 1, 2). `holdable = person.is_asleep` for every channel (was WhatsApp only). Awake: the "Hold until her morning" box is hidden and the letter goes now. Asleep: Hold is the default, Send now is the other choice. The dock pill reads "Send when they're ready" while holding and reuses "Send now" otherwise. Backend `next_release_utc` was already channel-agnostic; new `tests/test_hold_and_letter.py` covers an iMessage letter held while Sarah sleeps and an awake "her_morning" request going out now.
- Preview dock (QA 3): the dock is absolute at the bottom and the ScrollView's bottom padding is the measured dock height + 32, so "Send now" scrolls clear of it at 402 wide.
- Settings Switch (QA 4): `trackColor {false: hairline, true: accent}`, `thumbColor bg`, `ios_backgroundColor hairline`, and web-only `activeThumbColor bg` (no react-native-web teal).
- Letter de-dupe (QA 5): a piece whose words are contained in another selected piece is dropped from the letter. Same rule in `mobile/src/lib/api.ts letterLines()` (Preview) and `backend/app/delivery.py letter_lines()` (the card she gets); every selected piece is still marked `in_card`. Sarah's seeded "I miss the way we used to talk." no longer repeats under tonight's longer line. Test in `test_hold_and_letter.py`.
- Home reply title wraps to 2 lines (QA 6).
- Talk on a wide screen (QA 9): the side panel is top-aligned with the transcript (`paddingTop 24`, tools row, then the mic block), no centered float.
- Letters (QA 10): the avatar strip only shows with 2+ senders.
- Settings debug lines (QA 14): already inside `__DEV__`, so hidden in release builds. Left as is.
- Copy for Gurneal: none new. The awake case hides the hold box instead of inventing an "Arrives now" line; the send pill reuses "Send now".
