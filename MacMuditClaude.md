# Claude Code change log (Branched-Frontend)

Running log of every change Claude Code makes on the `branched-frontend` workstream (`Branched-Frontend/`). Times are America/Chicago (CDT). Newest entries are at the top. Updated after every message Gurneal sends to Claude Code.

## Current state

- **Device (Phase 1):** the iPhone Fold, drawn in CSS 3D, opens and closes with the Fold/Unfold pill or the F key (Shift+F jumps). The inner screen has no punch-hole and no crease (D11). The cover screen keeps its camera top-right. The stage is a studio off-white (D12). fold-check passes 26/26 at 60 fps. Not committed yet.
- **In progress:** the iOS home screen (wallpaper, status bar, widgets, iPhone layout on the cover and iPad-style layout on the inner screen per D8) and the smooth unfold (screen content visible on both halves while folding, with motion blur), plus the fake apps (WhatsApp thread + chat list, Messages, Instagram DMs, keyboard; then Photos, calls, Reels).
- **Meta icons:** official logo files for Facebook, Messenger, Instagram, WhatsApp and Threads are in `Branched-Frontend/assets/brand/meta/` (sources in its README; D9: used 1:1, never redrawn). Meta AI, Edits, Meta Horizon, WhatsApp Business, Meta Business Suite, Meta Ads Manager and Messenger Kids have no official file on the Brand Resource Center, so they stay plain grey tiles.
- **Open questions for Gurneal:** the fold spring (spec 120/22/1.3) settles in about 0.8 s, not "about 2 s", and its overshoot is about 0.5°, so the detent reads from the ripple only.

## Oct 24, 2026, 11:14 PM CDT

Downloaded the official Meta packs after accepting each page's terms: Facebook (337 KB), Messenger (1.4 MB), Instagram (35 MB), WhatsApp (10.6 MB), Threads (1.5 MB). The screen-ready SVG/PNG files (14 files) were copied unmodified into `assets/brand/meta/`, with 512 px copies in `public/brand/meta/`. The home-screen builder is composing them into iOS-style app icons.

## Oct 24, 2026, 11:08 PM CDT

Gurneal asked for this file, `MacMuditClaude.md` on `branched-frontend-context`, updated live with every chat message.

## Oct 24, 2026, 11:00 PM CDT

Gurneal approved accepting Meta's brand terms and downloading the official icon packs. Done so far: Messenger (`Messenger-Icon-Pack.zip`, 1.4 MB, SVG + PNG) and Facebook (`Facebook-Brand-Asset-Pack.zip`, 337 KB, PNG). Instagram, WhatsApp and Threads are next. Meta AI, Edits and Horizon have no brand page.

## Oct 24, 2026, 10:55 PM CDT

Gurneal asked whether the fake apps were built. They were not yet. Two builders started in parallel: one for the iOS home screen and the smooth unfold, one for the fake apps.

## Oct 24, 2026, 10:50 PM CDT

Gurneal: "get rid of that shitty ass background and start adding in the iOS", with the reference https://iphone-duo-tawny.vercel.app. Recorded as D12: the gradient stage is gone and `/device` defaults to a studio off-white. The screens get a real iOS wallpaper, home screen and apps. The unfold keeps the content visible with motion blur and lands sharp.

## Oct 24, 2026, 10:40 PM CDT

Gurneal: "the inner display has no Holepunch and remove the crease completely." Recorded as D11. Removed the inner punch-hole, the crease component, its tokens and its geometry. Review round 1 (10 reviewers) produced 19 findings, all fixed or answered with a reason in `REVIEW_FINDINGS.md`. The fixes include the reduced-motion crossfade, the fold-pill focus ring, device shadow tokens, tilt values back to spec, the shadow seam at the hinge, and a lit-screen wallpaper built from Gurneal's icon colors.

## Oct 24, 2026, 10:15 PM CDT

Resumed from the pause. The iPhone Fold device compiles. Fixed a hydration mismatch (rounded edge and spine sizes), softened the crease, added the `/device` test patterns, the `?debug=1` spec overlay and 17 device scenes. Production build, lint, token check, placeholder check and fold-check all pass. Sent Gurneal renders of the folded, 60°, 120°, flat and back views.
