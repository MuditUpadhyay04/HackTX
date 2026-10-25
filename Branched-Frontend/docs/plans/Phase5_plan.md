# Phase 5 plan: the Apple-style unfold (B27), splash → slot (B28), polish, the MP4

**Planner:** Opus (Fable out of credits). **Spec:** `docs/CLAUDE_PROMPT.md` Phase 5 block.

## Packages
| ID | Wave | Owner | Files | What |
|---|---|---|---|---|
| P5-A | 1 | opus-builder-opening (unfold) | `lib/opening/beats.ts`, `lib/opening/getOpeningFrame.ts` | B27: banner → app card (31.60–32.00, radius 24→52, un-card-gradient, icon fades in), then `openAngle` 0→180 through `deviceTransform` with remotion `spring()` = springUnfold from 32.00; camera eases back to scale 1 (ease-breath); hinge ripple at ~178°; crease fades in only near flat. B28: UnsaidSplash ready holds 900 ms then 200 ms ease-soft crossfade to the UnsaidSlot placeholder (render ignores `?unsaid=`); still from 35.00. Reduced motion: 400 ms crossfade folded card → unfolded splash. `?scene=unfold` starts at B26, `?scene=launch` at B28. |
| P5-B | 1 | opus-builder-opening (render) | `scripts/record-opening.ts`, `remotion.config.ts`, `package.json` scripts `render:opening`, `record:opening` (requested via orchestrator) | `npx remotion render Opening out/opening.mp4 --codec=h264 --crf=16`; ffprobe check; Playwright recordVideo backup → `out/opening-screen.webm`. |
| P5-C | 2 | opus-builder-opening (polish) | `scripts/opening-check.ts` (extended checklist: 29 timestamps, 1x+2x, twice), fixes assigned by the orchestrator | Frame checklist, holds still (B06, B09, B11, end of B24), opening frame == static state pixels, fold-control unfold == opening unfold strip at 30/60/90/120/150. Timing changes are proposed in BUILD_LOG, never applied without Gurneal. |

## Integration + review
build/lint/checks; opening-check; render + record; ffprobe; watch the MP4; 10 reviewers until CLEAN; commit `branched-frontend: phase 5: unfold, splash to slot, polish, render` + push (MP4/webm not committed).
