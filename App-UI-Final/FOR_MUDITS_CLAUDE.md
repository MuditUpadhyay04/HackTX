# Paste this into Claude Code, in your HackTX repo, on your `backend` branch

You are restyling and re-laying-out the Un-Said web app's UI, which lives in `backend/web/`, so it matches Gurneal's design. Gurneal owns all of the design: names, palette, wordmark, icon and copy. Mudit owns the app and the backend. This brief is everything you need. Its folder, `App-UI-Final/`, also holds the full spec (`DESIGN_SPEC.md`), the strings (`COPY_AND_NAMES.md`), the tokens (`tokens/`), the art (`assets/`) and the feature IDs (`FEATURE_IDS.md`). Read all of them before you change anything.

## 0. Hard rules

1. **UI only.**
   - Don't change any backend logic, API route, request or response shape, database schema, auth, delivery, sorting, transcription or safety logic, under `backend/app/` or anywhere else.
   - Don't change what the API returns or the order in which `app.js` calls it.
   - You may change markup, CSS, client-side layout and view structure, plus which returned fields you display and where.
2. **Fixed, and not yours to change:** the palette and tokens (`tokens/unsaid-tokens.css`), the name **"Un-Said"** (with the hyphen, everywhere a person sees it), the wordmark, the icon, the cast names (Riley, Mom, Dad, Sarah, Michael (Best Friend)) and every string in `COPY_AND_NAMES.md`.
3. **What you may change:** layout tweaks the backend needs. That covers:
   - a field the API doesn't provide
   - a flow step your app does differently
   - a screen your app has that the spec doesn't

   Keep those tweaks inside the same component set and tokens. If a needed string doesn't exist, keep your current string and add it to `backend/web/COPY_NEEDED.md` for Gurneal. Don't write new copy.
4. **Look-alike honesty:** no official Meta or Apple logo files. Don't add any web font: the system stack only, with no Google Fonts, no Caveat and no Inter download.
5. **Quality bar:** every screen should look like Meta's design team shipped it. These are banned:
   - default-looking components
   - gradients other than the three tokens
   - emoji used as icons
   - glass on content
   - values off the 4/8 grid
   - centered hero layouts
   - random shadows
   - AI sparkle icons
6. **Work in small commits** on your branch. Run your tests (`uv run pytest`) after each step to prove nothing in the backend moved.

## 1. Set up the theme (step 1)

1. Copy `App-UI-Final/tokens/unsaid-tokens.css` to `backend/web/unsaid-tokens.css`. Link it in `index.html` and `card.html` before `app.css`.
2. Copy the icons from `App-UI-Final/assets/brand/` into `backend/web/`:
   - `icon-32.png` and `favicon.ico` become the favicon
   - `icon-180.png` becomes the apple-touch-icon
   - `icon-192.png` and `icon-512.png` go in the manifest
   - `unsaid-app-icon.png` (1254 px) is for the splash; never pre-round it
3. Make these changes in `index.html` (and `card.html`):
   - `<title>Un-Said</title>`
   - `apple-mobile-web-app-title` "Un-Said"
   - `theme-color` #0F0D15
   - `apple-mobile-web-app-status-bar-style` `black-translucent`
   - remove the Google Fonts link
   - replace `icon.svg` with the PNGs
4. In `manifest.webmanifest`: `name` and `short_name` "Un-Said", `background_color` and `theme_color` #0F0D15, and the 192/512 icons.
5. Repoint the `:root` variables in `app.css` to Gurneal's tokens, so the existing classes pick up the new look before you re-lay-out anything:

| Your variable | Set to |
|---|---|
| `--accent` | `var(--un-indigo)`. Primary buttons use `background: var(--un-pill-gradient)` |
| `--accent-soft` | `var(--un-surface-raised)` |
| `--ink` | `var(--un-text)` |
| `--ink-muted` | `var(--un-text-3)` |
| `--ink-faint` | `var(--un-text-4)` |
| `--cream`, `--bg-dusk` | `var(--un-bg)`. The app is now dark: body background `--un-bg`, text `--un-text` |
| `--cream-deep`, `--card` | `var(--un-surface)` |
| `--line` | `var(--un-hairline)` |
| `--dusk-rose`, `--peach` | avatar fills: illustrated avatars, or initials on `--un-surface-raised`; unread = 2 px `--un-pill-gradient` ring |
| `--safety` | `var(--un-surface-raised)` (calm, no gradient) |
| `--logo-gradient` | not used. The mark is the PNG icon, with fallback `--un-icon-gradient` behind a white “ |
| `--hand` (Caveat) | `var(--un-sans)`. Every `.hand` / `.hand-lg` becomes heavy sans: `.hand` = 22/28 weight 700, `.hand-lg` = `--un-compose` 34/42 weight 700. **No handwriting anywhere** |
| `--ui` (Inter) | `var(--un-sans)` |

6. **Class mapping:**

| Your class | Becomes |
|---|---|
| `.wordmark` | "Un-Said" as live text: 24/28 weight 800, -0.01em, white |
| `.mark` | the icon PNG in a squircle (radius 22.37%) |
| `.card` | radius 16 (28 for letter-sized cards), `--un-surface`, no border, no shadow |
| `.chip` | `--un-surface-raised`, `--un-violet` 12/16/600, pill radius, 8×4 padding |
| `.btn.primary` | 56 pt pill, `--un-pill-gradient`, white 17/22/600, `--un-shadow-pill` |
| `.btn.outline` | 52 pt pill, 1.5 px white stroke |
| `.btn.ghost` / `.link` | a text button in `--un-text-2`, 13/18 weight 600 |
| `.btn.dark` | `--un-surface-raised`, radius 16 |
| `.strip` | the waiting strip: a 56 pt `--un-surface` row, 32 pt avatar, `--un-violet` time |
| `.mic` | 88 pt circle, `--un-pill-gradient`, white 32 pt glyph |
| `.wave` | bars 3 pt wide, 3 pt gap, `--un-violet` live / `--un-text-3` idle |
| `.sheet` | `--un-surface`, 24 pt top radius, 36×5 grabber |
| `.toast` | `--un-surface-raised`, radius 16 |
| `.safety` | the no-gradient safety style (section 3.12) |

Check after this step: the app runs, every screen is dark and nothing in the backend changed.

## 2. Navigation (step 2)

- **Bottom tab bar on every main screen:**
  - 49 pt plus the safe area, on `--un-bg`, with a 0.5 pt `--un-hairline` on top.
  - **Home · Letters · You**: 24 pt icons over 11/13/600 labels.
  - Active: `--un-violet` with a filled icon. Inactive: `--un-text-3` with an outline icon.
- **Pushed screens** (Talk, Pile, Compose, Preview, a letter, Self note, Safety, Connect photos) hide the tab bar.
  - Their nav bar is "‹" leading, a 17/22/600 title in the center and an optional trailing text action.
- **Header on Home:** the "Un-Said" wordmark leading, with a 44 pt avatar trailing that opens You.
- **Grid and insets:**
  - The screen is designed at 402 pt wide.
  - Text insets are 24, card and row insets 16, the section gap 24 and the row gap 8.
  - Spacing comes only from 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- **Launch:**
  - Splash: `--un-bg` with the 120 pt icon and "Un-Said" 20 pt below it.
  - Then Home. If you add motion, the icon blooms into the hero card (spring stiffness 180, damping 26). Otherwise use a 200 ms cross-fade.

## 3. Screens, top to bottom

Every size is in pt (CSS px at 1x). Token names refer to `unsaid-tokens.css`. IDs in [brackets] are in `FEATURE_IDS.md`; use them as `data-feature-id` on the matching control. The exact copy is in `COPY_AND_NAMES.md`, quoted here.

### 3.1 Home (tab)

1. **Header** (44): the wordmark, plus the avatar (44).
2. **Headline:** "Some words take a little longer." (`--un-display` 36/42/800, 2 lines, 16 below the header).
3. **Hero card:**
   - 370×288, radius 28, `--un-card-gradient`, `--un-shadow-hero`.
   - A white “ (40) at padding 24.
   - "What have you been meaning to say?" (`--un-card-title` 32/40/800).
   - A 56×56 `--un-surface-raised` square, radius 16, with a white "+", 16 from the right and bottom [draft-new].
   - Tapping the card body also starts a new draft or rant. In your app that's whatever begins a new message: the photo/memory rant or a new draft.
4. **"Your words"** (18/24/700): draft rows (76 tall, `--un-surface`, radius 16), each with a 44 avatar, the name 15/20/700, a preview 13/18 in `--un-text-2` and a trailing "Draft ›" [draft-open].
5. **"Say it out loud" card:** a mic in a gradient circle, with "Only you can hear this." It opens Talk.
6. **Waiting strip:** your held cards (`status === "held"`).
   - Each row shows the name and "arrives 8:00 AM her time" (use your `release_label` value, styled `--un-meta` in `--un-violet`), with a trailing "Cancel" [pending-unsend-cancel] wired to your existing revoke call.
   - If nothing is held, hide the strip with no filler.
7. **"waiting on you":** your reminders.
   - Each row shows the person's name, then "waiting on you" over their text, with a trailing outline pill "Open Instagram" / "Open Messages" / "Open WhatsApp" [handoff-instagram etc.], using your existing handoff URL.

**States:**
- default
- held (strip)
- after (delivered, letter arrived, waiting on you)

**Your extra Home blocks:**
- **"your lane"** photo row (horizontal tiles, radius 16, caption 13/18) goes under "Your words".
- **"for the next hard day"** row: style it as a Row that opens Self note.
- **"+ add a photo"** form: put it in a Sheet.

Their headings are COPY NEEDED. Keep your strings for now and list them.

### 3.2 Talk / the rant (your memory + rant view)

1. **Nav:** "‹", plus the title "Say it out loud".
2. If a photo opened it, show the photo full width, radius 28.
3. If there's a reply from this person, a letter-style card holds the play row and transcript. The transcript is set in heavy sans, not handwriting. Show the translation line, if any, in 13/18 `--un-text-3`.
4. **Overline:** "ONLY YOU CAN HEAR THIS" (11/14/700, 0.10em, `--un-text-4`).
5. **Live transcript:** `--un-compose` 34/42/700, white, with a 2 pt `--un-caret`.
6. **Bottom dock:**
   - the waveform
   - the 88 pt mic [rant-record] / [rant-stop]
   - the caption "Tap to talk" / "Tap to stop" (if your interaction is hold-to-talk, keep it, and the caption is COPY NEEDED: list it)
   - "Type instead" [rant-type]
   - "Start over" [rant-discard], which opens an action sheet with "Delete recording" in red and "Cancel"
7. **Quiet line until stop:** "Nothing leaves without you."
8. **Typed state:** the field uses `--un-compose` on `--un-bg` with no box border, and the primary pill sits below it.

### 3.3 Split (your "sorted" view)

1. **Loading:** skeleton shapes like the person cards. No spinner.
2. **One line from Un-Said:** "Here's who that was for." (*proposed*). Your backend's generated reflection text is not shown here (rule: Un-Said speaks rarely). Keep the field in the API, and list it for Gurneal as an open question.
3. **Person cards,** staggered in (spring 260/28, 120 ms) [pile-open]. Each is `--un-surface`, radius 16, padding 16, with:
   - a 44 avatar with a gradient ring, and the name
   - a tone chip: your `tone` value; the design's examples are "missing her" / "sorry" / "missing him"
   - up to 3 of his lines, verbatim (heavy sans 22/28/700 in `--un-text-2`)
   - "+N more"
   - a chevron
4. **"Keep it just for me"** [rant-save-private], with the toast "Saved. Only you can see it."
5. If nothing was about anyone, keep your current behavior and string (COPY NEEDED).
6. Your "what was heard" disclosure stays as a small text disclosure at the bottom.
7. Your self-note-on-a-hard-night card sits above the cards, in a letter-style card (`--un-surface`, radius 28).

### 3.4 Per-person pile (your "stack" view)

1. **Nav:** "‹" plus "For Mom" (or "For Sarah", "For Michael").
2. **Overline:** "IN YOUR WORDS".
3. **One row per line:**
   - the text in heavy sans 22/28/700, white when on and `--un-text-4` when off
   - a trailing round toggle, gradient-filled when on [pile-line-toggle]
   - a 12/16 meta line under it (date · tone)

   Keep your checkbox logic, and restyle the checkbox as the toggle. Nothing is pre-picked, as in your app.
4. **Header card:** the avatar and name, "Goes to Mom on WhatsApp" with "Change" [delivery-channel-pick], and, for a person who's asleep, the time chip "8:11 AM for Mom" [recipient-timezone-set] (fill it from your local-time data).
5. **Primary pill:** "Preview letter" [letter-preview]. It is disabled until a line is on.
6. **Secondary:** "Edit as a draft".

If your flow sends straight from here ("send to … in …"), keep that call, put it behind the Preview step (3.6), and use the pill "Send when they're ready".

### 3.5 Compose "ONLY A DRAFT"

1. **Nav:** "‹" · "To Sarah" · "Save" [draft-save].
2. **Overline:** "ONLY A DRAFT".
3. **Draft:** `--un-compose` 34/42/700 with the caret.
4. **Channel line:** "Goes to Sarah in Messages · Change".
5. **Tool row** above a 0.5 pt hairline: mic [compose-dictate] and paperclip [unsend-attach-photos].
6. **Pill:** "Preview letter".
7. **Caption:** "You decide when it leaves.", centered.

No AI tools at all. If your app has no draft storage, Save stays local or is hidden. That's a layout tweak, so note it.

### 3.6 Preview letter

1. **Nav:** "‹ Edit".
2. **The letter card,** as the recipient will see it:
   - `--un-letter` #EEEAFB, radius 28, padding 24, `--un-shadow-letter`
   - a `--un-letter-accent` “ and "FOR YOU"
   - the first line at `--un-letter-hero` (64, stepping to 48 or 36 to fit) and the rest at 22/28/500, all in `--un-letter-ink`
   - signed "Riley"
3. **Caption:** "This is how Sarah will see it." (use the right name).
4. **Pill:** "Send when they're ready" [unsend-queue-send].
5. **Link:** "Keep editing".

### 3.7 Hold until her morning (your "hold" view)

1. The Preview layout (3.6), plus a delivery card:
   - "Mom's morning" / "Arrives 8:00 AM her time" (your morning label)
   - two choices: "Hold until her morning" (default when she's asleep) [unsend-hold-until-morning] and "Send now"
2. **Pill:** "Send when they're ready". It calls your existing create-card call, with `when` taken from the choice.
3. **Held:** the confirmation "Held for Mom's morning." and the chip. Home shows the strip.
4. **Secondary:** "Keep it for now" (yours) becomes the text link "Keep editing".
5. **Cancel on the strip:** the toast "Kept as a draft."

### 3.8 Delivery handoff

- Un-Said never shows a chat. Delivery hands off to the person's real app with the link ready:
  - WhatsApp (your share/WhatsApp link) [handoff-whatsapp]
  - Messages [unsend-share-sms]
  - Instagram [handoff-instagram]
- Keep your existing share logic. Change only the strings and the button styling.
- **Link preview metadata on the card page:**
  - title "A letter from Riley" (the sender's name)
  - site "unsaid.app"
  - image: the white “ on the card gradient (use `icon-512.png`)
  - never a sentence of the letter
- After send, the strip shows "Delivered" and then clears.

### 3.9 The card page Mom opens (`card.html` / `card.js`)

1. A dark `--un-bg` page that looks like Un-Said, not WhatsApp. It has no tab bar and no account.
2. **The letter card** (3.6 style): "FOR YOU", his lines, "Riley", and a "listen" row if there's audio [unsend-play].
3. **Under it:**
   - a primary pill "Hold to reply" [reply-page-record], which reads "Release to send" (*proposed*) while recording
   - an outline pill "Call Riley" [call-start]

   Both are wired to your existing reply and call logic.
4. **States:** letter, reply-recording, reply-sent. The reply-sent string is COPY NEEDED.

### 3.10 Letters (tab) and the received letter

1. **Letters:**
   - the header "Letters" (36/42/800), then story rings for senders (gradient ring = unread)
   - rows: name, the first line or "voice reply · 0:24", and the time [letter-open]
   - the source is your replies data
2. **Received letter:**
   - **Nav:** "‹" · "From Sarah".
   - **The letter card,** 370×520:
     - a “, then "FOR YOU"
     - "I missed you too." (64/72/800), with a hand-drawn underline under "you too." (an SVG path, 4 pt stroke, round caps)
     - "I'm glad you told me." (22/28/500)
     - the signature "Sarah"
   - **Under the card:** "Take your time.", the outline pill "Write back" [letter-write-back] (opens Compose to that person) and the text "Keep this moment" [vault-save].
   - **Footer:** "about this letter" · the time.
3. **Voice replies** use a play row instead of text. Mark replies heard exactly as you do now.

### 3.11 Self note (your "note" view)

1. **Overline:** "FOR YOU, LATER".
2. **Front-camera preview** at radius 28.
3. **Record button:** a white ring with a red dot that becomes a rounded square while recording [self-note-record], plus a tabular timer.
4. **After stopping:** the pill "Save for later" [self-note-save] and "Retake".
5. **List:** "Notes to yourself" (your existing notes), as rows or videos at radius 16.

### 3.12 Safety

1. A calm screen with **no gradient**: `--un-bg`, `--un-surface` rows and white outline pills.
2. **Header:** "You deserve to feel safe. Here's real help."
3. **Rows** with the numbers as visible text:
   - 988 Suicide & Crisis Lifeline · Call or text 988
   - National Domestic Violence Hotline · Call 1-800-799-7233 · Text START to 88788
   - Immediate danger · Call 911

   Keep your existing links and resources data; only the strings and styling change.
4. **Footer:** "Un-Said isn't a crisis service. These people are."
5. **Behavior stays yours:** while safety is on, no memories, cards, photos or letters show. Use plain fades only. Your extra line "we're not going to show memories right now." is COPY NEEDED (list it).

### 3.13 You (tab), connectors and face grouping

**You:**
- **Header:** a 72 avatar, then "Riley".
- **Rows:**
  - "Notes to yourself"
  - "Your people"
  - "Connect photos" [photo-connectors-open]
  - "Safety and support"
  - "Settings"
- **Footer:** "powered by Meta AI" as plain text.

**Connect photos:**
- **Rows:**
  - "Photos" · "on this iPhone"
  - "Instagram photos" · "your posts and tagged photos"
  - "Facebook photos" · "albums and tagged photos"
- Each row has a gradient "Connect" pill.
- **Notes:**
  - "grouped on your phone. only you can see this."
  - "faces never leave your phone" · "you name people, not us" · "delete face data anytime"

**Faces sheet:**
- **Title:** "We found 4 people in your photos".
- **Avatars** with gradient rings, each with its count and a chip: "Mom?" / "Sarah?" / "Michael?" / "Name this person".
- **Pill:** "see who". **Text button:** "not now".

**A person's photos:**
- The header, then "212 photos · from Photos, Instagram, Facebook".
- The pill "add to Mom's memories".
- "not them" on each photo.

Build these only if your backend supports them. Otherwise leave them out; don't fake them.

### 3.14 Your demo and key screens

The demo panel and the app-key screen aren't part of the design. Restyle them with the same tokens and components (cards, pills, fields: `--un-surface`, radius 16, 15/20 text), and keep every control exactly as it is.

## 4. Where each file in App-UI-Final/ is used

| File | Used for |
|---|---|
| `tokens/unsaid-tokens.css` | every color, gradient, type, radius, spacing, shadow and ease (link it first) |
| `tokens/unsaid-tokens.json` | the same values, plus the spring configs, if you animate in JS |
| `tokens/unsaid-palette.png` | the visual check of the palette |
| `assets/brand/unsaid-app-icon.png` | the splash and the knock notification icon |
| `assets/brand/icon-1024/512/192/180/32.png`, `favicon.ico` | manifest, apple-touch-icon, favicon, link-preview image |
| `assets/wordmark.md` | the wordmark rules |
| `assets/ui-reference/unsaid-ui-reference.png` | the visual truth for Home, Compose and the Received letter: compare side by side |
| `DESIGN_SPEC.md` | the full spec (this brief is its condensed form) |
| `COPY_AND_NAMES.md` | every string and the cast |
| `FEATURE_IDS.md` | `data-feature-id` values |

## 5. How it plugs into the phone frontend later

Gurneal's demo frontend (`Branched-Frontend/`, branch `branched-frontend`) draws the phone, the white iPhone Duo, with WhatsApp, Messages and Instagram look-alikes. Un-Said appears there only as its icon, its notification, a launch splash and a slot, `components/UnsaidSlot.tsx`. That slot shows a polished static placeholder until it gets your app's URL (`NEXT_PUBLIC_UNSAID_APP_URL`, for example `http://localhost:8000/app/?demo=1`). Then it renders your app in an iframe sized to the phone's display. So that the swap is seamless:
- **Don't block framing** from the demo's origin (`localhost:3000`): no `X-Frame-Options: DENY`, and a CSP `frame-ancestors` that allows it.
- **Allow mic and camera** in a frame: the frontend sets `allow="microphone; camera; autoplay"`, and it needs HTTPS or localhost.
- **Fit the display:** design for the full viewport with `env(safe-area-inset-*)`. The slot gives you about 402×874 pt folded and about 2×402 pt wide unfolded. Single column is fine: the slot centers you on the right display.
- **Splash:** start on `--un-bg`, so the handoff from the frontend's splash (the same icon and wordmark on the gradient) doesn't flash white.
- **Demo key:** if `APP_KEY` is set, the demo URL needs a way in (your key screen, or `?demo=1`), and that's yours to decide.

Nothing in the frontend calls your API directly. It only loads your page.

## 6. Done when

- Every screen above matches `DESIGN_SPEC.md` and the reference image, side by side.
- "Un-Said" appears everywhere, and the strings match `COPY_AND_NAMES.md`.
- There is no Caveat, cream or amber anywhere.
- `uv run pytest` passes, and `git diff` shows no change under `backend/app/`.
- `backend/web/COPY_NEEDED.md` lists every string you kept that isn't in the copy file.
