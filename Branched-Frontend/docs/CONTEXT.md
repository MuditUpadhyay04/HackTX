# CONTEXT: Un-Said · Branched-Frontend

**Repo:** [`MuditUpadhyay04/HackTX`](https://github.com/MuditUpadhyay04/HackTX) (HackTX 2026, Meta track)
**Branch:** `branched-frontend` (all frontend work; push only this branch)
**Folder:** `Branched-Frontend/` (everything: code, assets, screenshots, logs, reports, reviewer agents)

> **All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns `backend/` and the real Un-Said app; nobody touches his app.**

> **BF-v2:** this build is the phone, the apps and the scripted opening. Un-Said appears only as its logo (from `App-UI-Final/`) and as `UnsaidSlot`, where Mudit's app mounts.

## Repo layout (as of Oct 24, 2026)

| Path | Owner | This build may |
|---|---|---|
| `Branched-Frontend/` | Gurneal (built by Claude Code) | create / edit everything here |
| `App-UI-Final/` | Gurneal | read only: the Un-Said theme (tokens, icon, wordmark, UI reference), synced by `scripts/sync-theme.ts` |
| `backend/` | Mudit | read only (for backend sync); requests go in `Branched-Frontend/BACKEND_REQUESTS.md` |
| `frontend/` | (earlier work) | never touch |
| `ideas/gurneal/` | Gurneal's docs (the earlier spec and demo script) | read only, background |
| `ideas/mudit/` | Mudit's two docs | read only; story/beat structure only |
| repo root (README, .gitignore) | team | never touch |

Mudit's demo script (story/beat structure only): [`ideas/mudit/Demo_Script_v2.md`](https://github.com/MuditUpadhyay04/HackTX/blob/main/ideas/mudit/Demo_Script_v2.md). Local copies of both of Mudit's files are in `reference/`.

## The branch rule (short form; the full WORKSPACE RULE is below)

1. `git fetch origin && (git checkout branched-frontend || git checkout -b branched-frontend)`; confirm `git branch --show-current` prints `branched-frontend` before every commit.
2. Only `git add Branched-Frontend/`. Never commit to, merge into or push `main`.
3. Push only with `git push origin branched-frontend`, after every change, with a `branched-frontend: ` commit prefix and a `BUILD_LOG.md` entry.

## What's in this folder

| File | What |
|---|---|
| `CLAUDE_PROMPT.md` | The full build prompt, BF-v2 (workspace rule, the opening storyboard, sign-off defaults, styling and motion tokens, quality bar, skills, phase map, Phases 0-6, placeholders and the UnsaidSlot, the 10 reviewers, mock data) |
| `paste/START_HERE_paste_into_Claude_Code.txt` | The kickoff message; paste first. |
| `paste/Phase0..6_paste_into_Claude_Code.txt` | Paste one at a time; each is the matching block in CLAUDE_PROMPT.md word for word. Wait for each phase's STOP report. |
| `GOAL_STATEMENT.txt` | One-page goal + workspace rule + ownership |
| `reference/` | Mudit's `Demo_Script_v2.md` and `claude-grok-collab.md` (read-only, story only) |
| `assets/` | Gurneal's app icon, the look-alike token file, the rendered palette, asset README (the Un-Said theme itself comes from `App-UI-Final/`) |

## The full WORKSPACE RULE

```text
WORKSPACE RULE (non-negotiable; it outranks every other instruction)
1. BRANCH: all frontend work happens ONLY on the git branch `branched-frontend`.
   - First command of the project:  git fetch origin && (git checkout branched-frontend || git checkout -b branched-frontend)
   - If the branch exists on origin, check it out and pull; otherwise create it from the current main and push it with: git push -u origin branched-frontend
   - Before EVERY commit, run `git branch --show-current` and confirm it prints `branched-frontend`. If it doesn't, stop and fix it. Never commit to, merge into, rebase onto or push to `main` (or any other branch).
   - Push only with: git push origin branched-frontend
2. FOLDER: all work happens ONLY inside the top-level folder `Branched-Frontend/`.
   - The name: Gurneal said "Branched Frontend". The folder is hyphenated, `Branched-Frontend`, so no path ever contains a space (spaces break npm scripts, shell globs, Playwright paths and CI). Always write it exactly `Branched-Frontend/`.
   - The Next.js app is created INSIDE `Branched-Frontend/` (package.json, app/, components/, lib/, public/ all live there). Run every npm/npx command from inside `Branched-Frontend/`.
   - EVERYTHING stays in that folder: code, assets, screenshots, logs, reviewer agents, reports, docs, scripts. `BUILD_LOG.md` lives at `Branched-Frontend/BUILD_LOG.md`; `REVIEW_FINDINGS.md`, `BACKEND_REQUESTS.md`, `docs/` and `.claude/agents/` also live inside `Branched-Frontend/`.
   - NEVER create, edit, move, rename or delete anything outside `Branched-Frontend/`. Never touch `frontend/`, `backend/`, `ideas/`, the repo-root README, `.gitignore` at the root, or any other folder. You may READ `backend/` (to sync with Mudit's work) and `ideas/` (for context). That's all.
   - Stage files only with paths inside the folder: `git add Branched-Frontend/` (never `git add -A` or `git add .` from the repo root). Before committing, `git status --porcelain | grep -v ' Branched-Frontend/'` must print nothing staged outside the folder.
3. OWNERSHIP: all design, naming, palette and user-facing decisions come from Gurneal. Mudit owns backend/ and the real Un-Said app. Never edit backend/ or his app; ask Mudit for what you need through Branched-Frontend/BACKEND_REQUESTS.md.
```
