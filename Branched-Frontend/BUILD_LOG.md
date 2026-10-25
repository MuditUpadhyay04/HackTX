# Un-Said Branched-Frontend build log

Times are America/Chicago. Newest entries at the bottom. Each entry: what changed, files, why, screenshots.

## 2026-10-24 19:05 CDT · Phase 0 plan
- `docs/plans/Phase0_plan.md` written by Opus (Fable was out of usage credits; Gurneal approved Opus). Gurneal approved the recommended defaults D1–D7 and said to build every phase without stopping.
- Compute: every build runs on this MacBook (D6).

## 2026-10-24 19:20 CDT · Phase 0 Wave 0 (workspace)
- D1: `git switch -C branched-frontend origin/main` (the branch had no commits of its own; it pointed at fad6c78 on origin/backend). Upstream unset so nothing ever pushes to main; first push will be `git push -u origin branched-frontend`.
- Docs refreshed from `~/Desktop/Unsaid-Claude-Context/Branched-Frontend/` (newer than the earlier scaffold's copies): `docs/CLAUDE_PROMPT.md`, `docs/CONTEXT.md`, `docs/GOAL_STATEMENT.txt`, `docs/paste/*` (now incl. Phase6), `assets/`, `reference/`. Nothing from `private/`.
- D5: `npx playwright install chromium` (Chrome Headless Shell 156, ~99 MB, into ~/Library/Caches/ms-playwright).
- `docs/plans/BUILDER_BRIEF.md`: the shared Opus builder brief.
- Theme sync (rule 11): App-UI-Final is read from `origin/app-ui-final` (4dadc1e) per D2.

## 2026-10-24 20:55 CDT · Phase 0 packages P0-A…P0-E (pre-review)
- **P0-A foundation · BF-v2 retire.** Moved to macOS Trash (recoverable): `assets/ui-reference/`, `assets/palettes/tokens.json`, `assets/palettes/palette.md`, `public/{next,vercel,file,globe,window}.svg`, `app/favicon.ico`. Added `package.json` scripts (`sync:theme`, `predev`/`prebuild`, `shoot`, `shoot:clean`, `check:tokens`, `check:placeholders`), `.gitignore`, `app/layout.tsx` (Geist removed, system font; mounts `ConceptLabel`, `PlaceholderToaster`, `DevPanel`, each in `<Suspense>` because Next 16.4.3 runs with cacheComponents on), `app/globals.css`, `app/page.tsx` (dev index), `README.md`. Tailwind 4 runs through `@tailwindcss/turbopack`.
- **P0-B tokens.** `scripts/sync-theme.ts` (App-UI-Final lookup: `../App-UI-Final`, then `~/Desktop/Unsaid-Claude-Context/App-UI-Final`, then `git archive origin/app-ui-final`), generated `lib/unsaid-theme.json`, `app/unsaid-theme.css`, `public/unsaid-theme/**`; `lib/tokens.ts`, `lib/motion.ts`, `app/tokens.css`, `app/test/tokens/page.tsx`. Added the requested tokens (`--stage-white`, `--ios-bg`, `--label-on-dark`, the `--ios-dark-*` set, `--shadow-sheet`, `--shadow-knob`, `--motion-*`, `--ease-ios/soft/breath`, `--dur-200/400`). `--font-system` now lives only in `app/tokens.css` (duplicate in `globals.css` removed). TS↔CSS consistency check: 159/159 color, gradient, space, radius, shadow and blur values match; every motion duration and easing matches. `assets/README.md` gained rows for the reels and the synced theme.
- **P0-C scripts.** `lib/scenes.ts`, `scripts/check-tokens.ts` (escape hatch: `@token-source` on line 1), `scripts/check-placeholders.ts` (writes `docs/PLACEHOLDERS.md`), `scripts/shoot.ts` (`--clean`, `--hi`, `--only`), `scripts/lib/server.ts`, `app/scenes/page.tsx`.
- **P0-D stage-dev.** `lib/flags.ts`, `components/stage/Stage.tsx` (+ `Wallpaper`, `useStageScale`), `components/Placeholder.tsx`, `components/PlaceholderToast.tsx`, `components/ConceptLabel.tsx`, `components/dev/DevPanel.tsx` (press transition uses `var(--motion-press) var(--ease-ios)`, no raw ms), `app/test/placeholder/page.tsx`.
- **P0-E docs-reviewers.** `docs/RULES.md` (16 rules + D1–D7), `REVIEW_FINDINGS.md`, the 10 Haiku reviewers and 10 Opus builders in `.claude/agents/`.
- **Phase 2 started early (independent):** `assets/images/reel-goldenhour-pups.svg`, `reel-rec-league.svg`, `reel-dormlife.svg`.
- **D6:** every build, lint, check and screenshot ran on this MacBook.
- **Integration:** `sync:theme` (up to date) → `next build` ✓ (5 routes) → `lint` ✓ → `check:tokens` OK (13 files) → `check:placeholders` OK (9 placeholder ids, 0 unmarked controls, 0 external requests, 0 console errors) → `shoot` and `shoot --hi`.
- **Screenshots:** `screenshots/test__tokens__default.png` (+`@2x`), `screenshots/test__placeholder__default.png` (+`@2x`). Checked against `public/unsaid-theme/unsaid-palette.png` and `public/test/branched-frontend-palette.png`: Un-Said swatches match value for value.
- **For Gurneal (spec conflict):** the Un-Said "concept only" toast follows App-UI-Final DESIGN_SPEC 2.7 (`un-surface-raised`, radius 16) rather than the plan's `un-surface`, and sits top-center where App-UI-Final puts it at the bottom.
- **COPY NEEDED (dev/test only, placeholder text in use):** "Like" on the Facebook test tile; a11y labels Search, Camera, Share, Favorite, Delete, Send; dev-panel labels.

## 2026-10-24 21:10 CDT · Compute note scrubbed (Gurneal)
- Per Gurneal: all builds run on this MacBook only, and no file names any other machine. Removed every such mention from `BUILD_LOG.md`, `docs/RULES.md` (D6 now reads "Every npm/build/shoot/test runs on this MacBook"; D2 note reworded), `docs/plans/Phase0_plan.md` and `docs/HANDOFF.md`.

## 2026-10-24 21:40 CDT · Decision D8: unfolded home screen (Gurneal)
- Gurneal sent a reference photo of an unfolded foldable home screen: "this is what should show when opened but max amount of meta apps" and "it should be a flat view of the phone". Recorded as D8 in `docs/RULES.md` and at the top of `docs/plans/Phase3_plan.md`: flat straight-on unfolded Duo; one continuous iPadOS-style home across both displays; widgets top-left, dense grid, vertical dock on the right, search bottom-right, page dots bottom-center; as many Meta look-alike apps as fit. The photo is kept locally at `screenshots/reference/unfolded-home-gurneal.webp` (gitignored; real-device screenshot, comparison only).

## 2026-10-24 21:50 CDT · Decision D9: official Meta logos, fewer Apple apps (Gurneal)
- Gurneal: use the official Meta logos (the project is for Meta's track), and no Safari, Camera or Settings. Recorded as D9 in `docs/RULES.md`; D8 updated (Apple apps: Messages, Photos, Phone only). Meta artwork will come from Meta's own brand resources into `assets/brand/meta/` (each file listed with its source in `assets/README.md`) when the icons are built in Phase 2/3.
- D9 tightened (Gurneal: "make sure the logos are 1:1"): Meta icons are the exact official files, unmodified (only uniform scale + the iOS squircle mask); never redrawn or approximated; each checked side by side with its source at 2x. Reviewers `assets-slot`, `meta-style-slop` and `meta-apps` got a D9 line: official Meta logos are allowed, anything not identical to source is a finding.

## 2026-10-24 22:30 CDT · Decision D10: the device is the iPhone Fold (Gurneal)
- First /device render (P1-A, two iPhone panels + white hinge per the spec) shown to Gurneal; rejected ("I WANT THE REAL PHONE"). He sent a reference of the iPhone Fold concept (folded short-wide cover screen; unfolded one seamless landscape inner screen; punch-hole top-right; titanium frame; thin black bezel). Recorded as D10 in `docs/RULES.md`; reference kept locally at `screenshots/reference/iphone-fold-gurneal.webp` (gitignored). The device core is being rebuilt to D10; P1-B (fold spring/control) and P1-D (logo) carry over.

## 2026-10-24 22:55 CDT · Phase 0 review rounds 1-3 (fixes)
- Round 1: 13 findings (P0-R1-*), round 2: 15 (P0-R2-*), round 3: 17 (P0-R3-*); all FIXED or decided (WONTFIX with reason / DEFERRED-P1) in `REVIEW_FINDINGS.md`. Highlights: `--material-light` to spec `#F5F5F5`; HANDOFF + Grok chat log untracked and gitignored; Un-Said tiles and "Preview letter" copy removed from /test/placeholder; DevPanel focus ring, reduced-motion switch, Device section only where a device is mounted; concept-only toast reduced-motion crossfade, bottom-center for Un-Said (Gurneal), subheadline-semibold font fix, `durations.conceptOnly`; stricter `check:tokens` (bare numeric sizes, `${n}px`, numeric size defaults) and every test-page size moved to `size` tokens; host glyphs redrawn to each app's own shapes with matched optical weight; Meta AI send 44 pt target; tab title "concept mock", no Un-Said favicon; `ios-wallpaper` built from the synced `un-icon-*` colors; off-grid iOS radii/spacing documented as spec geometry; `assets/icons/README.md` aligned with D9.
- Gurneal decisions logged this round: D8 (unfolded home layout), D9 (official Meta icons 1:1; no Safari/Camera/Settings), D10 (the device is the iPhone Fold). Reviewer files `assets-slot`, `meta-apps`, `meta-style-slop` carry a D9 line.
- Device files (`components/device/**`, `lib/device/**`, `app/device/**`, `components/unsaid/**`, `lib/squircle.ts`, `scripts/fold-check.ts`) are Phase 1 work in progress (D10 rebuild) and are not in this commit.
- Screenshots are re-shot after the D10 device compiles (the full `next build` type-checks it); then round 4.
