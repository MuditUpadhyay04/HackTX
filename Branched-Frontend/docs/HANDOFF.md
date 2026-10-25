# HANDOFF: Un-Said Branched-Frontend (BF-v2), state as of Oct 24, 2026 ~8:15 PM CT

Paste this whole file into the new Claude Code session (run it from `~/Gurneal/HackTX/Branched-Frontend`, ideally `claude --add-dir ..` so the agents in `.claude/agents/` load natively). It tells you where everything is, what's done, what's half done, and exactly what to do next.

---

## 1. The job (unchanged)
Gurneal's original kickoff is `docs/paste/START_HERE_paste_into_Claude_Code.txt`; the full spec is `docs/CLAUDE_PROMPT.md` (BF-v2, 1382 lines, the source of truth: read it in full). Build the white iPhone Duo web mock, look-alike apps, iOS shell, banners, fold control, the scripted `/opening` and the `UnsaidSlot` placeholder, Phases 0–6. Un-Said itself is logo + splash + slot only (Mudit's real app mounts in `components/UnsaidSlot.tsx`).

**Gurneal's standing orders (Oct 24):**
- Approved Phase 0 decisions D1–D7 (recommended defaults; see `docs/plans/Phase0_plan.md` §3 and `docs/RULES.md`).
- "Go down the whole list now and do the whole project, do not stop till you're done" → build all phases without waiting at phase gates. Each phase still ends with its review loop + BUILD_LOG + commit + push.
- Then he said "ok stop": all agents were stopped at ~8:10 PM CT. Resume only when he says go in the new session.
- Process: plan (Fable when it has credits; it was out, so Opus planned, with his OK), build with Opus builder agents in parallel (~10 at once), review with the 10 Haiku reviewers until all CLEAN in one round, log + commit + push after every change.

## 2. Workspace rule (outranks everything)
- Repo `~/Gurneal/HackTX` (remote `MuditUpadhyay04/HackTX`). Branch **`branched-frontend` only**. Folder **`Branched-Frontend/` only**.
- Never touch `backend/`, `frontend/`, `ideas/`, App-UI-Final, root files, or Mudit's app. Stage with `git add Branched-Frontend/` only; before every commit `git branch --show-current` must print `branched-frontend` and `git diff --cached --name-only | grep -v '^Branched-Frontend/'` must print nothing. Never push to main; never force-push.
- Never copy from any `private/` folder.
- Compute: every build, test and screenshot runs on this MacBook (D6).

## 3. Git state (nothing committed yet)
- D1 done: `branched-frontend` was re-pointed with `git switch -C branched-frontend origin/main` (it used to sit on Mudit's fad6c78 "backend finished"). Upstream was unset on purpose. Local HEAD = `fd352fd` (origin/main).
- **`origin/branched-frontend` does not exist yet.** First push: `git push -u origin branched-frontend` (skip `git pull --rebase` on that first push).
- `git status`: only `?? Branched-Frontend/` (untracked). **Zero commits so far.** First commit should happen right after the Phase 0 integration build passes.
- App-UI-Final (the read-only Un-Said theme) lives only on **`origin/app-ui-final`** (4dadc1e). Decision D2: `scripts/sync-theme.ts` reads it from (1) `../App-UI-Final`, (2) `~/Desktop/Unsaid-Claude-Context/App-UI-Final`, (3) `git archive origin/app-ui-final`. Never merge that branch (it would put non-`Branched-Frontend/` paths in the diff). Read its docs with `git show origin/app-ui-final:App-UI-Final/<file>`.

## 4. Key docs
| File | What |
|---|---|
| `docs/CLAUDE_PROMPT.md` | the spec (refreshed from `~/Desktop/Unsaid-Claude-Context/Branched-Frontend/`, the newest copy) |
| `docs/CONTEXT.md`, `docs/GOAL_STATEMENT.txt`, `docs/paste/*` (START_HERE + Phase0–6) | spec companions |
| `docs/plans/Phase0_plan.md` … `Phase6_plan.md` | the plans: work packages, file ownership, interfaces, waves. **Phase0 is detailed; Phases 1–6 are written and usable but should get a quick refresh against the real code before dispatching** |
| `docs/plans/BUILDER_BRIEF.md` | the shared Opus builder brief (rules every builder follows; builders never run git or `next build` unless told) |
| `docs/RULES.md` | the 16 global rules word for word + decisions D1–D7 + the "build all phases" note |
| `BUILD_LOG.md` | log so far (plan, Wave 0). **Needs the entries listed in §7 added** |
| `REVIEW_FINDINGS.md` | header only, no findings yet (ID format `P<phase>-R<round>-<n>`) |
| `.claude/agents/` | 10 Haiku reviewers (section 9 word for word + one D3 line pointing at `docs/CLAUDE_PROMPT.md`) and 10 Opus builders (`opus-builder-{foundation,tokens,scripts,stage-dev,docs-reviewers,device,apps,shell,opening,fixer}`) |

## 5. Phase 0 status: 4 of 5 packages DONE, 1 partial, integration NOT run

| Pkg | Status | Files |
|---|---|---|
| Wave 0 (orchestrator) | ✅ | branch re-point; docs/assets/reference refreshed from Desktop; `npx playwright install chromium` done; `BUILD_LOG.md`, `BUILDER_BRIEF.md` |
| P0-A foundation | ✅ | Step 0 retire (moved to macOS Trash: `assets/ui-reference/`, `assets/palettes/tokens.json`, `assets/palettes/palette.md`, `public/{next,vercel,file,globe,window}.svg`, `app/favicon.ico`); `package.json` scripts (`sync:theme`, `predev`/`prebuild`, `shoot`, `shoot:clean`, `check:tokens`, `check:placeholders`); `.gitignore`; `app/layout.tsx` (no Geist, system font, mounts `ConceptLabel` + `PlaceholderToaster` in Suspense); `app/globals.css`; `app/page.tsx` (dev index); `README.md`. One `next build` passed; Tailwind 4 works via `@tailwindcss/turbopack` (no postcss needed). Next 16.4.3 has **cacheComponents on**: anything reading search params must be inside `<Suspense>`. |
| P0-B tokens | ⚠️ PARTIAL (stopped) | Done: `scripts/sync-theme.ts`, `lib/unsaid-theme.json`, `app/unsaid-theme.css`, `public/unsaid-theme/**`, `public/brand/unsaid-app-icon.png`, `public/test/branched-frontend-palette.png`, `lib/tokens.ts`, `lib/motion.ts`, `app/tokens.css`, `app/test/tokens/page.tsx`. It was in the middle of: the TS↔CSS token consistency check, adding the requested tokens (below), and updating `assets/README.md`. **Verify `/test/tokens` renders and finish these.** |
| P0-C scripts | ✅ | `lib/scenes.ts`, `scripts/check-tokens.ts` (escape hatch: `@token-source` on line 1), `scripts/check-placeholders.ts` (writes `docs/PLACEHOLDERS.md`), `scripts/shoot.ts` (`--clean`, `--hi`, `--only`), `scripts/lib/server.ts` (`BASE_URL` / :3000 / `next start -p 3123`), `app/scenes/page.tsx`. Tested only against a fake server. |
| P0-D stage-dev | ✅ | `lib/flags.ts`, `components/stage/Stage.tsx` (+ `Wallpaper`, `useStageScale`), `components/Placeholder.tsx`, `components/PlaceholderToast.tsx`, `components/ConceptLabel.tsx`, `components/dev/DevPanel.tsx` (**not mounted yet**), `app/test/placeholder/page.tsx`. Not visually checked. |
| P0-E docs-reviewers | ✅ | `docs/RULES.md`, `REVIEW_FINDINGS.md`, all 20 `.claude/agents/*.md` |

**Token requests still open (P0-B owns `lib/tokens.ts` + `app/tokens.css`; check whether it already added them):**
`--stage-white #FFFFFF`, `--ios-bg #FFFFFF`, `--label-on-dark #FFFFFF`, `--ios-dark-elevated #1C1C1E`, `--ios-dark-grouped #2C2C2E`, `--ios-dark-fill #39393D`, `--ios-dark-separator rgba(84,84,88,0.65)`, `--ios-dark-label #FFFFFF`, `--ios-dark-label-2 rgba(235,235,245,0.6)`, `--ios-dark-label-3 rgba(235,235,245,0.3)`, `--shadow-sheet`, `--shadow-knob`, motion vars `--motion-press`/`--ease-ios`/`--ease-soft`/`--ease-breath`/`--dur-200`/`--dur-400`. Also remove the duplicate `--font-system` (defined in both `app/globals.css` and `app/tokens.css`; keep one).

**Other Phase 0 loose ends:**
- Mount `DevPanel` in `app/layout.tsx`: `<Suspense fallback={null}><DevPanel /></Suspense>`.
- `check-tokens` doesn't flag raw `ms` durations; DevPanel has a `200ms` literal → use the motion var.
- Spec conflict to tell Gurneal: the Un-Said toast follows App-UI-Final DESIGN_SPEC 2.7 (`un-surface-raised`, radius 16) instead of the plan's `un-surface`, and it sits top-center (App-UI-Final puts it at the bottom).
- COPY NEEDED (dev/test only): "Like" on the Facebook test tile; a11y labels (Search, Camera, Share, Favorite, Delete, Send); dev-panel labels. Log them in BUILD_LOG.

## 6. Phase 2 illustrations (started early because they're independent): PARTIAL
- P2-I2 (reels/screenshots/doodle): **done** `assets/images/reel-goldenhour-pups.svg`, `reel-rec-league.svg`, `reel-dormlife.svg` (goldenhour splash was being reworked; check it). **Not done:** `avatar-goldenhour/recleague/dormlife.svg`, `screenshot-1..3.svg`, `wa-doodle.svg`, and copying everything to `public/mock/` (folder doesn't exist yet).
- P2-I1 (people/places): **nothing saved.** Still needed: avatars (mom, dad, sarah, michael, riley, fam, roommates, marfa), `dal`, `sunrise-290`, `kitchen`, `lake`, `campus`, `dorm-desk`, `mom-video`, `mom-video-dad`, `riley-selfview`. Full briefs are in `docs/plans/Phase2_plan.md` (P2-I1/P2-I2 rows); style: polished editorial semi-flat SVG, consistent palette, South Asian family for Riley/Mom/Dad, no text/logos/real people, render-check each with Playwright in a temp dir.
- Illustrators must NOT edit `assets/README.md` (owned by tokens); add their rows afterwards.

## 7. Exactly what to do next (in order)
1. `git -C ~/Gurneal/HackTX branch --show-current` → `branched-frontend`.
2. Finish P0-B (tokens list above, consistency check, `assets/README.md`), mount DevPanel, fix the `200ms`, dedupe `--font-system`.
3. Phase 0 integration from inside `Branched-Frontend/`: `npm run sync:theme && npm run build && npm run lint && npm run check:tokens && npm run check:placeholders`, then `npm run shoot` (tokens + placeholder) at 1x and `--hi`. LOOK at `screenshots/test__tokens__default.png` and `test__placeholder__default.png` side by side with `public/unsaid-theme/unsaid-palette.png` and `public/test/branched-frontend-palette.png`.
4. Add BUILD_LOG entries: P0-A retire list ("BF-v2 retire", list in §5), P0-B/C/D/E summaries, the D6 MacBook note, COPY NEEDED items. Then first commit `branched-frontend: phase 0: workspace, scaffold, theme sync, tokens, rules, reviewers (pre-review)` and `git push -u origin branched-frontend`.
5. Run the 10 Haiku reviewers in parallel (natively if loaded, else general-purpose `model: haiku` with each file body as the prompt, plus the screenshot paths). Log every finding in `REVIEW_FINDINGS.md`, fix via Opus builders (owner per Phase0_plan §5), rerun all 10 until CLEAN in one round. Final commit `branched-frontend: phase 0: retire v1, workspace, theme sync, tokens, rules, reviewers` + push.
6. Phase 1 (`docs/plans/Phase1_plan.md`, 4 parallel packages: device core, fold, /device page, UnsaidLogo) → review loop → commit/push. Then Phase 2 (finish illustrations, Wave 1 data/stores + iOS chrome, Wave 2 seven app packages), Phase 3, 4, 5, 6 per their plans. `npm i remotion @remotion/player @remotion/cli` at the start of Phase 4.

## 8. Decisions in force (D1–D7, approved)
D1 branch on main ✅ done · D2 App-UI-Final via sync script 3-source lookup (git ref) · D3 single spec copy in `docs/` (+ one path line in each reviewer) · D4 the section 6 third-party skills/plugins are NOT installed (Gurneal installs `/plugin` ones himself; `git clone`/`npx skills add` only with his yes) · D5 Playwright Chromium installed ✅ · D6 builds run on this MacBook · D7 keep the existing Next 16.4.3 scaffold (Geist removed ✅).

## 9. Known gotchas
- Next 16.4.3: read `node_modules/next/dist/docs/` before Next APIs; `searchParams` are Promises; cacheComponents → Suspense around search-param readers; `LayoutProps` type exists only after a build/dev generates it.
- App-UI-Final's motion names clash with the phone's (`spring-banner` 300/30 vs 420/34): phone uses `lib/motion.ts` (section 4.4); App-UI-Final springs only inside splash/slot (`unMotion`).
- App-UI-Final's `FEATURE_IDS.md` tells Mudit to use `data-feature-id`; this build bans it.
- Running ~5 Opus agents at once hit the 5-hour session limit (reset 8 PM CT); check `get_usage` before big waves and resume stopped agents with SendMessage rather than restarting them.
- Parallel builders share one folder: only one agent should run `next build` at a time (the orchestrator).

---

## Appendix: Gurneal's original kickoff prompt (verbatim, same as docs/paste/START_HERE_paste_into_Claude_Code.txt)

```text
You're building the Un-Said demo frontend for HackTX (BF-v2). Read this whole message before you do anything.

WHAT YOU'RE BUILDING
This build is the phone, its apps and the opening animation. Un-Said itself is NOT built here.
- The phone: a white iPhone Duo (a book-style, dual-screen concept iPhone), folded and unfolded, drawn from scratch with Apple-level materials.
- On the phone: the iOS home screen across both displays, the iOS navigation shell (open, close, the app switcher, swiping between apps), and iOS notification banners.
- The apps, all working look-alikes on mock data:
  - WhatsApp: Mom's chat, missed calls, the Calls tab, and the incoming, voice and video call screens.
  - Messages: Sarah ❤️🤍.
  - Instagram: Michael (Best Friend)'s DMs and the Reels viewer.
  - Photos.
  - Facebook and Meta AI as shells.
  - A dev panel plus `?notify=` to fire any banner by hand.
- A fold/unfold control: a glass "Fold"/"Unfold" button on the stage below the phone, plus the `F` key.
  - It uses an Apple-quality spring (spring-unfold: stiffness 120, damping 22, mass 1.3), a smooth hinge, and a click at the detent.
  - It can be interrupted mid-move.
  - With reduced motion it falls back to a crossfade.
- The opening animation: a scripted, replayable storyboard at `/opening`. It runs on the real build, never on copies of the screens. It has Replay, `?t=` seeking and an MP4 render.
  1. The folded Duo.
  2. Mom's WhatsApp with "Seen".
  3. He types "love you too", then deletes it.
  4. Sarah's notification and his reply.
  5. Michael's notification and his reply.
  6. The Un-Said notification.
  7. The Apple-style unfold into the Un-Said splash.
- Un-Said is logo only. It appears as:
  - its home-screen icon
  - its notification icon
  - a launch splash: the icon plus the "Un-Said" wordmark on the gradient
  - `components/UnsaidSlot.tsx`
- `components/UnsaidSlot.tsx` is where Mudit's real app mounts later, through an iframe URL prop or env var. Until then it shows a polished, static placeholder Home in Gurneal's App-UI-Final theme.
  - The placeholder does nothing: no fake features, no fake recording, no AI text.
  - It can be swapped out in one line.

WORKSPACE RULE (outranks everything else)
- Branch: work ONLY on the git branch `branched-frontend`.
  - First run `git fetch origin`, then `git checkout branched-frontend` (or `git checkout -b branched-frontend` if it doesn't exist).
  - Run `git branch --show-current` before every commit.
  - Never commit to, merge into or push to main. Push only with `git push origin branched-frontend`.
- Folder: work ONLY inside the top-level folder `Branched-Frontend/` (hyphenated, so no path has a space).
  - The Next.js app, code, assets, logs, reviewers, reports and docs all live there.
  - Stage with `git add Branched-Frontend/` only.
- NEVER touch Mudit's work. Never create, edit, move or delete anything in `backend/`, in Mudit's Un-Said app, in `frontend/`, `ideas/` or any root file.
  - Mudit owns `backend/` and the real Un-Said app. You never build Un-Said's screens; his app plugs into UnsaidSlot.
- `App-UI-Final/` is the Un-Said theme source (tokens, icon, wordmark, UI reference, copy). It is READ-ONLY.
  - It sits at the repo root, or at `~/Desktop/Unsaid-Claude-Context/App-UI-Final/`.
  - A sync script copies what the build needs into `Branched-Frontend/`. Never edit App-UI-Final.
- Every design, name, palette and user-facing decision comes from Gurneal. The names are Riley, Mom, Dad, Sarah ❤️🤍 and Michael (Best Friend).

THE SPEC
- The full build spec (BF-v2) is `~/Desktop/Unsaid-Claude-Context/Branched-Frontend/CLAUDE_PROMPT.md`. Read it in full.
- Its `assets/`, `reference/` and `paste/` files sit next to it.
- Scaffold the Next.js app inside `Branched-Frontend/` first. Then copy in the spec, `GOAL_STATEMENT.txt`, `CONTEXT.md`, `assets/` and `reference/` (put the docs in `Branched-Frontend/docs/`).
- Never copy anything from a `private/` folder.
- The spec is the source of truth. Follow it phase by phase and stop for Gurneal's approval at the end of each phase:
  - Phase 0: retire the old v1 Un-Said leftovers, scaffold, theme sync from App-UI-Final, tokens, rules, reviewers.
  - Phase 1: the Duo and the fold control.
  - Phase 2: the Act 1 apps, banners, the Un-Said splash and the dev panel.
  - Phase 3: home, the shell, UnsaidSlot and the interactive unfold.
  - Phase 4: the opening timeline engine, beats B01–B26.
  - Phase 5: the Apple-style unfold, splash → slot, polish and the MP4.
  - Phase 6: the Facebook and Meta AI shells, the full click-through, and the final "ready for animation work" report.

HOW YOU WORK: PLAN WITH FABLE, BUILD WITH OPUS IN PARALLEL, REVIEW WITH HAIKU
1. Plan with Fable. Before each phase, use Fable to write that phase's plan to `Branched-Frontend/docs/plans/PhaseN_plan.md`.
   - The plan splits the phase into independent work packages (one per app, screen, component group or beat range) and lists each package's files.
   - It names a single owner for every shared file (tokens, mock data, the opening timeline, layout).
   - Show Gurneal the plan before building.
2. Build with Opus agents in parallel. Define Opus builder subagents in `Branched-Frontend/.claude/agents/` (front matter `model: opus`), for example `opus-builder-device`, `opus-builder-apps`, `opus-builder-shell` and `opus-builder-opening`.
   - Dispatch them in parallel, one per work package, with about 10 running at once.
   - Each builder sticks to its own files and follows spec section 4 (styling) and section 5 (quality bar) exactly.
   - Each builder reports which files it changed.
3. Review with Haiku. After every package and every change, run the 10 Haiku reviewers from spec section 9 in parallel.
   - Every issue, however small, gets logged in `REVIEW_FINDINGS.md`, fixed by an Opus builder and re-checked.
   - Repeat until all 10 report CLEAN in the same round, before Gurneal sees anything.
4. Log and push every change. After every change, add an entry to `Branched-Frontend/BUILD_LOG.md`, then commit and push to `branched-frontend`.

SCOPE: DEMO-ONLY
- This is NOT a production app. Build only what shows on screen in the HackTX demo. "Production quality" means how it LOOKS and MOVES, not production engineering.
- Skip these:
  - auth, a real backend and persistence
  - security hardening
  - tests beyond keeping `npm run build` green and the spec's Playwright checks
  - responsiveness and deployment
- Mock data, local state and hardcoding are fine. If something won't show up in the demo, skip it.

QUALITY BAR
- Nothing may look vibe-coded or like AI slop.
- The phone, the iOS chrome, the banners, the fold and the opening must look like Apple built them:
  - follow Apple's Human Interface Guidelines pixel for pixel
  - use springs, not linear easing
  - hold 60 fps
- The app look-alikes must pass as real WhatsApp, iMessage, Instagram, Photos, Facebook and Meta AI screenshots. They are look-alikes only: never use official logo files, icons or fonts.
- The Un-Said icon, splash and placeholder use only App-UI-Final's tokens. No handwriting fonts, no amber, no invented colors.
- Controls that would do something real outside the demo have a press state and show a small "concept only" toast. Nothing is dead to the touch.
- The only thing that plays on its own is `/opening`. Everything else moves only when touched.
- When the build is done, the frontend is ready for animation work.

Start now with Phase 0 from the spec. Fable writes the Phase 0 plan first.

```
