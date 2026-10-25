# Grok Bot change log

Running log of every change Grok Bot makes. Times are America/Chicago (CDT). Newest entries are at the top. Updated after every message Gurneal sends to Grok Bot.

## Oct 25, 2026, 12:30 AM CDT

QA on `1843560` (HackTx2). One commit on `unsaid-overhaul`, `b62a45e`:

- Preview hold follows sleep, not channel. While the person is asleep (any channel: WhatsApp, iMessage, Instagram), "Hold until her morning" is offered and is the default. Awake, the hold box is hidden and the letter goes now. The pill says "Send when they're ready" while holding and "Send now" otherwise. The backend's release time was already channel-agnostic; a test now covers Sarah (iMessage) being held while asleep.
- Preview: the dock sits over the scroll's bottom padding (dock height), so "Send now" isn't hidden at 402 wide.
- Settings Switch: theme track/thumb colors, no react-native-web teal.
- Letter de-dupe: a selected piece whose words are already inside another selected piece is left out of the letter, in the app preview and in the card the backend builds. Sarah's seeded "I miss the way we used to talk." no longer repeats.
- Home reply title wraps to 2 lines; Talk's wide (Duo) side panel is top-aligned; Letters hides the avatar strip with a single sender. The settings debug line was already `__DEV__`-only.
- Skipped: QA 7 and 8 (copy, Gurneal). No new copy was written; the awake case hides the hold box rather than adding a line.

Checks: tsc and expo lint clean; expo export for iOS, Android and web works; backend pytest 64 passing.

## Oct 25, 2026, 12:07 AM CDT

Nick asked for no dark mode, a way to send a video with a letter, and a reminder that the goal is the new frontend running on the existing backend. Three commits are on `unsaid-overhaul`:

- `14611e9` Light theme. Every screen is white or near-white, with ink #1D1742 text and the blue/violet brand as light accents. Text and accent colors pass WCAG AA. `userInterfaceStyle` is `light` and the status bar is dark. There is no dark mode.
- `c468021` Video with a letter. On Preview, "Add a video" records or picks a clip of up to 60 seconds, shows a thumbnail, and has a Remove option (expo-image-picker 58.0.10, expo-video 58.0.12, SDK 58, works in Expo Go). The backend has a new `POST /api/cards/{id}/video`, and `video_url` is now on `GET /api/cards/{id}` and the public card. `backend/web/card.js` plays it in a `<video>`. A backend test was added.
- `1843560` QA fixes:
  - A shared card still hands off.
  - Hold is on by default.
  - The Preview card is compact.
  - Pile ticks every line.
  - Talk: the encourage line is gone, the transcript sits behind a tap, and "+N more" is correct.
  - Home hides the lane when it would only show seed photos.
  - Settings shows the debug line only in dev.
  - The photo top bar is hidden while the knock shows.
  - "Your people" is row 2 on You.

Checks: tsc and expo lint are clean; expo export for iOS, Android and web works; backend pytest has 61 passing. Screenshots are in `/workspace/unsaid-shots/light-*.png` on the box. The recipient card page (`backend/web`) is still dark.

## Oct 24, 2026, 11:52 PM CDT

Two commits on `unsaid-overhaul`, mobile only, with no backend, API, or feature changes:

- `938b7cf` finishes the phone-portrait layouts (402×874):
  - Talk's app rail moves into a tool row above the dock, so it no longer overlaps the transcript.
  - Gallery, Photo and knock, Pile, and Preview are re-laid out against the reference image.
  - Home, Letters, and You get a second pass.
  - The Android adaptive icon is fixed.
  - The web build no longer crashes on push setup.
- `fc1a66e` re-lays out every screen live for any window size (iPhone Duo outer and inner displays, landscape, Split View):
  - A new `useLayout` hook.
  - `orientation: default`.
  - Two columns when the window is wide.
  - Safe areas on the left and right.

`32afd00` (EAS and the demo runbook) was already on the branch. It was rebased onto and left unchanged. tsc, lint, and the iOS, Android, and web exports pass. Launching into Home vs. the gallery is still open. Nothing was built or published to EAS, and PR #1 was not merged. OVERHAUL_STATUS.md is updated.

## Oct 24, 2026, 11:19 PM CDT

Stopped at Gurneal's request at 11:19 PM CDT. No further design or feature work. `unsaid-overhaul` tip is `6703bf4` (handoff). App restyle is `259c00b`. Handoff document is `4cf6071`. SHA line is `13abbe4`. `mobile/OVERHAUL_PROGRESS.md` is copied here as OVERHAUL_STATUS.md.

## Oct 24, 2026, 11:12 PM CDT

Checkpoint `259c00b` on `unsaid-overhaul`. Restyled the Expo app: splash into Home, illustrated portraits, and the demo path (Gallery, Photo knock, Talk, Pile with time zone, Preview) plus Home, Letters, You, Letter, Connect, and Safety. Settings and Notes use the real APIs. Same calls, no backend edits. EAS Update is prepared (expo-updates, runtimeVersion appVersion, preview channel) and was not published. Typecheck, lint, and `npx expo export` (iOS, Android, and web) pass. Progress file copied here as OVERHAUL_STATUS.md.

## Oct 24, 2026, 11:10 PM CDT

Gurneal told Grok to stop tracking Claude and focus only on the Un-Said app. The Claude watcher is paused. The overhaul priorities are (1) the core demo flow: Gallery, Photo + knock, Talk, Pile, Preview; (2) the Home/Letters/You tabs; (3) Letter, Connect, Safety. Checkpoints get pushed early and often.

## Oct 24, 2026, 11:10 PM CDT

Gurneal clarified ownership. Grok Bot is the ONLY one building the Un-Said app itself (the overhaul of mobile/ on unsaid-overhaul). Claude Code builds everything else for the demo (iPhone Fold device, mock WhatsApp/iMessage/Instagram apps, animations) in Branched-Frontend/, where Un-Said is only an icon or placeholder.

## Oct 24, 2026, 11:09 PM CDT

Gurneal asked how the frontend is going. Grok checked the unsaid-overhaul progress and the Claude Code branched-frontend build.

## Oct 24, 2026, 11:01 PM CDT

Gurneal asked that Grok's context file be named grok.md and updated with every chat message.

## Oct 24, 2026, 11:00 PM CDT

Created this context branch.

## Oct 24, 2026, 10:57–10:59 PM CDT

Gurneal asked that the overhaul be ready to test through Expo. An Expo account is now available to publish an EAS Update preview once the overhaul is done. The app still needs a phone-reachable backend URL (`EXPO_PUBLIC_API_URL`).

## Oct 24, 2026, 10:57 PM CDT

Scope narrowed. Nothing under `backend/` (including `backend/web/`) is changed. `mobile/` only.

## Oct 24, 2026, 10:55 PM CDT

Started the Un-Said frontend overhaul on branch `unsaid-overhaul` off main. It reads Mudit's latest backend first (photo memory, gentle knocks and settings, Expo push reminders, safety resources, "A letter from {name}" previews), then restyles and improves the flow of every `mobile/` screen with Gurneal's tokens (bg #0F0D15, surface #191622, raised #211E39, blue #4F62F4, violet #A890F6, indigo #4046EE, letter #EEEAFB, ink #1D1742), with the same features and API calls. The handoff file is `mobile/OVERHAUL_PROGRESS.md` on that branch.

## Oct 24, 2026, 8:37 PM CDT

Seeded `Branched-Grok/Grok-progress.md` on `branched-frontend`.
