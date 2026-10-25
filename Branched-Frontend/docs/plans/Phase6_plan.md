# Phase 6 plan: Meta shells, completeness, click-through, ready for animation work

**Planner:** Opus (Fable out of credits). **Spec:** `docs/CLAUDE_PROMPT.md` Phase 6 block.

## Packages (Wave 1 parallel; Wave 2 = P6-G, P6-H)
| ID | Owner | Files | What |
|---|---|---|---|
| P6-A | opus-builder-apps (Facebook) | `components/lookalike/facebook/*`, `lib/mock/facebook.ts`, `assets/images/fb-*.svg` | Home ("Home" title, create/search/Messenger glyphs), "What's on your mind?" with Riley's avatar, stories strip, 4 posts (Mom recipe photo, campus page, friend's lake photo, group post), like toggles, post detail, tab bar Home/Video/Friends/Marketplace/Notifications/Menu; everything else `facebook:<control>`. |
| P6-B | opus-builder-apps (Meta AI) | `components/lookalike/meta-ai/*`, `lib/mock/meta-ai.ts`, `assets/images/meta-*.svg` | Glasses card (Ray-Ban Meta · 62% · connected), Recent media grid, "Ask Meta AI" pill with the gradient ring glyph, tabs Home/Gallery/Settings, empty chat with composer only; send = `meta-ai:send`; no generated text. |
| P6-C | opus-builder-apps (Instagram tabs) | `components/lookalike/instagram/{HomeFeed,SearchGrid,ReelsTab,Profile,IGTabBar}.tsx`, `assets/images/ig-*.svg` | Home feed + stories, Search grid, Reels tab (reuses viewer), Riley's profile grid; DM inbox/thread unchanged. |
| P6-D | opus-builder-apps (WhatsApp + Messages lists) | `components/lookalike/whatsapp/{UpdatesTab,CommunitiesTab,SettingsTab}.tsx`, `components/lookalike/imessage/ConversationList.tsx` | WhatsApp Updates/Communities/Settings look-alikes; chat list complete; Messages conversation list with Sarah ❤️🤍 on top. |
| P6-E | opus-builder-apps (replies) | `lib/mock/threads.ts` (replies, COPY NEEDED), `components/dev/NotificationsPanel.tsx` | "fire reply" buttons for Sarah and Michael (dev panel only). |
| P6-F | opus-builder-shell (registry) | `components/apps/registerAll.ts` | Register Facebook/Meta AI/IG tabs/WA tabs screens. |
| P6-G | opus-builder-scripts (click-through) | `scripts/clickthrough.ts`, `scripts/check-placeholders.ts` | Full click-through from /phone; PLACEHOLDERS.md with slot status. |
| P6-H | orchestrator | `docs/READY_FOR_ANIMATION.md`, `docs/PLACEHOLDERS.md` | Handover; last line "Status: ready for animation work." |

## Integration + review
build/lint/checks; clickthrough; re-run opening-check (pixel-identical to Phase 5); 10 reviewers until CLEAN; commit `branched-frontend: phase 6: Meta shells, completeness, click-through, ready for animation work` + push.
