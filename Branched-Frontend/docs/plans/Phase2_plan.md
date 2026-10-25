# Phase 2 plan: Act 1 apps, banners, the Un-Said splash, the dev panel

**Planner:** Opus (Fable out of credits). **Spec:** `docs/CLAUDE_PROMPT.md` Phase 2 block (THE SCRIPTS, WhatsApp calls, Reels, dev panel, receipts, chrome specs, interactive messaging, routes/states, components, acceptance, copy rules). Every string comes from THE SCRIPTS word for word.

## Waves
- **Wave 1 (foundations, parallel):** P2-A data/stores, P2-B iOS chrome, P2-I1 + P2-I2 illustrations.
- **Wave 2 (apps, parallel, after Wave 1 integrates):** P2-C WhatsApp thread, P2-D WhatsApp calls, P2-E Messages, P2-F Instagram DMs, P2-G Reels, P2-H Photos, P2-J splash + scenes + dev notifications.

## Decisions
- **Store:** rule 3a (zustand, `lib/store/*.ts`) wins over the Phase 2 line "React context + useReducer"; `lib/mock/messaging.tsx` re-exports the store hooks/actions so both spec paths exist.
- **Illustrations:** no image generator is available, so every mock photo/avatar/reel still is a finished, hand-drawn SVG illustration (flat, warm, editorial style; consistent palette; no stock, no real people). Source in `assets/images/*.svg`, served from `public/mock/*.svg`, indexed in `assets/README.md`.

## Interfaces (fixed before Wave 2)
- `lib/mock/clock.ts`: `NOW` = Sat Oct 24 2026 21:41 America/Chicago; `useMockClock()` → `{ now: Date-like minutes value, label "9:41" }` advancing in real time unless `?clock=frozen` or driven; `setDriven(t)`. All times are `MockTime = { y, mo, d, h, mi }` or ISO local strings `"2026-10-24T21:41"`; no `Date.now()` outside this file.
- `lib/mock/format.ts`: `waDatePill(t)` (Today / Yesterday / weekday within 7 days / "Sat, Oct 10"), `waTime(t)` ("9:02 PM"), `imsgStamp(t)` ("Today 9:41 PM", "Yesterday 1:12 AM", "Sunday 12:47 AM", "Sat, Oct 10 at 12:31 PM"), `igStamp(t)` ("Sun 7:26 PM", "Today 9:41 PM", "Sep 19, 11:12 PM"), `relativeDay(t)` ("Sun", "Wed", "Today").
- `lib/mock/people.ts`: Riley, Mom, Dad, Sarah ❤️🤍, Michael (Best Friend) (+ handle michael.ortiz on profile peek), WhatsApp background contacts (Fam, Roommates, Marfa Trip); each with `avatar` → `/mock/avatar-<id>.svg`, Mom tz America/Chicago.
- `lib/mock/threads.ts`: seed data word for word (Mom read + history, Sarah read + history, Michael read + history incl. reels/photo), WhatsApp chat list rows, Calls rows, quick replies, banner copy (Sarah, Michael, Un-Said copy A/B/C — B/C are COPY NEEDED until written), typed scripts ("love you too", "i just don't feel like talking rn", "im good bro just tired"), predictive words per thread, `typingAfterRead` (Sarah only).
- `lib/store/messaging.ts` (zustand) + `lib/mock/messaging.tsx` (re-export):
  - `Message { id; threadId; from: "me"|"them"|"system"; kind: "text"|"missed-call"|"call"|"photo"|"reel"|"encryption"; text?; at: string; receipt?: "sending"|"sent"|"delivered"|"read"|"seen"|null; imageId?; reelId?; callLabel? }`
  - `Thread { id; app: "whatsapp"|"messages"|"instagram"; contactId; messages; draft; unread; keyboard: boolean; theirTyping: boolean; presence: "online"|"active"|"offline" }`
  - actions: `focus(threadId)`, `blur(threadId)`, `type(threadId, ch)`, `backspace(threadId)`, `setDraft(threadId, text)`, `predict(threadId, word)`, `send(threadId)`, `receive(threadId, partial)`, `markRead(threadId)`, `seed(threadId, state, params)` (exact `?state=` frames: read, history, compose&typed=N, sent, read-receipt, typing), `reset()`; receipts per app timing from the spec, scheduled through the mock clock and skipped in driven mode; `?reset=1` restores seed.
- `lib/notify.ts`: `notify({ app, threadId, title, body })` → appends the incoming message, bumps unread, pushes a banner into `lib/store/banners.ts` (stack newest first, max 3 + "+N more", auto-dismiss 5 s unless `?banner-hold=on`); `onBannerTap(handler)` registry (Phase 2: route change with crossfade; Phase 3 replaces with the shell).
- `components/ios/*` (P2-B): `StatusBar({ tone: "dark"|"light", side: "right"|"left", time })`, `HomeIndicator({ tone })`, `Keyboard({ threadId, tint, predictions, onKey })` (drawn QWERTY 291 pt incl. predictive bar, key-pop callout, shift/123/emoji layouts, hold-delete accelerate, physical keyboard input bridge), `NotificationBanner({ icon, title, body, time: "now", state: "in"|"pressed"|"off" })`, `BannerHost` (renders the banner stack on a display), `AppIcon({ app, size })` (Messages, Instagram, WhatsApp, Un-Said look-alikes; squircle from `lib/squircle.ts`), `Caret({ tint })`, `IOSSheet`, `PhoneScreen({ children, statusTone, keyboard? })` (the 402x874 viewport with status bar + home indicator + banner host).
- `components/scene/PhoneScene.tsx` (P2-B): renders Stage + folded/unfolded `IPhoneDuo` with a screen in the cover display, reads `&device=folded|unfolded&caret=static&banner=&banner-state=`.

## Packages

| ID | Wave | Owner | Files |
|---|---|---|---|
| P2-A | 1 | opus-builder-apps (data) | `lib/mock/{clock,format,people,threads,reels,photos,predict}.ts`, `lib/store/{messaging,banners,calls}.ts`, `lib/mock/messaging.tsx`, `lib/notify.ts` |
| P2-B | 1 | opus-builder-apps (iOS chrome) | `components/ios/{StatusBar,HomeIndicator,Keyboard,KeyPop,NotificationBanner,BannerHost,AppIcon,Caret,IOSSheet,PhoneScreen,ContextMenu}.tsx`, `components/scene/PhoneScene.tsx`, `lib/keyboard/layout.ts` |
| P2-I1 | 1 | opus-builder-apps (illustrations: people + places) | `assets/images/{avatar-mom,avatar-dad,avatar-sarah,avatar-michael,avatar-riley,avatar-fam,avatar-roommates,avatar-marfa,dal,sunrise-290,kitchen,lake,campus,dorm-desk,mom-video,mom-video-dad,riley-selfview}.svg` → `public/mock/` |
| P2-I2 | 1 | opus-builder-apps (illustrations: reels + screenshots) | `assets/images/{reel-goldenhour-pups,reel-rec-league,reel-dormlife,avatar-goldenhour,avatar-recleague,avatar-dormlife,screenshot-1,screenshot-2,screenshot-3,wa-doodle}.svg` → `public/mock/`; `assets/images/README.md` + `assets/README.md` rows |
| P2-C | 2 | opus-builder-apps (WhatsApp) | `components/lookalike/whatsapp/{WhatsAppThread,MissedCallRow,DatePill,Composer,ChatList,Bubble,WhatsAppNav,TabBar,DoodleWallpaper,CallActionSheet}.tsx`, `app/scene/threads/mom/page.tsx`, `app/scene/threads/whatsapp-chats/page.tsx` |
| P2-D | 2 | opus-builder-apps (WhatsApp calls) | `components/lookalike/whatsapp/{CallsTab,IncomingCall,InCall,VideoCall,QuickReplies,CallBanner,CallEnded}.tsx`, `app/scene/whatsapp/call/page.tsx`, `app/scene/whatsapp/calls/page.tsx` |
| P2-E | 2 | opus-builder-apps (Messages) | `components/lookalike/imessage/{MessagesThread,Bubble,TypingDots,Composer,MessagesNav,ConversationList}.tsx`, `app/scene/threads/sarah/page.tsx` |
| P2-F | 2 | opus-builder-apps (Instagram DMs) | `components/lookalike/instagram/{DMThread,ReelCard,Composer,DMNav,DMInbox,PhotoCard}.tsx`, `app/scene/threads/michael/page.tsx` |
| P2-G | 2 | opus-builder-apps (Reels) | `components/lookalike/instagram/{ReelsViewer,ReelRail,ShareSheet}.tsx`, `app/scene/instagram/reels/page.tsx` |
| P2-H | 2 | opus-builder-apps (Photos) | `components/lookalike/photos/{PhotosLibrary,PhotoViewer,PhotosTabBar}.tsx`, `app/scene/photos/page.tsx` |
| P2-J | 2 | opus-builder-apps (splash + dev) | `components/unsaid/UnsaidSplash.tsx`, `app/scene/launch/page.tsx`, `components/dev/NotificationsPanel.tsx`, `components/dev/DevPanel.tsx` (ownership moves here), `lib/scenes.ts` (ownership for Phase 2: every route/state from ROUTES AND STATES), `scripts/messaging-check.ts` |

## Integration + review
Orchestrator: build, lint, check:tokens, check:placeholders, shoot every Phase 2 scene at 1x and 2x (`caret=static`), messaging-check; LOOK at every default state; COPY NEEDED list (kitchen date "November 12, 2023", Un-Said banner copy B/C, Sarah/Michael replies for Phase 6) logged in BUILD_LOG; 10 reviewers until CLEAN; commit `branched-frontend: phase 2: Act 1 apps (WhatsApp + calls, Messages, Instagram DMs + Reels, Photos), banners, Un-Said splash, dev panel` + push.
