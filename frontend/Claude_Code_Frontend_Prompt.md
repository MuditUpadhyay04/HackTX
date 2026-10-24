# Unsaid: Claude Code Frontend Prompt (phased)

**HackTX 2026 · Meta track: "Bringing People Closer Together with AI"**
Owner: Gurneal Chandi (frontend) · Backend: Mudit Upadhyay · **Prompt version: v1** · Oct 24, 2026

Companion to `Unsaid_Frontend_Build_Spec.md` (v2, the source of truth for screens, strings, feature IDs, and the 110-button contract table), `Unsaid_Product_Spec.md` (v4), and `Demo_Script.md`.

> **Cold open:** "The last thing my kid ever texted me was 'k.'"

**How to use this file.** Each phase below is one self-contained block. Paste one block into Claude Code, let it finish, review the screenshots it produces, then paste the next. **Phase 0 + Phase 1 are fully standalone; paste them first.** Every phase ends with a **STOP AND LET ME REVIEW** point. Do not let Claude run ahead.

## Claude Project goal statement (paste into the project instructions)

Goal: Build the frontend for Unsaid, our HackTX 2026 entry for Meta's "Bringing People Closer Together with AI" track. Unsaid is an emotional "unsends" app: it captures the things you never said to the people you love and delivers them when the moment is right, powered by Meta AI (Muse Spark, Muse Image, Muse Voice) and built into Instagram, WhatsApp, Facebook and Meta AI.

What we're building: a Next.js + TypeScript + Tailwind + Framer Motion web app that renders a realistic WHITE iPhone Duo (a concept dual-screen iPhone) with a working iOS shell: a home screen with Meta apps featured prominently, Apple-style app open, close and switching, and fake but convincing Messages, Unsaid, Instagram, Meta AI, Facebook and WhatsApp apps with Unsaid integrated into each.

Rules:
- Unsaid is the only fully working app. Every Unsaid screen, tab and flow is clickable end to end, so you can go through the whole app. Backend actions use mock data and carry a data-feature-id from the contract table for Mudit to wire up later.
- Everything else (the iPhone Duo device, the Messages thread, the home screen, and the fake Instagram, Meta AI, Facebook and WhatsApp apps) is a convincing visual shell with placeholder buttons only. Only the iOS-level open, close and app switching works for them.
- Unsaid's features follow Mudit's backend as it progresses. Check the repo's backend/ folder. If the backend has a feature the frontend doesn't list, add it to the Unsaid app (and to the contract table). If a feature isn't built on the backend yet, leave it as a placeholder button.
- At the end, report every button that still has no backend behind it (feature ID, screen, label), so Gurneal can decide whether to delete it or keep it as a blank button that won't be used in the animation.
- The Unsaid app must look and feel heavily like a Meta app. Meta and Apple elements are look-alike recreations; never use official logo files.
- Mock data only.
- iOS chrome must be pixel-accurate to Apple's Human Interface Guidelines.
- The scripted demo animation is out of scope for now and will come in a separate prompt later.
- Work phase by phase, screenshot-check each phase against its acceptance criteria, commit after each one, and ask before deviating from the spec.

North star: a judge should feel the gut punch of Mom's text and the "k," and believe Unsaid could ship inside Meta's apps tomorrow.

**Concept-mock disclaimer (applies everywhere):** this is a hackathon concept mock, **not affiliated with, endorsed by, or sponsored by Apple or Meta**. The "iPhone Duo" is a fictional device. Every Apple and Meta app icon and screen is a **look-alike recreated in SVG/CSS** (a brand-colored gradient plus a simple glyph). **Never** download or embed official logo files, app icons, screenshots, or proprietary fonts. A small `concept mock · not affiliated with Apple or Meta` label sits outside the device on every page (hidden with `?labels=off` for recording).

---

## Skills and plugins to install first

Install these **before Phase 0**. All were checked on Oct 24, 2026 (the repos exist and the commands come from their READMEs or marketplace manifests). The Apple skills are written for SwiftUI/UIKit. Here they are used as the **reference for iOS measurements, conventions, and motion feel**, which Claude translates into CSS/React. They are not used to write Swift.

### Apple / iOS interface accuracy (use in Phases 1–5)

| Skill | Install (exact) | Use it for |
|---|---|---|
| **apple-hig** (ebuntario, MIT; 68 HIG-cited reference files) | `git clone --single-branch --depth 1 https://github.com/ebuntario/apple-hig.git ~/.claude/skills/apple-hig && cd ~/.claude/skills/apple-hig && ./setup` | Status bar, safe areas, Dynamic Island, touch targets, typography, materials ([repo](https://github.com/ebuntario/apple-hig)) |
| **apple-design-skill** (NutshellEngineering, Apache-2.0; an unofficial HIG mirror) | In Claude Code: `/plugin marketplace add https://github.com/NutshellEngineering/apple-design-skill` then `/plugin install apple-design-skill@apple-design-skill-marketplace` | Composing whole iOS screens: the home screen grid, widgets, dock, motion ([repo](https://github.com/NutshellEngineering/apple-design-skill)) |
| **ios-design-skills** (heyimjames; five skills) | `/plugin marketplace add heyimjames/ios-design-skills` then `/plugin install heyimjames@heyimjames` | `heyimjames:interaction-primitives` (home and lock widgets, Dynamic Island, Live Activities) and `heyimjames:the-final-5-percent` (spring damping ratios, corner radii, hero transitions, typography). Use it for the app open/close springs in the Phase 3 navigation shell ([repo](https://github.com/heyimjames/ios-design-skills)) |
| **human-interface-guidelines** (zanwei; needs Python 3.10+) | `npx skills add zanwei/human-interface-guidelines-skill --skill human-interface-guidelines` | Searching and fetching live HIG pages when a measurement is in doubt ([repo](https://github.com/zanwei/human-interface-guidelines-skill)) |
| *Optional:* **ios-design** (pproenca/dot-skills) | `npx -y skills add pproenca/dot-skills --skill ios-design --agent claude-code` (installs into the project's `.claude/skills`) | 62 "feels like Apple" rules. The command is from its [claudemarketplaces listing](https://claudemarketplaces.com/skills/pproenca/dot-skills/ios-design); the repo exists, but the skill folder was not opened |
| *Optional:* **liquid-glass** (heyparsadev) | `/plugin marketplace add https://github.com/heyparsadev/liquid-glass-skill.git` then `/plugin install liquid-glass@liquid-glass` | iOS 26/27 Liquid Glass rules for the dock, widgets, and search pill ("glass is for controls, never content") ([repo](https://github.com/heyparsadev/liquid-glass-skill)) |

**Apple's own design resources (reference only; do not copy assets into the repo):**
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
- Apple Design Resources (the iOS / iPadOS UI kits for Figma and Sketch, SF Symbols, product bezels): https://developer.apple.com/design/resources/. Use them to eyeball-check the status bar, widgets, and the home grid. Apple's license limits these to mockups, so **do not ship Apple's bezel images or SF Pro font files**. The device here is drawn from scratch, and type uses the system stack (`-apple-system`, which renders SF Pro on a Mac).

### Motion (for the Phase 3 navigation shell)

| Skill | Install (exact) |
|---|---|
| **Motion AI Kit** (official, Framer Motion team) | `npx motion-ai` ([docs](https://motion.dev/docs/ai-kit)). Springs, gestures, and drag for the navigation shell. |
| **GSAP AI Skills** (official) | `npx skills add https://github.com/greensock/gsap-skills` (or in Claude Code: `/plugin marketplace add greensock/gsap-skills`). Optional now. |

*For the later animation prompt (do not install yet):* the **Remotion Claude Code plugin** (official): `claude plugin marketplace add remotion-dev/claude-code-plugin` then `claude plugin install remotion@remotion` ([repo](https://github.com/remotion-dev/claude-code-plugin); the marketplace name `remotion` was confirmed in its `marketplace.json`).

*snapcn Phone Frame* (listed in the build spec v1) is **no longer needed**: the white iPhone Duo is a custom component (Phase 1). Use snapcn only if a plain single-phone fallback is wanted later.

---

## Phase map

| Phase | Builds | Motion? | Standalone? |
|---|---|---|---|
| **0** | Project setup, tokens, routes, the placeholder-button system, the `?state=` system, the screenshot script, a read of `backend/` | No | **Yes** |
| **1** | The **white iPhone Duo** device component: folded, unfolded, back, and the unfold snapshots, with every hardware detail | No (static snapshots only) | **Yes** (with Phase 0) |
| **2** | iOS Messages thread on the son's phone: Mom's sad text, his "k." | No | Needs 0–1 |
| **3** | iOS home screen across both panels (Meta apps prominent, Apple apps, widgets) **+ the interactive iOS navigation shell** | **Interactive navigation only** (open, close, switcher, swipe between apps) | Needs 0–2 |
| **4** | The Unsaid app: all 15 screens and placeholder buttons, heavily Meta-styled, synced with `backend/`, registered with the shell | Shell transitions only | Needs 0–3 |
| **5 (last build phase)** | Fake Meta apps with Unsaid integrated: Instagram, Meta AI, Facebook, WhatsApp (+ Messenger and Threads stubs), all registered with the shell; **final report** of unconnected buttons | Shell transitions only | Needs 0–4 |
| *later* | Scripted demo animation: separate prompt, coming later. Don't build it yet. | n/a | n/a |

---

## Phase 0: Project setup

```text
You are a senior front-end engineer and motion designer working in Claude Code. We are building the FRONTEND of "Unsaid" for HackTX 2026 (Meta track: "Bringing People Closer Together with AI"). Unsaid is an emotional "unsends" app built on Meta's stack: the things you never said to the people you love, recorded and delivered later. This is a mock-data-only web build: static, pixel-accurate screens inside a phone whose app-to-app navigation really works. A scripted demo animation comes later in a separate prompt; do not build it. My teammate Mudit Upadhyay is building the backend separately. You do NOT touch backend/.

THIS PHASE: project setup only. No screens yet beyond a scenes index and a test page. Screens are STATIC in every phase. The only motion in this whole build is the interactive iOS navigation shell (built in Phase 3: app open/close, app switcher, swipe between apps). The scripted demo animation (opening sequence, timed tour, video render) is out of scope; a separate prompt will cover it later.

GLOBAL RULES (apply in every phase)
1. Frontend only. No real backend, no fetch/axios calls, no env keys, no auth, no camera/mic/photo access, no tel:/sms:/https deep links. Mock data only, hard-coded in frontend/lib/mock/.
2. Every action button is a placeholder, marked NOT YET CONNECTED:
   - It renders through <PlaceholderButton featureId="..."> (or PlaceholderToggle / PlaceholderSegmented / PlaceholderSlider).
   - It carries BOTH data-backend="<feature-id>" and data-feature-id="<feature-id>" (same kebab-case value, from the contract table in Unsaid_Frontend_Build_Spec.md Section 9).
   - It shows a small pill badge "NOT YET CONNECTED" (9px, uppercase, 600 weight, 0.06em tracking, #E8A15A outline on #FFF4E8, top-right corner) and a hover tooltip "not connected yet · <feature-id>".
   - onClick ONLY shows a soft toast "Not connected yet" with the feature ID underneath in small text. No navigation, no state change, no network.
   - Badges hide with ?badges=off or NEXT_PUBLIC_SHOW_BADGES=false (for recording). The data attributes and toasts stay.
3. Only navigation works: routes, back, tab bars, a floating dev ScreenSwitcher, story tap-left/right. These get no badge. Unsaid is the ONLY fully clickable app: every Unsaid screen, tab and flow navigates end to end. The other apps (Messages, home screen, Instagram, Meta AI, Facebook, WhatsApp) are visual shells whose in-app buttons are placeholders; only the iOS-level open/close/switching works for them.
4. Every screen reads a ?state= query param (and optionally a route segment) that puts it into an exact, named, static visual state, so any frame of the future animation can be shown and screenshotted. Unknown states fall back to "default" and log a console warning.
5. Mock data uses realistic names and messages: Mom, Dad, Priya (best friend), Jordan (partner); group chats Fam, Roommates, Marfa Trip; the user's own display name is Riley. Never use real people's photos; use soft illustrated or gradient placeholders.
6. Concept-mock honesty: this is NOT affiliated with Apple or Meta. The "iPhone Duo" is fictional. Apple and Meta app icons are recreated look-alikes in SVG/CSS (brand-colored gradient + simple glyph). Never download or embed official logo files, icons, screenshots, or proprietary fonts (no SF Pro files, no Optimistic files). Show a small label "concept mock · not affiliated with Apple or Meta" outside the device on every page; hide it with ?labels=off.
7. Accessibility basics: semantic buttons, aria-labels on icon buttons, visible focus rings, alt text on images, 4.5:1 contrast for body text, prefers-reduced-motion respected (the navigation shell, Phase 3).
8. After each phase: run npm run dev, take screenshots of every new route/state with the screenshot script, LOOK at them yourself and fix what's off, then git commit with a clear message. Do NOT push to any remote.
9. Ask me before deviating from this prompt or from Unsaid_Frontend_Build_Spec.md (new dependencies, renamed IDs, changed copy, changed layout). If something is ambiguous, ask; don't guess.
10. Stop at the end of the phase and wait for my review.
11. Backend sync: Unsaid's features follow Mudit's backend as it progresses. At the start of every phase, read (never edit) the repo's backend/ folder (routes, handlers, schemas, README). If the backend has a feature the frontend doesn't list, tell me and propose adding it to the Unsaid app and to the contract table (lib/contract.ts + Unsaid_Frontend_Build_Spec.md Section 9) with a new kebab-case feature ID. If a feature isn't built on the backend yet, it stays a placeholder button. Placeholders stay placeholders in this build either way: no fetch calls (rule 1). If backend/ doesn't exist yet, say so and continue.

STACK
- Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS. Create it in ./frontend:
  npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
- Install now: framer-motion, gsap, @gsap/react, sonner, clsx, tailwind-merge. Dev: @playwright/test (for screenshots); run npx playwright install chromium.
- Do NOT install Remotion (it belongs to the later animation prompt). Do NOT install react-force-graph yet (Phase 4).
- Fonts via next/font/google: Inter (UI fallback and Meta-style UI) and Caveat (handwritten unsends). iOS chrome uses the system stack: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Inter, sans-serif (SF renders on a Mac; never bundle SF files).
- If the Apple/iOS skills (apple-hig, apple-design-skill, heyimjames ios-design-skills, human-interface-guidelines) are installed, read them now; Phases 1-3 rely on them for iOS-accurate chrome.

FOLDER STRUCTURE (create all folders now, with index files or TODO stubs)
frontend/
  app/
    layout.tsx                  fonts, Toaster, ConceptLabel, ScreenSwitcher, Stage
    scenes/page.tsx             index of EVERY route and every ?state= value, as links (dev hub)
    device/page.tsx             Phase 1: the white iPhone Duo (?state=...)
    scene/messages/page.tsx     Phase 2: iOS Messages thread (?state=...)
    scene/home/page.tsx         Phase 3: iOS home screen across both panels (?state=...)
    page.tsx + rant/ memories/ send/ graph/ posthumous/ proxy/ breakup/ inbox/ reminisce/[person]/
      story-notification/ plans/ group/ settings/delivery/ overlays/   Phase 4: the 15 Unsaid screens (routes as in the build spec)
    apps/instagram/[[...view]]/page.tsx   Phase 5
    apps/meta-ai/[[...view]]/page.tsx     Phase 5
    apps/facebook/[[...view]]/page.tsx    Phase 5
    apps/whatsapp/[[...view]]/page.tsx    Phase 5
    apps/messenger/page.tsx, apps/threads/page.tsx   Phase 5 stubs
    phone/page.tsx              Phase 3: the live, interactive phone (home screen + navigation shell)
    tour/page.tsx               Phase 4: static tour steps (?step=N), for the later animation prompt
    test/placeholder/page.tsx   Phase 0: shows one of each placeholder control
  components/
    device/      IPhoneDuo.tsx (+ parts: Panel, Frame, Display, DynamicIsland, Hinge, SideButtons, CameraBump, BackGlass, Shadow, Reflection)  Phase 1
    stage/       Stage.tsx (fixed 1920x1080 artboard, scaled to fit the window, letterboxed black), Wallpaper.tsx
    ios/         StatusBar, HomeIndicator, AppIcon, Dock, PageDots, SearchPill, widgets/*, messages/*   Phases 2-3
    meta/        MetaTopBar, StoriesRow, StoryRing, BottomTabBar, MetaAISparkle, PoweredByMetaAI, VerifiedBadge   Phase 4
    unsaid/      UnsaidMark, Wordmark, UnsaidLogo (loads /unsaid-logo.png with an SVG fallback)
    ui/          PlaceholderButton, NotConnectedBadge, PlaceholderToggle, PlaceholderSegmented, PlaceholderSlider,
                 ConceptLabel, ScreenSwitcher, Card, Chip, Avatar, Sheet
    screens/     one pure, prop-driven component per Unsaid screen (reused by Remotion later)
    lookalike/   instagram/*, metaai/*, facebook/*, whatsapp/*, messenger/*, threads/*
    shell/       EMPTY until Phase 3 (the iOS navigation shell: ShellProvider, AppHost, AppSwitcher, HomeIndicatorGesture, appRegistry)
  lib/
    tokens.ts    all tokens below, exported as TS constants (also mirrored as CSS variables in globals.css and in tailwind.config.ts)
    contract.ts  FEATURE_IDS typed union + metadata (label, screen, backend feature) from build spec Section 9 (fill in Phase 4; stub now)
    state.ts     useSceneState<T extends string>(allowed: readonly T[], fallback: T): reads ?state= safely (useSearchParams), plus flags badges/labels
    toast.ts     notConnected(featureId)
    mock/        people.ts groups.ts memories.ts unsends.ts plans.ts calls.ts messages.ts graph.ts (stubs now)
  public/
    unsaid-logo.png             (Gurneal drops this in later; until then UnsaidLogo renders the SVG fallback)
    mock/                       illustrated placeholder images
  scripts/shoot.ts              Playwright screenshot script (below)
  screenshots/                  output (gitignored)

DESIGN TOKENS (put in lib/tokens.ts, globals.css variables, and tailwind.config.ts)
Unsaid core:
  accent #E8A15A (amber) · accent-soft #F6D3AE · ink #4A1F35 (deep plum) · ink-muted #7A5A6A · ink-faint #B9A3AE
  cream #FBF5EC · cream-deep #F3E7D7 · card #FFFDF9 · dusk-rose #E9B7B4 · peach #F6C9A4 · line #EADBCB
  safety #3E5C76 (calm slate; safety screens only, never red) · badge #E8A15A outline on #FFF4E8
  bg-dusk: linear-gradient(180deg, #E9B7B4 0%, #F6C9A4 45%, #FBF5EC 100%)
  logo-gradient: linear-gradient(135deg, #E8A15A 0%, #4A1F35 100%)
Meta-style accents (approximate look-alike values, eyeballed, not official brand specs):
  meta-blue #0866FF · meta-blue-pressed #0753D6 · meta-link #0064E0
  ig-gradient: linear-gradient(45deg, #FEDA75 0%, #FA7E1E 25%, #D62976 50%, #962FBF 75%, #4F5BD5 100%)
  messenger-gradient: linear-gradient(45deg, #0099FF 0%, #A033FF 60%, #FF5280 90%, #FF7061 100%)
  meta-ai-gradient (the sparkle/ring): conic-gradient(from 200deg, #0064E0, #7B3FF2, #D63BC4, #FF6A3D, #0064E0)
  unsaid-ring (story ring for unsends; Meta-style ring in Unsaid colors): linear-gradient(45deg, #F6C9A4 0%, #E8A15A 35%, #C2557A 70%, #4A1F35 100%)
  wa-green #25D366 · wa-teal #075E54 · wa-chat-bg #EFEAE2 · wa-bubble-out #D9FDD3
  fb-bg #F0F2F5 · threads-ink #000000 · notification-red #FF3040 · hairline #DBDBDB · ig-text #000000 · ig-muted #737373
iOS chrome:
  ios-label #000000 · ios-label-dark #FFFFFF · ios-secondary rgba(60,60,67,0.6) · ios-fill rgba(120,120,128,0.2)
  ios-blue #007AFF · ios-green #34C759 · ios-bubble-gray #E9E9EB · ios-separator rgba(60,60,67,0.29)
Type:
  font-ios: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Inter, sans-serif
  font-meta: "Optimistic Text", "Optimistic Display", -apple-system, "SF Pro Text", Inter, system-ui, sans-serif  (Optimistic is Meta's proprietary face; it is NOT installed. This stack falls back to SF on a Mac and to Inter elsewhere. Never bundle Optimistic.)
  font-hand: Caveat (unsends, letters, anything a person wrote or said)
  sizes (px/line-height/weight): display 32/38/600 · title 22/28/600 · body 16/24/400 · meta-body 15/20/400 · meta-username 14/18/600 · small 13/18/400 · micro 9/12/600 uppercase 0.06em · hand-lg 34/40/500 · hand 24/30/500
Radii: sm 10 · md 16 · lg 24 · xl 32 · pill 999 · ios-icon 22.37% (continuous squircle, see Phase 3)
Spacing (4px base): 4 8 12 16 24 32 48 64
Shadows: card 0 8px 24px rgba(74,31,53,0.08) · float 0 20px 48px rgba(74,31,53,0.14)
Motion tokens (defined now, used by the Phase 3 navigation shell): ease-soft cubic-bezier(0.22,1,0.36,1) · ease-breath cubic-bezier(0.45,0,0.55,1) · ease-ios cubic-bezier(0.32,0.72,0,1) · dur-fast 240ms · dur-base 480ms · dur-slow 900ms · dur-hold 1200ms · spring-soft {type:"spring", stiffness:120, damping:20} · spring-open {stiffness:340, damping:32, mass:1} · spring-close {stiffness:300, damping:30, mass:1} · spring-snapback {stiffness:400, damping:35, mass:1}

THE STAGE
- Stage.tsx renders a fixed 1920x1080 artboard (position relative, overflow hidden), centered in the browser window and scaled with CSS transform to fit (letterbox in #000). All device geometry in later phases is specified in artboard pixels at 1920x1080, so screenshots at a 1920x1080 viewport are pixel-exact.
- Stage props: background "black" | "wallpaper" | "dusk" | "white". Default "black".
- ?frame=bare hides everything outside the artboard (ScreenSwitcher, labels) for clean screenshots.

PLACEHOLDER SYSTEM (build now and prove it on /test/placeholder)
<PlaceholderButton featureId="rant-record" variant="primary">hold to talk</PlaceholderButton>
renders <button type="button" data-backend="rant-record" data-feature-id="rant-record" aria-describedby=...>hold to talk<NotConnectedBadge/></button>
onClick: notConnected("rant-record") -> sonner toast("Not connected yet", { description: "rant-record" }), styled cream card, plum text, amber left border.
Variants: primary (amber fill, plum text), secondary (outline), ghost, chip, icon, meta-primary (meta-blue fill, white text), meta-link (meta-link text). PlaceholderToggle / Segmented / Slider may change locally for feel but must badge, carry both attributes, and toast on change.

SCREENSHOT SCRIPT
scripts/shoot.ts (run with npx tsx scripts/shoot.ts [routes...]): uses Playwright Chromium, viewport 1920x1080, deviceScaleFactor 1 (and a 2x pass with --hi), waits for fonts (document.fonts.ready) and networkidle, appends ?badges=off&labels=off&frame=bare when --clean is passed, and saves screenshots/<route-slug>__<state>.png. It reads a manifest of routes+states from lib/scenes.ts (the same list the /scenes index renders), so every new state is shot automatically. Add npm scripts: "shoot" and "shoot:clean".
Also add scripts/check-contract.ts: crawls every route+state, collects all data-feature-id values, and compares them with lib/contract.ts (reports missing/extra). And it asserts that zero network requests leave localhost.

BACKEND READ (do this now)
- Look for backend/ at the repo root. If it exists, list its features (endpoints/handlers and what they do) in docs/backend-sync.md with columns: backend feature, endpoint/file, matching feature ID in Unsaid_Frontend_Build_Spec.md Section 9 (or "NONE: proposed new ID"). Do not edit backend/. If it doesn't exist, write "backend/ not present yet" in that file.

ACCEPTANCE CRITERIA (Phase 0)
- npm run dev starts clean; npm run build and npm run lint pass with zero errors.
- /scenes lists every planned route (as "coming in Phase N" placeholders for later ones).
- /test/placeholder shows one of each placeholder control; each click toasts "Not connected yet" + its ID; each has data-backend AND data-feature-id; badges vanish with ?badges=off.
- Tokens exist in tokens.ts, CSS variables, and Tailwind theme with identical values.
- npm run shoot produces screenshots/test-placeholder__default.png at exactly 1920x1080; you have opened it and checked it.
- The concept label shows outside the artboard; ?labels=off hides it.
- git commit -m "phase 0: project setup, tokens, placeholder system, stage, screenshot script". Do not push.

STOP AND LET ME REVIEW. Show me the screenshot paths, the folder tree, and anything you were unsure about. Do not start Phase 1 until I say go.
```

---

## Phase 1: The white iPhone Duo device (static)

```text
PHASE 1: Build the white "iPhone Duo" device as a reusable, STATIC React component. No animation. (Context, in case you didn't see Phase 0: we're building the static frontend for "Unsaid", a HackTX 2026 concept app; everything is mock; Next.js App Router + TypeScript + Tailwind in ./frontend; a fixed 1920x1080 Stage artboard; all values below are artboard pixels. The Phase 0 global rules still apply: no network, placeholder buttons with data-backend + data-feature-id, ?state= on every screen, concept label "not affiliated with Apple or Meta", screenshot and self-check, commit, ask before deviating, stop at the end; read backend/ but never edit it. Screens are static; the only motion in this build is the Phase 3 navigation shell, and the scripted demo animation is a separate, later prompt.)

WHAT THE iPHONE DUO IS
A fictional, dual-screen, book-style iPhone: two iPhone-proportioned panels joined by a 360-degree hinge (think two iPhones sharing a spine). It does not exist; it's a concept. FINISH: WHITE (white / light titanium-ceramic). White is the default everywhere in this project.
- FOLDED: the panels sit back to back. The RIGHT panel's display faces the viewer, so it reads as a normal white iPhone; the LEFT panel is hidden behind it, display facing away. The hinge wraps the folded device's left edge.
- UNFOLDED: the left panel has swung 180 degrees around the hinge and lies flat to the left. Two displays sit side by side with a white hinge between them.
- The unfold is a rotation of the LEFT panel around the hinge axis (the left panel's right edge): rotateY goes from -180deg (folded, behind) to 0deg (flat). Phase 1 only builds STATIC SNAPSHOTS of that rotation; the later animation prompt animates it.
- Use the Apple/iOS skills you installed (apple-hig, apple-design-skill, heyimjames:interaction-primitives) to sanity-check the Dynamic Island, the corner concentricity, and the status-bar safe area. Translate everything to CSS. Do not use Apple's bezel images.

COMPONENT API
<IPhoneDuo
  state="folded" | "folded-off" | "folded-angled" | "unfold-30" | "unfold-60" | "unfold-90" | "unfold-120" | "unfold-150" | "unfolded" | "unfolded-off" | "back"
  openAngle?: number             // 0 = folded, 180 = flat; overrides state (used by the later animation)
  scale?: number                 // default 1 (geometry below is at scale 1)
  x?: number; y?: number         // artboard center of the DEVICE GROUP, default 960, 540
  tilt?: { rotateX?: number; rotateY?: number }  // whole-device tilt, default 0
  screenOn?: boolean             // false = displays are pure #000 (default true unless state ends in -off)
  left?: ReactNode; right?: ReactNode   // display contents (each rendered in a 402x874 logical iOS viewport, scaled 0.95)
  spanning?: ReactNode           // optional content that spans both displays across the hinge (rendered above both, clipped to the two display shapes)
  shadow?: "auto" | "none"; reflection?: boolean (default false); specular?: number (0..1 position of the specular sweep, static in Phase 1)
/>
Also export the geometry constants from components/device/geometry.ts so later phases (home screen, app-close target rects) can compute exact positions.

GEOMETRY (artboard px at scale 1, stage 1920x1080)
Logical iOS viewport per display: 402 x 874 pt (iPhone 16 Pro class), rendered at s = 0.95 -> display 382 x 830 px. All iOS content in Phases 2-5 is laid out in pt (CSS px) inside a 402x874 box and scaled by 0.95.
Per PANEL (outer):
  - Outer size: 414 x 862 px. Aspect ratio 0.480 (W:H about 1 : 2.08). Display aspect 382:830 = 0.460 (19.5:9 class).
  - Layers from the outside in: white frame band 6 px -> black glass bezel 10 px -> display. (6 + 10 = 16 px inset per side.)
  - Outer corner radius 68 px on the two OUTER corners; 14 px on the two HINGE-SIDE corners (the panels read as one device).
  - Bezel (black glass) outer radius 62 px outer corners / 10 px hinge-side; display radius 52 px outer corners / 4 px hinge-side. (Concentric: 68 - 6 = 62, 62 - 10 = 52.)
  - The display's TOP-LEFT pixel sits 16 px in from the panel's top-left.
HINGE: 16 px wide, full panel height (862 px), with 8 px end radii, sitting between the panels.
UNFOLDED DEVICE GROUP: 414 + 16 + 414 = 844 x 862 px, centered at (960, 540): left panel x 538-952, hinge x 952-968, right panel x 968-1382; y 109-971. (Margins: 538 px left/right, 109 px top/bottom.)
  - Left display: x 554-936, y 125-955. Right display: x 984-1366, y 125-955.
FOLDED DEVICE: only the right panel is visible face-on, centered at (960, 540): x 753-1167, y 109-971; right display x 769-1151, y 125-955. The hinge spine shows as a 5 px white rounded sliver beyond the left edge (x 748-753), because it wraps the fold.
  - Internally the device group is translated -215 px in X when folded (so the right panel is centered), 0 px when unfolded. For an intermediate openAngle a: translateX = -215 * (1 - a/180).
THICKNESS (visible only in angled states): each panel is 7 px thick; folded total 14 px plus the hinge. Render the edge as a 3D side face (transform-style: preserve-3d), with the frame gradient rotated 90deg.

DYNAMIC ISLAND
- On the RIGHT panel only (the primary, outward-facing screen when folded). Pill 120 x 35 px (126 x 37 pt x 0.95), radius 17.5 px, color #000000, centered horizontally on the right display, top edge 10 px below the display's top (11 pt). Unfolded artboard position: x 1115-1235, y 135-170. Folded: x 900-1020, y 135-170.
- Inside the pill, right side: a front-camera lens dot 11 px diameter, centered 14 px from the pill's right end: radial-gradient(circle at 35% 35%, #2B3140 0%, #0A0C12 60%, #000 100%) with a 1 px ring rgba(255,255,255,0.05). The island must read as one solid black shape when the screen is off (that's the point of the reveal).
- LEFT panel: no island; a single front camera pinhole 11 px diameter, centered horizontally, center 27 px below the left display's top (same lens styling), so the left status bar has room.

WHITE FRAME (titanium-ceramic) - exact values
- frame-base #E9E8E4 · frame-highlight #FFFFFF · frame-mid #D8D7D2 · frame-shadow #B7B6B0 · frame-seam #C4C3BD
- Fill: linear-gradient(135deg, #FFFFFF 0%, #EDECE8 18%, #D8D7D2 46%, #F4F3EF 68%, #BDBCB6 100%).
- Brushed edge sheen (overlay on the 6 px band): repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 1px, rgba(255,255,255,0.10) 1px, rgba(255,255,255,0.10) 2px), mix-blend-mode: soft-light, plus an inner 1 px highlight line (box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.12)).
- Edge highlight: a 1 px #FFFFFF line along the top and outer-side edge at 80% opacity. Edge shadow: a 1 px #B7B6B0 line along the bottom and hinge-side inner edge.
- Antenna bands: 2 px x 6 px strips in #C4C3BD, crossing the frame band on each panel's outer side at y = 88 px and y = 774 px from the panel top (subtle realism).
- Outer rim: box-shadow 0 0 0 0.5px rgba(0,0,0,0.18) so the white device separates from a white/light background.
BLACK GLASS BEZEL: #050506, inner edge highlight inset 0 0 0 1px rgba(255,255,255,0.06), and a faint top glare linear-gradient(180deg, rgba(255,255,255,0.05), transparent 30%).
DISPLAY OFF: pure #000000 (no gradient), so the black display, the bezel, and the island merge. DISPLAY ON: renders the children.

HINGE - segmented white
- 16 px wide, 862 px tall, radius 8 px at both ends.
- 5 knuckle segments of equal height (172.4 px), separated by 1 px seams in #BEBFC3 with a 1 px highlight rgba(255,255,255,0.8) directly below each seam.
- Segment fill: linear-gradient(90deg, #CFCFCB 0%, #FFFFFF 32%, #EDECE8 55%, #C9C8C2 80%, #B2B1AB 100%) (a cylinder highlight).
- Hinge caps: the top and bottom 10 px are #DCDBD6 with a 1 px #BEBFC3 ring.
- Unfolded, the hinge sits 0.5 px proud (box-shadow 1px 0 0 rgba(0,0,0,0.08), -1px 0 0 rgba(0,0,0,0.08)).
CREASE on the inner displays (unfolded): on the left display's right edge and the right display's left edge, an inner shadow linear-gradient(to <hinge side>, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0) 12px) layered OVER the content (pointer-events none), plus a 1 px line rgba(255,255,255,0.05) at the very edge. Subtle: the content must stay readable.

SIDE BUTTONS (artboard px measured from the PANEL's top edge; each protrudes outward from the frame)
- LEFT panel, outer (left) edge:
  * Action button: y 176-214 (38 px tall), 4 px wide, protrudes 3 px, radius 2 px, fill linear-gradient(90deg, #BDBCB6, #F4F3EF 60%, #D8D7D2).
  * Volume up: y 258-318 (60 px), 4 px wide, protrudes 3 px, same fill.
  * Volume down: y 334-394 (60 px), same.
- RIGHT panel, outer (right) edge:
  * Side / power button: y 270-372 (102 px), 4 px wide, protrudes 3 px, same fill, mirrored.
  * Camera Control: y 560-626 (66 px), 4 px wide, protrudes only 1.5 px, sapphire look: linear-gradient(90deg, #E4E6EA, #C9CDD3 50%, #F2F3F5), with a 1 px #BFC3C9 ring and a 1 px inner highlight.
- Folded: the right panel's power + Camera Control show on the right edge; the left panel's buttons are hidden behind (correct for a back-to-back fold).

BACK (glossy white) and CAMERA BUMP
- Each panel has a back face (a separate element rotated 180deg with backface-visibility: hidden on both faces).
- Back glass: linear-gradient(180deg, #F7F7F4 0%, #EFEFEB 55%, #E6E6E1 100%), inner frame rim as above, gloss overlay linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 65%) with background-size 250% 100%; prop specular (0..1) maps background-position-x from -150% to 150% (the later animation prompt animates it; Phase 1 shows it at 0.35).
- No Apple logo or any trademark on the back. Optional: a tiny engraved "unsaid · concept" in #D2D1CC, 9 px, 0.2em tracking, centered 120 px from the bottom.
- CAMERA BUMP (on the LEFT panel's back; that's the outer back when folded, and it becomes visible as the left panel swings out): plateau 156 x 156 px, radius 44 px, top-left 22 px from the back's top and 22 px from its outer edge. Fill frosted white glass linear-gradient(145deg, #FBFBF9, #E9E9E5), rim 1 px #D2D1CC, shadow 0 2px 6px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08). It is raised 2 px in 3D (translateZ 2px).
  * 3 lenses in a triangle (like a Pro iPhone): each a 56 px outer ring (titanium ring linear-gradient(135deg, #F2F1ED, #BDBCB6), 3 px) around a 48 px lens: radial-gradient(circle at 38% 32%, #3A4256 0%, #12151D 45%, #050608 100%) + a reflection highlight ellipse rgba(140,120,255,0.35) 14x8 px at top-left + a tiny white specular dot 4 px. Positions (centers, relative to the plateau's top-left): (44,44), (44,112), (112,78).
  * Flash: 16 px circle at (116,32), fill radial-gradient(#FFF8E7, #E9DFC8). LiDAR: 14 px circle at (116,124), fill #1A1C22. Mic: 4 px hole at (78,140).
- "back" state: shows the folded device turned around (rotateY 180deg) so the back of the left panel with the camera bump faces the viewer.

SHADOWS AND REFLECTION
- On black (Stage background "black"): no drop shadow; instead a rim light: box-shadow 0 0 0 1px rgba(255,255,255,0.35), 0 0 60px rgba(255,255,255,0.05).
- On the wallpaper or light backgrounds: drop shadow on the device group: 0 2px 4px rgba(20,16,30,0.10), 0 24px 48px rgba(20,16,30,0.22), 0 60px 120px rgba(20,16,30,0.28). Contact shadow: an ellipse 70% of the device width x 28 px, rgba(0,0,0,0.35), filter blur(24px), centered 18 px below the device's bottom edge.
- shadow="auto" picks one by Stage background.
- Reflection (off by default; on for hero states): a mirrored copy (scaleY(-1)) 14 px below the device, opacity 0.10, filter blur(1.5px), mask-image linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 35%).
- PERSPECTIVE: the device wrapper has perspective: 2400px; perspective-origin: 50% 50%; transform-style: preserve-3d on the group and panels.

STATIC STATES (each one is a pure function of openAngle; implement openAngle and map the states onto it)
| state          | openAngle | left panel rotateY | group translateX | group tilt rotateY | screenOn | notes |
| folded         | 0         | -180deg            | -215 px          | 0                  | true     | looks like a normal white iPhone |
| folded-off     | 0         | -180deg            | -215 px          | 0                  | false    | THE OPENING FRAME: pure black display |
| folded-angled  | 0         | -180deg            | -215 px          | -24deg (rotateX 6deg) | false | shows the right-edge buttons, the panel thickness, the hinge spine |
| unfold-30      | 30        | -150deg            | -179 px          | -4deg              | false    | back of the left panel (camera bump) peeking out from behind |
| unfold-60      | 60        | -120deg            | -143 px          | -7deg              | false    | camera bump clearly visible, specular at 0.35 |
| unfold-90      | 90        | -90deg             | -108 px          | -8deg              | false    | left panel edge-on; its thickness is visible |
| unfold-120     | 120       | -60deg             | -72 px           | -6deg              | false    | left display now facing forward, black |
| unfold-150     | 150       | -30deg             | -36 px           | -3deg              | false    | almost flat |
| unfolded       | 180       | 0deg               | 0 px             | 0                  | true     | two displays + hinge, centered |
| unfolded-off   | 180       | 0deg               | 0 px             | 0                  | false    | both displays black |
| back           | 0         | -180deg            | -215 px          | 180deg             | -        | rear view, camera bump |
(The whole-device tilt peaks at -8deg around 90 degrees so the fold reads as 3D; the later animation interpolates between these.)
Rule: past 90 degrees the left panel shows its DISPLAY face; before 90 it shows its BACK face. Use backface-visibility so this happens automatically.

/device PAGE
- /device?state=<state>&bg=black|wallpaper|white&scale=1&reflection=1 renders the IPhoneDuo on the Stage.
- With screenOn, a test pattern for each display: left shows "LEFT 402x874pt", right shows "RIGHT" with a 1 px grid every 50 pt and the display outline, so the geometry can be checked in screenshots.
- A dev-only "spec overlay" (?debug=1) draws artboard-pixel rulers and the boxes of each part (panel, bezel, display, island, hinge, buttons) labeled with their coordinates.
- Add every state to lib/scenes.ts so /scenes and npm run shoot cover them.
- The bg=wallpaper option uses Stage background "wallpaper": a blurred Apple-style gradient (build it now, static): base #0B0B12, then radial blobs radial-gradient(40% 50% at 22% 30%, #F7B27A, transparent), radial-gradient(45% 55% at 78% 25%, #E86A7E, transparent), radial-gradient(50% 60% at 60% 80%, #8E6CF0, transparent), radial-gradient(40% 45% at 15% 85%, #4A90E2, transparent), whole layer filter blur(80px) saturate(1.2), scaled 1.2 so the blur has no edges, plus a 4% noise overlay (SVG feTurbulence) to avoid banding. It should feel like an Apple keynote wallpaper, warm-leaning toward Unsaid's amber/plum.

UNSAID LOGO SLOT (prep for later phases)
- components/unsaid/UnsaidLogo.tsx tries /unsaid-logo.png (Gurneal will generate it in ChatGPT and drop it in /public); if it fails to load, it renders the SVG UnsaidMark: a single-line speech-bubble outline left slightly open (a gap where the words never got said), white on the logo-gradient (#E8A15A -> #4A1F35) rounded square.

ACCEPTANCE CRITERIA (Phase 1) - verify each in a screenshot at 1920x1080 and LOOK at it
1. /device?state=folded-off&bg=black: a single white iPhone, centered (panel x 753-1167, y 109-971 within 1 px), pure black display, black Dynamic Island invisible against the black display, white frame and rim clearly visible on black. Right-edge buttons (power, Camera Control) visible. A 5 px hinge sliver on the left edge.
2. /device?state=folded&bg=wallpaper: same device on the blurred wallpaper, with the drop + contact shadow; test pattern on screen; Dynamic Island at x 900-1020, y 135-170.
3. /device?state=folded-angled: the panel thickness, hinge spine, and right-edge buttons read as 3D; no z-fighting; the frame sheen is visible.
4. /device?state=unfold-60: the glossy white back of the left panel with the full camera bump (3 lenses, flash, LiDAR) visible, swinging out from behind; the specular band is visible.
5. /device?state=unfold-90: the left panel is edge-on (a thin white sliver at its thickness), with no flicker or disappearing faces.
6. /device?state=unfold-120: the left panel now shows its (black) display face, never its back.
7. /device?state=unfolded&bg=wallpaper: total 844 x 862 centered (x 538-1382, y 109-971); the hinge has 5 segments with grey seams; the crease shading shows on both inner display edges; outer corners 68 px, hinge-side 14 px; Action + volume on the far-left edge; power + Camera Control on the far-right edge.
8. /device?state=back: glossy white back, camera bump top-left, no Apple logo.
9. ?debug=1 overlays confirm every coordinate in GEOMETRY within 1 px.
10. White is the default finish; there is no other color option yet (add a finish prop typed "white" only, so it can grow later).
11. The screen content slots (left/right/spanning) accept arbitrary React and clip to the display shapes (outer 52 px / hinge-side 4 px radii).
12. npm run build, lint, and shoot pass; check-contract still passes. Commit: "phase 1: white iPhone Duo device, static states". Do not push.

STOP AND LET ME REVIEW. Send me the list of screenshots (folded-off, folded, folded-angled, unfold-60, unfold-90, unfold-120, unfolded, back, plus the debug overlays) and note any value you had to change and why. Do not start Phase 2.
```

---

## Phase 2: iOS Messages thread (static)

```text
PHASE 2: Build the iOS Messages thread on the kid's phone as a STATIC screen inside the folded white iPhone Duo. No animation of the thread itself (the later animation prompt ages the timestamp and wakes the screen). In Phase 3 this thread also becomes the Messages app inside the navigation shell. Phase 0 global rules apply. Use the Apple/iOS skills (apple-hig, apple-design-skill, heyimjames:interaction-primitives) for status bar, navigation bar, bubble, and input-bar accuracy; translate to CSS. Everything is laid out in pt inside the 402x874 logical viewport (scaled 0.95 by IPhoneDuo).

THE STORY BEAT
This is the cold open: "The last thing my kid ever texted me was 'k.'" We are on the KID's phone (contact: "Mom"). Mom sent warm, slightly sad messages; the kid answered "k". Later the timestamp ages to show that "k" was the last thing he sent.

ROUTE
/scene/messages?state=<state>&device=folded|unfolded (default folded; unfolded puts the thread on the right panel and a dimmed home-screen blur on the left, for flexibility)

CONTENT (exact copy; light mode)
- Status bar (54 pt tall, Dynamic Island safe area): time "9:41" at left (SF Pro Text semibold 17 pt, centered in the left "ear"), right ear: cellular 4 bars, Wi-Fi 3 arcs, battery 72% glyph (no percent text), all #000.
- Nav bar (iOS 18/26 Messages style): back chevron "<" at left with a blue unread count pill "12" (ios-blue #007AFF); center: circular avatar 54 pt (illustrated Mom placeholder, soft peach background) with "Mom >" below it (12 pt, #000, chevron 9 pt ios-secondary); right: video-call glyph (ios-blue). Bar background translucent white rgba(249,249,249,0.94) with a 0.5 pt bottom hairline ios-separator. No real Apple assets; draw glyphs as inline SVG (SF Symbols look-alikes).
- Thread (top to bottom), timestamps centered, 11 pt semibold ios-secondary, e.g. "Thursday 6:02 PM":
  [timestamp] Thursday 6:02 PM
  Mom (incoming, gray #E9E9EB, black text): "hi sweetheart 💛 tried calling you a few times today"
  Mom: "no emergency. just miss you."
  Mom: "I made your favorite this weekend and saved you some. call me when you can? love you"
  [timestamp] Thursday 11:48 PM
  You (outgoing, blue #007AFF, white text): "k"
  Under it, right-aligned: "Read Thursday" (11 pt, ios-secondary).
- Bubble rules: 17 pt SF Pro Text, line-height 22 pt, padding 7 pt 12 pt, radius 18 pt, tail on the last bubble of each run (draw the tail as an SVG path, not a rotated square), max width 72% of the thread, 2 pt gap within a run, 8 pt between runs, 16 pt side margins. Consecutive incoming bubbles without avatar (1:1 thread).
- Input bar: "+" circle button (ios-fill), capsule text field "iMessage" placeholder (ios-secondary, 17 pt), mic glyph inside the field's right end; home indicator bar 134x5 pt, radius 2.5, #000, centered 8 pt from the bottom.

STATES (?state=)
- default: as above, "Read Thursday".
- today: timestamps "Today 6:02 PM" / "Today 11:48 PM", receipt "Read 11:48 PM".
- yesterday: "Yesterday 6:02 PM" / "Yesterday 11:48 PM", receipt "Read Yesterday".
- last-week: "Thu, Oct 15 at 6:02 PM" / "Thu, Oct 15 at 11:48 PM", receipt "Read Oct 15".
- last-month: "Thu, Sep 24 at 6:02 PM" / ...11:48 PM, receipt "Read Sep 24".
- last-year: "Oct 23, 2025 at 6:02 PM" / "Oct 23, 2025 at 11:48 PM", receipt "Read 10/23/25". (This is the frame the cold-open line lands on.)
- off: display black (screenOn=false). Used to prove the black display = the opening black card.
- k-focus: same as last-year but with everything except the "k" bubble and its timestamp at 35% opacity (a static frame the later animation may use for emphasis).
Register all states in lib/scenes.ts.

ACCEPTANCE CRITERIA (Phase 2)
- /scene/messages?state=last-year on the folded white Duo (bg=black and bg=wallpaper) reads instantly as a real iOS Messages thread at a glance: correct status bar inside the Dynamic Island safe area, nav bar, gray/blue bubbles with tails, input bar, home indicator.
- The "k" bubble is the visual end point: single short blue bubble, bottom-right, with the receipt under it.
- Typography uses the system stack (SF on a Mac); nothing uses Caveat here (this is the real-phone world).
- No placeholder buttons on this screen (it's a scene, not the Unsaid app); any tappable chrome is inert. Build the thread as a reusable <MessagesThread state> component so Phase 3 can register it as the Messages app. check-contract passes (no IDs here).
- Screenshots for every state at 1920x1080 and 2x; you checked each. Commit "phase 2: iOS Messages thread scene (static)". Do not push.

STOP AND LET ME REVIEW.
```

---

## Phase 3: iOS home screen across both panels + the interactive iOS navigation shell

```text
PHASE 3: Build (A) the iOS home screen on the UNFOLDED white iPhone Duo, spanning both panels, as STATIC states, and (B) the interactive iOS NAVIGATION SHELL that every app (Messages now; Unsaid in Phase 4; the Meta look-alikes in Phase 5) plugs into. The shell is the ONLY motion in this build; the scripted demo animation is a separate, later prompt. Phase 0 global rules apply. USE the Apple/iOS skills now: apple-design-skill (home-screen grid, widgets, dock), heyimjames:interaction-primitives (widget anatomy, Dynamic Island), apple-hig (status bar, materials, SF type), liquid-glass if installed (dock/search-pill glass). Cross-check measurements against the Apple Design Resources iOS UI kit (https://developer.apple.com/design/resources/); don't copy its assets.

ROUTE
/scene/home?state=<state>&wallpaper=unsaid|apple   (state: default | close-target | tap-unsaid | pressed-unsaid | dimmed)

WALLPAPER (each display, continuous across the hinge as if one image split in two)
- "unsaid" (default): the Phase 1 blurred Apple-style gradient but brighter and warmer for a home screen: radial blobs #F7B27A (top-left), #E86A7E (top-right), #8E6CF0 (bottom-center), #F6C9A4 (bottom-left), on #2A1B2E; blur 60px; 4% noise. Left display shows the left half, right display the right half (offset the background by the display's artboard x so it's continuous behind the hinge).

iOS HOME GRID (per display, in pt inside 402x874; verify with the skills)
- Status bar 54 pt. Left display: time "9:41" in its left ear (white, SF Pro Text semibold 17 pt); no island (it has the pinhole camera). Right display: Dynamic Island, right ear shows cellular, Wi-Fi, battery (white).
- Icon: 64 x 64 pt, continuous-corner squircle (superellipse; approximate with border-radius 22.37% plus an SVG mask, or a CSS clip-path generated from a superellipse with n=5), subtle 0.5 pt inner stroke rgba(255,255,255,0.12). Label below: 12 pt SF Pro Text, white, 1 line, text-shadow 0 1px 2px rgba(0,0,0,0.3), 5 pt gap.
- 4 columns, 6 rows max. Side margins 27 pt, column pitch 87 pt (64 icon + 23 gap), row pitch 100 pt, first row top at 74 pt (below the status bar).
- Widgets: small 164x164 pt (2x2 slots), medium 346x164 pt (4x2 slots), radius 26 pt, material: rgba(255,255,255,0.22) + backdrop-filter blur(30px) saturate(1.6) + 0.5 pt rgba(255,255,255,0.35) stroke (Liquid Glass feel), labels under widgets 12 pt white.
- Search pill above the dock: 92x30 pt, "🔍 Search" 13 pt, glass material, centered, 12 pt above the dock (left display has the search pill; right display has page dots instead).
- Dock (right display only): 378x96 pt, radius 34 pt, 12 pt from the bottom, 4 icons, same glass material.
- Page dots (right display): 2 dots 7 pt, active white, inactive rgba(255,255,255,0.4), centered 14 pt above the dock.
- Home indicator: 134x5 pt white bar on each display, 8 pt from the bottom.

LAYOUT
LEFT display (Apple apps + widgets):
- Row 1-2: Weather medium widget: "Austin" + location arrow, "78°", "Sunny", "H:84° L:66°", and a 5-hour strip (10AM 79° ... 2PM 83°) on a blue-sky gradient (#3C8CE7 -> #7EC3F8); white text.
- Row 3-4: Calendar small widget ("SATURDAY" in red #FF3B30, big "24", then "HackTX demo · 11 AM" and "call Mom?" in lowercase, a tiny Unsaid nod) + Photos small widget ("Memories", "lake trip, june", illustrated lake photo, soft vignette).
- Row 5: Clock, Notes, Maps, Photos
- Row 6: Mail, Reminders, Health, Settings
- Search pill.
RIGHT display (Meta apps prominent, then Apple):
- Row 1: Instagram, WhatsApp, Facebook, Messenger
- Row 2: Meta AI, Threads, Edits, Unsaid   <- Unsaid sits here, row 2 col 4 (also the tap target in the later animation)
- Row 3-4: Batteries medium widget: four rings with icons and %: "iPhone Duo 84%", "Ray-Ban Meta 62%" (glasses glyph), "AirPods Pro 100%", "Watch 71%". (The Ray-Ban glasses tie to the Meta AI app.)
- Row 5: App Store, Music, Camera, Wallet
- Page dots; Dock: Phone, Messages, Safari, Calendar  (Messages in the dock is the app-close target in the later animation.)
Export from the home screen component a function getIconRect(appId) that returns the icon's artboard-pixel rect for the unfolded Duo at scale 1 (the navigation shell uses it for the open/close morphs).

ICONS: LOOK-ALIKES ONLY (SVG/CSS; never download official icons or logo files)
Meta family (approximate colors; recognizable at a glance, drawn from simple shapes):
- Instagram: radial-gradient(circle at 30% 107%, #FDF497 0%, #FDF497 5%, #FD5949 45%, #D6249F 60%, #285AEB 90%); glyph: white rounded-square outline (stroke 5 pt, radius 14 pt) + centered circle outline + small dot top-right.
- WhatsApp: #25D366 tile; glyph: white speech-bubble outline with a small tail at bottom-left containing a white handset.
- Facebook: #0866FF tile; glyph: a white lowercase "f" built from rectangles/paths (do not use a font or logo file).
- Messenger: messenger-gradient tile; glyph: white rounded speech bubble with a zig-zag "bolt" cutout.
- Threads: #000 tile; glyph: white "@"-like spiral drawn as a single stroked path.
- Meta AI: #FFFFFF tile (dark-mode #0B0B0F), glyph: a thick ring stroked with the meta-ai-gradient (conic). Label "Meta AI". (This is the Ray-Ban Meta glasses companion app: formerly "Meta View", renamed to Meta AI on Apr 29, 2025; App Store title "Meta AI - Assistant & Glasses".)
- Edits (by Instagram, video editor): #000 tile with a white stylized film-strip/scissor-cut glyph and a thin ig-gradient underline. (Approximate; Edits' real icon was not copied.)
- Unsaid: loads /public/unsaid-logo.png via UnsaidLogo (fallback: the SVG open speech bubble, white on logo-gradient #E8A15A -> #4A1F35). Label "Unsaid". Optional: a small blue notification dot is NOT used; instead state=tap-unsaid adds a soft amber glow ring (static).
- NO "Muse" app anywhere. Muse Spark, Muse Image, and Muse Voice appear only as "powered by" text inside apps (Phase 4).
Apple apps (look-alikes): Weather (blue gradient + sun/cloud), Calendar (white, red day name, date number), Photos (white, 8-petal color pinwheel), Clock (black, white face, hands at 9:41), Notes (white with yellow header band + lines), Maps (map tile pastel + blue route), Settings (gray, gear), Mail (blue gradient, white envelope), Reminders (white, three colored dots + lines), Health (white, pink heart), App Store (blue gradient, a white "A" built from three rounded strokes), Music (red-pink gradient, white note), Camera (gray, lens circle), Wallet (black, stacked colored cards), Phone (green, white handset), Messages (green, white speech bubble), Safari (white/blue compass).


B) iOS NAVIGATION SHELL (interactive; real in the built web app, not scripted)
Goal: Gurneal can open any app from its icon, close it, open the next one, use the app switcher, and swipe between apps, live, and it feels like iOS. Every app registers with the shell, so every transition is identical and system-level. Use the Motion AI Kit + heyimjames:the-final-5-percent + apple-design-skill (motion) for the feel. Framer Motion only (already installed; ask before adding any other dependency).

Files: components/shell/ShellProvider.tsx (state + API), AppHost.tsx (the morphing app "window"), AppSwitcher.tsx, HomeIndicatorGesture.tsx, appRegistry.ts, rubberband.ts. Route: /phone (the live phone: unfolded Duo + home + shell). Also wrap the app routes in a route group app/(phone)/layout.tsx so the Duo, home, and shell PERSIST across navigation (Next layouts don't remount), and the Unsaid and /apps/* routes render inside AppHost.

APP REGISTRY
registerApp({ id, name, Icon, route, placement: "span" | "left" | "right", Screen })
- Register now: messages (the Phase 2 MessagesThread; placement "right"), unsaid (placeholder screen until Phase 4; "span"), instagram, meta-ai, facebook, whatsapp, messenger, threads, edits (placeholder screens until Phase 5: app name + "coming in phase 5" on the app's brand color), and every Apple look-alike icon (a generic stub: the app's icon large, its name, and "concept · look-alike stub"), so EVERY icon on the home screen is tappable.
- Each registered app gets the same open/close/switcher behavior. No app implements its own transition.

STATE AND API
- Shell state: openApps (most recent first), foreground per placement: { span } or { left, right } (two single-panel apps can sit side by side, one per display; opening a span app replaces both), phase: home | opening | app | closing | switcher | switching.
- URL sync: ?app=<id>&placement=span|left|right (and the app's own route + ?state=). Loading a URL with an app open shows it already open with NO animation (so ?state= screenshots stay exact).
- Programmatic API (the later animation prompt drives the shell through this, so build it cleanly): shell.open(appId, {placement?, from?: "icon"}), shell.close(placement?), shell.openSwitcher(), shell.resume(appId), shell.kill(appId), shell.switchTo("prev" | "next"). Each returns a Promise that resolves when its transition settles. Expose it as window.__unsaidShell in dev and test builds (for Playwright). Keep every transition a pure function of a progress value (0..1) fed by the spring, so a later prompt can add a "driven" mode where a video timeline supplies the progress frame by frame. Don't build that mode now.
- Shell controls are navigation, not features: no NOT YET CONNECTED badge, no toast, no feature ID.

OPEN (tap an icon): Apple's zoom from the icon's exact rect
- Press: icon scale 1 -> 0.9 + 15% black overlay while pressed (120 ms ease-ios), release back to 1.
- The app window starts at getIconRect(appId) (converted to the current Stage scale) and springs to its placement rect: the right display, the left display, or both displays (span; the content is clipped by both display masks with the hinge between them, as in the Phase 1 spanning slot).
- The corner radius morphs from the icon's radius (64 pt x 0.95 x 22.37% = 13.6 px) to the display's radius (52 px; 4 px on hinge-side corners).
- Crossfade: the icon artwork fades out over progress 0-0.35 while the app content fades and scales in (opacity 0 -> 1 over 0.15-0.6, content scale 0.96 -> 1).
- Behind it, the wallpaper and the other icons dim and recede: home layer scale 1 -> 0.92, brightness 1 -> 0.7 (crossfade to a pre-blurred copy rather than animating filter: blur on every icon).
- Spring: spring-open {stiffness 340, damping 32, mass 1} (about 450 ms to settle, little to no overshoot).
- Animate with transform (translate + scale) and opacity only. Use Framer Motion's layout/borderRadius correction (or counter-scale the content) so corners stay crisp. Don't animate width/height, and keep backdrop-filter off the moving window. 60 fps is the target.

CLOSE: swipe up on the home indicator
- Hit area: a 34 pt-tall strip over each display's home indicator. Drag with Framer Motion drag/pan gestures (pointer events; works with a mouse and with touch).
- While dragging, the window follows the finger: translateY = dy, scale = 1 - min(|dy| / 900, 0.4), and the corner radius grows toward the icon radius ratio. Dragging DOWN rubber-bands: offset = (1 - 1 / (x * 0.55 / 200 + 1)) * 200 (rubberband.ts, the iOS-style constant 0.55).
- Release: if velocityY < -500 px/s or progress > 0.25, the app springs back INTO ITS ICON's rect: spring-close {stiffness 300, damping 30, mass 1}, the radius returns to 13.6 px, the icon artwork crosses back in (progress 0.55-0.85), and the home un-dims (scale 0.92 -> 1, brightness 0.7 -> 1). Otherwise it springs back open: spring-snapback {stiffness 400, damping 35}.
- Also close with: the keyboard (Escape or Cmd/Ctrl+Shift+H = home) and a "Home" button in a small dev control bar outside the artboard (Home · Switcher · ◀ Prev · Next ▶ · span/single toggle; hidden with ?frame=bare) for clean screen recording.

APP SWITCHER: swipe up and hold
- Trigger: during a home-indicator drag, if the finger rests (velocity < 50 px/s for 250 ms) after rising more than 120 px; also the keyboard (Cmd/Ctrl+Shift+A or "\") and the dev bar.
- Layout: the open apps as cards in a horizontal carousel spread across both displays, most recent at the right: each card is the live app (render the Screen scaled, pointer-events none) at scale 0.62, radius 40 px, gap 24 px, the app's icon (28 pt) and name (13 pt white) above it; the home layer blurred and dimmed (pre-blurred copy, brightness 0.6). Horizontal drag scrolls the carousel with rubber-band at the ends.
- Swipe a card UP (dy < -120 px or velocityY < -600 px/s): it flies off upward (y -> -1.2 x height, opacity -> 0, spring-close) and the app is removed from openApps (killed); remaining cards close the gap with spring-snapback.
- Tap a card: it springs back to its placement rect (spring-open) and resumes in the exact state it was left in. Tap empty space: go home.

SWITCH BETWEEN APPS: swipe along the home indicator
- A horizontal drag on the home indicator (|dx| > |dy|) moves the current app sideways with the finger, and the previous/next recent app slides in beside it, edge-to-edge with a 16 px gap and both slightly scaled to 0.96 while dragging. Past the ends of the list it rubber-bands.
- Release past 30% of the display width (or |velocityX| > 400 px/s) to commit with spring-snapback; otherwise it springs back. Keyboard: [ and ] (or Cmd/Ctrl+Shift+Left/Right); dev bar Prev/Next.

DUO PANELS
- An app opens in its registered placement. Hold Alt/Option while tapping (or use the dev bar's span/single toggle) to open it on the icon's own panel instead. Two single-panel apps can run side by side (one per display); each display's home indicator controls the app on that display; for a span app, either indicator works.
- Apps that span lay out using the Duo's left/right slots (list on the left, detail on the right), as in Phases 4-5.

REDUCED MOTION AND PERFORMANCE
- prefers-reduced-motion (and ?motion=reduced): open/close/switch become a 200 ms crossfade with a scale of 0.98; switcher cards appear without flying; the gestures still work.
- 60 fps: will-change only on the window and cards while they move; no layout-thrashing reads during a gesture; pre-render the blurred home and wallpaper once.
- In dev, record frame times during every transition (requestAnimationFrame deltas) and expose them as window.__unsaidShell.frameStats.

HOME STATES (static, for screenshots and the later animation)
- default: as above.
- close-target: identical, plus a debug outline (only with ?debug=1) on the Messages dock icon and Unsaid icon showing their getIconRect values.
- tap-unsaid: a touch indicator (44 pt circle, rgba(255,255,255,0.35), 1 pt white stroke at 50%) centered on the Unsaid icon; the icon has an amber glow 0 0 24px rgba(232,161,90,0.6).
- pressed-unsaid: the Unsaid icon at scale 0.9, darkened by a 15% black overlay (the iOS press state).
- dimmed: the whole home screen at blur 12px, scale 0.94, opacity 0.6 (what sits behind an app opening).
Footer label (outside the device, with the concept label): "hackathon concept mock · not affiliated with Apple or Meta · icons are look-alikes".

ACCEPTANCE CRITERIA (Phase 3)
- /scene/home?state=default at 1920x1080 reads as a real iOS 26-era home screen spread across two panels: correct status bars, a consistent icon grid on both panels, glassy widgets and dock, page dots, search pill, home indicators.
- Meta apps are the most prominent thing on the right panel (top two rows); Unsaid sits clearly among them; Apple apps are scattered on the left and below.
- Every icon is recognizable at a glance, and every one is a drawn SVG/CSS look-alike. Run: grep -ri "\.png\|\.svg" for any downloaded brand asset; the only image file in an icon is /public/unsaid-logo.png.
- getIconRect returns correct artboard rects (verify with ?debug=1 overlays).
- No placeholder buttons on the home screen (it's iOS, not Unsaid); check-contract passes.
- NAVIGATION SHELL, on /phone:
  - Every icon opens its app with the zoom from its exact rect (corner-radius morph, icon crossfade, home dims and recedes).
  - Swiping up on the home indicator closes the app into its icon: it follows the finger, rubber-bands when dragged down, and springs back open on a weak swipe.
  - Swipe-up-and-hold opens the switcher: cards for every open app; swipe a card up to kill it; tap a card to resume it in its exact state.
  - A horizontal swipe on the home indicator switches between recent apps.
  - The keyboard shortcuts and the dev bar do the same, and both placements (span, and left/right single) work.
- Write scripts/shell-check.ts (Playwright). For EVERY registered app, it calls the shell API, then also drives a real mouse drag on the indicator:
  - open from the icon, close, then open the next app;
  - then open 3 apps and use the switcher to resume one and kill one;
  - then swipe prev/next.
  It screenshots the midpoint and the end of each transition, and it fails if frameStats shows a p95 frame time over 20 ms or any frame over 50 ms. Run it once with reduced motion emulated.
- "No jank" is checked by eye too: record a 20-second screen capture of opening, closing, and opening the next app, and look at it.
- Screenshots of every state at 1x and 2x, checked. Commit "phase 3: iOS home screen across the Duo + navigation shell". Do not push.

STOP AND LET ME REVIEW.
```

---

## Phase 4: The Unsaid app, all 15 screens (static, heavily Meta-styled)

```text
PHASE 4: Build all 15 Unsaid screens as STATIC, prop-driven screens on the white iPhone Duo, with every action a NOT YET CONNECTED placeholder. Source of truth for copy, layout, and feature IDs: Unsaid_Frontend_Build_Spec.md Sections 2, 3, 6, 7, 8, and 9 (v2). Phase 0 global rules apply. Screens are static; the only motion is the Phase 3 shell's open/close/switch transitions. The scripted tour comes in the later animation prompt.

FIRST
1. Fill lib/contract.ts from build spec Section 9.1 (rows 1-94) PLUS the Phase 5 rows (95-110) listed in Section 9.4 of the spec: 110 buttons, 94 unique feature IDs. Type FeatureId as a union; PlaceholderButton's featureId prop must be FeatureId so a typo fails the build.
2. Install react-force-graph-2d now (Screen 5).
3. Backend sync (global rule 11): re-read backend/ and update docs/backend-sync.md. For each backend feature with no frontend control, propose a screen, a label, and a new feature ID; after I approve, add it to lib/contract.ts, the screen, and Unsaid_Frontend_Build_Spec.md Section 9 (new rows after 110). Features not built on the backend stay placeholder buttons.
4. Register the Unsaid app with the Phase 3 navigation shell (placement "span"): tapping Unsaid on the home screen zooms it open into Screen 1, and its internal routes render inside AppHost, so closing, the switcher, and swiping between apps all work from any Unsaid screen. Screens drawn as TwoPhones or three Duos (4, 7, 11, 12, 14, 15) are presentation scenes on the Stage at their own routes; inside the live /phone shell, those screens show only "your phone" side on the Duo (for 11, the kid's side).

HOW THE 15 SCREENS USE THE DUO (use the two panels smartly)
- Single-person screens use ONE UNFOLDED white Duo, Meta-style "list on the left, detail on the right":
  1 Home: left = feed (top bar, stories row of unsend rings, ask bar "try 'I miss Mom'", nudges, pending strip); right = the selected item in detail (Dad's missed-call nudge expanded with the suggested photo and "send him something"/"not now").
  3 Memory surfacing: left = camera-roll grid + "who's this?" cluster row; right = the selected memory large, the "everything will be okay." caption in Caveat, "keep", "I'm ready", "save for later".
  5 Brain graph: the ForceGraph spans BOTH displays (use the spanning slot; the hinge runs through it like a spine); the node sheet docks on the right display; "ask your graph" bar on the left display.
  9 Unsends inbox: left = stories row + list of unsends (Messenger-style rows); right = the open unsend card (Caveat), "listen", "reply with an unsend", "keep it", plan Accept/Reject, "…" menu (block/report).
  10 Reminisce mode: left = full-bleed story viewer (progress bars, header, tap zones); right = "about this memory" detail + reply composer.
  13 Group-chat unsend: left = group list (Fam, Roommates, Marfa Trip) + members; right = the draft, photo strip, actions.
- Screens the spec draws as "Duo, same person" (2 Rant, 6 Posthumous, 8 Breakup/safety): one UNFOLDED Duo, left/right exactly as the spec says.
- Screens that show TWO PEOPLE'S phones (4 Send: you / Jordan; 7 Proxy: you / recipient; 11 Story notification: Mom / kid; 12 Plans: you / Jordan; 14 Phone-activity: you at 3:02 AM / Jordan later): a TwoPhones layout = two FOLDED white Duos (each looks like a white iPhone), scale 0.86, 96 px apart, centered, captions under each in 14 px Inter ink-muted ("your phone" / "jordan's phone, later").
- 15 Overlays: three FOLDED white Duos side by side (scale 0.72), captions "Gen Z" / "your parents" / "the grandparents" (Phase 5 builds the full fake apps; this screen keeps the spec's three-panel summary, now using the Phase 5 look-alike components once they exist; for now, simple versions).
- Everything outside the device is the Stage background "dusk" (bg-dusk gradient) for app screens.

HEAVY META STYLING: NON-NEGOTIABLE ACCEPTANCE CRITERIA
The Unsaid app must look like it shipped from Meta's family of apps (Instagram / Messenger / Meta AI), wearing Unsaid's amber + plum. Look-alike patterns only, no copied assets. All 10 must be visible in the screenshots:
 M1. Instagram-style top bar on the main tabs: lowercase "unsaid" wordmark at left (22 pt, 700, tight -0.02em tracking, font-meta; the dot of the "i" is the open bubble), right icons: "+" (new unsend), heart (activity) and a paper-plane-like inbox icon with a notification-red #FF3040 badge "2". White bar, 0.5 pt hairline #DBDBDB bottom border.
 M2. Stories row under the top bar on Home and Inbox: 66 pt avatars with 2.5 pt rings. Unread unsends use the unsaid-ring gradient (#F6C9A4 -> #E8A15A -> #C2557A -> #4A1F35, a Meta-style ring in Unsaid colors); seen = #DBDBDB; "your note" bubble on your own avatar like Instagram Notes ("still thinking about marfa").
 M3. Bottom tab bar (Instagram/Facebook style): 49 pt + home indicator, white, 0.5 pt top hairline, outline icons that fill when active, no labels: home · graph · inbox · you (the spec's 4 tabs; do not add more without asking). Active = ink #4A1F35.
 M4. Typography: font-meta stack (Optimistic-style fallback: "Optimistic Text", -apple-system, "SF Pro Text", Inter, system-ui). Usernames 14/18 600, body 15/20 400, captions 13 ig-muted. Caveat stays for every unsend/letter/rant quote.
 M5. Meta blue (#0866FF / link #0064E0) for secondary actions, links, "see all", verified-style check on Meta-verified accounts; amber #E8A15A stays the primary CTA color; plum #4A1F35 is the ink. Mix them, don't replace Unsaid's palette.
 M6. Gradient accents in Meta's manner: the ig/messenger-style diagonal gradients re-tinted to amber -> rose -> plum on hero cards, the unsend story ring, the record button ring, and the Meta AI sparkle.
 M7. Rounded cards (16-24 radius), Messenger-style chat bubbles (18 pt radius, grouped corners 4 pt on the joined side), pill chips, bottom sheets with a 36x5 pt grabber (Instagram sheet style).
 M8. Meta AI sparkle affordance on every AI-driven action (muse-ask, memory-surface-request, unsend-draft-generate, unsend-draft-rewrite, muse-image-cover, graph-ask, group-draft-tone): a small 4-point sparkle glyph filled with meta-ai-gradient before the label, and an "AI" tag tooltip "powered by Meta AI".
 M9. "from Meta"-style footer line, changed to "powered by Meta AI": centered, 12 pt, ig-muted "powered by" + "Meta AI" in a meta-ai-gradient text fill, at the bottom of the splash, the "you" tab, and Settings. Under it, small: "Muse Spark · Muse Image · Muse Voice" as plain text (these are model names, never an app).
 M10. Look-alikes only: no official Meta/Instagram/Facebook/WhatsApp logos, wordmarks, glyph files, or fonts. Our own wordmark and icons only; Meta app names appear as text where needed.

PLACEHOLDERS
- Every button named in spec Section 8 is a PlaceholderButton (or Toggle/Segmented/Slider) with its feature ID, data-backend + data-feature-id, the NOT YET CONNECTED badge, tooltip, and a "Not connected yet" toast on click. Spec rules stay: hotline buttons never use real tel:/sms: links; no time/date pickers for everyday unsends (Screen 14); Plans (Screen 12) has restaurant/date/time + Accept/Reject and NO pricing.
- Navigation-only controls (spec 9.2) work and carry no badge.

STATIC STATES (?state=) - each screen exposes the states its demo moment needs (the later animation prompt uses them), e.g.
  /rant?state=recording | transcript | emotion-chip ; /memories?state=grid | selected ; /send?state=composing | delivered ;
  /graph?state=empty | hubs | full | node-open ; /posthumous?state=default | date-turned ; /proxy?state=1-of-3 | 3-of-3 ;
  /inbox?state=list | card-open | plan ; /reminisce/mom?state=item-1 | item-2 ; /story-notification?state=story | notification | call ;
  /plans?state=picker | recipient ; /group?state=default ; /settings/delivery?state=waiting | delivered ; /overlays?state=default
Graph states must be deterministic (fixed seed, cooldownTicks then freeze, or precomputed node positions in lib/mock/graph.ts) so screenshots are identical every run.

SPLASH + TOUR HOOK (static now)
- /splash: the Unsaid splash on the unfolded Duo: continuous bg-dusk across both displays, UnsaidLogo 96 pt centered on the right display, Caveat line "for the words we never got to say." centered on the left display, M9 footer at the bottom of both.
- /tour?step=N renders tour step N statically (the screen + state + a small caption chip outside the device, "step 3 · brain graph"). The step list lives in lib/tour.ts and follows Demo_Script.md scene order (2 apps you use -> 3 brain graph -> 4 right moment -> 5 posthumous -> 6 resurfacing -> 7 close), mapped to these routes/states. No auto-play; that belongs to the later animation prompt.

ACCEPTANCE CRITERIA (Phase 4)
- All 15 routes render on the white Duo in the layouts above; every string matches the spec.
- npx tsx scripts/check-contract.ts: every ID from spec rows 1-94 appears on its screen; no unknown IDs; zero network requests.
- Every placeholder click toasts "Not connected yet" + ID; ?badges=off hides badges only.
- M1-M10 are each visible; list where each one shows up in your report.
- Unsaid opens from its home-screen icon in /phone, closes into it, and appears in the switcher; scripts/shell-check.ts passes with it included.
- docs/backend-sync.md is current; any approved new features are in the contract, on their screen, and in the spec.
- Screenshots of every route x state at 1x (and 2x for /, /graph, /inbox, /story-notification), checked against the spec. Commit "phase 4: Unsaid app, 15 static screens, Meta styling". Do not push.

STOP AND LET ME REVIEW.
```

---

## Phase 5: Fake Meta apps with Unsaid integrated (static, navigable)

```text
PHASE 5: Build navigable, STATIC look-alike clones of Meta's apps with Unsaid woven in. Phase 0 global rules apply. These are concept screens: every app is a recreated look-alike (drawn SVG icons, our own layout code, no official logos/glyph files/fonts/screenshots), each page carries the label "concept · look-alike. a real version needs a Meta partnership." Every Unsaid touchpoint is a PlaceholderButton (NOT YET CONNECTED) with the feature ID below. Each app renders on the white Duo (unfolded unless noted); internal navigation (tabs, opening a chat/story) works via routes, everything else toasts. EVERY app here registers with the Phase 3 navigation shell (replacing its placeholder screen): it opens from its home-screen icon, closes into it, shows in the switcher, and swipes to the next app with the same system-level transitions. No app gets its own open/close animation.

NEW FEATURE IDs: these are already added to Unsaid_Frontend_Build_Spec.md Section 9.4 (rows 95-110) and must be in lib/contract.ts. If you need any other ID, STOP and ask me; don't invent one.

1) INSTAGRAM look-alike  /apps/instagram/[feed|stories|dm|dm-mom|story-notification]
- Feed (left display): IG-style top bar with the app name as plain text "Instagram" in font-meta 22 pt 700 (never recreate the script wordmark), heart + messenger-style icons at right, stories row with ig-gradient rings, posts: Mom's birthday-dinner photo post with like/comment/share/save outline icons, "liked by dad and 12 others", caption. On the photo's top-right: the Unsaid mark (26 pt white on frosted circle) -> [overlay-open-memory].
- Right display: Mom's profile preview card, or the DM list.
- Stories (/stories): full-bleed story viewer of "you · 2h" (the cozy library study scene), progress bars, reply bar "Send message".
- Story notification (/story-notification): the Unsaid NotificationSheet over the story: UnsaidMark, "Mom left you something.", "no emergency. just miss you.", buttons "Reply with an unsend" [contextual-reply-unsend] and "Call Mom" [contextual-call], grabber [contextual-dismiss].
- DMs (/dm, /dm-mom): IG DM list (left) + the Mom thread (right). In the composer row, an "unsaid" chip with the open-bubble mark: "send an unsaid" [ig-dm-unsend-compose].
2) META AI app look-alike (the Ray-Ban Meta glasses companion)  /apps/meta-ai/[chat|glasses]
- Chat (left display): Meta AI chat home: meta-ai-gradient ring at top, greeting "Hi Riley", prompt chips, a conversation: you: "help me say sorry to Jordan" (send button [meta-ai-chat-ask]); Meta AI reply bubble with a suggested gentle draft in Caveat and a card "open in Unsaid" with the mark [meta-ai-unsaid-handoff]; footer "built with Muse Spark" in small text.
- Glasses tab (right display): device card "Ray-Ban Meta · connected · 62%", recent captures grid (illustrated POV photos: lake trip, mom's kitchen), an Unsaid card "3 moments with Mom from your glasses" with "import to Unsaid" [glasses-media-import] and "record an unsend hands-free" [glasses-voice-unsend] (hint text: "say 'Hey Meta, tell Mom I miss her'"). Bottom tabs: Meta AI · Devices · Discover (look-alike).
3) FACEBOOK look-alike  /apps/facebook/[feed|post]
- Feed (left): fb-bg #F0F2F5, top bar with the name "facebook" as plain text in meta-blue 26 pt 700 (no logo file), "What's on your mind?" composer, a memories card "6 years ago today" from Grandma ("Nana Ruth") with the family photo; the Unsaid mark on the photo [overlay-open-graph-node].
- Right: the post detail with comments; a button "send to Messenger" (Unsaid hand-off into Messenger) [messenger-handoff].
4) WHATSAPP look-alike  /apps/whatsapp/[chats|marfa-trip|call]
- Chats (left): WhatsApp-style list (wa-teal header, light), chats "Fam" (preview: "Dad: 📷 Photo"), "Roommates", "Marfa Trip", "Mom", with unread wa-green badges.
- Marfa Trip group (right): wa-chat-bg #EFEAE2, Priya: "omg marfa was 2 years ago??", then an Unsaid group unsend card in the thread, sent by you to the group ("found these and miss you all. reunion soon?" in Caveat, with the marfa sunset / road trip / 2 AM laughing fit photo strip), with "open in Unsaid" [wa-group-unsend-open] and "reply with an unsend" [unsend-reply]; header call icon [call-start].
- Call screen (/call): WhatsApp-style voice call "Mom" "00:02", end button [call-end].
5) OPTIONAL STUBS (single folded Duo each)  /apps/messenger, /apps/threads
- Messenger: a thread with Mom; her voice-unsend bubble with "listen" [unsend-play].
- Threads: a feed with one post "today I finally called my mom back." No Unsaid button (no ID).

Also: replace Screen 15's simple frames with these components (Instagram feed post / WhatsApp Fam bubble / Facebook memories card), keeping its IDs (overlay-open-memory, overlay-open-unsend-draft, overlay-open-graph-node).
Static states: each view is a route; add ?state= where a view has variants (e.g. /apps/instagram/story-notification?state=story|notification|call). Register all in lib/scenes.ts.

ACCEPTANCE CRITERIA (Phase 5)
- Each fake app is instantly recognizable as its Meta counterpart from layout and color alone, while using zero official assets (verify: no downloaded image except /public/unsaid-logo.png and our illustrated mock photos).
- Every Unsaid touchpoint is a placeholder with the exact ID; check-contract shows all 110 buttons / 94 unique IDs and no extras.
- Unsaid touchpoints are visually Unsaid (amber/plum mark, Caveat text) inside each host app's styling.
- Internal navigation works; the concept label is present on every page.
- Live navigation: on /phone, open Instagram -> close -> open Meta AI -> close -> open Facebook -> close -> open WhatsApp -> close -> open Messages -> close -> open Unsaid, with no jank; then the switcher and prev/next across all of them. scripts/shell-check.ts passes for every registered app (including reduced motion).
- Screenshots of every view/state, checked. Commit "phase 5: Meta app look-alikes with Unsaid touchpoints". Do not push.

FINAL REPORT (this is the last build phase; do this before stopping)
1. Re-read backend/ one last time and update docs/backend-sync.md.
2. Write docs/unconnected-buttons.md and paste it into your reply. It must be a table of EVERY button that still has no backend behind it, with columns: feature ID · screen (number + name, or fake app + view) · button label · backend status (not built / partially built / built but not wired in this frontend). Sort it by screen. Give totals: buttons, unique IDs, and how many have a backend feature.
3. Also list any backend features that were added to the frontend in this build (new IDs) and any backend features still missing from the frontend.
4. Suggest, but do not do, which unconnected buttons could be deleted versus kept as blank buttons that won't appear in the animation. Gurneal decides.

STOP AND LET ME REVIEW.
```

---

## Later: the scripted demo animation

Scripted demo animation: separate prompt, coming later. Don't build it yet.

(The opening beat table, the motion specs, and the feature-tour timing are saved in `Demo_Script.md` under "Animation Production Notes" for that later prompt.)

---

## Appendix A: ChatGPT prompt for the Unsaid logo (save as `frontend/public/unsaid-logo.png`)

```text
Design a 1024x1024 iOS app icon for an app called "Unsaid", a warm, emotional app for saying the things you never said to the people you love. It should feel at home in Meta's family of apps next to Instagram, Messenger, and WhatsApp: bold, simple, friendly, one glyph on a rich gradient.

- Glyph: a single continuous-line speech bubble drawn with a rounded stroke about 7% of the icon width, LEFT SLIGHTLY OPEN at the upper right (a small gap in the outline, like words that never got said). Warm white (#FFF8EF). Centered, about 56% of the icon width, with a small soft tail at the bottom left.
- Background: a smooth diagonal gradient from warm amber #E8A15A (top left) through soft rose #C2557A to deep plum #4A1F35 (bottom right), with a very subtle inner glow so it looks warm, not flat.
- Full-bleed square (no rounded corners; iOS applies the mask), no text, no letters, no shadows outside the square, no Meta, Instagram, or Apple logos or look-alikes of them.
- Output: PNG, 1024x1024, sRGB. Also give a second version of just the white bubble mark on a transparent background.
```

## Appendix B: New feature IDs added in Phase 5

Added to `Unsaid_Frontend_Build_Spec.md` Section 9.4 (rows 95–110). There are 7 new unique IDs, and 9 rows reuse existing IDs. Totals are now **110 buttons and 94 unique feature IDs**.

| # | Button | Fake app | Feature ID | New? |
|---|---|---|---|---|
| 95 | Unsaid mark on Mom's birthday-dinner post | Instagram | `overlay-open-memory` | shared (row 92) |
| 96 | "send an unsaid" chip in the DM composer | Instagram | `ig-dm-unsend-compose` | **new** |
| 97 | "Reply with an unsend" (story notification) | Instagram | `contextual-reply-unsend` | shared (row 68) |
| 98 | "Call Mom" (story notification) | Instagram | `contextual-call` | shared (row 69) |
| 99 | dismiss grabber (story notification) | Instagram | `contextual-dismiss` | shared (row 70) |
| 100 | send "help me say sorry to Jordan" | Meta AI | `meta-ai-chat-ask` | **new** |
| 101 | "open in Unsaid" card in Meta AI's reply | Meta AI | `meta-ai-unsaid-handoff` | **new** |
| 102 | "import to Unsaid" (glasses captures) | Meta AI (glasses tab) | `glasses-media-import` | **new** |
| 103 | "record an unsend hands-free" | Meta AI (glasses tab) | `glasses-voice-unsend` | **new** |
| 104 | Unsaid mark on Nana Ruth's memories photo | Facebook | `overlay-open-graph-node` | shared (row 94) |
| 105 | "send to Messenger" | Facebook | `messenger-handoff` | **new** |
| 106 | "open in Unsaid" on the group unsend card | WhatsApp (Marfa Trip) | `wa-group-unsend-open` | **new** |
| 107 | "reply with an unsend" in the group | WhatsApp (Marfa Trip) | `unsend-reply` | shared (row 58) |
| 108 | header call icon | WhatsApp (Marfa Trip) | `call-start` | shared (row 65) |
| 109 | "end" on the call screen | WhatsApp (call) | `call-end` | shared (row 71) |
| 110 | "listen" on Mom's voice-unsend bubble | Messenger stub | `unsend-play` | shared (row 57) |

## Appendix C: Verification notes

- **The iPhone Duo is fictional.** Its dimensions come from iPhone 16 Pro–class proportions (a 402×874pt viewport, a Dynamic Island of about 126×37pt, concentric corners) scaled to 1920×1080. They are not measurements of a real device.
- **iOS chrome numbers are approximations** (icon grid pitch, widget sizes, dock size). Check them against the Apple Design Resources iOS kit and the installed skills; Phases 1 and 3 tell Claude to do this.
- **Meta brand colors are eyeballed look-alike values**, not official brand specs. "Optimistic" is Meta's proprietary typeface and is not available, so a fallback stack is used.
- **Meta AI app:** the Meta View → Meta AI rename (Apr 29, 2025), the App Store title "Meta AI - Assistant & Glasses", and "built with Muse Spark" were verified. Edits is by Instagram, but its real icon was not copied; the look-alike is approximate.
- **Skills:** all repos returned 200 and their install commands were taken from their READMEs or `marketplace.json`. The Remotion plugin repo's README is a stub, but its `marketplace.json` confirms `remotion@remotion`. For pproenca `ios-design`, only the repo and the marketplace listing were verified, not the skill folder.

---

*Unsaid · HackTX 2026 · For the words we never got to say. · Hackathon concept mock, not affiliated with Apple or Meta.*

---

## Changelog

| Date (CT) | Change |
|---|---|
| Oct 24, 2026 | **v1:** created. Phases 0–5, each with acceptance criteria and a review stop:<br>• 0: setup, verified skills, global rules and backend sync.<br>• 1: the white iPhone Duo.<br>• 2: the Messages "k" thread.<br>• 3: the home screen and the interactive iOS navigation shell.<br>• 4: 15 Unsaid screens with backend sync.<br>• 5: the Meta look-alike apps and the final unconnected-buttons report.<br>Heavy Meta styling (M1–M10), look-alike icons only, contract rows 95–110. The scripted demo animation was removed and deferred to a later prompt; its beat table and motion specs moved to `Demo_Script.md` → Animation Production Notes. |
