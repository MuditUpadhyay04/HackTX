# Grok Bot change log

Running log of every change Grok Bot makes. Times are America/Chicago (CDT). Newest entries are at the top. Updated after every message Gurneal sends to Grok Bot.

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
