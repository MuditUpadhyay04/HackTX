# Phase 4 plan: the opening timeline engine (beats B01–B26)

**Planner:** Opus (Fable out of credits). **Spec:** `docs/CLAUDE_PROMPT.md` Phase 4 block (engine, driven mode, Remotion composition, /opening, beat table, acceptance). Rule: the opening DRIVES the real build; it never re-implements a screen.

## Install (orchestrator, before Wave 1)
`npm i remotion @remotion/player @remotion/cli` (same major for all three). The Remotion Claude plugin is not installed (D4); builders use the local `remotion-best-practices` skill guidance instead.

## Packages (Wave 1 parallel; Wave 2 = P4-D after integration)
| ID | Owner | Files | What |
|---|---|---|---|
| P4-A | opus-builder-opening (engine) | `lib/opening/{beats,getOpeningFrame,jitter,types}.ts` | The beat table B01–B28 as data (B27–B28 placeholders filled in Phase 5). `getOpeningFrame(t)` → pure frame description (camera, device, shell, threads typed/keyboard/seen/receipts/typing, banner {app,y,pressed}, overlay {coldOpen, splash, slot}) built on remotion `interpolate()`/`spring()` with the section 4.4 configs; deterministic jitter table for B16; B10 accelerating delete (130/70/45 ms); `?cold=off` offset; `sceneStart(scene)` for `?scene=`. |
| P4-B | opus-builder-opening (driven mode) | `lib/opening/drive.ts`, `lib/driven.ts` + the minimal driven hooks in the owners' files, requested through the orchestrator: `lib/store/messaging.ts` (`applyThreadFrame`), `lib/store/banners.ts` (`setBannerFrame`), `lib/store/shell.ts` (`setDrivenProgress`), `lib/device/fold.ts` (`setDrivenAngle`), `lib/mock/clock.ts` (`setDriven`) | `driven` flag (always on inside the opening, also `?clock=frozen`): springs are bypassed and each subsystem takes its progress/state from the frame. `applyFrame(frame)` sets every store idempotently (seeking backwards re-derives from t). Typing goes through the same store text the keyboard writes. |
| P4-C | opus-builder-opening (stage + player) | `components/opening/{OpeningStage,ColdOpenCard,Camera,PlayerControls}.tsx`, `remotion/{Root,index}.tsx`, `app/opening/page.tsx` | `OpeningStage` renders the real PhoneScene/shell/IPhoneDuo/BannerHost under a camera transform and calls `applyFrame(getOpeningFrame(t))` per frame. Remotion composition "Opening" 1920×1080, 60 fps, 2280 frames. `/opening`: `@remotion/player`, Replay, Play/Pause (space), scrubber with beat ticks + labels, current t, `?t=`, `?autoplay=1`, `?loop=1`, `?scene=`, `?cold=off`, clean flags. Reduced motion: camera still, 400 ms crossfades. |
| P4-D | opus-builder-opening (check) | `scripts/opening-check.ts`, `lib/scenes.ts` (opening scenes) | frameStats p95 < 20 ms over a full run; the 21 determinism timestamps screenshotted twice → pixel-identical pairs; Replay resets stores; grep guard: no thread/banner/device markup in `components/opening/`. |

## Integration + review
build/lint/checks; opening-check; LOOK at every checklist frame side by side with the matching static `?state=`; 10 reviewers (opening-storyboard-reviewer included) until CLEAN; commit `branched-frontend: phase 4: opening engine, driven mode, beats B01-B26` + push.
