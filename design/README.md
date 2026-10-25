# App-UI-Final: the Un-Said design handoff for Mudit

*Moved from `App-UI-Final/` to `design/` in the Oct 24 cleanup. Contents unchanged. It now styles the Expo app in `mobile/` as well as `backend/web/`.*

**Owner of everything in this folder:** Gurneal Chandi (design, palette, names, wordmark, icon, copy).
**For:** Mudit, to restyle his Un-Said app (`backend/web/` on the `backend` branch). Mudit owns the app and the backend. Nothing here asks for a backend change.

## Start here
1. **`FOR_MUDITS_CLAUDE.md`**: paste it into Claude Code in your repo. It's the whole plan in one file: the rules, setup, navigation, every screen top to bottom, the flows, where each token and asset goes, how to map `backend/web/` onto it, and how it plugs into the phone frontend later.
2. **`DESIGN_SPEC.md`**: the full spec, with tokens, components and screens, plus the app.css mapping in section 4.
3. **`COPY_AND_NAMES.md`**: the cast (Riley, Mom, Dad, Sarah ❤️🤍, Michael (Best Friend)) and every string. Strings marked *(proposed)* or **COPY NEEDED** are still open.
4. **`FEATURE_IDS.md`**: the `data-feature-id` values to put on controls.
5. **`tokens/`**: `unsaid-tokens.css` (link this), `unsaid-tokens.json` (the same values, plus the springs) and `unsaid-palette.png` (the swatch sheet).
6. **`assets/`**: the brand icon and its sizes, the favicon, the wordmark rules and the UI reference image. See `assets/README.md`.

## What's fixed and what's yours
- **Fixed (Gurneal's):** the palette and tokens, the name "Un-Said" (with the hyphen), the wordmark, the icon, the cast names and the copy.
- **Yours (Mudit's):** all backend logic and API shapes, which stay as they are. You may also make layout tweaks the backend needs, using the same components and tokens. List any string you need that isn't here in `backend/web/COPY_NEEDED.md` for Gurneal.

## Precedence
The reference image beats the tokens, and the tokens beat anything older. Retired: the cream/plum/amber palette, Caveat or any handwriting font, the speech-bubble mark and lowercase "unsaid" as a display name.

The phone demo (`Branched-Frontend/`) reads this folder and never edits it.
