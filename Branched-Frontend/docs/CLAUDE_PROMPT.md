# Un-Said (Unsaid): Branched-Frontend build prompt for Claude Code

**Version:** BF-v2 · Oct 24, 2026 (CT) · the phone, the apps and the scripted opening; Un-Said itself is only its logo and a slot
**For:** Claude Code, working on the HackTX 2026 repo `MuditUpadhyay04/HackTX`, branch `branched-frontend`, folder `Branched-Frontend/`
**Owner of everything in this folder:** Gurneal Chandi (@NotGurneal)
**Paste-ready blocks:** `Branched-Frontend/paste/START_HERE_…` and `Phase0_…` through `Phase6_…` (each phase file is the matching text block below, word for word)

> **All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns `backend/` and the real Un-Said app.**
> Names (Riley, Mom, Dad, Sarah ❤️🤍, Michael (Best Friend)), the palette, styling, icons, UI copy and visuals come from Gurneal. The Un-Said theme (tokens, icon, wordmark, UI reference) lives in **`App-UI-Final/`**, which this build only READS. Mudit's `Demo_Script_v2.md` (in `reference/`) is used **only for story and beat structure**, and only where it doesn't conflict. Nothing visual or user-facing is taken from Mudit's files.

> **What changed in BF-v2 (read this first).** This build is the **phone, the apps and the opening**: the white iPhone Duo (folded and unfolded), the iOS home screen and navigation shell, notifications, fully working WhatsApp (chats, missed calls, Calls tab, call screens), Messages (Sarah), Instagram (Michael's DMs and Reels) and Photos, Facebook and Meta AI shells, the dev panel and `?notify=`, a fold/unfold control, and the **scripted, replayable opening storyboard**. **Un-Said itself is not built here.** It appears only as its logo (home icon, notification icon, launch splash) and as `components/UnsaidSlot.tsx`, a polished, clearly swappable placeholder where Mudit's real app mounts later. The old Un-Said screens, the 50-row contract and the rant/letter phases are retired (see section 12).

---

## ⚠️ SCOPE: DEMO-ONLY, NOT A PRODUCTION APP (Gurneal, Oct 24, 6:38 PM CT)

This is **not** a production-ready app. We only build enough of it to be screen-recorded and shown inside the animated presentation display for the HackTX demo.
- "Production quality" in this spec means **how it looks on screen**: Apple-level polish for the phone, real-app fidelity for the look-alikes, and Gurneal's Un-Said theme for the logo, splash and slot placeholder. It does **not** mean production engineering.
- Do NOT build auth, real backend calls, real persistence, security hardening, error monitoring, analytics, SEO, i18n, performance tuning beyond 60 fps on the demo machine, broad test suites or deployment pipelines.
- Do NOT make it responsive for other devices. It only has to look right on the 1920x1080 demo stage and the iPhone Duo frame.
- Mock data and local state only. Hardcode freely when that's faster. Shortcuts that never show on screen are fine.
- The reviewers judge what's **visible in the demo**: pixel accuracy, copy, flow, motion and no AI-slop look. They don't block on code-architecture purity or production concerns. Keep `npm run build` passing so it runs.
- When in doubt, ask: "Will this show up in the demo?" If not, skip it.

## ⚠️ THE WORKSPACE RULE (read before anything else)

```text
WORKSPACE RULE (non-negotiable; it outranks every other instruction)
1. BRANCH: all frontend work happens ONLY on the git branch `branched-frontend`.
   - First command of the project:  git fetch origin && (git checkout branched-frontend || git checkout -b branched-frontend)
   - If the branch exists on origin, check it out and pull; otherwise create it from the current main and push it with: git push -u origin branched-frontend
   - Before EVERY commit, run `git branch --show-current` and confirm it prints `branched-frontend`. If it doesn't, stop and fix it. Never commit to, merge into, rebase onto or push to `main` (or any other branch).
   - Push only with: git push origin branched-frontend
2. FOLDER: all work happens ONLY inside the top-level folder `Branched-Frontend/`.
   - The name: Gurneal said "Branched Frontend". The folder is hyphenated, `Branched-Frontend`, so no path ever contains a space. Always write it exactly `Branched-Frontend/`.
   - The Next.js app is created INSIDE `Branched-Frontend/` (package.json, app/, components/, lib/, public/ all live there). Run every npm/npx command from inside `Branched-Frontend/`.
   - EVERYTHING stays in that folder: code, assets, screenshots, logs, reviewer agents, reports, docs, scripts. `BUILD_LOG.md`, `REVIEW_FINDINGS.md`, `docs/` and `.claude/agents/` live inside `Branched-Frontend/`.
   - NEVER create, edit, move, rename or delete anything outside `Branched-Frontend/`. Never touch `frontend/`, `backend/`, `App-UI-Final/`, `ideas/`, Mudit's Un-Said app code, the repo-root README, `.gitignore` at the root, or any other folder. You may READ `App-UI-Final/` (the Un-Said theme source), `backend/` and `ideas/` (context). That's all.
   - Stage files only with paths inside the folder: `git add Branched-Frontend/` (never `git add -A` or `git add .` from the repo root). Before committing, `git diff --cached --name-only | grep -v '^Branched-Frontend/'` must print nothing.
3. OWNERSHIP: all design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app. Never edit backend/, App-UI-Final/ or Mudit's app. The Un-Said app is NOT built in this folder: it mounts later in components/UnsaidSlot.tsx.
```

This rule is repeated at the top of every paste block, in `GOAL_STATEMENT.txt` and in `CONTEXT.md`.

**Where App-UI-Final lives.** In the repo it is the top-level folder `App-UI-Final/` (a sibling of `Branched-Frontend/`). If it isn't in your checkout yet, read the same folder from `~/Desktop/Unsaid-Claude-Context/App-UI-Final/`. Either way it is read-only: `scripts/sync-theme.ts` (Phase 0) copies what the build needs into `Branched-Frontend/public/unsaid-theme/` and `Branched-Frontend/lib/unsaid-theme.json`, and never writes back.

---

## 0. Team structure: plan with Fable, build with Opus in parallel, review with Haiku

- **Plan with Fable.** Before each phase, Fable writes `Branched-Frontend/docs/plans/PhaseN_plan.md`. It splits the phase into independent work packages with file ownership, and names a single owner for each shared file (tokens, mock data, the opening timeline, layout). Gurneal sees the plan before the build starts.
- **Build with Opus.** Opus builder subagents (`model: opus`) live in `Branched-Frontend/.claude/agents/`, one per work package. Run them in parallel, about 10 at once. Each one edits only its own package's files.
- **Review with Haiku.** The 10 Haiku reviewers from section 9 run in parallel after every package and every change. Issues get fixed by Opus builders and re-checked until all 10 report CLEAN.
- **Log and push.** Every change gets a `BUILD_LOG.md` entry and a push to `branched-frontend`.
- The kickoff message is in `paste/START_HERE_paste_into_Claude_Code.txt`.

## 1. What we're building

A **fully built, interactive web mock** (Next.js) of one evening on Riley's white iPhone Duo, plus a **scripted, replayable opening** that performs that evening on top of the same build. Everything is mock data, look-alike UI and local state. No real accounts, no real Meta or Apple logos. **Un-Said is present only as its logo and a slot**: the real app is Mudit's and plugs in later.

**The opening storyboard** (what the build must perform, both by hand and as the scripted sequence):

| # | Phase of the opening | What happens | Beats (section 7, Phase 4) |
|---|---|---|---|
| 1 | **Folded Duo** | Black, the optional cold-open card, then the pull-back reveals the folded white Duo | B01–B03 |
| 2 | **Mom's WhatsApp + Seen** | The display wakes into Mom's thread: missed calls, "did you eat?", his "k", "I love you beta" + gray "Seen" | B04–B06 |
| 3 | **"love you too", typed and deleted** | The keyboard rises, "love you too" lands, the caret stalls, he deletes it; nothing is sent | B07–B11 |
| 4 | **Sarah's notification and his reply** | Banner "please just say something" → Messages → "i just don't feel like talking rn" → Read 9:41 PM, dots vanish | B12–B18 |
| 5 | **Michael's notification and his reply** | Banner → Instagram DM → "im good bro" · pause · "just tired" | B19–B24 |
| 6 | **The Un-Said notification** | The Un-Said banner (its icon is the first blue-violet on screen), held, then pressed | B25–B26 |
| 7 | **The Duo unfolds, Apple-style** | The left panel swings out on the hinge, then the Un-Said splash (icon + "Un-Said" wordmark on the gradient) hands off to the UnsaidSlot | B27–B28 |

**Rules this build lives by:**
1. **"Unsaid is the hallway, not a fifth app."** (from Mudit's v2, adopted by Gurneal). Nothing in this build renders a fake Un-Said chat, rant, letter or AI text. Un-Said is the icon, the banner, the splash and the slot.
2. **Nothing the model writes appears as his words.** No AI-written text anywhere in the build.
3. **Silence is designed.** Every hold beat has a static `?state=` frame with nothing moving.
4. **Keep "k."** His "k" stays in Mom's WhatsApp history in every state, under "did you eat?".
5. **Web mock, not film.** Every app is built here as an interactive look-alike. Nothing is screen-recorded from real apps.
6. **One timeline, one build.** The scripted opening DRIVES the working apps (messaging store, `notify()`, the shell, the Duo's `openAngle`); it never re-implements a screen.
7. **The slot is honest.** The UnsaidSlot placeholder looks finished but does nothing; it never fakes Un-Said features. It is replaced by Mudit's app with one prop or one env var.

**Done means:** the whole frontend except the real Un-Said app is built, polished and reviewed, the opening plays and replays, and the build is **ready for animation work** (further scenes are layered on later, after Mudit's app is in the slot).

---

## 2. Cast, clock, places (Gurneal's)

| Who | Shown as | Lives in (app) | Notes |
|---|---|---|---|
| Riley | "Riley" (you) | the white iPhone Duo | The son. Student in Austin |
| Mom | "Mom" | WhatsApp | Calls a lot; "I love you beta"; "just wanted to hear your voice" |
| Dad | "Dad" | WhatsApp ("Fam" group), on Mom's video call state | Leans into the video call in `state=video-dad` |
| Sarah ❤️🤍 | "Sarah ❤️🤍" | Messages (iMessage) | Girlfriend. Honey-bun paragraph. "please just say something" |
| Michael (Best Friend) | "Michael (Best Friend)" (Instagram chat nickname) | Instagram DMs | Sends reels; the 290 sunrise photo |

**Clock.** Riley's phone: Saturday, Oct 24, 2026, **9:41 PM** in Austin (status bar "9:41"). A dev-panel clock (`?clock=HH:MM`, default 21:41; `?clock=frozen` pins it) drives every time-dependent label. Mom's time zone is a mock setting in `lib/mock/people.ts` (used only by the WhatsApp header's last-seen and the call screens; it is an open question, section 3).

---

## 3. Pending team sign-off (defaults are Gurneal's; each is a one-line change in `lib/mock/` or `lib/opening/`)

| # | Question | Default in this build |
|---|---|---|
| 1 | Medium | Fully built web mock for every app (Gurneal). Mudit's v2 "filmed real apps" is not used |
| 2 | Order of the opening | Mom → Sarah → Michael → the Un-Said banner → the unfold (Gurneal) |
| 3 | How each thread ends | "love you too" typed and deleted (Mom); "i just don't feel like talking rn" sent (Sarah); "im good bro just tired" sent (Michael) |
| 4 | Cold-open card "The last thing my kid ever texted me was 'k.'" | ON by default (`?cold=off` skips it). The old amber 'k.' color is retired; the 'k.' uses the same #F5F5F7 as the line, weight 700 |
| 5 | The Photos beat (the kitchen photo) | Photos is a fully working app, but NOT part of the scripted opening. `?scene=photos` exists if Gurneal wants it back |
| 6 | Un-Said banner copy | Copy A: "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?" (B and C in Phase 2) |
| 7 | Splash background | `un-card-gradient` from App-UI-Final, full bleed across both displays; icon 120 pt + "Un-Said" wordmark (white) |
| 8 | UnsaidSlot default URL | None: the polished placeholder shows until `NEXT_PUBLIC_UNSAID_APP_URL` (or `?unsaid=<url>`) is set |
| 9 | Replies from Sarah and Michael | Seeded mock messages fired from the dev panel only (never in the opening) |
| 10 | Mom's time zone | America/Chicago like Riley (no visible wait) |

---

## 4. Styling (Gurneal's graphics; App-UI-Final is the Un-Said source)

### 4.1 The Un-Said theme: read from App-UI-Final (never copied by hand, never edited)

The Un-Said palette, gradients, type, radii, shadows and motion are **not redefined here**. They live in `App-UI-Final/tokens/unsaid-tokens.json` and `App-UI-Final/tokens/unsaid-tokens.css`, with the rules in `App-UI-Final/DESIGN_SPEC.md`, the names and strings in `App-UI-Final/COPY_AND_NAMES.md`, the icon set in `App-UI-Final/assets/brand/` and Gurneal's UI reference in `App-UI-Final/assets/ui-reference/unsaid-ui-reference.png`.

- `scripts/sync-theme.ts` (Phase 0) copies `unsaid-tokens.json` to `lib/unsaid-theme.json`, `unsaid-tokens.css` to `app/unsaid-theme.css`, and `assets/brand/*` to `public/unsaid-theme/brand/`, each with a "generated from App-UI-Final, do not edit" header. Re-run it whenever App-UI-Final changes. It never writes into App-UI-Final/.
- `lib/tokens.ts` imports `lib/unsaid-theme.json` for every `un-*` token and adds the look-alike, device and phone-motion tokens below. If a `un-*` value you need is missing, log it in BUILD_LOG.md as "THEME NEEDED" and ask Gurneal; never invent one.
- Un-Said appears in exactly four places in this build, all from that theme: the **home-screen icon**, the **notification icon**, the **launch splash** (icon + "Un-Said" wordmark on `un-card-gradient`), and the **UnsaidSlot placeholder** (a static Home in the theme; Phase 3).
- Retired and banned: the old cream/plum/amber palette, Caveat or any handwriting face, the bubble mark, any un-* value typed by hand into a component.

### 4.2 Look-alike palettes for the host apps (approximate, eyeballed from the real apps by us; not official brand specs; never ship real logo files)

**WhatsApp (iOS, light)**

| Token | Hex | Use |
|---|---|---|
| `wa-green` | `#25D366` | Brand accent, unread badges |
| `wa-accent` | `#1DAA61` | Send button, call buttons, links |
| `wa-chat-bg` | `#EFEAE2` | Chat wallpaper base (plus a faint doodle pattern drawn in-house) |
| `wa-bubble-out` | `#D9FDD3` | Outgoing bubble |
| `wa-bubble-in` | `#FFFFFF` | Incoming bubble |
| `wa-meta` | `#667781` | Timestamps, 'online', secondary |
| `wa-tick-read` | `#53BDEB` | Blue double tick |
| `wa-tick-sent` | `#8696A0` | Gray ticks |
| `wa-missed` | `#F15C6D` | Missed-call glyph/text |
| `wa-nav` | `#F6F6F6` | Nav and tab bars |
| `wa-system-pill` | `#FFF5C4` | Encryption / date system pills (light yellow) |

**WhatsApp calls (dark call screen)**

| Token | Hex | Use |
|---|---|---|
| `wa-call-bg` | `#0B141A` | Call screen background |
| `wa-call-surface` | `#1F2C34` | Call control well |
| `wa-call-end` | `#F15C6D` | End-call button |
| `wa-call-text` | `#E9EDEF` | Names, timer |

**Messages / iMessage (iOS, light)**

| Token | Hex | Use |
|---|---|---|
| `imsg-blue` | `#007AFF` | Outgoing iMessage bubble, send arrow, links |
| `imsg-gray` | `#E9E9EB` | Incoming bubble |
| `imsg-green` | `#34C759` | SMS bubble (not used in the story) |
| `imsg-meta` | `#8E8E93` | Delivered / Read 9:41 PM, timestamps |
| `imsg-failed` | `#FF3B30` | Not Delivered (not used by default) |
| `imsg-nav` | `#F9F9F9` | Nav bar material base (94% + blur) |
| `imsg-field-stroke` | `#C7C7CC` | Composer stroke |

**Instagram (light DMs, dark Reels)**

| Token | Hex | Use |
|---|---|---|
| `ig-text` | `#000000` | Primary text |
| `ig-muted` | `#737373` | Secondary |
| `ig-hairline` | `#DBDBDB` | Separators |
| `ig-blue` | `#0095F6` | Buttons, links |
| `ig-red` | `#FF3040` | Hearts, notification dot |
| `ig-dm-in` | `#EFEFEF` | Incoming DM bubble |
| `ig-dm-out-start` | `#7B2FF7` | Outgoing DM gradient start |
| `ig-dm-out-end` | `#3B5BFE` | Outgoing DM gradient end |
| `ig-reels-bg` | `#000000` | Reels |

**Facebook (light)**

| Token | Hex | Use |
|---|---|---|
| `fb-blue` | `#0866FF` | Primary, active tab |
| `fb-bg` | `#F0F2F5` | Feed background |
| `fb-card` | `#FFFFFF` | Posts |
| `fb-text` | `#050505` | Primary text |
| `fb-secondary` | `#65676B` | Secondary text |
| `fb-divider` | `#CED0D4` | Dividers |

**Meta AI (light)**

| Token | Hex | Use |
|---|---|---|
| `meta-ai-blue` | `#0064E0` | Links, send |
| `meta-ai-text` | `#1C2B33` | Primary text |
| `meta-ai-surface` | `#F1F4F7` | Assistant bubble / input well |

**iOS system (light, plus dark where used)**

| Token | Hex | Use |
|---|---|---|
| `ios-blue` | `#007AFF` | System tint |
| `ios-red` | `#FF3B30` | Destructive, badges |
| `ios-green` | `#34C759` | Call accept |
| `ios-gray` | `#8E8E93` | Secondary glyphs |
| `ios-gray4` | `#D1D1D6` | Hairline-ish fills |
| `ios-gray5` | `#E5E5EA` | Grouped fills |
| `ios-gray6` | `#F2F2F7` | Grouped background |
| `ios-kb-bg` | `#D1D4DA` | Keyboard tray (light) |
| `ios-kb-key` | `#FFFFFF` | Letter keys |
| `ios-kb-key-special` | `#ABB0BA` | Shift/delete/123 keys |
| `ios-banner` | `#F5F5F5` | Banner material base (78% + blur 30 + saturate 1.8) |

**Look-alike gradients**

| Token | CSS | Use |
|---|---|---|
| `ig-gradient` | `linear-gradient(45deg, #FEDA75 0%, #FA7E1E 25%, #D62976 50%, #962FBF 75%, #4F5BD5 100%)` | Instagram look-alike icon tile and story rings (never a real logo file) |
| `ig-dm-out` | `linear-gradient(90deg, #7B2FF7 0%, #3B5BFE 100%)` | Outgoing Instagram DM bubble |
| `messenger-gradient` | `linear-gradient(45deg, #0099FF 0%, #A033FF 60%, #FF5280 90%, #FF7061 100%)` | Messenger stub icon |
| `meta-ai-gradient` | `conic-gradient(from 200deg, #0064E0, #7B3FF2, #D63BC4, #FF6A3D, #0064E0)` | Meta AI look-alike ring/glyph only |
| `ios-wallpaper` | `radial blobs #677FEF / #A166B7 / #8776DF / #607CF2 on #0B0B12, blur 80 px (colors sampled from Gurneal's app icon)` | Stage and home-screen wallpaper (Phase 1/3) |

**Type in host apps:** the system stack (`-apple-system, "SF Pro Text", system-ui`), iOS text styles 34/28/22/20/17/16/15/13/12/11 pt. Instagram/Facebook/Meta AI use 14/15/17 pt at their usual weights. No bundled Apple or Meta font files.

### 4.3 Device and stage

White iPhone Duo frame: `frame-base` #E9E8E4 · `frame-highlight` #FFFFFF · `frame-mid` #D8D7D2 · `frame-shadow` #B7B6B0 · `frame-seam` #C4C3BD · `bezel` #050506 · `hinge-seam` #BEBFC3 · `back-glass` #FBFBF9 (all in `assets/palettes/branched-tokens.json`, key `device`). Stage behind the opening's black and cold-open card: #000000. Stage behind Act 1: the blurred `ios-wallpaper` or black. Stage behind the splash and the slot: `un-stage` from App-UI-Final. The full device geometry is in Phase 1.

### 4.4 Phone and opening motion (this build's own tokens, in lib/motion.ts)

App-UI-Final's motion tokens apply only inside the splash and the slot placeholder. The phone, the iOS shell and the opening use these (the same numbers work in Framer Motion `{type:"spring"}` and Remotion `spring({config})`):

| Token | Value | Use |
|---|---|---|
| `spring-open` | stiffness 340 · damping 32 · mass 1 | App open from an icon (Phase 3) |
| `spring-open-banner` | stiffness 320 · damping 32 · mass 1 | App open from a banner (B13, B20) |
| `spring-close` | stiffness 300 · damping 30 · mass 1 | App close into its icon; switcher kill |
| `spring-snapback` | stiffness 400 · damping 35 · mass 1 | Weak swipes, carousel, app switch |
| `spring-banner` | stiffness 420 · damping 34 · mass 1 | Notification banner drop |
| `spring-send` | stiffness 500 · damping 36 · mass 0.8 | Sent bubble rising from the composer (B17, B24) |
| `spring-pullback` | stiffness 75 · damping 20 · mass 1.2 | The camera pull-back from the black screen (B03) |
| `spring-unfold` | stiffness 120 · damping 22 · mass 1.3 | The hinge: fold and unfold (fold control, banner tap, B27) |
| `ease-soft` | cubic-bezier(0.22,1,0.36,1) | Fades in, the splash, the cold-open text |
| `ease-ios` | cubic-bezier(0.32,0.72,0,1) | Keyboard rise (300 ms), press (120 ms), display wake |
| `ease-breath` | cubic-bezier(0.45,0,0.55,1) | Camera drifts, the specular sweep |
| `caret-blink` | 500 ms on / 500 ms off | iOS caret in the host apps |

Reduced motion (`prefers-reduced-motion` or `?motion=reduced`): every scale/rotate/blur move becomes a 400 ms crossfade between the same key states in the opening, and a 200 ms crossfade in the shell; the fold control jumps between folded and unfolded with a 200 ms crossfade.

### 4.5 Assets (standing rule)

Every graphic, image, palette or brand asset this build owns goes into **`Branched-Frontend/assets/`** and gets a row in `Branched-Frontend/assets/README.md` (source, usage, where it lands). Claude Code copies what the app needs into `Branched-Frontend/public/`. Un-Said theme files are NOT duplicated here: they are read from `App-UI-Final/` by `scripts/sync-theme.ts`. The one exception is Gurneal's app icon, which also stays in `assets/brand/` so the home-screen and banner icons never break. Reviewer 10 (`assets-slot-reviewer`) checks the README against `assets/` and `public/`.

```
Branched-Frontend/assets/
  README.md                       index (every file, source, usage, where it lands)
  brand/unsaid-app-icon.png       Gurneal's app icon (1254x1254; iOS masks it; never pre-round). Same file as App-UI-Final/assets/brand/unsaid-app-icon.png
  brand/wordmark.md               "Un-Said" name and wordmark rules (the full rules are in App-UI-Final/assets/wordmark.md)
  palettes/branched-tokens.json   look-alike palettes, look-alike gradients and device frame colors (sections 4.2-4.3); Un-Said tokens come from App-UI-Final
  palettes/branched-frontend-palette.png   swatch sheet for the look-alikes and the device (its Un-Said strip is for reference only)
  icons/README.md                 look-alike icon specs (SVG drawn in code; no files from Apple/Meta)
  images/README.md                mock photo/illustration list and specs

Read from App-UI-Final/ (never copied into assets/; synced into public/unsaid-theme/ and lib/):
  tokens/unsaid-tokens.json · tokens/unsaid-tokens.css · tokens/unsaid-palette.png
  assets/brand/ (icon-1024/512/192/180/32, favicon.ico, unsaid-app-icon.png)
  assets/ui-reference/unsaid-ui-reference.png · assets/wordmark.md · DESIGN_SPEC.md · COPY_AND_NAMES.md
```

---

## 5. Production quality bar (top priority)

The whole build must **not** look vibe-coded or like AI slop. This bar is Phase 0's global rule 14, is checked in every phase's acceptance criteria ("would pass as a real Meta/Apple screenshot"), and is enforced by reviewer 2, `meta-style-slop-reviewer` (the **vibe-code / AI-slop detector**). Paths are inside `Branched-Frontend/`. The same text, word for word:

```text
PRODUCTION QUALITY BAR (top priority; it outranks speed. Applies to every phase, every screen, and every transition)
The test: a screenshot of any state should pass as a real Meta or Apple screenshot. Un-Said's logo, splash and slot placeholder should look like Meta's own design team shipped them (they use App-UI-Final's theme only). The white iPhone Duo, the iOS chrome, the notification banners, the fold control, the unfold, the opening and every transition should look like Apple built them. If it looks vibe-coded or AI-generated, it is not done.
BANNED TELLS (any one of these is a finding; the slop detector, reviewer 2, flags them):
- The default Tailwind/shadcn look: stock rounded-lg cards, default ring/focus styles, gray-200 borders, slate palettes, shadcn components used unstyled.
- Generic purple-to-blue "AI" gradients. Gradients come only from the tokens: the Un-Said gradients synced from App-UI-Final (lib/unsaid-theme.json), the Meta look-alike gradients (ig, messenger, meta-ai) and the Instagram DM bubble gradient. Any other blue-violet gradient is a finding.
- Glassmorphism everywhere. Blur/material only where iOS uses it (status-bar overlays, notification banners, dock, sheets, keyboard). Never on content cards.
- Emoji used as icons. Icons are drawn SVG glyphs at iOS/Meta weights. Emoji only inside message copy, where a person typed them.
- Inconsistent radii or spacing; any value off the token scale.
- Lorem ipsum, "Button", "Title", "John Doe", TODO text, or placeholder gray boxes. Every image is a finished illustration. Gurneal's own art (Branched-Frontend/assets/brand/ and App-UI-Final/assets/brand/, served from public/brand/ and public/unsaid-theme/brand/) is used as is.
- Centered-everything, hero-style layouts. These are app screens; follow the real apps' alignment (leading-aligned lists, real nav bars).
- Random drop shadows. Shadows come only from the shadow tokens, and only where iOS/Meta use them.
- Inter as a deliberate display face. UI type uses the system stack (SF on the recording Mac); Inter is a last-resort fallback only. No handwriting faces anywhere.
- Stock "AI sparkle" icons. The only sparkle is the Meta AI look-alike glyph, and only inside the Meta AI shell (Phase 6). Un-Said itself shows no AI sparkle.
- Janky motion: linear easing on UI, CSS ease-in-out defaults, durations picked at random, layout shift, anything below 60 fps.
REQUIRED CRAFT:
- A strict 4/8 pt grid. Every padding, gap and size comes from lib/tokens.ts.
- A real type scale (the iOS text styles: 34/28/22/20/17/16/15/13/12/11 pt with their line heights and weights; Meta's 14/15/17 sizes for Meta-styled UI). Numbers use tabular figures where they change.
- Design tokens for color, radius, shadow, blur, spacing, type and motion. No hard-coded hex or px in components (grep must find none outside lib/tokens.ts and the token CSS).
- A Meta-like palette and components (top bar, stories row, tab bar, sheets with a 36x5 grabber, Messenger-style bubbles, Meta blue for secondary actions), and App-UI-Final's palette and gradients for the Un-Said icon, splash and slot placeholder only.
- Real-looking content: real names, real times, real counts, finished illustrations, believable copy.
- Every state designed: default, loading (skeletons shaped like the real content, never spinners on blank screens), empty, pressed (iOS: 0.97 scale or a 15% darken in under 100 ms), disabled, error, and the placeholder press + "concept only" toast.
- iOS-matching motion: spring physics, not durations (shell springs ~stiffness 300-400, damping 30-35), 60 fps, interruptible, with transform/opacity only. Reduced-motion fallbacks.
- SF-style 0.5 pt hairlines (rendered at device pixel ratio) on nav bars, lists and the composer. Continuous-corner (squircle) radii on icons, cards and the device.
- Haptic-like micro-interactions: press-down on touch start, a subtle overshoot on toggles, a ripple ring where a haptic would fire.
- Pixel-checked: every new state is screenshotted at 2x and compared SIDE BY SIDE with a reference screenshot of the real app or device (saved under Branched-Frontend/screenshots/reference/, for comparison only: listed in .gitignore, never committed, never in public/). Log the comparison in BUILD_LOG.md. The UnsaidSlot placeholder is ALSO compared side by side with Gurneal's reference (App-UI-Final/assets/ui-reference/unsaid-ui-reference.png): its Home must match it closely (layout, sizes, colors, type weight, radii, copy).
- The phone, the notification banners, the fold control and the opening are held to the same bar: Apple-made quality, with correct materials, a continuous specular light, a hinge that feels mechanical, and banners with the real iOS proportions and spring.
```

---

## 6. Skills and plugins to install first

Install these **before Phase 0** (they install into `~/.claude/` or the project's `.claude/`, which for this build means `Branched-Frontend/.claude/`; nothing goes outside the folder in the repo). All were checked on Oct 24, 2026 (the repos exist and the commands come from their READMEs or marketplace manifests). The Apple skills are written for SwiftUI/UIKit. Here they are used as the **reference for iOS measurements, conventions, and motion feel**, which Claude translates into CSS/React. They are not used to write Swift.

### Apple / iOS interface accuracy (use in Phases 1–6)

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

### Motion (for the shell, the fold control and the opening)

| Package | Install (exact) |
|---|---|
| **Framer Motion** (springs for the shell, the banners and the fold control) | `npm i framer-motion` (inside `Branched-Frontend/`; Phase 0 installs it) |

The spring values live only in section 4.4 / `lib/motion.ts`; the Remotion opening uses the same configs through `spring()`.

### Rendering the opening (install before Phase 4)

| Skill / package | Install (exact) |
|---|---|
| **Remotion Claude Code plugin** (official) | `claude plugin marketplace add remotion-dev/claude-code-plugin` then `claude plugin install remotion@remotion` ([repo](https://github.com/remotion-dev/claude-code-plugin); the marketplace name `remotion` was confirmed in its `marketplace.json`) |
| **Remotion packages** (inside `Branched-Frontend/`) | `npm i remotion @remotion/player @remotion/cli` |

*snapcn Phone Frame* (listed in the build spec v1) is **not needed**: the white iPhone Duo is a custom component (Phase 1).

---

## 7. Phase map

| Phase | Builds | Storyboard it enables | Motion? |
|---|---|---|---|
| **0** | Retire the BF-v1 leftovers, branch + folder, scaffold, theme sync from App-UI-Final, tokens, global rules, logs, the placeholder system, 10 Haiku reviewers | none (foundation) | none |
| **1** | The white iPhone Duo (static states) + the **fold control** (on-stage button + `F` key, spring-unfold, interruptible) | the device; folding and unfolding by hand | the hinge only |
| **2** | Act 1 apps, fully interactive: WhatsApp (chats, missed calls, Calls tab, incoming/outgoing/video call screens), Messages (Sarah), Instagram (Michael's DMs + Reels), Photos; the iOS keyboard; banners; the **Un-Said splash**; the dev panel and `?notify=` | 1–6 by hand | in-app only (keyboard, bubbles, typing dots) |
| **3** | iOS home screen across both displays + the navigation shell (open, close, switcher, swipe between apps) + **`UnsaidSlot`** with its polished placeholder + the interactive unfold (banner → unfold → splash → slot) | moving between every app; 7 by hand | shell springs |
| **4** | The **opening timeline engine** (`lib/opening/`), driven mode, beats B01–B26 performed on the real build, `/opening` with Replay and `?t=` seeking | 1–6, scripted and replayable | the scripted opening |
| **5** | Beat B27 (the Apple-style unfold) and B28 (splash → slot), polish to the frame checklist, the MP4 render and the screen-record backup | 7, scripted | the scripted opening |
| **6** | Facebook + Meta AI shells, Instagram/WhatsApp completeness, the end-to-end click-through, `docs/PLACEHOLDERS.md`, the final report: **ready for animation work** | everything by hand and scripted | none new |

Only `/opening` (and its Remotion composition) auto-plays. Everything else moves only when touched, through the fold control, the dev panel or the opening timeline driving the build.

---

## Phase 0: retire, workspace, scaffold, theme sync, rules, reviewers

```text
PHASE 0: Retire the BF-v1 leftovers, set up the workspace, the app, the theme sync and the rules. Nothing visual yet beyond a token test page.

WORKSPACE RULE (non-negotiable; it outranks every other instruction)
1. BRANCH: all frontend work happens ONLY on the git branch `branched-frontend`. First command: git fetch origin && (git checkout branched-frontend || git checkout -b branched-frontend). If you created it, push it once with git push -u origin branched-frontend. Before EVERY commit run git branch --show-current and confirm `branched-frontend`. Never commit to, merge into, rebase onto or push to main or any other branch. Push only with: git push origin branched-frontend.
2. FOLDER: all work happens ONLY inside the top-level folder `Branched-Frontend/` (Gurneal said "Branched Frontend"; it is hyphenated so no path contains a space). The Next.js app lives INSIDE it. Everything stays in that folder: code, assets, screenshots, logs (Branched-Frontend/BUILD_LOG.md), reviewer agents (Branched-Frontend/.claude/agents/), reports, docs, scripts. Never create, edit, move or delete anything outside it. Never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app, the root README or the root .gitignore. You may READ App-UI-Final/ (the Un-Said theme source), backend/ and ideas/. Stage with `git add Branched-Frontend/` only (never `git add -A` / `git add .` from the root); before committing, `git diff --cached --name-only | grep -v '^Branched-Frontend/'` must print nothing.
3. OWNERSHIP: All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app. Never edit backend/, App-UI-Final/ or Mudit's app. The Un-Said app is NOT built here; it mounts later in components/UnsaidSlot.tsx.

CONTEXT
We're building the demo frontend for "Un-Said" (code name unsaid), a HackTX 2026 concept for the Meta track. THIS build is the phone and its apps: a white iPhone Duo (folded and unfolded), the iOS home screen and shell, notifications, fully working look-alikes of WhatsApp, Messages, Instagram and Photos, Facebook and Meta AI shells, a dev panel, a fold/unfold control, and a scripted, replayable opening storyboard. Un-Said itself appears only as its logo (home icon, notification icon, launch splash) and as a slot (components/UnsaidSlot.tsx) where Mudit's real app mounts later. It is a fully built, interactive WEB MOCK: mock data, look-alike apps, local state, no network. Read Branched-Frontend/CLAUDE_PROMPT.md in full (it is the spec for this build) and Branched-Frontend/CONTEXT.md. Read App-UI-Final/README.md, App-UI-Final/DESIGN_SPEC.md and App-UI-Final/COPY_AND_NAMES.md, and LOOK at App-UI-Final/assets/ui-reference/unsaid-ui-reference.png and Branched-Frontend/assets/brand/unsaid-app-icon.png. If App-UI-Final/ isn't at the repo root, read it from ~/Desktop/Unsaid-Claude-Context/App-UI-Final/. Branched-Frontend/reference/ holds Mudit's demo script: use it for story beats only, never for names, colors, fonts, icons or copy.

STEP 0: RETIRE THE BF-v1 LEFTOVERS (only if they exist; log every removal in BUILD_LOG.md under "BF-v2 retire")
- Delete any Un-Said screens built from the BF-v1 Phase 4 (components/unsaid/* except UnsaidSplash.tsx, app/unsaid/* routes other than the splash, Talk/Cards/Hold/Letters/You/Compose/Preview/Received/self-note/safety/faces), the LaunchPage bloom, SimplePhone and Mom's phone, lib/contract.ts, PlaceholderButton feature IDs, scripts/check-contract.ts, lib/mock/rant.ts, letters.ts and faces.ts, and the Un-Said requests in BACKEND_REQUESTS.md (keep the file with one line: "Retired in BF-v2: the Un-Said app is Mudit's and mounts in UnsaidSlot.").
- Delete Branched-Frontend/assets/ui-reference/, assets/palettes/tokens.json and assets/palettes/palette.md if they are still in your checkout (the Un-Said theme now comes from App-UI-Final/).
- Keep everything else that BF-v1 built (the Duo, Act 1 apps, the shell); later phases update it.

STEP 1: BRANCH AND FOLDER
- Run the branch command above. Confirm `git branch --show-current` prints branched-frontend.
- Branched-Frontend/ already exists (it holds CLAUDE_PROMPT.md, GOAL_STATEMENT.txt, CONTEXT.md, paste/, reference/, assets/). Keep every one of those files.
- If there is no package.json yet: create-next-app refuses a non-empty folder, so scaffold in a temp dir and copy in without overwriting:
    npx create-next-app@latest /tmp/bf-scaffold --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
    rm -rf /tmp/bf-scaffold/.git && cp -Rn /tmp/bf-scaffold/. Branched-Frontend/
    cd Branched-Frontend && npm install
  (cp -n never overwrites, so our README.md and docs stay; `rsync -a --ignore-existing --exclude .git` does the same where rsync exists.) Every npm/npx command from now on runs from inside Branched-Frontend/.
- Install: framer-motion (motion), sonner, zustand, clsx, @playwright/test (dev), tsx (dev). Run npx playwright install chromium. (Remotion comes in Phase 4.)
- Add Branched-Frontend/.gitignore entries: node_modules, .next, out/, screenshots/reference/ (comparison-only screenshots of real apps; never committed).

STEP 2: THEME SYNC AND TOKENS
- scripts/sync-theme.ts (npm run sync:theme; also run by predev and prebuild): find App-UI-Final/ at ../App-UI-Final (repo root) or ~/Desktop/Unsaid-Claude-Context/App-UI-Final; copy tokens/unsaid-tokens.json → lib/unsaid-theme.json, tokens/unsaid-tokens.css → app/unsaid-theme.css, assets/brand/* → public/unsaid-theme/brand/. Prepend "GENERATED from App-UI-Final by scripts/sync-theme.ts. Do not edit." where the format allows. Never write into App-UI-Final/. If App-UI-Final/ can't be found, keep the last synced copies and print a warning (the build must still pass).
- Copy Branched-Frontend/assets/brand/unsaid-app-icon.png → public/brand/unsaid-app-icon.png (the home and banner icon; the same art as App-UI-Final's icon). Record every copy in Branched-Frontend/assets/README.md ("where it lands").
- lib/tokens.ts: one source of truth. Un-Said tokens (un-*) come from lib/unsaid-theme.json. Look-alike palettes, look-alike gradients and device colors come from Branched-Frontend/assets/palettes/branched-tokens.json (sections 4.2-4.3). Phone and opening motion come from section 4.4 (lib/motion.ts). Export typed objects and CSS variables (app/tokens.css), and wire them into the Tailwind theme.
- No hard-coded hex or px in components: scripts/check-tokens.ts greps components/ and app/ for hex colors and raw px outside the token files and fails if it finds any.
- /test/tokens renders every un-* token from the synced theme on un-bg, and every look-alike palette on its own background. Screenshot it and compare it with App-UI-Final/tokens/unsaid-palette.png and Branched-Frontend/assets/palettes/branched-frontend-palette.png.

STEP 3: GLOBAL RULES (write them to Branched-Frontend/docs/RULES.md and follow them in every phase)
1. Mock only: no network requests leave localhost (the one exception: the UnsaidSlot iframe when a real Un-Said URL is set); all data lives in lib/mock/*.ts.
2. Story rules from CLAUDE_PROMPT.md section 1 (the hallway; no AI-written text; silence designed; keep "k."; web mock, not film; one timeline, one build; the slot is honest).
3. Every screen has ?state= for each designed state, and every state is listed in lib/scenes.ts (the /scenes index and the screenshot script read it).
3a. Mock messaging: each look-alike app keeps its own thread state in a zustand store (lib/store/*.ts), seeded from lib/mock/threads.ts; typing, deleting and sending work locally and are callable from code (the opening drives them); ?reset=1 restores the seed.
4. Placeholders: a control that would do something real outside this demo (search, settings, a feature of a shell app) is still a pressable control with the iOS press state, carries data-placeholder="<app>:<control>", and on tap shows a small sonner toast "concept only". No feature IDs, no NOT YET CONNECTED badges. Navigation taps carry data-nav. Nothing in the build is dead to the touch.
5. Concept label "concept mock · not affiliated with Apple or Meta" on every page (hidden by ?labels=off for clean shots).
6. Look-alikes only: never download or embed official logo files, app icons, screenshots or fonts from Apple or Meta. Icons are drawn in SVG/CSS from the look-alike gradients.
7. Ask before deviating from CLAUDE_PROMPT.md. Gurneal's reference and App-UI-Final beat every other source.
8. All user-facing copy comes from CLAUDE_PROMPT.md and App-UI-Final/COPY_AND_NAMES.md (Gurneal's). If a screen needs a string that isn't written there, mark it in BUILD_LOG.md as "COPY NEEDED" and use the closest written string; never invent names, and never take copy from reference/.
9. Stop at the end of each phase and wait for Gurneal.
10. Read backend/ and App-UI-Final/ (never edit them). Never build Un-Said screens: Un-Said is the icon, the banner, the splash and the slot.
11. Theme sync: at the start of each phase, run npm run sync:theme and note in BUILD_LOG.md whether App-UI-Final changed.
12. BUILD LOG, COMMIT, PUSH after EVERY change: append a timestamped entry to Branched-Frontend/BUILD_LOG.md (time in America/Chicago, what changed, files, why, screenshots taken), then: git branch --show-current (must be branched-frontend) && git add Branched-Frontend/ && git commit -m "branched-frontend: <summary>" && git pull --rebase origin branched-frontend && git push origin branched-frontend. Never force-push. Never stage anything outside Branched-Frontend/.
13. REVIEW: after each phase and every meaningful change, launch all 10 Haiku reviewer subagents (Branched-Frontend/.claude/agents/) in parallel. Log every finding in Branched-Frontend/REVIEW_FINDINGS.md (ID, reviewer, severity, file/route, issue, fix, status OPEN/FIXED/VERIFIED), fix it, re-run the affected reviewers, and repeat until all 10 report CLEAN in the same round. If the agents aren't loaded natively, run each as a general-purpose haiku subagent with its file body as the prompt.
14. PRODUCTION QUALITY BAR (CLAUDE_PROMPT.md section 5): it outranks speed.
15. Pixel-accurate iOS: follow Apple's HIG (status bar, Dynamic Island, safe areas, 44 pt targets, text styles, materials, banners, keyboard). Use the Apple skills you installed.
16. Motion: everything interactive moves only when touched (shell springs, keyboard, bubbles, typing dots, sheets, the fold control). The ONE scripted, auto-playing sequence is the opening at /opening (Phases 4-5); it drives the real build and never re-implements a screen. No other timed tours or auto-play.

STEP 4: PLACEHOLDER SYSTEM, DEV PANEL SKELETON, SCRIPTS
- components/Placeholder.tsx: wraps any control; sets data-placeholder, gives it the platform's press state, and fires the "concept only" toast (styled per host app, un-surface inside the slot placeholder). Prove the variants on /test/placeholder.
- scripts/check-placeholders.ts (npm run check:placeholders): crawls every route + state in lib/scenes.ts; fails on (a) any visible button/link with no data-nav, data-placeholder or real handler, (b) any data-feature-id attribute (must be zero), (c) any network request leaving localhost (the slot iframe excepted when a URL is set). Writes docs/PLACEHOLDERS.md (per app: every data-placeholder, plus the slot status).
- scripts/shoot.ts: Playwright Chromium, 1920x1080, deviceScaleFactor 1 (and 2 with --hi), waits for fonts and network idle, --clean adds ?labels=off&badges=off&dev=off; saves Branched-Frontend/screenshots/<route>__<state>.png. npm scripts: dev, build, lint, sync:theme, shoot, shoot:clean, check:placeholders, check:tokens.
- components/stage/Stage.tsx: a fixed 1920x1080 artboard scaled to fit the window, backgrounds black | un-stage | wallpaper | white.
- components/dev/DevPanel.tsx (toggle with the ` key or ?dev=1): a floating panel OUTSIDE the phone with: a screen/route jump list (from lib/scenes.ts), the story clock (?clock=HH:MM, frozen), "fire banner" buttons (Phase 2 fills them), "fire reply" buttons (Phase 6), fold/unfold, reset state, and toggles for labels and badges.

STEP 5: LOGS AND REVIEWERS
- Branched-Frontend/BUILD_LOG.md ("# Un-Said Branched-Frontend build log"; backfill Phase 0 steps, then append after every change).
- Branched-Frontend/REVIEW_FINDINGS.md (title + table header from rule 13).
- The 10 reviewer files: write them word for word from CLAUDE_PROMPT.md section 9 into Branched-Frontend/.claude/agents/ (replace any BF-v1 reviewer files).

ACCEPTANCE (Phase 0)
1. git branch --show-current prints branched-frontend; git log shows commits only on that branch; git diff main --name-only lists only paths under Branched-Frontend/.
2. npm run sync:theme, build, lint, check:tokens and check:placeholders pass from inside Branched-Frontend/. App-UI-Final/ is unchanged (git status shows nothing there).
3. /test/tokens and /test/placeholder screenshots exist and match the palette PNGs and token tables.
4. BUILD_LOG.md (with the "BF-v2 retire" entry), REVIEW_FINDINGS.md and docs/RULES.md exist inside Branched-Frontend/. No lib/contract.ts and no data-feature-id anywhere.
5. All 10 reviewers report CLEAN in the same round.
6. Final commit "branched-frontend: phase 0: retire v1, workspace, theme sync, tokens, rules, reviewers" pushed to origin branched-frontend only.

STOP AND LET ME REVIEW. Show me: git branch --show-current, git diff main --name-only (every path must start with Branched-Frontend/), the folder tree of Branched-Frontend/ (depth 2), what Step 0 removed, the screenshot paths, the BUILD_LOG entries and the REVIEW_FINDINGS summary. Remind me to restart Claude Code from inside Branched-Frontend/ (cd Branched-Frontend && claude --add-dir ..) so the 10 reviewers load natively (check with /agents). Do not start Phase 1 until I say go.
```

---

## Phase 1: the white iPhone Duo + the fold control

Paste this block into Claude Code (also in paste/Phase1_paste_into_Claude_Code.txt):

```text
PHASE 1: Build the white "iPhone Duo" device as a reusable React component (static states driven by openAngle), plus the FOLD CONTROL (an on-stage button and the F key that fold and unfold it with an Apple-quality spring). Context: we are building the demo frontend for "Un-Said" (HackTX 2026, Meta track); everything is mock; Next.js App Router + TypeScript + Tailwind inside Branched-Frontend/; a fixed 1920x1080 Stage artboard; all values below are artboard pixels.

WORKSPACE RULE (still in force): branch `branched-frontend` only; folder `Branched-Frontend/` only; everything stays in that folder; never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app or anything else (App-UI-Final/ is the read-only theme source); stage with git add Branched-Frontend/ and push only with git push origin branched-frontend; run git branch --show-current before every commit. All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app; it is NOT built here (it mounts in components/UnsaidSlot.tsx). Phase 0 global rules apply (docs/RULES.md), including rule 12 (BUILD_LOG + commit + push after every change), rule 13 (10 Haiku reviewers until CLEAN), rule 14 (PRODUCTION QUALITY BAR) and rule 16 (motion: interactive springs plus the one scripted opening).

WHAT THE iPHONE DUO IS
A fictional, dual-screen, book-style iPhone: two iPhone-proportioned panels joined by a 360-degree hinge (think two iPhones sharing a spine). It does not exist; it's a concept. FINISH: WHITE (white / light titanium-ceramic). White is the default everywhere in this project.
- FOLDED: the panels sit back to back. The RIGHT panel's display faces the viewer, so it reads as a normal white iPhone; the LEFT panel is hidden behind it, display facing away. The hinge wraps the folded device's left edge.
- UNFOLDED: the left panel has swung 180 degrees around the hinge and lies flat to the left. Two displays sit side by side with a white hinge between them.
- The unfold is a rotation of the LEFT panel around the hinge axis (the left panel's right edge): rotateY goes from -180deg (folded, behind) to 0deg (flat). Phase 1 builds STATIC SNAPSHOTS of that rotation plus the fold control that springs between them; the opening timeline (Phases 4-5) drives the same openAngle.
- Use the Apple/iOS skills you installed (apple-hig, apple-design-skill, heyimjames:interaction-primitives) to sanity-check the Dynamic Island, the corner concentricity, and the status-bar safe area. Translate everything to CSS. Do not use Apple's bezel images.

COMPONENT API
<IPhoneDuo
  state="folded" | "folded-off" | "folded-angled" | "unfold-30" | "unfold-60" | "unfold-90" | "unfold-120" | "unfold-150" | "unfolded" | "unfolded-off" | "back"
  openAngle?: number             // 0 = folded, 180 = flat; overrides state (used by the fold control and the opening timeline)
  scale?: number                 // default 1 (geometry below is at scale 1)
  x?: number; y?: number         // artboard center of the DEVICE GROUP, default 960, 540
  tilt?: { rotateX?: number; rotateY?: number }  // whole-device tilt, default 0
  screenOn?: boolean             // false = displays are pure #000 (default true unless state ends in -off)
  left?: ReactNode; right?: ReactNode   // display contents (each rendered in a 402x874 logical iOS viewport, scaled 0.95)
  spanning?: ReactNode           // optional content that spans both displays across the hinge (rendered above both, clipped to the two display shapes)
  shadow?: "auto" | "none"; reflection?: boolean (default false); specular?: number (0..1 position of the specular sweep; derived from openAngle unless set)
/>
Also export the geometry constants from components/device/geometry.ts so later phases (home screen, app-close target rects) can compute exact positions.

GEOMETRY (artboard px at scale 1, stage 1920x1080)
Logical iOS viewport per display: 402 x 874 pt (iPhone 16 Pro class), rendered at s = 0.95 -> display 382 x 830 px. All iOS content in Phases 2-6 is laid out in pt (CSS px) inside a 402x874 box and scaled by 0.95.
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
- Back glass: linear-gradient(180deg, #F7F7F4 0%, #EFEFEB 55%, #E6E6E1 100%), inner frame rim as above, gloss overlay linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 65%) with background-size 250% 100%; prop specular (0..1) maps background-position-x from -150% to 150% (derived from openAngle: 0.15 folded -> 0.85 flat; the static snapshots show it at 0.35).
- No Apple logo or any trademark on the back. Optional: a tiny engraved "Un-Said · concept" in #D2D1CC, 9 px, 0.2em tracking, centered 120 px from the bottom.
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
(The whole-device tilt peaks at -8deg around 90 degrees so the fold reads as 3D; the fold control and the opening interpolate between these with the same formulas.)
Rule: past 90 degrees the left panel shows its DISPLAY face; before 90 it shows its BACK face. Use backface-visibility so this happens automatically.

/device PAGE
- /device?state=<state>&bg=black|wallpaper|white&scale=1&reflection=1 renders the IPhoneDuo on the Stage.
- With screenOn, a test pattern for each display: left shows "LEFT 402x874pt", right shows "RIGHT" with a 1 px grid every 50 pt and the display outline, so the geometry can be checked in screenshots.
- A dev-only "spec overlay" (?debug=1) draws artboard-pixel rulers and the boxes of each part (panel, bezel, display, island, hinge, buttons) labeled with their coordinates.
- Add every state to lib/scenes.ts so /scenes and npm run shoot cover them.
- The bg=wallpaper option uses Stage background "wallpaper": a blurred Apple-style gradient (build it now, static): base #0B0B12, then radial blobs radial-gradient(40% 50% at 22% 30%, #677FEF, transparent), radial-gradient(45% 55% at 78% 25%, #A166B7, transparent), radial-gradient(50% 60% at 60% 80%, #8776DF, transparent), radial-gradient(40% 45% at 15% 85%, #607CF2, transparent) (the ios-wallpaper token), whole layer filter blur(80px) saturate(1.2), scaled 1.2 so the blur has no edges, plus a 4% noise overlay (SVG feTurbulence) to avoid banding. It should feel like an Apple keynote wallpaper, leaning blue -> violet like Gurneal's app icon.

UN-SAID LOGO (prep for later phases; logo only)
- components/unsaid/UnsaidLogo.tsx renders Gurneal's app icon /brand/unsaid-app-icon.png (copied in Phase 0 from Branched-Frontend/assets/brand/; the same art as App-UI-Final/assets/brand/, synced by scripts/sync-theme.ts; 1254x1254 and square, so apply the continuous squircle mask in CSS and never pre-round the file) at the requested size. If it fails to load, it renders the SVG fallback: the white rounded opening quote “ on un-icon-gradient. The old ChatGPT logo prompt and /unsaid-logo.png are retired.

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
12. npm run build, lint, shoot, check:tokens and check:placeholders pass.
13. All 10 reviewers report CLEAN in the same final round (rule 13); every finding is logged in REVIEW_FINDINGS.md and VERIFIED; BUILD_LOG.md is complete.
14. Would pass as a real Apple product shot: every device state at 2x, side by side with reference renders of a real iPhone (material, edges, specular light, shadow). Zero PRODUCTION QUALITY BAR tells (rule 14). The unfold snapshots and the fold control's motion are Apple-made quality: they're the frames of the opening's unfold.

FOLD CONTROL (the fold and unfold, by hand; interactive, never auto-plays)
- components/device/FoldControl.tsx: a small glass pill button OUTSIDE the device, centered below it on the Stage (artboard y 1012, 36 pt tall, iOS material: backdrop blur 20px, rgba(255,255,255,0.14) fill on dark stages / rgba(0,0,0,0.06) on light, 0.5 pt hairline, SF text 15 pt semibold), label "Unfold" when folded and "Fold" when unfolded, with a hinge glyph drawn in SVG. It is part of the demo stage, not the phone UI: shown by default, hidden with ?frame=bare (and in /opening, where the timeline owns the hinge). Press state: scale 0.97 + 15% darken in under 100 ms.
- Keyboard shortcut: F toggles fold/unfold anywhere on the stage (ignored while a text field has focus). Shift+F jumps instantly (no animation) for screenshots.
- Motion: openAngle is driven by a spring, spring-unfold {stiffness 120, damping 22, mass 1.3} (section 4.4), 0 -> 180 to unfold and the same spring reversed (180 -> 0) to fold. Every visual is a pure function of openAngle (left panel rotateY = openAngle - 180, group translateX = -215 * (1 - openAngle/180), tilt rotateY = -8deg * sin(pi * openAngle/180), rotateX = 3deg * sin(pi * openAngle/180), specular = openAngle/180 mapped 0.15 -> 0.85), so the opening timeline (Phase 4-5) can drive the same function frame by frame.
- Interruptible: pressing again (or F) mid-move reverses from the current angle and keeps the current velocity (no jump, no restart).
- The hinge "click": as openAngle crosses ~178 (or ~2 when folding), a one-shot ripple ring on the hinge (24 pt, rgba(255,255,255,0.25) -> 0 over 220 ms) where a haptic would fire, and the spring settles with a slight overshoot that reads as the detent. No sound in the build.
- While folding/unfolding, the displays keep their content: folded shows the cover display (right panel); unfolded, the shell decides the layout (Phase 3). Before Phase 3 the test patterns are fine.
- Reduced motion (prefers-reduced-motion or ?motion=reduced): a 200 ms crossfade between the folded and unfolded states.
- API: lib/device/fold.ts exports useFold() { angle, folded, fold(), unfold(), toggle(), setAngle(a) } and window.__unsaidDevice in dev/test builds, so the shell, the dev panel and the opening share one source of truth for openAngle.

ACCEPTANCE (additions for the fold control)
15. /device?state=folded&bg=wallpaper: the "Unfold" pill sits below the device; clicking it (and pressing F) unfolds with spring-unfold in about 2 s; the frames at 30/60/90/120/150 degrees match the static snapshots above; no flicker at 90 degrees; 60 fps (p95 frame time under 20 ms in a Playwright frameStats check, scripts/fold-check.ts).
16. Pressing again mid-unfold reverses smoothly from the current angle. Shift+F jumps. ?frame=bare hides the pill. Reduced motion crossfades.
17. Commit "branched-frontend: phase 1: white iPhone Duo, static states + fold control" and push per rule 12. All 10 reviewers report CLEAN in the same final round.

STOP AND LET ME REVIEW. Report: git branch --show-current, git diff main --name-only (only Branched-Frontend/ paths), the screenshot list, a short screen recording (or a frame strip) of the fold control unfolding and folding, every COPY NEEDED, the reviewer round results, and any value you changed and why. Send me the list of screenshots (folded-off, folded, folded-angled, unfold-60, unfold-90, unfold-120, unfolded, back, plus the debug overlays). Do not start Phase 2.
```

## Phase 2: Act 1 apps, banners, the Un-Said splash, the dev panel

Paste this block into Claude Code (also in paste/Phase2_paste_into_Claude_Code.txt):

```text
PHASE 2: Build Act 1's apps as WORKING MOCK APPS (local mock state, no backend) on the folded white iPhone Duo's cover display: Mom on WhatsApp (chats AND the calls side: Calls tab, missed calls, an incoming call, the voice/video call screen), Sarah ❤️🤍 on Messages (iMessage), Michael (Best Friend) on Instagram (DMs AND Reels), the Photos gallery he retreats to, the iOS keyboard, the iOS notification banners (fired from the dev panel and ?notify=), and Un-Said's launch splash (logo only). Everything is a pixel-accurate look-alike you can use by hand: open threads, type, send, see receipts, answer or decline a call, swipe reels, open a photo. Nothing plays on its own (the scripted opening comes in Phase 4 and drives these same apps). Every storyboard frame below also exists as an exact ?state=.
Rule 3a (mock messaging) applies. Every frame must pass as a real WhatsApp / iMessage / Instagram / Photos / iOS screenshot. Colors come only from the look-alike palettes in CLAUDE_PROMPT.md section 4.2 (lib/tokens.ts).

WORKSPACE RULE (still in force): branch `branched-frontend` only; folder `Branched-Frontend/` only; everything stays in that folder; never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app or anything else (App-UI-Final/ is the read-only theme source); stage with git add Branched-Frontend/ and push only with git push origin branched-frontend; run git branch --show-current before every commit. All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app; it is NOT built here (it mounts in components/UnsaidSlot.tsx). Phase 0 global rules apply (docs/RULES.md), including rule 12 (BUILD_LOG + commit + push after every change), rule 13 (10 Haiku reviewers until CLEAN), rule 14 (PRODUCTION QUALITY BAR) and rule 16 (motion: interactive springs plus the one scripted opening).



HONESTY
These are look-alikes we draw ourselves. Use no official logos, wordmarks, app icons, ringtones, notification sounds or bundled fonts (system stack only), and no real people's photos (illustrated avatars and photos only). Chrome text is paraphrased where needed. The "Seen" under Mom's last bubble is a story annotation: real WhatsApp doesn't show the reader a "Seen" on incoming messages, so it's listed in the honesty notes.

THE STORY BEAT
The cold open is "The last thing my kid ever texted me was 'k.'" Then we're on the SON's (Riley's) phone, folded. Mom's WhatsApp: her check-ins, missed calls, his "k", her "I love you beta", Seen. He starts to answer ("…love you too"), stalls, and deletes it. Sarah's banner drops in; he opens it and fires back "i just don't feel like talking rn". Michael's banner drops in; he answers "im good bro just tired". Then a banner from Un-Said. He taps it, and the Duo unfolds into the Un-Said splash, which hands off to the UnsaidSlot (Phase 3).

THE SCRIPTS (exact seed data and storyboard, in order)
NOW on the son's phone = Saturday, Oct 24, 2026, 9:41 PM (status bar "9:41" in every state). The son is Riley. The phone is the FOLDED white iPhone Duo: everything until the unfold is on its single cover display (the right panel's display). Date labels follow each app's own rules relative to NOW (Today, Yesterday, weekday names within the last 7 days, then dates). Each thread's default state shows exactly ONE screen of messages: what fits between the nav bar and the composer with the keyboard down. Earlier messages exist above it in a "history" state (scrolled up), so nothing written before is lost.

STATE 1 · MOM · WhatsApp look-alike · /scene/threads/mom
Header: back chevron + "3" · Mom's illustrated avatar (soft peach) · "Mom" · subtitle "online" (she is still there, waiting) · video + phone glyphs.
On screen (default "read", keyboard down; 11 rows + Seen):
[Wednesday]
  ☎ Missed voice call · 9:15 PM
  Mom     9:17 PM  call me when you can ❤️
  Mom     9:40 PM  haven't heard from you in a bit
[Yesterday]
  Mom     7:46 PM  did you eat?
  Mom     7:48 PM  can you call me this weekend? even 5 minutes
  Riley  11:36 PM  k                                         ✓✓ blue   <- the last thing he ever sent her
[Today]
  ☎ Missed voice call · 6:01 PM
  ☎ Missed voice call · 6:04 PM
  Mom     6:05 PM  just wanted to hear your voice
  Mom     9:02 PM  I love you beta                           <- final bubble
          Seen                                               <- small gray "Seen" under her last bubble (story annotation; see RECEIPTS)
Above it ("history" state, scrolled up): the encryption pill "🔒 messages and calls are end-to-end encrypted.", then
[Sat, Oct 10] Mom 11:04 AM "hi beta, how's it going? 😊" · Mom 11:05 AM "how did the chem exam go?" · Riley 10:51 PM "yeah im good" ✓✓
[Mon, Oct 12] ☎ Missed voice call · 7:30 PM · Mom 7:34 PM "tried calling. no emergency" · Mom 7:34 PM "did you eat?"
[Wed, Oct 14] Mom 6:12 PM "your dad asked about you today" · Mom 6:13 PM "he won't say it but he misses you" · Mom 6:15 PM "is everything okay?" · Riley 11:58 PM "everything's good" ✓✓
[Fri, Oct 16] ☎ Missed voice call · 8:02 PM · ☎ Missed voice call · 8:09 PM · Mom 8:11 PM "just wanted to hear your voice" · Mom 8:12 PM "I know you're busy. no pressure ❤️"
[Sunday] Mom 1:20 PM "made your favorite dal today. wish you were here" · Mom 1:20 PM [illustrated photo: a steel pot of dal on the stove] · Mom 1:22 PM "I put some in the freezer for when you come home"
STORYBOARD ACTION (Phase 4 drives this; it must also be possible by hand in your build; he answers her, then can't):
- He taps the field; the keyboard rises (the thread shifts up: "k", Today, both missed calls, "no emergency…", "I love you beta" and Seen stay visible).
- We cut in mid-word, so we only see the last letters land: the field already reads "love you t", then "love you to", then "love you too". The send button (green circle, white arrow) has replaced the mic.
- Stall: the caret blinks. Nothing happens.
- He deletes it: backspace, letter by letter, then faster (iOS hold-to-delete), back to an empty field. The mic glyph returns.
- Nothing is sent. "k" stays the last thing he ever texted her.
Predictive bar while typing: "too" · "to" · "you".

STATE 2 · SARAH (girlfriend) · iOS notification banner, then iOS Messages (iMessage) look-alike · /scene/threads/sarah
Contact name everywhere: "Sarah ❤️🤍" (iMessage header and notification title).
Banner (drops in over Mom's thread, keyboard still up, composer empty): Messages look-alike icon · title "Sarah ❤️🤍" · body "please just say something" · "now".
Tap -> her thread. Header: back chevron + blue unread pill "8" · avatar (illustrated Sarah) · "Sarah ❤️🤍 >" · FaceTime glyph. Composer placeholder "iMessage".
On screen (default "read", keyboard down):
[Sunday 12:47 AM]
  Sarah  I keep thinking about the night the bus never came and it started pouring and you gave me your hoodie and we split that gas station honey bun on the curb. you used to text me goodnight every single night. I'm not mad. I just miss you so much it scares me.
  Sarah  I don't know what I did
[Wednesday 8:15 PM]
  Sarah  we haven't really hung out in almost three weeks
[Yesterday 1:12 AM]
  Sarah  I really miss you
[Today 9:41 PM]
  Sarah  please just say something
Above it ("history"): [Sat, Oct 10 at 12:31 PM] "still on for barton springs today?" · "I packed the good snacks 🙂" · [Sat, Oct 10 at 3:47 PM] "ok I guess not" · "are you okay?" · [Tue, Oct 13 at 10:58 PM] "goodnight 🤍" · [Thu, Oct 15 at 11:20 PM] "I miss your voice. can we facetime tomorrow?"
STORYBOARD ACTION (Phase 4 drives this; it must also be possible by hand in your build; he answers fast, and it's the wrong answer):
- He taps the field; the keyboard rises.
- He types the whole reply quickly, with no hesitation: "i just don't feel like talking rn" (33 characters).
- The send arrow (blue circle, white up-arrow) is active; he hits send.
- Sent: a blue bubble "i just don't feel like talking rn" with "Delivered" under it, then "Read 9:41 PM".
- Her typing dots appear under it, then vanish. She doesn't answer.
Predictive bar while typing: "rn" · "right" · "now".

STATE 3 · MICHAEL (Best Friend) · iOS notification banner, then Instagram DM look-alike · /scene/threads/michael
Banner (drops in over Sarah's thread, after her dots vanish): Instagram look-alike icon · title "Michael (Best Friend)" · body "hey bro I miss you, haven't talked in a while… is everything ok?" (two lines) · "now".
Tap -> the DM. Header: back chevron · 32 pt avatar · "Michael (Best Friend)" (an Instagram chat nickname) · "Active now" · phone + video glyphs. The handle michael.ortiz (placeholder) shows only on the profile peek.
On screen (default "read", keyboard down):
  (top edge, clipped by the nav bar: the lower half of Michael's Sep 30 reel card, @goldenhour.pups, a golden retriever cannonballing into a pool)
  Michael  bro??
[Sun 7:26 PM]
  Michael  [reel card: @rec.league.legends · a half-court buzzer beater]
  Michael  you alive lol
[Today 9:41 PM]
  Michael  hey bro I miss you, haven't talked in a while… is everything ok?
Above it ("history"): [Sep 19, 11:12 PM] reel @dormlife.tx ("when your roommate says 'one episode' at 1am") · Michael "this is so us lmao" · Riley "LMAOOO" · Riley "literally last night" · Seen · [Sep 30, 4:40 PM] the goldenhour.pups reel · [Oct 9, 1:07 AM] shared illustrated photo (two friends on a car hood, sunrise, empty highway) · "one year ago today. the night we ran out of gas on 290 and just watched the sunrise 🌅" · "we need to do that again"
STORYBOARD ACTION (Phase 4 drives this; it must also be possible by hand in your build; the lie that's also the truth):
- He taps the field; the keyboard rises.
- He types "im good bro", pauses, then types "just tired": "im good bro just tired" (22 characters).
- He hits send. His purple-blue gradient bubble appears: "im good bro just tired". No "Seen" yet.
- (Changed Oct 24: this replaces the earlier unsent "I'm tired, a". He now sends a short reply.)
Predictive bar while typing: "tired" · "tbh" · "bro".

STATE 4 · UNSAID · iOS notification banner (Meta-styled) · /scene/threads/michael?banner=unsaid and /scene/launch
Banner (drops in over Michael's thread, a beat after his reply): the Un-Said app icon (Gurneal's icon, public/brand/unsaid-app-icon.png via UnsaidLogo, masked to the banner's icon squircle; the same icon as on the home screen; the first blue-violet on screen) · app name / title "Un-Said" · body (default; options in the notes): "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?" · "now".
Tap -> the Duo unfolds into book mode and shows the Un-Said splash (STATE 5), which hands off to the UnsaidSlot in Phase 3.

STATE 5 · UN-SAID SPLASH (logo only) · /scene/launch
Once unfolded, the phone shows Un-Said's launch splash, then hands off to the UnsaidSlot (Phase 3). Un-Said's screens are NOT built here: the splash is the only Un-Said page in this build.
- components/unsaid/UnsaidSplash.tsx: full bleed across both displays (continuous across the hinge; folded, the cover display only), background un-card-gradient from the synced theme (lib/unsaid-theme.json; Gurneal can switch it to un-bg with one prop, see CLAUDE_PROMPT.md section 3 row 7). The app icon (UnsaidLogo, 120 pt, continuous squircle mask 22.37%, un-shadow-hero from the theme) sits centered on the LEFT display when unfolded (centered on the cover display when folded). "Un-Said" in the theme's wordmark style (white, per App-UI-Final/assets/wordmark.md) sits 20 pt below it. Nothing else: no tagline, no spinner, no buttons.
- States: icon (the icon alone, wordmark at 0%), ready (default: icon + wordmark). Props: gradient (default "un-card-gradient"), onDone.
- Interactive: when the splash is reached by tapping the Un-Said banner, it holds for 900 ms, then crossfades (200 ms, ease-soft) into the UnsaidSlot. Before Phase 3 exists, it simply stays on state=ready.
- UnsaidLogo comes from Phase 1 (public/brand/unsaid-app-icon.png). The wordmark text and its rules come from App-UI-Final (COPY_AND_NAMES.md and assets/wordmark.md); never restyle them.

STATE 6 · PHOTOS (working app; optional, not in the opening) · /scene/photos
Photos is a fully working app but is NOT part of the scripted opening (CLAUDE_PROMPT.md section 3, row 5). It stays reachable by hand, and as an optional dev state (?scene=photos in the opening, ?notify=unsaid&photo=kitchen here): him and Mom in the kitchen at home, with the Un-Said banner landing on that photo.
- Photos look-alike (iOS 18-style library): a "Library" grid, 3 columns with 2 pt gaps, newest at the bottom; the top bar ("Library", "Select", the search glyph) and the bottom segmented control ("Years · Months · All").
- Seed (lib/mock/photos.ts, illustrated, never stock or real people): the Oct 9 sunrise car-hood photo (from Michael's thread), Mom's dal photo (from Mom's Sunday message), a lake shot ("lake trip, june"), campus, a dorm desk, a few screenshots, and the kitchen photo: Riley and Mom at the stove, warm light, her arm around his shoulder (state=kitchen opens it full screen with the date "November 12, 2023" and the iOS photo-viewer chrome: back, "Edit", share, heart, info, trash).
- States: grid (default), grid-scrolled, kitchen (full screen), kitchen-zoomed (pinch frame, 1.4x), kitchen+banner (the Un-Said banner over it: ?notify=unsaid&photo=kitchen).
- Interactive: tap a thumbnail to open it (iOS zoom-from-thumbnail spring), pinch or double-tap to zoom, swipe to the next photo, swipe down to dismiss. Heart/share/edit/trash are placeholders (rule 4: data-placeholder="photos:<control>", toast "concept only").
- COPY NEEDED (log it): the kitchen photo's date label is Gurneal's to confirm; default "November 12, 2023".

WHATSAPP CALLS (new; Mom calls a lot, so the calls side must exist and be usable)
- Calls tab (WhatsApp look-alike tab bar: Updates · Calls · Communities · Chats · Settings): "Recent" list. Mom's rows (newest first): today 6:04 PM missed voice (red #F15C6D, missed-arrow glyph), today 6:01 PM missed voice, Wednesday 9:15 PM missed voice, Oct 16 8:09 PM and 8:02 PM missed voice (one row, shown "(2)"), Oct 12 7:30 PM missed. These match the missed-call rows in THE SCRIPTS exactly. Each row: avatar, name (missed rows in red), the call-type glyph + date/time in wa-meta, and a trailing info "ⓘ". Top: "Favorites" strip with Mom.
- Missed-call rows in the chat: Mom's thread already shows "Missed voice call" system bubbles (THE SCRIPTS below). Tapping one opens a sheet: "Voice call" / "Video call" / "Cancel".
- INCOMING CALL (state=incoming, route /scene/whatsapp/call?state=incoming&from=mom): the full-screen WhatsApp look-alike incoming call on the cover display: blurred Mom avatar backdrop (wa-call-bg #0B141A), "Mom", "WhatsApp voice call", the "end-to-end encrypted" line, and the iOS-style controls: decline (red) and accept (green) with "Remind me" and "Message" above them. Interactive: accept → in-call; decline → back to the chat with a new "Missed voice call" row at the current mock time; "Message" opens WhatsApp's quick replies sheet ("Can't talk now. What's up?" · "I'll call you right back." · "I'll call you later." · "Can't talk now. Call me later?" · "Custom message…"); choosing one sends it in Mom's thread from Riley. Fire it from the dev panel ("incoming call · Mom") or ?notify=call-mom. On a locked or other-app screen it appears as the iOS call banner (compact, at the top) with the same accept/decline.
- IN-CALL / VIDEO CALL (route /scene/whatsapp/call?state=voice|video&with=mom): voice = avatar, name, timer "0:12" (tabular figures), controls (speaker, video, mute, end) in a wa-call-surface well; video = remote video full screen (an illustrated still of Mom in her kitchen; Dad leaning in behind her in state=video-dad), self-view tile top-right (Riley, draggable to the 4 corners with a spring), the same controls bar, and "end-to-end encrypted" at top. On the unfolded Duo the video call spans both displays (remote on the left, self-view + controls on the right). End → "Call ended" for 1.2 s, then back to the chat with a "Video call 4:12" row (state=after-call). The call buttons in the chat header (video, voice) open these screens; starting a call from Riley's side is a placeholder (data-placeholder="whatsapp:call-start", toast "concept only").
- All call audio is silent; no ringtones or WhatsApp sounds (honesty).

INSTAGRAM REELS (new; Michael sends reels that pile up)
- Every reel bubble in Michael's thread (the @goldenhour.pups and @rec.league.legends reels, and @dormlife.tx in history) is a tappable reel card: 9:16 thumbnail (illustrated), the account handle, a reel glyph. Tapping opens the Reels viewer (route /scene/instagram/reels?id=<id>): black background, the illustrated still with a subtle Ken-Burns pan (it is a still, not a video), the handle + "Follow", caption (one line, "more"), audio line, and the right rail (heart, comment, share, more) with counts. Swipe up/down for the next/previous reel; tap to "pause" (a pause glyph); the back chevron returns to the DM. Heart toggles locally; comment/share are placeholders (data-placeholder="instagram:<control>", toast "concept only").
- Each reel card in the thread shows its age under it in ig-muted (relative to NOW: "Sun", "Wed", "Today"), so the pile reads as unanswered.
- SEND A REEL BACK: in the Reels viewer, the share (paper-plane) button opens Instagram's share sheet look-alike (search, a row of recent people with Michael first, "Write a message…", "Send"). Choosing Michael and Send adds the reel as an outgoing reel card in his DM with "Sent" (Instagram receipts). This one works locally (it's messaging); nothing else in the sheet does.
- Instagram's main tabs (Home, Search, Reels, Profile) exist as look-alike shells in Phase 6; in Phase 2 only the DM inbox, Michael's thread and the Reels viewer must be complete.

DEV PANEL + ?notify= (fire everything by hand)
- The Phase 0 dev panel (` key or ?dev=1) gets a "Notifications" section: Sarah ("please just say something"), Michael ("hey bro I miss you, haven't talked in a while… is everything ok?"), Un-Said (the knock), Mom's incoming call, and (Phase 6) Sarah's and Michael's replies. Each fires the real iOS banner (or call screen) on whatever screen is showing and appends the incoming message to the right store.
- URL equivalents on any route: ?notify=sarah | michael | unsaid | call-mom, optional &at=<ms> delay so a screenshot can catch the banner mid-drop (static frames: &banner=in|resting|out). Banners stack like iOS (newest on top, max 3 visible, then "+N more").
- Tapping a banner opens that thread in its app (through the Phase 3 shell once it exists); swiping it up dismisses it; pulling it down expands it with the iOS quick-reply field (sending from there writes into the thread).

RECEIPTS AND "SEEN"
- Receipts stay true to each app on the reader's side: his blue WhatsApp ticks on "k"; iMessage "Delivered" then "Read 9:41 PM" under his reply; Instagram shows nothing under his new reply yet; "Seen" under his own Sep 19 replies (history).
- Gurneal wants Mom's "Seen" visible: a small gray "Seen" (12 pt, #8696A0, regular, left-aligned with her bubble, 4 pt under it), on by default in the Mom thread. It means he looked and never answered. Hide it with &seen=off. One-line honesty note: "WhatsApp doesn't show 'Seen' on incoming messages; we added it for the story."

CHROME SPECS (light mode; every glyph is inline SVG; no real assets)
- Shared iOS status bar (54 pt, Dynamic Island safe area): "9:41" in the system font, semibold 17 pt; 4 cellular bars, 3 Wi-Fi arcs, a 72% battery glyph; black. Home indicator: 134x5 pt, radius 2.5, black, 8 pt from the bottom.
- iOS keyboard look-alike (shared by all three threads): light, QWERTY, the system font, 291 pt tall at 402 wide (the predictive bar included), key radius 5, key shadow 0 1 0 rgba(0,0,0,0.3). The predictive bar shows each script's three words. The shift/return/space states are correct for the typed text. Drawn, not interactive. Caret: a 2 pt bar in the app's tint (WhatsApp-style green #00A884, iMessage #007AFF, Instagram #3B5BFE) that blinks 500 ms on / 500 ms off; ?caret=static keeps it visible for screenshots.
- iOS notification banner look-alike (shared): 8 pt from the sides, 6 pt under the Dynamic Island area; radius 24 (continuous corners); the iOS light notification material (rgba(250,250,250,0.78) with a 30 px backdrop blur and saturate 180%); padding 14x14; a 38 pt app icon (22.37% squircle) at left; title 15 pt semibold (one line, truncated); body 15 pt regular (at most 2 lines); "now" 13 pt secondary at the top right; a 0.5 pt hairline edge and the soft iOS banner shadow. States: in (resting), pressed (0.97 scale, 8% darker), off (hidden). Same component for all three banners; only the icon and copy change.
- WhatsApp look-alike (Mom):
  - Wallpaper: the classic beige #EFE7DE with a faint doodle pattern we draw ourselves (our own line icons at 6% opacity).
  - Nav bar: white rgba(255,255,255,0.96), 0.5 pt hairline. Back chevron + count in #007AFF. Avatar 36 pt. Name 17 pt semibold; subtitle 12 pt secondary.
  - Date pills: centered, rgba(255,255,255,0.92), 12.5 pt medium #54656F, radius 8, a soft 1 pt shadow.
  - Bubbles: incoming #FFFFFF, outgoing #D9FDD3, 16.5 pt text, radius 8, a small tail on the first bubble of each run; the time inside at bottom-right (11 pt #667781); outgoing bubbles carry the blue double tick #53BDEB.
  - Missed-call rows: an incoming-side compact bubble with a red #EA0038 phone-down glyph in a soft red circle, "Missed voice call" (15 pt semibold), "Tap to call back" (13 pt secondary), time at right. Two in a row = two stacked bubbles.
  - Composer: "+" · a capsule field · sticker and camera glyphs · mic (empty) or a green circle send button with a white arrow (text present).
- iOS Messages look-alike (Sarah):
  - Translucent white nav bar with a hairline; back chevron with a blue #007AFF unread pill "8"; 54 pt avatar with "Sarah ❤️🤍 >" (12 pt) under it; FaceTime glyph.
  - Timestamps centered, 11 pt semibold secondary, iOS formats ("Sunday 12:47 AM", "Yesterday 1:12 AM", "Today 9:41 PM").
  - Bubbles: incoming #E9E9EB with black text, outgoing #007AFF with white text, 17 pt, line-height 22, padding 7x12, radius 18, a tail (SVG path) on the last bubble of each run, max width 72%, 2 pt gap within a run and 8 pt between runs.
  - Receipts right-aligned under his last bubble (11 pt secondary): "Delivered", then "Read 9:41 PM".
  - Typing indicator: a gray bubble with three dots (static, mid-pulse).
  - Composer: "+" circle · capsule field with placeholder "iMessage" and a mic glyph; with text, the mic becomes a blue circle with a white up-arrow.
- Instagram DM look-alike (Michael):
  - White background. Nav: back chevron, 32 pt avatar, name 16 pt semibold, "Active now" 12 pt secondary, phone + video glyphs.
  - Timestamps centered, 12 pt secondary ("Sun 7:26 PM", "Today 9:41 PM").
  - Incoming: #EFEFEF bubbles, black text, radius 22 (stacked bubbles get 4 pt inner corners), a 28 pt avatar beside the last bubble of each run. Outgoing: our own purple-to-blue gradient (#7B2FF7 -> #3B5BFE, approximating the in-app bubble, not a logo) with white text.
  - Reel cards: 160x284 pt, radius 14, an illustrated thumbnail (our own art), the poster's avatar and handle on top, a small reel glyph, a one-line caption under it.
  - Composer: a blue camera circle · capsule field "Message…" · mic/photo/sticker glyphs; with text, a "Send" label in #3B5BFE replaces the glyphs.
- App icons in the banners: the same look-alike icons the Phase 3 home screen uses (build them here in components/ios/AppIcon if Phase 3 hasn't): Messages, Instagram, Un-Said.

INTERACTIVE MESSAGING (these are working mock apps, not static shells; local mock state only, no backend, no network)
- State: one in-memory messaging store (React context + useReducer in lib/mock/messaging.tsx; no new dependency). It is seeded from lib/mock/threads.ts and holds every thread, its messages, receipts and composer drafts. It survives in-app navigation and the Phase 3 shell, and resets on reload. ?state= seeds the store to that exact frame, and the screen stays interactive from there.
- Mock clock: starts at NOW (Sat, Oct 24, 2026, 9:41 PM) and advances in real time. The status bar and every new timestamp read it. ?clock=frozen pins it at 9:41 for screenshots.
- Composer: tap the field to focus it. The iOS keyboard look-alike rises with the iOS spring (about 250 ms; the thread shifts up, keeping the last message in view). Typing works BOTH ways: tap the drawn keys (each press shows the iOS key-pop callout, shift auto-capitalizes and then releases, 123 / emoji keys swap the layout, the delete key repeats and accelerates when held, the return key inserts a line break in Messages/IG and a send-less newline in WhatsApp) AND type on the computer's physical keyboard. The caret blinks in the app's tint. The predictive bar suggests 3 words from a small local word list (seeded with the storyboard words); tapping one inserts it plus a space. The send control appears as soon as there's text, exactly like each app; the mic/glyphs return when the field is empty. Tap outside the field, or swipe down on the thread, to dismiss the keyboard.
- Send: the message appends as the app's outgoing bubble with the real send motion (bubble springs up from the composer, the field clears, the list scrolls to bottom; transform/opacity only), stamped with the mock clock, grouped and tailed with the run, with a new date separator if needed. Receipts follow each app:
  - WhatsApp: one gray tick -> two gray ticks (300 ms) -> blue ticks when the contact is "online" (Mom: after 1.2 s).
  - iMessage: "Delivered" -> "Read <time>" after 1.5 s (Sarah has read receipts on). After your send in Sarah's thread her typing dots appear 1 s after "Read", stay about 2.5 s, then vanish with no reply (the storyboard beat; per-thread flag typingAfterRead in lib/mock/threads.ts, default on for Sarah only).
  - Instagram: no receipt -> "Seen" after 2 s only when the contact is "Active now" and ?replies=on; otherwise nothing (matches the storyboard).
  - No contact ever auto-replies by default (the story is that nobody gets an answer they need). ?replies=on enables a canned reply from lib/mock for testing only.
- Thread lists: every app's chat/DM list opens any thread; unread badges clear when a thread is opened; a sent message updates the list preview and time.
- Long-press a bubble: the iOS context menu look-alike (Reply / Copy / React) appears as a placeholder sheet (navigation-like, no badge). Attachments, calls, camera, voice notes and stickers stay placeholders (rule 4, toast "concept only").
- NOTIFICATION BANNERS, triggerable by hand so the animation can be recorded later:
  - A hidden dev panel "Notifications" inside the Phase 0 dev panel (also the N key, or ?dev=on; hidden by default and in recordings): buttons "Sarah ❤️🤍", "Michael (Best Friend)", "Un-Said", and "custom" (pick an app, title and body). Each one fires the banner on the current display.
  - URL trigger: ?notify=sarah|michael|unsaid fires that banner once, after &notify-delay=<ms> (default 600) from load.
  - Code trigger: notify({ app, threadId, title, body }) from lib/notify.ts (Phase 3 forwards it to shell.notify).
  - Firing a banner also appends its message to that thread in the store (as an incoming bubble with the clock time) and bumps that list's unread badge, like a real push.
  - Tapping a banner opens the RIGHT thread (Sarah -> Messages/Sarah, Michael -> Instagram/Michael, Un-Said -> the Un-Said splash). In Phase 2 that's a route change with a crossfade; Phase 3 replaces it with the iOS open-from-banner transition and, for Un-Said, the unfold, the splash and the slot. Swipe up dismisses a banner; it auto-dismisses after 5 s.
- What stays out: nothing types, sends or fires on its own. The storyboard's timed actions (auto-typing, the delete, the banner timing, the unfold timing) belong to the Phase 4-5 opening timeline, which drives THIS interactive build through the store actions, notify() and the shell. Make sure each storyboard action can be done by hand and that each resulting frame also exists as a ?state=.

ROUTES AND STATES (register all in lib/scenes.ts; every route takes &device=folded (default) and &caret=static)
- /scene/threads/mom?state=
  - read (default): the one-screen view above, keyboard down, Seen visible.
  - history: scrolled to the top of the two weeks (encryption pill, Sat, Oct 10).
  - compose&typed=N: keyboard up, the field holds the first N characters of "love you too" (N = 0..12; the storyboard frames are 10, 11, 12, then back down to 0). typed=0 shows the empty field with the mic.
  - off: black display (the folded Duo asleep).
- /scene/threads/sarah?state=
  - read (default): keyboard down, ending on "please just say something".
  - history
  - compose&typed=N: keyboard up, the first N characters of "i just don't feel like talking rn" (N = 0..33), send arrow active from N = 1.
  - sent: keyboard up, his blue bubble + "Delivered".
  - read-receipt: the same with "Read 9:41 PM".
  - typing: read-receipt + her typing dots.
- /scene/threads/michael?state=
  - read (default): keyboard down, ending on "hey bro I miss you, haven't talked in a while… is everything ok?".
  - history
  - compose&typed=N: keyboard up, the first N characters of "im good bro just tired" (N = 0..22).
  - sent: keyboard up, his gradient bubble "im good bro just tired", no Seen.
- Banner overlay on any thread route: &banner=sarah|michael|unsaid&banner-state=in|pressed (default in). Storyboard frames: Mom compose&typed=0 + banner=sarah; Sarah typing (dots gone: state=read-receipt) + banner=michael; Michael sent + banner=unsaid.
- &seen=off hides Mom's Seen annotation.
- /scene/launch?state= (the unfold and launch; reuses the Phase 1 IPhoneDuo openAngle snapshots)
  - tap: folded; Michael's thread (sent) with the Un-Said banner pressed.
  - unfold-start: folded; the banner has expanded into a full-display app card (iOS notification-open: the banner's rect grows to the display, radius 24 -> 52 px, un-card-gradient fills it, Gurneal's app icon fades in at center).
  - unfold-mid: openAngle 90 (Phase 1's unfold-90 snapshot); the right display shows the Un-Said card; the left panel is edge-on.
  - unfold-end: openAngle 180, book mode; the splash gradient spans both displays, the icon at 0% opacity.
  - ready (default): the splash, Gurneal's icon + "Un-Said" wordmark on un-card-gradient (STATE 5).
  - icon: the icon alone (wordmark at 0%).
  - slot: the UnsaidSlot (Phase 3; until then this state shows the splash).
- /scene/threads/whatsapp-chats: the WhatsApp chat list (interactive: opens any chat) (Mom at the top with 3 unread, "I love you beta", 9:02 PM; then Fam, Roommates, Marfa Trip), for any shot that needs it.

COMPONENTS (reusable in Phases 3-6)
- components/lookalike/whatsapp/{WhatsAppThread,MissedCallRow,DatePill,Composer,ChatList}.tsx
- components/lookalike/imessage/{MessagesThread,Bubble,TypingDots,Composer}.tsx
- components/lookalike/instagram/{DMThread,ReelCard,Composer}.tsx
- components/ios/{StatusBar,Keyboard,HomeIndicator,NotificationBanner,AppIcon}.tsx
- components/unsaid/UnsaidSplash.tsx (states icon | ready; Gurneal's icon from public/brand/, the theme from lib/unsaid-theme.json)
- lib/mock/messaging.tsx (the local messaging store and reducer: send, receipts, unread, drafts), lib/notify.ts (notify() + the dev-panel wiring), components/dev/NotificationsPanel.tsx (hidden; N key or ?dev=on).
- All copy, times and seed strings live in lib/mock/threads.ts. Nothing is hard-coded in the components.

ACCEPTANCE CRITERIA (Phase 2)
- Would pass as a real Meta/Apple screenshot: every new state, at 2x, side by side with a reference screenshot of the real app or device. A designer couldn't tell at a glance which is the mock (apart from the look-alike icons). Zero PRODUCTION QUALITY BAR tells (rule 14); meta-style-slop-reviewer reports CLEAN.
- Each default state reads instantly as the real app on an iPhone: status bar, nav bar, bubble colors/shapes/tails, receipts, date/timestamp formats, composer, keyboard and banners.
- The copy matches THE SCRIPTS word for word, emoji included, and each default state fits on ONE screen with nothing clipped except the deliberately clipped reel at the top of Michael's thread. The weekday/date labels are right relative to NOW.
- The emotional end points are unmistakable: "I love you beta" + Seen, and "love you too" typed and then deleted (Mom); "i just don't feel like talking rn" + Read 9:41 PM (Sarah); "im good bro just tired" sent (Michael); the Un-Said banner copy; the splash.
- The system font throughout. No Caveat anywhere. No official logos or assets (Gurneal's Un-Said icon is our own art).
- Interactive, checked by hand and by a Playwright test (scripts/messaging-check.ts): in each thread, focus the composer, type with the drawn keys AND the physical keyboard, use delete (hold to repeat) and a predictive word, send; the bubble appears with the right grouping, tail, mock-clock timestamp and receipt sequence for that app; the chat list preview and unread badges update. Firing each banner (dev panel and ?notify=) appends the incoming message and tapping it opens the right thread; the Un-Said banner opens /scene/launch (the splash). Nothing fires or types by itself. Placeholders (attachments, camera, voice notes, starting a call from Riley's side) still toast; the incoming call, Reels viewer, reel send-back and Photos viewer work by hand. Build each thread as a reusable component so Phase 3 can register it as the app's screen. check:placeholders passes (zero data-feature-id).
- Screenshots of every route and state at 1920x1080 and 2x (caret=static). You checked each one side by side with the references. Commit "branched-frontend: phase 2: Act 1 apps (WhatsApp + calls, Messages, Instagram DMs + Reels, Photos), banners, Un-Said splash, dev panel" and push per rule 12.
- All 10 reviewers report CLEAN in the same final round (rule 13); every finding is logged in REVIEW_FINDINGS.md and VERIFIED; BUILD_LOG.md is complete.

COPY RULES (for the seed data and anything you add): he writes lowercase with no punctuation and no emoji ("im", "rn", "k"). Mom's emoji are sparse (😊 ❤️). Sarah's paragraphs are one long bubble each, never split. No melodrama: no "I'm worried sick", no crying emoji, no ALL CAPS (except Riley's own "LMAOOO" from September, in history). It reads as burnout and loneliness; don't imply self-harm. The Un-Said banner is gentle, never clinical (no "we detected", no "risk").
(The opening's timing, holds and camera are in Phase 4's beat table. Don't build any timing here; just make sure every state it needs exists.)
- New in this build: the WhatsApp Calls tab shows Mom's missed calls exactly as listed; the incoming call (dev panel and ?notify=call-mom) can be accepted, declined and answered with a quick reply; the voice and video call screens (including state=video-dad and the spanning unfolded layout) match WhatsApp's call UI; every reel in Michael's thread opens the Reels viewer and one can be sent back to Michael; Photos opens, zooms and swipes, and /scene/photos?state=kitchen&notify=unsaid shows the optional banner over the kitchen photo. Each has a Playwright check in scripts/messaging-check.ts.
- Keep Mom's "k" history (his "k" from yesterday, ✓✓ blue) exactly as THE SCRIPTS show it.

STOP AND LET ME REVIEW. Report: git branch --show-current, git diff main --name-only (only Branched-Frontend/ paths), the screenshot list, every COPY NEEDED, the reviewer round results, and any value you changed and why.  Do not start Phase 3.
```

## Phase 3: home screen, navigation shell, UnsaidSlot, interactive unfold

Paste this block into Claude Code (also in paste/Phase3_paste_into_Claude_Code.txt):

```text
PHASE 3: Build (A) the iOS home screen on the UNFOLDED white iPhone Duo, spanning both panels, with exact ?state= frames, and (B) the interactive iOS NAVIGATION SHELL (open from an icon, close to the icon, the app switcher, swipe between apps, banners, the unfold) that every app plugs into: WhatsApp (chats + calls), Messages, Instagram (DMs + Reels) and Photos now; Facebook and Meta AI in Phase 6. Plus (C) components/UnsaidSlot.tsx, where Mudit's real Un-Said app mounts (a polished, honest placeholder until then), and the interactive unfold: Un-Said banner -> unfold -> splash -> slot. The shell, the fold control and each app's own micro-interactions are the only interactive motion; the scripted opening (Phase 4) drives them.

WORKSPACE RULE (still in force): branch `branched-frontend` only; folder `Branched-Frontend/` only; everything stays in that folder; never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app or anything else (App-UI-Final/ is the read-only theme source); stage with git add Branched-Frontend/ and push only with git push origin branched-frontend; run git branch --show-current before every commit. All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app; it is NOT built here (it mounts in components/UnsaidSlot.tsx). Phase 0 global rules apply (docs/RULES.md), including rule 12 (BUILD_LOG + commit + push after every change), rule 13 (10 Haiku reviewers until CLEAN), rule 14 (PRODUCTION QUALITY BAR) and rule 16 (motion: interactive springs plus the one scripted opening).

USE the Apple/iOS skills now: apple-design-skill (home-screen grid, widgets, dock), heyimjames:interaction-primitives (widget anatomy, Dynamic Island), apple-hig (status bar, materials, SF type), liquid-glass if installed. Cross-check against the Apple Design Resources iOS UI kit; don't copy its assets.

ROUTE
/scene/home?state=<state>&wallpaper=unsaid|apple   (state: default | close-target | tap-unsaid | pressed-unsaid | dimmed)

WALLPAPER (each display, continuous across the hinge as if one image split in two)
- "unsaid" (default): the Phase 1 blurred Apple-style gradient but brighter for a home screen: radial blobs #677FEF (top-left), #AD78D4 (top-right), #8776DF (bottom-center), #C6A9F4 (bottom-left), on #0F0D15 (all from Gurneal's app icon); blur 60px; 4% noise. Left display shows the left half, right display the right half (offset the background by the display's artboard x so it's continuous behind the hinge).

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
- Row 3-4: Calendar small widget ("SATURDAY" in red #FF3B30, big "24", then "HackTX demo · 11 AM" and "call Mom?" in lowercase, a tiny Un-Said nod) + Photos small widget ("Memories", "lake trip, june", illustrated lake photo, soft vignette).
- Row 5: Clock, Notes, Maps, Photos
- Row 6: Mail, Reminders, Health, Settings
- Search pill.
RIGHT display (Meta apps prominent, then Apple):
- Row 1: Instagram, WhatsApp, Facebook, Messenger
- Row 2: Meta AI, Threads, Edits, Un-Said   <- Un-Said sits here, row 2 col 4
- Row 3-4: Batteries medium widget: four rings with icons and %: "iPhone Duo 84%", "Ray-Ban Meta 62%" (glasses glyph), "AirPods Pro 100%", "Watch 71%". (The Ray-Ban glasses tie to the Meta AI app.)
- Row 5: App Store, Music, Camera, Wallet
- Page dots; Dock: Phone, Messages, Safari, Calendar.  (The home screen is not part of the opening, which enters Un-Said from a notification banner and the unfold. It is the live home for /phone and Phase 6.)
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
- Un-Said: Gurneal's own icon, public/brand/unsaid-app-icon.png via UnsaidLogo (masked to the iOS squircle; fallback the white “ on un-icon-gradient). Label "Un-Said". A blue notification dot is NOT used; instead state=tap-unsaid adds a soft un-violet #A890F6 glow ring (static).
Apple apps (look-alikes): Weather (blue gradient + sun/cloud), Calendar (white, red day name, date number), Photos (white, 8-petal color pinwheel), Clock (black, white face, hands at 9:41), Notes (white with yellow header band + lines), Maps (map tile pastel + blue route), Settings (gray, gear), Mail (blue gradient, white envelope), Reminders (white, three colored dots + lines), Health (white, pink heart), App Store (blue gradient, a white "A" built from three rounded strokes), Music (red-pink gradient, white note), Camera (gray, lens circle), Wallet (black, stacked colored cards), Phone (green, white handset), Messages (green, white speech bubble), Safari (white/blue compass).


B) iOS NAVIGATION SHELL (interactive; real in the built web app, not scripted)
Goal: Gurneal can open any app from its icon, close it, open the next one, use the app switcher, and swipe between apps, live, and it feels like iOS. Every app registers with the shell, so every transition is identical and system-level. Use the Motion AI Kit + heyimjames:the-final-5-percent + apple-design-skill (motion) for the feel. Framer Motion only (already installed; ask before adding any other dependency).

Files: components/shell/ShellProvider.tsx (state + API), AppHost.tsx (the morphing app "window"), AppSwitcher.tsx, HomeIndicatorGesture.tsx, appRegistry.ts, rubberband.ts. Route: /phone (the live phone: unfolded Duo + home + shell). Also wrap the app routes in a route group app/(phone)/layout.tsx so the Duo, home, and shell PERSIST across navigation (Next layouts don't remount), and the UnsaidSlot and /apps/* routes render inside AppHost.

APP REGISTRY
registerApp({ id, name, Icon, route, placement: "span" | "left" | "right", Screen })
- Register now: whatsapp (opens on the Phase 2 Mom thread; placement "right"), messages (the Phase 2 Sarah thread; "right"), instagram (the Phase 2 Michael DM, state read; "right"), unsaid (Screen = components/UnsaidSlot.tsx, shown after the splash; "span" unfolded, "right" folded), meta-ai, facebook, messenger, threads, edits (simple look-alike stubs until Phase 6: the app's icon large, its name, on the app's own background; Phase 6 fills Facebook and Meta AI), and every Apple look-alike icon (a generic stub: the app's icon large, its name, and "concept · look-alike stub"), so EVERY icon on the home screen is tappable.
- Each registered app gets the same open/close/switcher behavior. No app implements its own transition.

STATE AND API
- Shell state: openApps (most recent first), foreground per placement: { span } or { left, right } (two single-panel apps can sit side by side, one per display; opening a span app replaces both), phase: home | opening | app | closing | switcher | switching.
- URL sync: ?app=<id>&placement=span|left|right (and the app's own route + ?state=). Loading a URL with an app open shows it already open with NO animation (so ?state= screenshots stay exact).
- Programmatic API (the Phase 4 opening drives the shell through this, so build it cleanly): shell.open(appId, {placement?, from?: "icon"}), shell.close(placement?), shell.openSwitcher(), shell.resume(appId), shell.kill(appId), shell.switchTo("prev" | "next"). Each returns a Promise that resolves when its transition settles. Expose it as window.__unsaidShell in dev and test builds (for Playwright). Keep every transition a pure function of a progress value (0..1) fed by the spring, so Phase 4 can add a "driven" mode where the opening timeline supplies the progress frame by frame. Don't build that mode now.
- Shell controls are navigation, not features: data-nav, no toast.

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
- Apps that span lay out using the Duo's left/right slots (list on the left, detail on the right).

REDUCED MOTION AND PERFORMANCE
- prefers-reduced-motion (and ?motion=reduced): open/close/switch become a 200 ms crossfade with a scale of 0.98; switcher cards appear without flying; the gestures still work.
- 60 fps: will-change only on the window and cards while they move; no layout-thrashing reads during a gesture; pre-render the blurred home and wallpaper once.
- In dev, record frame times during every transition (requestAnimationFrame deltas) and expose them as window.__unsaidShell.frameStats.

HOME STATES (static, for screenshots and the opening)
- default: as above.
- close-target: identical, plus a debug outline (only with ?debug=1) on the Instagram icon and the Un-Said icon showing their getIconRect values.
- tap-unsaid: a touch indicator (44 pt circle, rgba(255,255,255,0.35), 1 pt white stroke at 50%) centered on the Un-Said icon; the icon has an un-violet glow 0 0 24px rgba(168,144,246,0.6).
- pressed-unsaid: the Un-Said icon at scale 0.9, darkened by a 15% black overlay (the iOS press state).
- dimmed: the whole home screen at blur 12px, scale 0.94, opacity 0.6 (what sits behind an app opening).
Footer label (outside the device, with the concept label): "hackathon concept mock · not affiliated with Apple or Meta · icons are look-alikes".

NOTIFICATION BANNERS (iOS-level, so allowed for every app)
- shell.notify(appId, {title, body, threadId}) (wired to lib/notify.ts, so the Phase 2 dev panel and ?notify= go through it) drops the Phase 2 NotificationBanner from under the Dynamic Island with an iOS spring (spring-banner {stiffness 420, damping 34}, from y -120% with a slight overshoot settle, about 350 ms), on the display of the foreground app (the cover display when folded).
- Tap: the banner's rect becomes the app's launch rect: the app opens FROM THE BANNER on the banner's thread (threadId), with the messaging store intact, (same zoom as the icon open, with the banner as the source rect). Swipe up: it dismisses. Untouched: it auto-dismisses after 5 s (?banner-hold=on keeps it up).
- Un-Said's banner: when folded, tapping it plays the banner-to-app-card morph, then unfolds the Duo through useFold() (openAngle 0 -> 180 with spring-unfold {stiffness 120, damping 22, mass 1.3}, about 2.0 s, the Phase 1 snapshots as the keyframe reference), shows the UnsaidSplash (state=ready, 900 ms hold) and crossfades into the UnsaidSlot. Apart from the fold control, this is the only place the shell unfolds the device.
- Banner states for screenshots come from Phase 2 (&banner=...&banner-state=...).

C) UNSAID SLOT (where Mudit's real app mounts; a polished, honest placeholder until then)
- components/UnsaidSlot.tsx is the ONLY place Un-Said's app appears. It is registered with the shell as appId "unsaid" (placement "span" when unfolded, "right" when folded) and is what the Un-Said banner, the home icon and the splash hand off to.
- Props: src?: string | null (default process.env.NEXT_PUBLIC_UNSAID_APP_URL ?? null), mode?: "auto" | "placeholder" | "frame" (default "auto": frame when src is set, placeholder otherwise), placement?: "span" | "left" | "right", onReady?.
- URL override for demos and tests: ?unsaid=placeholder forces the placeholder; ?unsaid=<url-encoded https or localhost URL> mounts that URL.
- FRAME mode: an <iframe title="Un-Said" src={src} allow="microphone; camera; autoplay" data-slot="unsaid">, sized to the display(s): 402 x 874 pt per display (804 + hinge across both when spanning; the iframe gets ?display=span|single so Mudit's app can lay out). The UnsaidSplash stays on top until the iframe fires onLoad, then crossfades out (200 ms). If onLoad hasn't fired after 8 s, show the placeholder instead and log a console warning (never a broken frame on screen).
- PLACEHOLDER mode (data-slot="unsaid" data-slot-mode="placeholder"): a STATIC Un-Said Home in Gurneal's App-UI-Final theme, built only from the synced tokens and App-UI-Final/DESIGN_SPEC.md "Home" and assets/ui-reference/unsaid-ui-reference.png. Unfolded: the left display holds the header (wordmark), the headline and the hero card; the right display holds the "Your words" rows, the "Say it out loud" card and the tab bar. Folded: the same as one scrolling column on the cover display. Every string comes from lib/mock/unsaid-placeholder.ts, copied from App-UI-Final/COPY_AND_NAMES.md (log any missing string as COPY NEEDED; never invent features).
- The placeholder is honest: nothing in it works. Each control has only the iOS press state and carries data-placeholder="unsaid:<control>" with the "concept only" toast (rule 4). No fake recording, no fake transcript, no fake letters, no AI text.
- Dev tag: with ?dev=on only, a small tag at the bottom of the right display reads "placeholder · Mudit's app mounts here". It never shows in recordings.
- docs/UNSAID_SLOT.md (for Mudit): how to point the slot at his app (NEXT_PUBLIC_UNSAID_APP_URL in .env.local, or ?unsaid=<url>), the size contract (402 x 874 pt per display, ?display=span|single), framing (his app must allow being framed by the demo origin: no X-Frame-Options DENY, and Content-Security-Policy frame-ancestors including http://localhost:3000), mic/camera (https or localhost only; the iframe's allow attribute already grants them), and that nothing in Branched-Frontend/ needs to change when he swaps it in.
- The slot is swappable in one line: replacing the placeholder never touches the shell, the splash or the opening.
- /scene/unsaid?mode=placeholder|frame&placement=span|right renders the slot on its own (registered in lib/scenes.ts).

ACCEPTANCE CRITERIA (Phase 3)
- Would pass as a real Meta/Apple screenshot: every new state, at 2x, side by side with a reference screenshot of the real app or device. A designer couldn't tell at a glance which is the mock (apart from the look-alike icons). Zero PRODUCTION QUALITY BAR tells (rule 14); meta-style-slop-reviewer reports CLEAN.
- Banners: shell.notify drops, taps open the app from the banner, swipe up dismisses; the Un-Said banner tap unfolds into the splash and then the slot. Every frame of the drop, the banner open and the unfold passes as an Apple-built transition (60 fps, no linear easing, no flicker at 90 degrees).
- /scene/home?state=default at 1920x1080 reads as a real iOS 26-era home screen spread across two panels: correct status bars, a consistent icon grid on both panels, glassy widgets and dock, page dots, search pill, home indicators.
- Meta apps are the most prominent thing on the right panel (top two rows); Un-Said sits clearly among them; Apple apps are scattered on the left and below.
- Every icon is recognizable at a glance, and every one is a drawn SVG/CSS look-alike. Run: grep -ri "\.png\|\.svg" for any downloaded brand asset; the only image file in an icon is Gurneal's /public/brand/unsaid-app-icon.png.
- getIconRect returns correct artboard rects (verify with ?debug=1 overlays).
- No placeholder buttons on the home screen (it's iOS, not Un-Said); check:placeholders passes.
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
- Screenshots of every state at 1x and 2x, checked. Commit "branched-frontend: phase 3: home screen, navigation shell, UnsaidSlot, interactive unfold" and push per rule 12.
- UNSAIDSLOT: the Un-Said banner (folded) and the home icon (unfolded) both reach the splash and then the slot; with no URL set the placeholder shows, matches App-UI-Final's Home side by side (layout, type, colors, radii), and every control toasts "concept only"; with ?unsaid=http://localhost:5173 (any local page) the iframe mounts at the right size and the splash fades out on load; with a dead URL the placeholder appears after 8 s. docs/UNSAID_SLOT.md exists. Nothing in the slot renders fake features or AI text.
- All 10 reviewers report CLEAN in the same final round (rule 13); every finding is logged in REVIEW_FINDINGS.md and VERIFIED; BUILD_LOG.md is complete.

ADDITIONS IN THIS BUILD
- Register photos (the Phase 2 Photos library; placement "right" folded, "span" unfolded) and make WhatsApp open on its Chats tab with the Calls tab one tap away. The incoming WhatsApp call is a system-level overlay owned by the shell (full screen when an app is open, the compact call banner otherwise), so it can arrive on any screen.
- The Un-Said banner tap ALWAYS runs: unfold (if folded) -> UnsaidSplash -> UnsaidSlot, through the shell's launch path, so Un-Said opens like any other app. The Un-Said home icon does the same (splash -> slot) without the unfold when already unfolded.
- Dev panel: Apps section (open any registered app on any thread or state), the shell toggles (folded/unfolded, reduced motion), and the slot mode (placeholder / frame with a URL).
- Home screen copy is Gurneal's from the scripts (Calendar widget "HackTX demo · 11 AM" and "call Mom?"); anything new is COPY NEEDED.

STOP AND LET ME REVIEW. Report: git branch --show-current, git diff main --name-only (only Branched-Frontend/ paths), the screenshot list, every COPY NEEDED, the reviewer round results, and any value you changed and why.  Do not start Phase 4.
```

## Phase 4: the opening timeline engine (beats B01–B26)

Paste this block into Claude Code (also in paste/Phase4_paste_into_Claude_Code.txt):

```text
PHASE 4: Build the scripted, replayable OPENING: a timeline engine that performs the evening on the REAL build (the Duo, the shell, the messaging stores, notify()), plus /opening with Replay and seeking. This phase covers beats B01–B26 (from the black screen to the press on the Un-Said banner). Phase 5 adds the unfold (B27) and the splash → slot (B28).

WORKSPACE RULE (still in force): branch `branched-frontend` only; folder `Branched-Frontend/` only; everything stays in that folder; never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app or anything else (App-UI-Final/ is the read-only theme source); stage with git add Branched-Frontend/ and push only with git push origin branched-frontend; run git branch --show-current before every commit. All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app; it is NOT built here (it mounts in components/UnsaidSlot.tsx). Phase 0 global rules apply (docs/RULES.md), including rule 12 (BUILD_LOG + commit + push after every change), rule 13 (10 Haiku reviewers until CLEAN), rule 14 (PRODUCTION QUALITY BAR) and rule 16 (motion: interactive springs plus the one scripted opening).

INSTALL FIRST
- The Remotion Claude Code plugin (CLAUDE_PROMPT.md section 6), then, inside Branched-Frontend/: npm i remotion @remotion/player @remotion/cli

THE ENGINE (lib/opening/)
- lib/opening/beats.ts: the beat table below as data (id, start, end, what, the state it drives, easing/spring). One source of truth: the player, the driven mode, the checklist and the reviewers all read it.
- lib/opening/getOpeningFrame.ts: getOpeningFrame(t: seconds) -> a pure, deterministic description of the whole stage at time t: { camera: {scale, x, y}, device: {openAngle, screenOn, tilt, specular}, shell: {app, placement}, threads: {mom: {typed, keyboard, seen}, sarah: {...}, michael: {...}}, banner: {app, y, pressed} | null, overlay: {coldOpen opacity, splash, slot} }. Build it on remotion's interpolate() and spring() with the springs and easings from section 4.4. No Date.now(), no randomness: the same t always gives the same frame.
- components/opening/OpeningStage.tsx renders a frame: it sets the stores and the shell into the exact state the frame describes (driven mode; below) and renders the real components. It never re-implements a thread, a banner or the device.
- DRIVEN MODE: every transition in the shell, the banners, the keyboard, the bubbles and the Duo is already a pure function of a progress value (Phase 3). Add a driven flag (?clock=frozen, and always on inside the opening) where the opening supplies that progress per frame instead of the live spring, and the clock is pinned to 9:41 PM. Typing, deleting and sending go through the same store actions the keyboard uses (type(char), backspace(), send()); banners go through notify(); app opens go through window.__unsaidShell; the hinge goes through window.__unsaidDevice. Seeking backwards re-derives state from t (no accumulated side effects).
- remotion/Root.tsx registers the composition "Opening": 1920 x 1080, 60 fps, 38 s = 2280 frames, component OpeningStage, using useCurrentFrame()/fps as t.
- /opening: @remotion/player playing "Opening" at 1920 x 1080 scaled to fit, with on-stage controls outside the artboard (hidden with ?frame=bare): Replay (restart from t=0 and play), Play/Pause (space), a scrubber with beat ticks and labels (B01…), and the current t. URL: ?t=<seconds> (seek and hold), ?autoplay=1, ?loop=1, ?scene=opening|cold|duo|mom|type|sarah|michael|unsaid|unfold|launch (jumps to that section's first beat and plays it alone), ?cold=off (skip B02; the opening then starts at the pull-back), and the clean-shot flags ?frame=bare&badges=off&labels=off&dev=off.
- Reduced motion (prefers-reduced-motion or ?motion=reduced): the camera holds still and every scale/rotate/blur move becomes a 400 ms crossfade between the same key states; typing still types (it's content, not motion).
- Fonts: the system stack with Inter as the fallback only. No handwriting faces.

THE BEATS (t in seconds; adapted from Gurneal's ideas/gurneal/Demo_Script.md, read-only; Gurneal's names and copy)
| Beat | t | What happens | Motion |
| B01 | 0.00–1.00 | Black. The camera starts at scale 5.2 on the folded Duo's black cover display (folded-off) | hold |
| B02 | 1.00–4.20 | Cold-open card (on by default; ?cold=off skips): "The last thing my kid ever texted me was 'k.'" centered, 54 px, weight 600, #F5F5F7; the 'k.' in the same #F5F5F7, weight 700. Fade in 600 ms, hold, fade out 500 ms | ease-soft |
| B03 | 4.20–6.20 | Pull back from scale 5.2 to 1 until the whole folded white Duo is centered on black (the rim light shows) | spring-pullback {75, 20, 1.2} |
| B04 | 6.20–6.60 | The cover display wakes straight into Mom's WhatsApp thread (state=read) | 400 ms brightness 0 → 1, ease-ios |
| B05 | 6.60–9.60 | Reading down Mom's thread: the missed calls, "did you eat?", his "k" | camera drift scale 1 → 1.06 toward the thread, ease-breath |
| B06 | 9.60–11.20 | Hold on "I love you beta" + gray "Seen" | hold (silence is designed) |
| B07 | 11.20–11.50 | The keyboard rises | 300 ms ease-ios |
| B08 | 11.50–11.90 | "love you too" appears at typed=10, 11, 12 (t = 11.50, 11.70, 11.90) | per-character, caret blinking |
| B09 | 12.10–13.10 | Stall: the caret blinks at the end of "love you too" | hold |
| B10 | 13.10–14.10 | He deletes it, accelerating like a held delete key: characters removed at 130 ms, then 70 ms, then 45 ms intervals | backspace() through the store |
| B11 | 14.10–14.70 | The empty field (typed=0), the mic glyph back | hold |
| B12 | 14.70–15.30 | Sarah's banner drops: "Sarah ❤️🤍" · "please just say something" | spring-banner {420, 34, 1}, a 2 px horizontal shake on settle |
| B13 | 15.30–15.70 | The banner is tapped (press 0.97) and Messages opens from the banner on Sarah's thread | spring-open-banner {320, 32, 1} |
| B14 | 15.70–18.10 | Reading Sarah's honey-bun paragraph and "please just say something" | camera drift, ease-breath |
| B15 | 18.10–18.40 | The keyboard rises | 300 ms ease-ios |
| B16 | 18.40–20.40 | "i just don't feel like talking rn" types in (33 characters, evenly spaced with ±15 ms deterministic jitter from a fixed table) | per-character |
| B17 | 20.40–20.90 | Send: the blue bubble rises from the composer, "Delivered" | spring-send {500, 36, 0.8} |
| B18 | 20.90–22.60 | "Read 9:41 PM" replaces Delivered at 20.90; her typing dots appear at 21.30 and vanish at 22.00 (she stops typing) | 200 ms crossfades |
| B19 | 22.60–23.20 | Michael's banner drops: "Michael (Best Friend)" · "hey bro I miss you, haven't talked in a while… is everything ok?" | spring-banner |
| B20 | 23.20–23.60 | Tapped; Instagram opens on Michael's DM | spring-open-banner |
| B21 | 23.60–25.60 | Reading the DM: the reels piling up, his question | camera drift, ease-breath |
| B22 | 25.60–25.90 | The keyboard rises | 300 ms ease-ios |
| B23 | 25.90–27.70 | "im good bro" types (25.90–26.70), a 350 ms pause, then " just tired" (27.05–27.70) | per-character |
| B24 | 27.70–28.80 | Send: the gradient bubble "im good bro just tired". No Seen. Stillness | spring-send, then hold |
| B25 | 28.80–31.30 | The Un-Said banner drops (its icon is the first blue-violet on screen): "Un-Said" · "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?" (copy A; B and C selectable with ?copy=b|c from Phase 2's notes). Held | spring-banner, then hold |
| B26 | 31.30–31.60 | The banner is pressed (scale 0.97, 15% darken) | ease-ios 120 ms |
| B27 | 31.60–33.60 | The Apple-style unfold (Phase 5) | spring-unfold |
| B28 | 33.60–38.00 | The splash, then the slot (Phase 5) | ease-soft |

ACCEPTANCE CRITERIA (Phase 4)
1. /opening plays B01–B26 at 60 fps on the real components (Playwright frameStats p95 under 20 ms over the whole run, scripts/opening-check.ts); Replay restarts cleanly with every store reset; ?t= lands on the exact frame for any t, forward or backward.
2. Determinism: scripts/opening-check.ts screenshots t = 0.50, 2.60, 5.20, 8.00, 10.40, 11.70, 12.60, 13.60, 14.40, 15.00, 16.90, 19.40, 20.60, 21.60, 22.90, 24.60, 26.30, 27.40, 28.20, 30.00 and 31.45 twice and the pairs are pixel-identical.
3. Every on-screen copy matches Phase 2's THE SCRIPTS and this table word for word; Mom's "k" is visible during B05; "love you too" is never sent.
4. The opening drives the real build: grep shows no thread, banner or device markup inside components/opening/ (it only renders the existing components and sets their state).
5. Reduced motion works; ?scene= jumps work; ?cold=off skips B02.
6. npm run build, lint, check:tokens and check:placeholders pass. Commit "branched-frontend: phase 4: opening engine, driven mode, beats B01-B26" and push per rule 12. All 10 reviewers CLEAN in one round (opening-storyboard-reviewer included).

STOP AND LET ME REVIEW. Report: git branch --show-current, git diff main --name-only (only Branched-Frontend/ paths), the checklist screenshots, a screen recording of /opening from Replay to B26, every COPY NEEDED, the reviewer round results, and any timing you changed and why. Do not start Phase 5.
```

---

## Phase 5: the Apple-style unfold (B27), splash → slot (B28), polish, the MP4

Paste this block into Claude Code (also in paste/Phase5_paste_into_Claude_Code.txt):

```text
PHASE 5: Finish the scripted opening: beat B27 (the Apple-style unfold) and B28 (the Un-Said splash handing off to the UnsaidSlot), then polish the whole opening to the frame checklist, render the MP4 and record a screen-capture backup. Nothing new is built outside lib/opening/, components/opening/ and remotion/, except fixes the polish pass finds.

WORKSPACE RULE (still in force): branch `branched-frontend` only; folder `Branched-Frontend/` only; everything stays in that folder; never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app or anything else (App-UI-Final/ is the read-only theme source); stage with git add Branched-Frontend/ and push only with git push origin branched-frontend; run git branch --show-current before every commit. All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app; it is NOT built here (it mounts in components/UnsaidSlot.tsx). Phase 0 global rules apply (docs/RULES.md), including rule 12 (BUILD_LOG + commit + push after every change), rule 13 (10 Haiku reviewers until CLEAN), rule 14 (PRODUCTION QUALITY BAR) and rule 16 (motion: interactive springs plus the one scripted opening).

THE BEATS (continuing Phase 4's table; t in seconds)
| Beat | t | What happens | Motion |
| B27 | 31.60–33.60 | The pressed banner becomes the app card (the iOS notification-open: the banner rect grows to the cover display, radius 24 -> 52 px, un-card-gradient fills it, the Un-Said icon fades in at center, 31.60–32.00). Then the Duo unfolds: openAngle 0 -> 180 through the SAME function the fold control uses (Phase 1: left panel rotateY = openAngle - 180, group translateX = -215 * (1 - openAngle/180), tilt rotateY = -8deg * sin(pi * openAngle/180), rotateX = 3deg * sin(pi * openAngle/180), specular 0.15 -> 0.85). The camera eases from the Phase 4 drift back to scale 1 so the whole unfolded Duo is centered. The hinge ripple fires at openAngle ~178 | spring-unfold {120, 22, 1.3} (Remotion spring() with the same config, starting at 32.00), camera ease-breath |
| B28 | 33.60–38.00 | The UnsaidSplash (state=ready: the 120 pt icon centered on the left display, "Un-Said" wordmark 20 pt below, un-card-gradient full bleed across both displays, continuous across the hinge) holds 900 ms, then crossfades (200 ms, ease-soft) into the UnsaidSlot (placeholder unless a slot URL is set; in the render, always the placeholder, ?unsaid= ignored, so the MP4 is deterministic). Hold to the end | ease-soft |
- The unfold must read as Apple's own product film: a mechanical hinge (no rubbery overshoot beyond the detent settle), a continuous specular sweep along the white frame and the back glass, the camera bump catching the light as it passes 60-120 degrees, no flicker at 90 degrees, no z-fighting, the crease shading fading in only as the panels go flat.
- Reduced motion: B27 becomes a 400 ms crossfade from the folded card to the unfolded splash; B28 is unchanged (it is already a crossfade).
- ?scene=unfold starts at B26; ?scene=launch starts at B28.

POLISH PASS (the whole opening, B01–B28)
- Frame checklist (scripts/opening-check.ts, extended): screenshot t = 0.50, 2.60, 5.20, 8.00, 10.40, 11.70, 12.60, 13.60, 14.40, 15.00, 16.90, 19.40, 20.60, 21.60, 22.90, 24.60, 26.30, 27.40, 28.20, 30.00, 31.45, 31.80, 32.40, 32.80, 33.20, 33.60, 34.20, 35.00 and 37.50, at 1x and 2x, twice (pixel-identical pairs). Save them under Branched-Frontend/screenshots/opening/ and LOOK at every one side by side with the matching static ?state= frame from Phases 1-3: the opening's frame and the hand-built state must be the same pixels (beyond the camera transform).
- Holds are silent and still: during B06, B09, B11 and the end of B24 nothing moves except the caret.
- Timing review: play the opening three times end to end; if a beat feels rushed or slow, propose a change in BUILD_LOG.md (beat, old t, new t, why) and ask Gurneal before changing the table.
- Fonts, emoji and the clock are pinned (system stack, the same emoji rendering every run, 9:41 PM).

THE MP4
- npx remotion render Opening out/opening.mp4 --codec=h264 --crf=16 (from inside Branched-Frontend/; out/ is git-ignored). 1920 x 1080, 60 fps, 38.00 s, no audio track. Check the file with ffprobe (duration, fps, size) and watch it.
- SCREEN-RECORD BACKUP: also record /opening?autoplay=1&frame=bare&labels=off&dev=off in Chromium at 1920 x 1080 with Playwright's recordVideo (scripts/record-opening.ts -> out/opening-screen.webm), so a live recording exists if the render ever disagrees with the browser.
- Neither file is committed. Note their paths, sizes and durations in BUILD_LOG.md.

ACCEPTANCE CRITERIA (Phase 5)
1. /opening plays B01–B28 at 60 fps (frameStats p95 under 20 ms, no frame over 50 ms); Replay restarts cleanly; ?t= lands on the exact frame anywhere in 0–38 s.
2. The unfold in the opening and the unfold from the fold control are the same motion (same function, same spring): a frame strip of both at openAngle 30/60/90/120/150 matches.
3. B28 lands on the splash and then the UnsaidSlot placeholder; from 35.00 s the end frame is completely still.
4. Every checklist frame passes as an Apple/Meta screenshot (rule 14); the slop detector and the opening reviewer report CLEAN.
5. out/opening.mp4 and out/opening-screen.webm exist and play; ffprobe shows 1920x1080, 60 fps (the webm: whatever Chromium records), about 38 s.
6. npm run build, lint, check:tokens and check:placeholders pass. Commit "branched-frontend: phase 5: unfold, splash to slot, polish, render" and push per rule 12 (the MP4 itself is not committed). All 10 reviewers CLEAN in one round.

STOP AND LET ME REVIEW. Report: git branch --show-current, git diff main --name-only (only Branched-Frontend/ paths), the frame checklist screenshots, the MP4 and webm paths with ffprobe output, every timing change you propose, every COPY NEEDED and the reviewer round results. Do not start Phase 6.
```

---

## Phase 6: Meta shells, completeness, click-through, ready for animation work

Paste this block into Claude Code (also in paste/Phase6_paste_into_Claude_Code.txt):

```text
PHASE 6: Fill in the remaining apps (Facebook and Meta AI as look-alike shells, the rest of Instagram's and WhatsApp's tabs), make every control on every screen either work or toast "concept only", run the full click-through, write docs/PLACEHOLDERS.md, and hand over a build that is READY FOR ANIMATION WORK.

WORKSPACE RULE (still in force): branch `branched-frontend` only; folder `Branched-Frontend/` only; everything stays in that folder; never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app or anything else (App-UI-Final/ is the read-only theme source); stage with git add Branched-Frontend/ and push only with git push origin branched-frontend; run git branch --show-current before every commit. All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app; it is NOT built here (it mounts in components/UnsaidSlot.tsx). Phase 0 global rules apply (docs/RULES.md), including rule 12 (BUILD_LOG + commit + push after every change), rule 13 (10 Haiku reviewers until CLEAN), rule 14 (PRODUCTION QUALITY BAR) and rule 16 (motion: interactive springs plus the one scripted opening).

FACEBOOK (look-alike shell; placement "right" folded, "span" unfolded)
- iOS Facebook look-alike: the top bar (our drawn "facebook"-style wordmark is NOT used; the bar shows a plain "Home" title in the system font, plus create / search / Messenger glyphs), the "What's on your mind?" row with Riley's avatar, a stories strip (illustrated), and a feed of 4 posts from lib/mock/facebook.ts (Mom sharing a recipe photo, a campus page, a friend's lake photo, a group post), each with like / comment / share counts. Tab bar: Home, Video, Friends, Marketplace, Notifications, Menu.
- Interactive: scroll, tap a post to open it, like toggles locally. Everything else is a placeholder (data-placeholder="facebook:<control>", "concept only"). Colors from section 4.2 (fb-*).

META AI (the Ray-Ban Meta glasses companion; look-alike shell)
- Home: the glasses card ("Ray-Ban Meta" · 62% · connected, an illustrated pair of glasses), a "Recent" media grid (illustrated stills), and an "Ask Meta AI" prompt pill with the meta-ai-gradient ring glyph. Tab bar: Home, Gallery, Settings (look-alike labels).
- No AI conversation is shown and nothing generates text (story rule 2). Tapping the prompt pill opens an empty chat with the composer only; sending is a placeholder (data-placeholder="meta-ai:send"). Everything else is a placeholder.

COMPLETENESS
- Instagram: Home feed (illustrated posts, stories row), Search grid, Reels tab (reuses the Reels viewer), Profile (Riley's, illustrated grid). DMs inbox and Michael's thread stay as built.
- WhatsApp: Updates, Communities and Settings tabs as look-alike screens; the chat list complete (Mom, Fam, Roommates, Marfa Trip).
- Messages: the conversation list (Sarah ❤️🤍 at the top).
- Apple stubs: every Apple icon on the home screen opens its stub (Phase 3).
- Replies (dev panel only, never in the opening): "fire reply" buttons for Sarah and Michael append a seeded reply from lib/mock/threads.ts (Sarah: COPY NEEDED; Michael: COPY NEEDED); log both as COPY NEEDED until Gurneal writes them.

CLICK-THROUGH (scripts/clickthrough.ts, Playwright)
- From /phone, open every registered app from its icon, tap every visible control on its default screen, and check that each one navigates (data-nav), works, or toasts "concept only" (data-placeholder). Then: fold, unfold (button and F), fire every banner, tap each, run the Un-Said path (banner -> unfold -> splash -> slot), open the switcher, kill an app, swipe between apps. Screenshot every step. It fails on any dead control, any console error, any data-feature-id and any network request leaving localhost.
- npm run check:placeholders regenerates docs/PLACEHOLDERS.md: per app, every data-placeholder with its route, plus the UnsaidSlot status (mode, URL or none) and a short "how to swap in Mudit's app" pointer to docs/UNSAID_SLOT.md.

THE HANDOVER (docs/READY_FOR_ANIMATION.md)
- What exists: every route and ?state= (from lib/scenes.ts), the opening's beat table, the driven-mode API (window.__unsaidShell, window.__unsaidDevice, notify(), the store actions), the Remotion composition, the fold control, the slot.
- How to add a new scene later: a new beat range in lib/opening/beats.ts driving existing states; never re-implementing a screen.
- Known gaps: every COPY NEEDED and THEME NEEDED still open, every placeholder, anything Gurneal deferred.
- The last line reads: "Status: ready for animation work."

ACCEPTANCE CRITERIA (Phase 6)
1. Facebook and Meta AI open from their icons and pass as real look-alike screenshots side by side with the real apps (rule 14); no official logos.
2. clickthrough.ts passes with zero dead controls, zero console errors, zero data-feature-id and zero external requests.
3. docs/PLACEHOLDERS.md, docs/UNSAID_SLOT.md and docs/READY_FOR_ANIMATION.md exist and are accurate.
4. /opening still plays B01–B28 identically (the Phase 5 frame checklist re-run is pixel-identical).
5. npm run build, lint, check:tokens and check:placeholders pass. Commit "branched-frontend: phase 6: Meta shells, completeness, click-through, ready for animation work" and push per rule 12. All 10 reviewers CLEAN in one round.

STOP AND LET ME REVIEW. Report: git branch --show-current, git diff main --name-only (only Branched-Frontend/ paths), the click-through screenshots, docs/PLACEHOLDERS.md, docs/READY_FOR_ANIMATION.md, every COPY NEEDED / THEME NEEDED, and the reviewer round results. The build is done: ready for animation work.
```

---

## 8. Placeholders and the UnsaidSlot

This build has no feature contract. Un-Said's real features live in Mudit's app; here, every control that would need a backend is a **placeholder**, and Un-Said itself is only its logo, its splash and a slot.

### 8.1 Placeholders
- Markup: `data-placeholder="<app>:<control>"` (for example `whatsapp:call-start`, `instagram:share`, `photos:trash`, `unsaid:compose`). The app part is one of: whatsapp, messages, instagram, photos, facebook, meta-ai, ios, unsaid.
- Behavior: the real app's press state (scale 0.97 or the platform highlight), then one shared toast, "concept only", from `components/PlaceholderToast.tsx` (sonner, 1.6 s, never stacked, hidden when `?toasts=off` and in the opening render).
- Never: a badge on the control, a disabled look, fake output, a `data-feature-id`, or any reference to the old feature list.
- Navigation controls carry `data-nav` instead and must navigate.
- `npm run check:placeholders` (scripts/check-placeholders.ts) fails on any `data-feature-id`, any interactive element with neither `data-nav`, `data-placeholder` nor a handler, and any `data-placeholder` outside the `<app>:<control>` shape. From Phase 6 it also writes `docs/PLACEHOLDERS.md`.

### 8.2 The UnsaidSlot (`components/UnsaidSlot.tsx`, built in Phase 3)
- Purpose: the one place Mudit's real Un-Said app appears. Nobody edits his app or his backend from this repo.
- Modes: `placeholder` (default) and `frame`. `frame` is used only when a URL is set: `NEXT_PUBLIC_UNSAID_APP_URL` in `.env.local`, or `?unsaid=<url>`. There is no default URL.
- Frame: an `<iframe>` sized to the displays (402 x 874 pt per display; `span` when unfolded, `right` when folded), `allow="microphone; camera; clipboard-write"`, `?display=span|single` appended so his app can lay out. The splash stays up until the iframe's load event; if nothing loads in 8 s the placeholder replaces it.
- Placeholder: a static Un-Said Home in App-UI-Final's theme only (`lib/unsaid-theme.json`), matching `App-UI-Final/assets/ui-reference/unsaid-ui-reference.png`; every control is `data-placeholder="unsaid:<control>"`. No generated text, no fake AI output, no letters, no faces.
- Docs: `docs/UNSAID_SLOT.md` (Phase 3) explains the URL, the size contract, framing headers and mic/camera rules.
- The opening render (Phase 5) always uses the placeholder so the MP4 is deterministic.

---

## 9. The 10 Haiku reviewers (write each file word for word into Branched-Frontend/.claude/agents/<name>.md)

All reviewers are read-only (they never edit files, never commit, never push). Run all 10 in parallel after every phase and every meaningful change; log every finding in Branched-Frontend/REVIEW_FINDINGS.md (id, reviewer, file:line, finding, fix, VERIFIED); repeat until all 10 report CLEAN in the same round. If the agents aren't loaded, run each as a general-purpose haiku subagent with its file body as the prompt.

Every reviewer file has the same HOW YOU WORK and REPORT FORMAT blocks (written out in full in each file):

```text
HOW YOU WORK
- Read CLAUDE_PROMPT.md (Branched-Frontend/) for the rules you check, then the files changed in this phase (git diff main --name-only), then the screenshots under Branched-Frontend/screenshots/ for this phase. Open the app or the screenshots, never just the code, for anything visual.
- Only report what you can point to (file:line or screenshot path). No style opinions beyond your CHECK list.
- Never edit, commit or push.

REPORT FORMAT
- First line: CLEAN, or FINDINGS (n).
- Then one line per finding: [severity: blocker | major | minor] file:line or screenshot — what is wrong — the rule (section/rule number) — the smallest fix.
```

### 9.1 `ios-hig-reviewer`
```markdown
---
name: ios-hig-reviewer
description: Read-only Branched-Frontend reviewer: iOS chrome accuracy. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
You check that every piece of iOS chrome passes as a real iOS 26 screenshot.

CHECK
- Status bar (9:41, signal, Wi-Fi, battery), Dynamic Island / cutout placement per display, home indicator, safe areas.
- Notification banners: size, radius, blur material, icon squircle, title/body type, the "now" label, swipe-up dismiss.
- Keyboards, navigation bars, tab bars, sheets, switcher: sizes and type styles from section 4 and Apple's UI kits; system font stack only, no bundled Apple fonts or bezel images.
- Light and dark appearances where used; 1x and 2x screenshots crisp.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.2 `meta-style-slop-reviewer`
```markdown
---
name: meta-style-slop-reviewer
description: Read-only Branched-Frontend reviewer: the vibe-code / AI-slop detector. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
You are the slop detector. Anything that looks generated, generic or template-made is a finding.

CHECK
- Generic gradients, glows, glassmorphism, emoji-as-icons, Lucide-default icon look, uneven spacing, off-grid radii, placeholder lorem, "AI" sparkles outside the Meta AI shell.
- Look-alike apps match their real counterparts side by side (section 5); colors only from section 4.2 and the synced theme (no hex typed into components).
- No handwriting faces, no Caveat, no amber, no bubble mark, no official Meta/Apple logo files.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.3 `device-fold-reviewer`
```markdown
---
name: device-fold-reviewer
description: Read-only Branched-Frontend reviewer: the white iPhone Duo, the fold control, the home screen. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- The Duo matches section 4.3 (white frame, sizes, hinge, crease, camera bump); every openAngle snapshot (0/30/60/90/120/150/180) reads as one solid device, no z-fighting or flicker at 90.
- The fold control (on-stage button and the F key) springs with spring-unfold / spring-close from lib/motion.ts and uses the same openAngle function as the opening.
- The home screen spans the displays correctly, icons on grid, Un-Said's icon is Gurneal's art from the synced theme, no "Muse" app.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.4 `threads-copy-reviewer`
```markdown
---
name: threads-copy-reviewer
description: Read-only Branched-Frontend reviewer: Act 1 copy. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- Every message, name, emoji, time and status in WhatsApp, Messages and Instagram is word for word from CLAUDE_PROMPT.md (Phase 2 and Phase 4); nothing paraphrased, nothing added.
- Missing copy is logged as COPY NEEDED, never invented.
- The Un-Said banner uses copy A by default (B and C only via ?copy=).

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.5 `nav-motion-reviewer`
```markdown
---
name: nav-motion-reviewer
description: Read-only Branched-Frontend reviewer: the shell and interactive motion. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- Every spring and easing comes from section 4.4 / lib/motion.ts by name; no inline stiffness/damping/duration numbers in components.
- App open/close, banner open, switcher, swipe-between-apps and the snap-back feel like iOS; interruptible; reduced motion swaps to crossfades.
- window.__unsaidShell and window.__unsaidDevice / useFold() work and are progress-pure (Phase 4 drives them).

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.6 `opening-storyboard-reviewer`
```markdown
---
name: opening-storyboard-reviewer
description: Read-only Branched-Frontend reviewer: the scripted opening against the beat table. Use after Phases 4-6 and any change to lib/opening/ or remotion/.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- lib/opening/beats.ts matches the beat table (B01–B28) exactly: start/end seconds, copy, motion token per beat; 1920x1080, 60 fps, 2280 frames.
- The opening drives the real interactive build (store actions, notify(), the shell, useFold()); no screen re-implemented for the video.
- ?t=, ?scene= and ?cold=off land on the exact frame; two renders of the same frame are pixel-identical; holds are still.
- Photos, Mom's phone and the letter beats are absent; the cold card is on by default.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.7 `workspace-placeholder-reviewer`
```markdown
---
name: workspace-placeholder-reviewer
description: Read-only Branched-Frontend reviewer: workspace discipline and the placeholder system. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- git diff main --name-only lists only Branched-Frontend/ paths; nothing written into App-UI-Final/ or anyone else's folder; no secrets or .env files committed.
- npm run check:placeholders passes: zero data-feature-id, every non-nav control has data-placeholder="<app>:<control>" and the "concept only" toast.
- No personal notes or chat logs anywhere in the repo.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.8 `meta-apps-reviewer`
```markdown
---
name: meta-apps-reviewer
description: Read-only Branched-Frontend reviewer: the look-alike apps. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- WhatsApp, Messages, Instagram, Photos, Facebook and Meta AI each pass side by side with the real app (layout, type sizes, colors from section 4.2, icon shapes); drawn glyphs, never official logo files.
- Each app's own micro-interactions (scroll, tap highlight, long-press, read receipts, typing dots) behave like the real app.
- Meta AI never shows generated text or a conversation.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.9 `build-a11y-reviewer`
```markdown
---
name: build-a11y-reviewer
description: Read-only Branched-Frontend reviewer: build health and accessibility. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- npm run build, lint, check:tokens and check:placeholders pass; no TypeScript any without a reason; no console errors in the shoot/click-through logs; no network request leaving localhost.
- Interactive elements are real buttons/links with accessible names; focus is visible on the stage controls; prefers-reduced-motion is honored.
- Performance: frameStats p95 under 20 ms on /phone and /opening.

(HOW YOU WORK and REPORT FORMAT as above.)
```

### 9.10 `assets-slot-reviewer`
```markdown
---
name: assets-slot-reviewer
description: Read-only Branched-Frontend reviewer: the synced theme, assets and the UnsaidSlot. Use after every phase and meaningful change.
tools: Read, Grep, Glob, Bash
model: haiku
---
CHECK
- Every un-* value comes from lib/unsaid-theme.json (generated by scripts/sync-theme.ts from App-UI-Final, with its header); no un-* hex typed by hand; THEME NEEDED logged for anything missing.
- Un-Said appears only as the home icon, the notification icon, the splash and the UnsaidSlot placeholder (section 4.1).
- The UnsaidSlot follows section 8.2: no default URL, iframe size and allow list, 8 s fallback, placeholder matches the App-UI-Final reference, docs/UNSAID_SLOT.md accurate.
- Assets follow section 4.5: Gurneal's art used as is, no Apple bezels, no SF Pro files, no official app logos.

(HOW YOU WORK and REPORT FORMAT as above.)
```

---

## 10. Mock data (lib/mock/)

- `lib/mock/people.ts`: Riley (him), Mom, Dad, Sarah ❤️🤍, Michael (Best Friend), plus the background contacts in WhatsApp's list; illustrated avatars only.
- `lib/mock/threads.ts`: the WhatsApp (Mom), Messages (Sarah) and Instagram (Michael) threads word for word from Phase 2 and the beat table; seeded replies for Phase 6 marked COPY NEEDED until Gurneal writes them.
- `lib/mock/reels.ts`, `lib/mock/photos.ts`, `lib/mock/facebook.ts`, `lib/mock/meta-ai.ts`: illustrated stills and counts for the look-alike apps.
- `lib/mock/unsaid-placeholder.ts`: the static strings for the UnsaidSlot placeholder Home, taken from the App-UI-Final reference (no generated text).
- `lib/opening/beats.ts`: the beat table B01–B28 as data (id, start, end, action, motion token), the single source for /opening and the Remotion composition.
- All times read 9:41 PM; all mock data is deterministic (no Date.now(), no Math.random() without a fixed seed).

## 11. Later (not in this build)

- Animation work beyond the opening, once Mudit's app is running in the UnsaidSlot: new scenes are new beat ranges in lib/opening/beats.ts driving the same build (docs/READY_FOR_ANIMATION.md).
- Sound design and music for the opening.
- Any change to Un-Said's own screens happens in Mudit's app and App-UI-Final, never here.

## 12. Changelog

- **BF-v2 · Oct 24, 2026 (CT).** Re-scoped: the phone, the apps and the scripted opening; Un-Said itself is only its logo, its splash and the UnsaidSlot (where Mudit's app mounts). Un-Said's theme is synced from App-UI-Final (scripts/sync-theme.ts). Added: the fold control (Phase 1), the dev panel (Phase 2), the UnsaidSlot and the interactive unfold (Phase 3), the 38 s scripted opening with Remotion (Phases 4-5), the Meta shells, click-through and the handover (Phase 6), the data-placeholder system, the motion table (section 4.4). Retired: the Un-Said screens, the 50-row feature contract and lib/contract.ts, the rant / letter / Act 2 / Act 2b / Act 3 phases, Mom's phone, the bloom, the NOT YET CONNECTED badges, the old copies of the Un-Said palette, the "no animation" rule.
- BF-v1.2 (Oct 24, 2026, 6:38 PM CT): added the demo-only scope section. It is not a production app; build only what shows in the animated demo.

- BF-v1.1 (Oct 24, 2026, 6:25 PM CT): added section 0 (Fable plans, Opus builders work in parallel, Haiku reviews) and the START_HERE kickoff paste.


- **BF-v1 (Oct 24, 2026, CT):** written from scratch for the `branched-frontend` branch and the `Branched-Frontend/` folder. Story/beat structure follows the team's v2 demo script where it doesn't conflict; every design, naming, palette and copy decision is Gurneal's (his app icon and UI reference are the only palette source; the old cream/plum/amber palette, Caveat and the bubble mark are retired). New since the v5 prompt: the hallway and his-words-only rules, the WhatsApp calls side and video call, Instagram Reels, Photos, Talk/split/piles, Hold until her morning and the waiting strip, the handoffs, Mom's phone and the letter page, the self video note, the 50-row contract, reviewers rewritten for branch/folder discipline, and the generated UNCONNECTED_BUTTONS report.
