# Un-Said Branched-Frontend build log

Times are America/Chicago. Newest entries at the bottom. Each entry: what changed, files, why, screenshots.

## 2026-10-24 19:05 CDT · Phase 0 plan
- `docs/plans/Phase0_plan.md` written by Opus (Fable was out of usage credits; Gurneal approved Opus). Gurneal approved the recommended defaults D1–D7 and said to build every phase without stopping.
- Compute: the Mac mini (`ssh mini`) timed out, so builds run on the MacBook (D6). Will switch back when it answers.

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
- **D6:** the mini still times out on `ssh mini` (re-checked 20:40 CDT); every build, lint, check and screenshot ran on the MacBook.
- **Integration:** `sync:theme` (up to date) → `next build` ✓ (5 routes) → `lint` ✓ → `check:tokens` OK (13 files) → `check:placeholders` OK (9 placeholder ids, 0 unmarked controls, 0 external requests, 0 console errors) → `shoot` and `shoot --hi`.
- **Screenshots:** `screenshots/test__tokens__default.png` (+`@2x`), `screenshots/test__placeholder__default.png` (+`@2x`). Checked against `public/unsaid-theme/unsaid-palette.png` and `public/test/branched-frontend-palette.png`: Un-Said swatches match value for value.
- **For Gurneal (spec conflict):** the Un-Said "concept only" toast follows App-UI-Final DESIGN_SPEC 2.7 (`un-surface-raised`, radius 16) rather than the plan's `un-surface`, and sits top-center where App-UI-Final puts it at the bottom.
- **COPY NEEDED (dev/test only, placeholder text in use):** "Like" on the Facebook test tile; a11y labels Search, Camera, Share, Favorite, Delete, Send; dev-panel labels.
