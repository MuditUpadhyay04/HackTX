# Phase 3 plan: home screen, navigation shell, UnsaidSlot, interactive unfold

**Planner:** Opus (Fable out of credits). **Spec:** `docs/CLAUDE_PROMPT.md` Phase 3 block (wallpaper, home grid, layout, icons, shell: registry/state/API/open/close/switcher/switch/Duo panels/reduced motion, home states, banners, UnsaidSlot, acceptance, additions).

## Waves
- **Wave 1 (parallel):** P3-A home screen, P3-B icon set, P3-C shell core (provider, registry, AppHost open/close, API), P3-D UnsaidSlot + placeholder Home + docs, P3-E Apple app stubs + Meta stubs.
- **Wave 2 (parallel, after Wave 1 integrates):** P3-F switcher + swipe-between-apps + home-indicator gestures, P3-G banners through the shell + Un-Said launch path (banner → card morph → unfold → splash → slot) + incoming-call overlay, P3-H `/phone` route group + dev bar + dev panel Apps section + scenes + `scripts/shell-check.ts`.

## Interfaces
- `components/home/HomeScreen.tsx`: `<HomeScreen side="left"|"right" state wallpaper>`; `getIconRect(appId): {x,y,w,h}` in artboard px for the unfolded Duo at scale 1 (from `components/home/layout.ts`, computed from `GEOM` + the grid: margins 27 pt, pitch 87/100 pt, first row 74 pt, ×0.95).
- `components/icons/apps/*.tsx` + `components/icons/AppGlyph.tsx`: `<AppIconArt app="instagram"|... size />` (drawn SVG/CSS, squircle from `lib/squircle.ts`; Un-Said uses `UnsaidLogo`). `components/ios/AppIcon.tsx` (Phase 2) delegates to it.
- `components/shell/appRegistry.ts`: `registerApp({ id, name, Icon, route, placement, Screen })`, `getApp(id)`, `apps`.
- `components/shell/ShellProvider.tsx`: zustand `lib/store/shell.ts` state `{ openApps, foreground: {span}|{left,right}, phase, progress }`; API `shell.open(appId,{placement,from:"icon"|"banner",sourceRect})`, `close(placement?)`, `openSwitcher()`, `resume(appId)`, `kill(appId)`, `switchTo("prev"|"next")`, `notify(appId,{title,body,threadId})` — each returns a Promise; `window.__unsaidShell` (+ `frameStats`). Every transition = pure function of progress 0..1 (`components/shell/transitions.ts`), fed by a spring MotionValue (driven mode in Phase 4 supplies progress).
- `components/UnsaidSlot.tsx`: props `src?`, `mode?: "auto"|"placeholder"|"frame"`, `placement?`, `onReady?`; `?unsaid=placeholder|<url>`; iframe contract per section 8.2; 8 s fallback; placeholder Home from `lib/mock/unsaid-placeholder.ts` (strings from App-UI-Final COPY_AND_NAMES Home section) in the synced theme only.

## Packages
| ID | Wave | Owner | Files |
|---|---|---|---|
| P3-A | 1 | opus-builder-shell (home) | `components/home/{HomeScreen,layout,Widgets,WeatherWidget,CalendarWidget,PhotosWidget,BatteriesWidget,Dock,SearchPill,PageDots,HomeWallpaper}.tsx/.ts`, `app/scene/home/page.tsx` |
| P3-B | 1 | opus-builder-shell (icons) | `components/icons/apps/*.tsx` (Instagram, WhatsApp, Facebook, Messenger, Threads, MetaAI, Edits, Weather, Calendar, Photos, Clock, Notes, Maps, Settings, Mail, Reminders, Health, AppStore, Music, Camera, Wallet, Phone, Messages, Safari), `components/icons/AppGlyph.tsx`, `components/ios/AppIcon.tsx` (ownership moves here) |
| P3-C | 1 | opus-builder-shell (core) | `components/shell/{ShellProvider,AppHost,appRegistry,transitions,rubberband,useShell}.tsx/.ts`, `lib/store/shell.ts` |
| P3-D | 1 | opus-builder-shell (slot) | `components/UnsaidSlot.tsx`, `components/unsaid/UnsaidPlaceholderHome.tsx`, `lib/mock/unsaid-placeholder.ts`, `app/scene/unsaid/page.tsx`, `docs/UNSAID_SLOT.md` |
| P3-E | 1 | opus-builder-shell (stubs) | `components/apps/{AppleStub,MetaStub}.tsx`, `components/apps/registerAll.ts` (registers every app with its Screen; Phase 2 screens for whatsapp/messages/instagram/photos) |
| P3-F | 2 | opus-builder-shell (gestures) | `components/shell/{AppSwitcher,HomeIndicatorGesture,SwitchGesture}.tsx` |
| P3-G | 2 | opus-builder-shell (launch) | `components/shell/{BannerLauncher,UnsaidLaunch,CallOverlay}.tsx`, `lib/notify.ts` (ownership moves here: forward to shell.notify) |
| P3-H | 2 | opus-builder-shell (phone route) | `app/(phone)/layout.tsx`, `app/(phone)/phone/page.tsx`, `components/shell/DevBar.tsx`, `components/dev/DevPanel.tsx` (Apps/shell/slot sections), `lib/scenes.ts`, `scripts/shell-check.ts` |

## Integration + review
build/lint/checks; shoot home states + `/scene/unsaid` + `/phone` states at 1x/2x; shell-check (p95 < 20 ms, reduced motion run); compare placeholder Home side by side with `unsaid-ui-reference.png`; 10 reviewers until CLEAN; commit `branched-frontend: phase 3: home screen, navigation shell, UnsaidSlot, interactive unfold` + push.
