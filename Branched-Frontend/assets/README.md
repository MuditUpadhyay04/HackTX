# Branched-Frontend/assets/ (graphics, palettes and brand files for this build)

Repo home: **`Branched-Frontend/assets/`** on branch `branched-frontend`. All paths below are relative to `Branched-Frontend/`. Nothing in this build lives outside `Branched-Frontend/`.

**All design, naming, palette and user-facing decisions come from Gurneal. Mudit owns `backend/` and the real Un-Said app.**

**BF-v2:** the Un-Said theme (tokens, icon, wordmark, UI reference) lives in **`App-UI-Final/`** and is copied in by `scripts/sync-theme.ts` (never by hand). This folder keeps only what the phone, the look-alike apps and the opening need, plus Gurneal's icon for the home screen and banner.

**Standing rule:** every new graphic, image, palette or brand asset goes into `assets/` and gets a row in this README (source, usage, where it lands). The app serves copies from `public/`; `assets/` is the source of truth. Reviewer 10 (`assets-slot-reviewer`) checks this README against `assets/` and `public/`.

| Path | Source | What it is / usage | Lands in the app |
|---|---|---|---|
| `assets/brand/unsaid-app-icon.png` | **Gurneal's own art** (same file as `App-UI-Final/assets/brand/unsaid-app-icon.png`) | The Un-Said app icon. 1254x1254 (iOS masks the corners; never pre-round it). | `public/brand/unsaid-app-icon.png`: home icon, banner icon, splash, `UnsaidLogo` |
| `assets/brand/wordmark.md` | notes | "Un-Said" name and wordmark rules (live text; style from the synced theme). | rendered as text |
| `assets/palettes/branched-tokens.json` | look-alike sampling | Look-alike palettes, look-alike gradients, device colors (CLAUDE_PROMPT.md sections 4.2-4.3). No Un-Said tokens. | loaded by `lib/tokens.ts` → `app/tokens.css` |
| `assets/palettes/branched-frontend-palette.png` | generated swatch sheet (BF-v1) | Visual check for the look-alike swatches; its Un-Said row is superseded by App-UI-Final. | `public/test/branched-frontend-palette.png` (shown on `/test/tokens` only) |
| `assets/icons/README.md` | look-alike notes | Specs for drawn Apple/Meta look-alike icons; no files. | SVG/CSS components |
| `assets/images/README.md` | placeholder spec | Mock illustrations to make (dal, sunrise, reels, avatars, the Photos library). | `public/mock/...` once made |
| `assets/images/reel-goldenhour-pups.svg`, `reel-rec-league.svg`, `reel-dormlife.svg` | drawn for this build (Phase 2, P2-I2) | Instagram Reels frames: golden-hour puppies, rec-league game, dorm life. Original semi-flat SVG, no text, logos or real people. | `public/mock/` (Phase 2) |
| *(public only)* `public/mock/photos/widget-sarah-sunset.jpg` | demo photo set (`sarah-sunset.jpg`, generated fictional cast: Riley + Sarah), square crop, 512 px | Photos "Featured Photo" widget on the unfolded home ("With Sarah") | `PhotosWidget` in `components/home/Widgets.tsx` |
| *(synced, not in `assets/`)* `public/unsaid-theme/**`, `lib/unsaid-theme.json`, `app/unsaid-theme.css` | `App-UI-Final/` via `npm run sync:theme` | The Un-Said theme: tokens, brand files, palette sheet. Regenerated on every `dev`/`build`; never edited by hand. | splash, `UnsaidSlot`, Un-Said toast |

The UI reference used to check the UnsaidSlot placeholder is `App-UI-Final/assets/ui-reference/unsaid-ui-reference.png` (read only).

Never put official Apple/Meta logos, real app screenshots or proprietary fonts here or in `public/`. Real-app reference screenshots go in `screenshots/reference/` (gitignored).
