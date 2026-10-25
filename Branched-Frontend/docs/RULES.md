# Branched-Frontend global rules (Phase 0, Step 3)

Source: `docs/CLAUDE_PROMPT.md`, Phase 0 block (WORKSPACE RULE and STEP 3), copied word for word.

```text
WORKSPACE RULE (non-negotiable; it outranks every other instruction)
1. BRANCH: all frontend work happens ONLY on the git branch `branched-frontend`. First command: git fetch origin && (git checkout branched-frontend || git checkout -b branched-frontend). If you created it, push it once with git push -u origin branched-frontend. Before EVERY commit run git branch --show-current and confirm `branched-frontend`. Never commit to, merge into, rebase onto or push to main or any other branch. Push only with: git push origin branched-frontend.
2. FOLDER: all work happens ONLY inside the top-level folder `Branched-Frontend/` (Gurneal said "Branched Frontend"; it is hyphenated so no path contains a space). The Next.js app lives INSIDE it. Everything stays in that folder: code, assets, screenshots, logs (Branched-Frontend/BUILD_LOG.md), reviewer agents (Branched-Frontend/.claude/agents/), reports, docs, scripts. Never create, edit, move or delete anything outside it. Never touch frontend/, backend/, App-UI-Final/, ideas/, Mudit's Un-Said app, the root README or the root .gitignore. You may READ App-UI-Final/ (the Un-Said theme source), backend/ and ideas/. Stage with `git add Branched-Frontend/` only (never `git add -A` / `git add .` from the root); before committing, `git diff --cached --name-only | grep -v '^Branched-Frontend/'` must print nothing.
3. OWNERSHIP: All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app. Never edit backend/, App-UI-Final/ or Mudit's app. The Un-Said app is NOT built here; it mounts later in components/UnsaidSlot.tsx.
```

## Global rules (STEP 3)

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

## Decisions (Oct 24, 2026, Gurneal)

Approved defaults from `docs/plans/Phase0_plan.md` section 3.

| # | Decision | Recommended default | Why |
|---|---|---|---|
| D1 | **Branch base.** `branched-frontend` currently sits on Mudit's "backend finished" commit, so `git diff main` would list `backend/` and `render.yaml`, which fails acceptance 1. | **Re-point it at `origin/main` before the first commit:** `git switch -C branched-frontend origin/main`. The untracked `Branched-Frontend/` carries over. Mudit's commit stays on `origin/backend`, untouched. | The spec says the branch is created from main. The branch has no commits to lose. **Side effect:** the local working copies of `backend/` and `render.yaml` switch to main's version. That's a checkout, not an edit, and nothing on origin changes. Alternative: keep the base and measure the diff against `origin/backend`. |
| D2 | **How the build reads App-UI-Final.** | **`scripts/sync-theme.ts` tries three sources in order:** (1) `../App-UI-Final`, (2) `~/Desktop/Unsaid-Claude-Context/App-UI-Final`, (3) the git ref `origin/app-ui-final`, read with `git show` / `git archive` into a temp dir. It never writes into App-UI-Final and never merges that branch. | Option 3 works today and also works on the mini, which mounts `~/Gurneal` but not `~/Desktop`. Merging `app-ui-final` would put `App-UI-Final/` paths in the branch diff, which breaks the workspace rule. |
| D3 | **Where the spec lives.** Your kickoff says `docs/`. The spec's Step 1 and the reviewer text say `Branched-Frontend/CLAUDE_PROMPT.md`. | **One copy, in `docs/`** (`docs/CLAUDE_PROMPT.md`, `docs/CONTEXT.md`, `docs/GOAL_STATEMENT.txt`, `docs/paste/*`), refreshed from the Desktop. Each reviewer file is written word for word, plus **one added line**: "The spec is at Branched-Frontend/docs/CLAUDE_PROMPT.md." | Two copies would drift. One added line is the smallest change to "word for word". |
| D4 | **Section 6 skill/plugin installs** (apple-hig clone + `./setup`, the apple-design-skill / ios-design-skills / liquid-glass plugins, `npx skills add …`) | **Not part of Phase 0.** You install the `/plugin …` ones yourself in an interactive `claude` terminal. I run the `git clone` / `npx skills add` ones only after you say yes. | They download and run third-party code. Phase 0 doesn't need them. They matter from Phase 1. |
| D5 | **`npx playwright install chromium`** (about 150 MB from Microsoft's CDN, into `~/Library/Caches/ms-playwright`) | **Yes.** | `shoot.ts` and acceptance 3 need it |
| D6 | **The mini is down** | **Run npm/build/shoot on this MacBook for Phase 0** and note it in BUILD_LOG. Switch back to `ssh mini …` as soon as it answers. | Your CLAUDE.md allows this ("ONLY if the mini is down, and say so") |
| D7 | **Keep the existing scaffold** (Next 16.4.3) instead of re-scaffolding | **Keep it.** Remove the Geist font + boilerplate. If Tailwind 4 isn't wired for `next build`, add `@tailwindcss/postcss` + `postcss.config.mjs` (no other new deps). | The spec's scaffold command is only for "if there's no package.json yet" |

Phase gates: Gurneal said on Oct 24 to build all phases without stopping; each phase still ends with its review loop and a report in BUILD_LOG.md.
