# Phase 0 plan: retire, workspace, scaffold, theme sync, tokens, rules, reviewers

**Spec:** `CLAUDE_PROMPT.md` BF-v2 (Desktop copy, 1382 lines), Phase 0 block + sections 0, 4, 5, 8, 9, 10.
**Planner:** Opus (Fable was out of usage credits; Gurneal approved Opus for this plan, Oct 24, 2026).
**Status:** DRAFT. Waiting for Gurneal's approval and answers to the open decisions below. Nothing is built yet.

---

## 1. Goal and acceptance

Goal: a clean, committed foundation that every later phase builds on. Nothing visual yet beyond `/test/tokens` and `/test/placeholder`.

Acceptance (spec Phase 0, adjusted for the open decisions):
1. `git branch --show-current` prints `branched-frontend`. Every commit is on that branch only. `git diff <base> --name-only` lists only `Branched-Frontend/` paths. The base is `main` if D1 is accepted, otherwise `origin/backend`.
2. `npm run sync:theme`, `build`, `lint`, `check:tokens` and `check:placeholders` all pass from inside `Branched-Frontend/`. App-UI-Final is unchanged: it is only read, never written.
3. `screenshots/test__tokens.png` and `screenshots/test__placeholder.png` exist at 1920x1080 and match `App-UI-Final/tokens/unsaid-palette.png` and `assets/palettes/branched-frontend-palette.png`.
4. `BUILD_LOG.md` (with a "BF-v2 retire" entry), `REVIEW_FINDINGS.md` and `docs/RULES.md` exist. There is no `lib/contract.ts` and no `data-feature-id` anywhere.
5. All 10 Haiku reviewers report CLEAN in the same round.
6. The final commit, `branched-frontend: phase 0: retire v1, workspace, theme sync, tokens, rules, reviewers`, is pushed to `origin branched-frontend` only.

---

## 2. What I verified (current state)

| Item | Finding |
|---|---|
| Repo | `~/Gurneal/HackTX`, remote `MuditUpadhyay04/HackTX` |
| Branch | Local `branched-frontend` = **fad6c78** ("backend finished", the tip of `origin/backend`). That is 1 commit ahead of `origin/main` (fd352fd) and has no commits of its own. **`origin/branched-frontend` doesn't exist yet.** |
| `Branched-Frontend/` | Untracked. It is a create-next-app scaffold from an earlier session: Next **16.4.3**, React 19.3.0, Tailwind 4 (`@tailwindcss/turbopack`, no postcss config), framer-motion ^14, sonner, zustand, clsx, @playwright/test, tsx. `node_modules` is installed. |
| App code | Only the default boilerplate: `app/page.tsx` (Vercel links), `app/layout.tsx` (**Geist from `next/font/google`**, which means a network fetch and a non-system font), `app/globals.css`, and `public/*.svg` (Next/Vercel logos). |
| BF-v1 leftovers | **None.** There is no `components/`, no `lib/`, no `scripts/`, no `lib/contract.ts`, no Un-Said screens. The only Step 0 removals are the asset files listed in P0-A. |
| Docs | `docs/CLAUDE_PROMPT.md`, `CONTEXT.md`, `GOAL_STATEMENT.txt` and `docs/paste/*` are **older** than the Desktop copies. `paste/Phase6` is missing. `assets/` READMEs, `wordmark.md` and `branched-tokens.json` also differ from the Desktop (newer). |
| `AGENTS.md` | Holds Next's "This is NOT the Next.js you know" block. **Every builder must read `node_modules/next/dist/docs/` before writing Next code.** |
| App-UI-Final | **Not in the working tree. Not at `~/Desktop/Unsaid-Claude-Context/App-UI-Final/`.** It exists only on **`origin/app-ui-final`** (4dadc1e, built on fad6c78): README, DESIGN_SPEC, COPY_AND_NAMES, FEATURE_IDS, FOR_MUDITS_CLAUDE, `tokens/{unsaid-tokens.json,.css,unsaid-palette.png}`, `assets/{brand/*,ui-reference/*,wordmark.md,README.md}` |
| Playwright | Chromium is not downloaded (`~/Library/Caches/ms-playwright` is empty) |
| Compute | Builds run on this MacBook. |

---

## 3. Open decisions for Gurneal (with my recommended default)

| # | Decision | Recommended default | Why |
|---|---|---|---|
| D1 | **Branch base.** `branched-frontend` currently sits on Mudit's "backend finished" commit, so `git diff main` would list `backend/` and `render.yaml`, which fails acceptance 1. | **Re-point it at `origin/main` before the first commit:** `git switch -C branched-frontend origin/main`. The untracked `Branched-Frontend/` carries over. Mudit's commit stays on `origin/backend`, untouched. | The spec says the branch is created from main. The branch has no commits to lose. **Side effect:** the local working copies of `backend/` and `render.yaml` switch to main's version. That's a checkout, not an edit, and nothing on origin changes. Alternative: keep the base and measure the diff against `origin/backend`. |
| D2 | **How the build reads App-UI-Final.** | **`scripts/sync-theme.ts` tries three sources in order:** (1) `../App-UI-Final`, (2) `~/Desktop/Unsaid-Claude-Context/App-UI-Final`, (3) the git ref `origin/app-ui-final`, read with `git show` / `git archive` into a temp dir. It never writes into App-UI-Final and never merges that branch. | Option 3 works today and needs nothing on `~/Desktop`. Merging `app-ui-final` would put `App-UI-Final/` paths in the branch diff, which breaks the workspace rule. |
| D3 | **Where the spec lives.** Your kickoff says `docs/`. The spec's Step 1 and the reviewer text say `Branched-Frontend/CLAUDE_PROMPT.md`. | **One copy, in `docs/`** (`docs/CLAUDE_PROMPT.md`, `docs/CONTEXT.md`, `docs/GOAL_STATEMENT.txt`, `docs/paste/*`), refreshed from the Desktop. Each reviewer file is written word for word, plus **one added line**: "The spec is at Branched-Frontend/docs/CLAUDE_PROMPT.md." | Two copies would drift. One added line is the smallest change to "word for word". |
| D4 | **Section 6 skill/plugin installs** (apple-hig clone + `./setup`, the apple-design-skill / ios-design-skills / liquid-glass plugins, `npx skills add …`) | **Not part of Phase 0.** You install the `/plugin …` ones yourself in an interactive `claude` terminal. I run the `git clone` / `npx skills add` ones only after you say yes. | They download and run third-party code. Phase 0 doesn't need them. They matter from Phase 1. |
| D5 | **`npx playwright install chromium`** (about 150 MB from Microsoft's CDN, into `~/Library/Caches/ms-playwright`) | **Yes.** | `shoot.ts` and acceptance 3 need it |
| D6 | **Where builds run** | **Every npm/build/shoot/test runs on this MacBook.** | Gurneal's instruction |
| D7 | **Keep the existing scaffold** (Next 16.4.3) instead of re-scaffolding | **Keep it.** Remove the Geist font + boilerplate. If Tailwind 4 isn't wired for `next build`, add `@tailwindcss/postcss` + `postcss.config.mjs` (no other new deps). | The spec's scaffold command is only for "if there's no package.json yet" |

---

## 4. Work packages

Phase 0 has 5 genuinely independent packages. Fewer than ~10 is honest here: the rest is sequential integration. For Phase 0, builders run as `general-purpose` agents with `model: opus` and the builder brief (section 7) inline, because the `.claude/agents/` files P0-E writes only load natively after a restart from inside `Branched-Frontend/`.

### Wave 0: orchestrator (me), sequential, after approval
1. Run D1: `git switch -C branched-frontend origin/main`, then `git branch --show-current`.
2. Refresh docs from `~/Desktop/Unsaid-Claude-Context/Branched-Frontend/`. Use `rsync -a --exclude .DS_Store --exclude private/` for `CLAUDE_PROMPT.md`, `CONTEXT.md` and `GOAL_STATEMENT.txt` into `docs/`, `paste/` into `docs/paste/`, and also `assets/` and `reference/`. Nothing from `private/`.
3. D5: `npx playwright install chromium`.
4. Create `BUILD_LOG.md` with its header and the first entries (branch, docs refresh). The Wave 0 commit and push (`git push -u origin branched-frontend`, which creates the remote branch) go after the integration build passes, never before.

### Wave 1: five Opus builders in parallel

| ID | Owner | Files (all under `Branched-Frontend/`) | Steps | Done when |
|---|---|---|---|---|
| **P0-A** | opus-builder-foundation | **delete:** `assets/ui-reference/`, `assets/palettes/tokens.json`, `assets/palettes/palette.md`, `public/{next,vercel,file,globe,window}.svg` · **edit:** `package.json`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `next.config.ts`, `README.md` · **create (if D7 needs it):** `postcss.config.mjs` | Step 0 retire (log each removal for the BUILD_LOG "BF-v2 retire" entry). Remove Geist and set the system stack (`-apple-system, "SF Pro Text", system-ui`, Inter last). Mount the sonner `<Toaster>` (from P0-D's `PlaceholderToast`) and `<ConceptLabel>` in the layout. `globals.css` imports `./unsaid-theme.css` then `./tokens.css`, with no default Tailwind palette use. `page.tsx` becomes a plain index linking `/scenes`, `/test/tokens` and `/test/placeholder`. npm scripts: `dev`, `build`, `lint`, `predev`/`prebuild` → `sync:theme`, `sync:theme`, `shoot`, `shoot:clean`, `check:tokens`, `check:placeholders`. `.gitignore`: `node_modules`, `.next`, `out/`, `screenshots/reference/`, `.env*`. README: a short "how to run". | `npm run build` passes with the stubs. No Geist / Google font fetch. No Vercel or Next art left. |
| **P0-B** | opus-builder-tokens | **create:** `scripts/sync-theme.ts`, `lib/unsaid-theme.json` (generated), `app/unsaid-theme.css` (generated), `public/unsaid-theme/brand/*` (generated), `public/brand/unsaid-app-icon.png`, `lib/tokens.ts`, `lib/motion.ts`, `app/tokens.css`, `app/test/tokens/page.tsx` · **edit:** `assets/README.md` | `sync-theme.ts` uses the D2 three-source lookup. It copies `unsaid-tokens.json` → `lib/unsaid-theme.json` (with a `"_generated"` header key), `unsaid-tokens.css` → `app/unsaid-theme.css` (with a header comment), and `assets/brand/*` → `public/unsaid-theme/brand/`. It prints which source it used and whether anything changed. If no source is found it warns and keeps the last copies (exit 0). It copies `assets/brand/unsaid-app-icon.png` → `public/brand/`. `lib/tokens.ts` imports `unsaid-theme.json` (as `un`) and `assets/palettes/branched-tokens.json` (look-alike + gradients + device), and adds the spacing (4/8 grid), radius, shadow, blur and iOS type scale (34/28/22/20/17/16/15/13/12/11 with line heights + weights; Meta 14/15/17). It exports typed objects. `app/tokens.css` holds the same values as CSS vars (`--wa-green`, `--ios-blue`, `--device-frame-base`, `--space-*`, `--radius-*`, `--type-*`…) plus a Tailwind `@theme` block mapping them. `lib/motion.ts` exports the section 4.4 springs (`springOpen`, `springOpenBanner`, `springClose`, `springSnapback`, `springBanner`, `springSend`, `springPullback`, `springUnfold`), the easings (`easeSoft`, `easeIos`, `easeBreath`), `caretBlink`, and reduced-motion durations (400 ms opening / 200 ms shell). App-UI-Final's own springs stay namespaced under `un.motion` (splash/slot only), because its `spring-banner` (300/30) is not the phone's `spring-banner` (420/34). `/test/tokens` is a fixed 1920x1080 page: every `un-*` color/gradient/shadow/type token on `un-bg`, and every look-alike palette on its own background, labeled with name + value. `assets/README.md`: add the "lands in" rows for every copy. | `npm run sync:theme` reports source (3) and writes the files. `/test/tokens` renders every token. No hex outside the token files. |
| **P0-C** | opus-builder-scripts | **create:** `lib/scenes.ts`, `scripts/check-tokens.ts`, `scripts/check-placeholders.ts`, `scripts/shoot.ts`, `app/scenes/page.tsx` | `lib/scenes.ts`: `type Scene = { id; route; query?; label; group; phase }` and `scenes: Scene[]`, seeded with `/test/tokens` and `/test/placeholder`. `check-tokens.ts` greps `components/` and `app/` (`.ts`, `.tsx`, `.css`) for hex colors, `rgb(` / `hsl(` and raw `px` (including Tailwind arbitrary `[12px]`). It allowlists `lib/tokens.ts`, `app/tokens.css`, `app/unsaid-theme.css` and `lib/unsaid-theme.json`, prints file:line and exits 1 on any hit. `check-placeholders.ts` (Playwright) crawls every scene and fails on: (a) a visible `button` / `a` / `[role=button]` with no `data-nav`, `data-placeholder` or real handler (the handler check uses a `data-action` marker the components set), (b) any `data-feature-id`, (c) any request leaving localhost, (d) any `data-placeholder` not matching `^(whatsapp\|messages\|instagram\|photos\|facebook\|meta-ai\|ios\|unsaid):[a-z0-9-]+$`. It writes `docs/PLACEHOLDERS.md`. `shoot.ts` (Playwright Chromium, 1920x1080, DSF 1, `--hi` for 2) waits for fonts + network idle. `--clean` adds `labels=off&badges=off&dev=off`. It saves `screenshots/<route>__<state>.png`. `/scenes` lists `lib/scenes.ts` grouped, as links. | Both checks run green on the Phase 0 pages. `shoot` writes the two test screenshots. |
| **P0-D** | opus-builder-stage-dev | **create:** `components/stage/Stage.tsx`, `components/Placeholder.tsx`, `components/PlaceholderToast.tsx`, `components/ConceptLabel.tsx`, `components/dev/DevPanel.tsx`, `lib/flags.ts`, `app/test/placeholder/page.tsx` | `Stage`: a fixed 1920x1080 artboard scaled to fit the window (transform only). Backgrounds: `black`, `un-stage`, `white`, and `wallpaper`, which is a static placeholder layer in Phase 0 built from the `ios-wallpaper` token (Phase 1 finishes it). `lib/flags.ts`: `useFlags()` reads `labels`, `badges`, `dev`, `clock`, `motion`, `frame` and `toasts` from the URL. `Placeholder`: `<Placeholder id="ios:search" platform="ios\|whatsapp\|messages\|instagram\|photos\|facebook\|meta-ai\|unsaid">`. It wraps one child, sets `data-placeholder`, applies the platform press state (scale 0.97 or 15% darken, under 100 ms, `easeIos`) and fires `toastConceptOnly(platform)`. `PlaceholderToast`: a sonner `<Toaster>` plus `toastConceptOnly`. The toast text is "concept only", 1.6 s, never stacked (dismiss before showing), styled per platform from tokens (`un-surface` for unsaid), hidden with `?toasts=off`. `ConceptLabel`: "concept mock · not affiliated with Apple or Meta", hidden with `?labels=off`. `DevPanel`: toggled with the backtick key or `?dev=1`; it floats outside the artboard and has sections for the scene jump list (from `lib/scenes.ts`), the clock (`HH:MM`, frozen), Notifications (empty, Phase 2), Replies (empty, Phase 6), Fold/Unfold (disabled stubs, Phase 1), reset, and the labels/badges toggles. Its controls carry `data-nav` or real handlers. `/test/placeholder`: one sample control per platform variant on that platform's background, plus the toast. | `/test/placeholder` shows every variant. Pressing one shows the press state and exactly one "concept only" toast. `check:placeholders` passes on it. |
| **P0-E** | opus-builder-docs-reviewers | **create:** `docs/RULES.md`, `REVIEW_FINDINGS.md`, `.claude/agents/{ios-hig,meta-style-slop,device-fold,threads-copy,nav-motion,opening-storyboard,workspace-placeholder,meta-apps,build-a11y,assets-slot}-reviewer.md`, `.claude/agents/opus-builder-{foundation,tokens,scripts,stage-dev,docs-reviewers,device,apps,shell,opening,fixer}.md` | `RULES.md` holds the 16 Phase 0 global rules word for word. `REVIEW_FINDINGS.md` holds the title + table header (ID, reviewer, severity, file/route, issue, fix, status OPEN/FIXED/VERIFIED). The 10 reviewer files are word for word from section 9, with HOW YOU WORK + REPORT FORMAT written out in full in each, plus the D3 path line. The builder agent files use the front matter `model: opus` and `tools: Read, Write, Edit, Bash, Grep, Glob`, with the body from section 7 of this plan and each builder's scope (device = Phase 1, apps = Phase 2 / 6, shell = Phase 3, opening = Phases 4-5, fixer = review findings). | The files exist. A diff of each reviewer file against section 9 shows only the D3 line. |

### Wave 2: integration (orchestrator)
`npm run sync:theme && npm run build && npm run lint && npm run check:tokens && npm run check:placeholders`, then `npm run shoot` for the two test pages. I look at both screenshots side by side with the palette PNGs. Failures go back to the owning builder, never fixed across ownership. Then I write the BUILD_LOG entries and run the first commit + `git push -u origin branched-frontend`.

### Wave 3: review loop (section 5 below)

---

## 5. Shared-file ownership (one owner each; anyone else asks the orchestrator)

| File | Owner |
|---|---|
| `package.json`, `package-lock.json`, `.gitignore`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs` | P0-A foundation |
| `app/layout.tsx`, `app/globals.css`, `app/page.tsx` | P0-A foundation |
| `lib/tokens.ts`, `lib/motion.ts`, `app/tokens.css`, `lib/unsaid-theme.json`, `app/unsaid-theme.css`, `public/unsaid-theme/**`, `public/brand/**`, `assets/README.md` | P0-B tokens |
| `lib/scenes.ts`, `scripts/**` (except `sync-theme.ts`), `docs/PLACEHOLDERS.md` | P0-C scripts |
| `lib/flags.ts`, `components/**` (Phase 0) | P0-D stage-dev |
| `docs/RULES.md`, `REVIEW_FINDINGS.md`, `.claude/agents/**` | P0-E docs-reviewers |
| `BUILD_LOG.md`, `docs/plans/**`, `docs/CLAUDE_PROMPT.md`, `docs/CONTEXT.md`, `docs/GOAL_STATEMENT.txt`, `docs/paste/**`, `reference/**`, all git operations | orchestrator |
| Later phases: `lib/mock/**` (apps), `lib/opening/**` (opening), `components/device/**` + `lib/device/**` (device), `components/shell/**` (shell) | named in each phase's plan |

**Interfaces fixed now so Wave 1 can run in parallel:**
- `@/lib/tokens`: `tokens.{color, gradient, device, space, radius, shadow, blur, type}` and `un` (the synced theme). The CSS var names are listed in P0-B.
- `@/lib/motion`: the names listed in P0-B. Each spring is `{ type: "spring", stiffness, damping, mass }`.
- `@/lib/scenes`: `scenes: Scene[]`.
- `@/lib/flags`: `useFlags(): { labels, badges, dev, clock, motion, frame, toasts }`.
- `@/components/Placeholder`: `Placeholder`. `@/components/PlaceholderToast`: `PlaceholderToaster` and `toastConceptOnly`. `@/components/ConceptLabel`. `@/components/stage/Stage`.

---

## 6. Review loop (rule 13)

1. The prerequisites are a green Wave 2 and the two screenshots in `screenshots/`.
2. I launch all 10 reviewers in parallel as `general-purpose` agents with `model: haiku`, each with its file body as the prompt (they aren't native until the restart).
3. Every finding, however small, goes into `REVIEW_FINDINGS.md` as `P0-R<round>-<n>` with status OPEN.
4. The owning Opus builder fixes it (status FIXED). I re-run the affected checks, then re-run **all 10** reviewers. A finding is VERIFIED when its reviewer no longer reports it.
5. This repeats until all 10 report CLEAN in one round. Every round gets a BUILD_LOG entry and a commit + push.

---

## 7. Builder brief (inline for Phase 0; it becomes the body of each `opus-builder-*.md`)

- WORKSPACE RULE: branch `branched-frontend` only, folder `Branched-Frontend/` only. Never touch `backend/`, `frontend/`, `ideas/`, App-UI-Final or root files. **Builders never run git**: the orchestrator commits.
- Edit only the files your package owns (section 5). If you need a change elsewhere, say so in your report.
- Read `node_modules/next/dist/docs/` for any Next API you use (Next 16.4.3 differs from your training data).
- Follow spec section 4 (styling: tokens only, no hex/px in components, system font stack, look-alikes only) and section 5 (the production quality bar and its banned tells) exactly. Demo-only scope: build what shows on screen, skip production engineering.
- Copy only from the spec / `COPY_AND_NAMES.md`. Missing copy goes in the report as COPY NEEDED, and a missing `un-*` token as THEME NEEDED. Never invent either.
- Report: the files created/edited/deleted, the commands run and their results, COPY NEEDED / THEME NEEDED items, and any open issue.

---

## 8. Commit and push protocol (rule 12)

```
git branch --show-current            # must print branched-frontend
git add Branched-Frontend/
git diff --cached --name-only | grep -v '^Branched-Frontend/'   # must print nothing
git commit -m "branched-frontend: <summary>"   # + Co-Authored-By trailer
git pull --rebase origin branched-frontend     # skipped on the very first push (remote branch doesn't exist yet)
git push origin branched-frontend              # the first push is: git push -u origin branched-frontend
```
No force-push, ever. The final Phase 0 commit is `branched-frontend: phase 0: retire v1, workspace, theme sync, tokens, rules, reviewers`.

---

## 9. Risks and foreseeable THEME NEEDED / COPY NEEDED items

- **Tailwind 4 wiring.** The scaffold uses `@tailwindcss/turbopack` with no postcss config. If `next build` doesn't pick it up, P0-A adds `@tailwindcss/postcss` (D7).
- **Default Tailwind look.** The scaffold page uses zinc/slate classes, which reviewer 2 flags. P0-A replaces the page and `globals.css` drops the default palette usage.
- **Motion name clash.** App-UI-Final's `spring-banner` / `spring-app-open` values differ from section 4.4. The phone uses section 4.4 (`lib/motion.ts`); App-UI-Final's springs are used only inside the splash/slot (`un.motion`).
- **`FEATURE_IDS.md` in App-UI-Final** tells Mudit's app to use `data-feature-id`. This build bans that attribute (section 8.1). The sync does not copy `FEATURE_IDS.md`, and `check:placeholders` fails on it.
- **Theme tokens.** Every token the spec names exists in App-UI-Final: `un-stage`, `un-bg`, `un-surface`, `un-violet` (#A890F6), `un-card-gradient`, `un-icon-gradient`, `un-shadow-hero`, `un-wordmark`. There's no `un-*` blur token, which is fine because the splash/slot don't need blur in Phase 0. **No THEME NEEDED so far.**
- **COPY NEEDED.** Nothing in Phase 0 needs new user-facing copy beyond the concept label and "concept only", both written in the spec.
- **Compute location.** Everything runs on this MacBook (D6).
- **The reviewers judge visuals from screenshots.** Haiku can only read PNGs via the Read tool, so each reviewer prompt includes the exact screenshot paths.
- **The 10 reviewers only load natively after a restart** from inside `Branched-Frontend/` (`cd Branched-Frontend && claude --add-dir ..`). Until then they run as general-purpose Haiku agents.

---

## 10. STOP report (end of Phase 0)

You get: `git branch --show-current`, `git diff <base> --name-only` (every path under `Branched-Frontend/`), the `Branched-Frontend/` tree at depth 2, what Step 0 removed, the screenshot paths, the BUILD_LOG entries and the REVIEW_FINDINGS summary, plus the reminder to restart Claude Code from inside `Branched-Frontend/` (`cd Branched-Frontend && claude --add-dir ..`, check with `/agents`). Phase 1 starts only when you say go.
