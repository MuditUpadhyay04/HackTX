# Un-Said context hub

This branch is the shared context hub for Un-Said (HackTX 2026). It holds markdown only. Its job is so Gurneal, Mudit, and any AI session (Claude Code, Grok Bot) can read the current state of every workstream in one place.

## Workstreams

- `unsaid-overhaul` is the Un-Said app, built only by Grok Bot.
- `branched-frontend` is everything except the Un-Said app, built by Claude Code.
- `main` — Mudit's backend in `backend/`, the Expo app in `mobile/`, and Gurneal's design handoff in `design/`.

## Ownership

Gurneal owns all design, naming, palette, and copy. Mudit owns `backend/`. The name is always written "Un-Said".

## Files

- [`grok.md`](grok.md) — running log of Grok Bot's changes. Updated after every message Gurneal sends to Grok Bot.
- [`OVERHAUL_STATUS.md`](OVERHAUL_STATUS.md) — mirror of the `unsaid-overhaul` status.
- [`MacMuditClaude.md`](MacMuditClaude.md) — running log of Claude Code's changes on `branched-frontend`. Updated after every message Gurneal sends to Claude Code.

## What belongs here

Markdown files only. No code, images, or other file types.
