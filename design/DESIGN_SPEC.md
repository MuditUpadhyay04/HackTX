# Un-Said: design spec

**Owner:** Gurneal Chandi. All design, names and copy are his. **For:** Mudit, to apply to the Un-Said app you own and build. **Version:** App-UI-Final v1 · Oct 24, 2026 (CT)

This is a **design spec**, not a build plan. It says what each screen looks like, what it says and which states it has. How you build it (routes, components, framework, data) is up to you. Machine-readable tokens are in `tokens/`, and the art is in `assets/`.

**Precedence:** Gurneal's reference image (`assets/ui-reference/unsaid-ui-reference.png`) beats these tokens, and these tokens beat anything older. Retired and not to be used: the old cream/plum/amber palette, Caveat or any handwriting font, `bg-dusk`, the open speech-bubble mark and the amber→plum logo gradient.

---

## 1. Name, wordmark and icon

- **The name is "Un-Said"**: capital U, a hyphen, capital S. Gurneal confirmed it on Oct 24, 2026. Use it on every surface a person sees: the page title, the home-screen label, the PWA manifest name, notifications, the in-app header and the share/link previews. Code identifiers, routes and folders can stay `unsaid`.
- **Wordmark:** live text, never an image. `un-wordmark` is 24/28 pt, weight 800, tracking -0.01em, `un-text` #FFFFFF on `un-bg` #0F0D15. It is leading-aligned at the 24 pt screen inset. Inside the app there's no lockup with the icon. Details are in `assets/wordmark.md`.
- **Icon:** `assets/brand/unsaid-app-icon.png` is Gurneal's art: a white rounded opening quote “ on a blue → violet → lilac blur. It is 1254×1254 and square. Never pre-round the file, because the OS masks it (iOS uses a 22.37% continuous squircle). Ready-made sizes are in `assets/brand/`: `icon-1024.png`, `icon-512.png`, `icon-192.png`, `icon-180.png` (apple-touch-icon), `icon-32.png` and `favicon.ico` (16/32/48). If an image can't load, the fallback is a white “ on `un-icon-gradient`.
- The mark is the white “. Older marks are retired.

## 2. Styling

### 2.1 Colors (eyedropper-sampled from Gurneal's two images)

| Token | Hex | Use |
|---|---|---|
| `un-stage` | `#0B0B10` | Stage/canvas behind the Duo on Un-Said scenes (near-black) |
| `un-bg` | `#0F0D15` | App background, nav bar, tab bar |
| `un-surface` | `#191622` | List rows ('Your words'), dark cards |
| `un-surface-raised` | `#211E39` | The square '+' button on the hero card; pressed rows |
| `un-hairline` | `#322E3E` | Composer divider, tab-bar top hairline (0.5 pt) |
| `un-text` | `#FFFFFF` | Headlines, titles, names, compose text |
| `un-text-2` | `#DDDBE4` | Row previews, secondary body on dark |
| `un-text-3` | `#9C99AA` | Inactive tab icon + label, 'Draft', captions |
| `un-text-4` | `#6F6A80` | Overline labels on dark ('ONLY A DRAFT') |
| `un-violet` | `#A890F6` | Active tab icon + label, accents on dark |
| `un-blue` | `#4F62F4` | Gradient start (pill) |
| `un-indigo` | `#4046EE` | Gradient core (pill, card) |
| `un-indigo-deep` | `#3949EA` | Hero-card top-left |
| `un-periwinkle` | `#728CF4` | Hero-card bottom-left glow |
| `un-lilac` | `#B9ABF6` | Hero-card top-right glow |
| `un-violet-soft` | `#9885F4` | Pill gradient end |
| `un-caret` | `#5B59F2` | Text caret, focus ring on dark |
| `un-letter` | `#EEEAFB` | Letter card (received/preview), lavender |
| `un-letter-ink` | `#1D1742` | Text on the letter card |
| `un-letter-label` | `#3B3570` | Overline on the letter card ('FOR YOU') |
| `un-letter-accent` | `#504FF3` | Quote glyph and hand-drawn underline on the letter card |
| `un-icon-blue` | `#677FEF` | App icon top-left |
| `un-icon-periwinkle` | `#607CF2` | App icon bottom-left |
| `un-icon-violet` | `#8776DF` | App icon mid-left |
| `un-icon-orchid` | `#A166B7` | App icon center (behind the glyph) |
| `un-icon-lavender` | `#AD8FED` | App icon upper middle |
| `un-icon-lilac` | `#C6A9F4` | App icon top-right |
| `un-icon-plum` | `#AD78D4` | App icon bottom-right |

### 2.2 Gradients (only these three exist)

| Token | CSS | Use |
|---|---|---|
| `un-card-gradient` | `radial-gradient(60% 70% at 100% 0%, #B9ABF6 0%, rgba(185,171,246,0) 100%), radial-gradient(60% 60% at 0% 100%, #728CF4 0%, rgba(114,140,244,0) 100%), linear-gradient(135deg, #3949EA 0%, #4755F0 45%, #6E6CF2 100%)` | Home hero card ('What have you been meaning to say?') |
| `un-pill-gradient` | `linear-gradient(90deg, #4F62F4 0%, #4046EE 45%, #9885F4 100%)` | Primary pill ('Preview letter', 'Send when they're ready'), unread story ring |
| `un-icon-gradient` | `radial-gradient(45% 45% at 50% 52%, #A166B7 0%, rgba(161,102,183,0) 100%), linear-gradient(135deg, #677FEF 0%, #8776DF 35%, #AD8FED 60%, #C6A9F4 80%, #AD78D4 100%)` | SVG fallback for the app icon only; the PNG is the real icon |

No other gradient may appear inside Un-Said. A generic purple→blue "AI" gradient is a reviewer-2 finding.

### 2.3 Type

The family is `un-sans`: "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, Inter, sans-serif. Use heavy display weights that feel rounded. A person's words are set in this same face (`un-compose`, `un-letter-hero`); **there is no handwriting font anywhere**. No web font needs to load: the system stack renders SF on Apple devices.

| Token | Size / line (pt) | Weight | Tracking | Use |
|---|---|---|---|---|
| `un-wordmark` | 24 / 28 | 800 | -0.01em | 'Un-Said' wordmark, top-left of Home |
| `un-display` | 36 / 42 | 800 | -0.02em | Home headline 'Some words take a little longer.' |
| `un-card-title` | 32 / 40 | 800 | -0.02em | Hero-card prompt |
| `un-compose` | 34 / 42 | 700 | -0.02em | Draft text in Compose |
| `un-letter-hero` | 64 / 72 | 800 | -0.03em | 'I missed you too.' (steps down 64 > 48 > 36 for longer letters) |
| `un-letter-body` | 22 / 28 | 500 | 0 | 'I'm glad you told me.' |
| `un-signature` | 17 / 22 | 700 | 0 | Signature on the letter card ('Sarah') |
| `un-nav-title` | 17 / 22 | 600 | -0.01em | 'To Sarah', 'From Sarah' |
| `un-section` | 18 / 24 | 700 | -0.01em | 'Your words' |
| `un-button` | 17 / 22 | 600 | 0 | Pill labels, 'Save' |
| `un-row-name` | 15 / 20 | 700 | 0 | Row names |
| `un-row-preview` | 13 / 18 | 400 | 0 | Row previews |
| `un-caption` | 13 / 18 | 400 | 0 | 'You decide when it leaves.', 'Take your time.', 'Keep this moment' |
| `un-meta` | 12 / 16 | 500 | 0 | 'Draft' + chevron |
| `un-overline` | 11 / 14 | 700 | 0.10em | 'ONLY A DRAFT', 'FOR YOU' (uppercase) |
| `un-tab` | 11 / 13 | 600 | 0 | Tab labels Home / Letters / You |

### 2.4 Radii, spacing and sizes

The design is drawn on a **402 pt-wide phone screen**. Side insets are fixed (24 pt for text, 16 pt for cards and rows). Widths are fluid on other phones; the stated sizes are what they come to at 402 pt.

| Token | Value | Use |
|---|---|---|
| `un-r-hero` | 28 pt | Hero card, letter card |
| `un-r-row` | 16 pt | List rows |
| `un-r-square` | 16 pt | '+' button (56x56) |
| `un-r-pill` | 999 pt | Pills |
| `un-r-icon` | 22.37% | App icon (continuous squircle) |

Spacing scale (4/8 grid): **4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 pt**. Nothing off the scale.

| Element | Size (pt) |
|---|---|
| screen side inset (text) | 24 |
| card/row side inset | 16 |
| hero card padding | 24 |
| hero card size | 370 x 288 |
| '+' button | 56 x 56, inset 16 from the card's right and bottom |
| row height | 76 |
| row gap | 8 |
| row avatar | 44 |
| header avatar | 44 |
| section gap | 24 |
| primary pill | 366 x 56 |
| outline pill | 348 x 52, 1.5 pt white stroke |
| letter card | 370 x 520, padding 24 |
| quote glyph | 40 pt |
| underline stroke | 4 pt, round caps, slight upward arc |
| tab bar | 49 pt + 34 pt home-indicator area, 0.5 pt un-hairline top |
| tab icon | 24 |

### 2.5 Shadows

| Token | Value | Use |
|---|---|---|
| `un-shadow-hero` | `0 24px 48px -16px rgba(57,73,234,0.45)` | Home hero card (a soft indigo lift; derived, not sampled: tune against the reference) |
| `un-shadow-pill` | `0 12px 28px -10px rgba(64,70,238,0.55)` | Primary pill |
| `un-shadow-letter` | `0 32px 64px -24px rgba(0,0,0,0.60)` | Letter card on un-bg |
| `un-shadow-none` | `none` | Rows, tab bar, nav bar (the reference rows are flat) |

### 2.6 Motion (springs, not durations)

The springs are given as stiffness / damping / mass, the same numbers you'd pass to Motion/Framer `{type:"spring"}`. If you're in plain CSS, `--ease-ios` cubic-bezier(0.32,0.72,0,1) at 300–400 ms is the closest match.

| Token | Value | Use |
|---|---|---|
| `spring-app-open` | stiffness 380 · damping 34 · mass 1 | App open zoom from the icon, unfold settle |
| `spring-app-close` | stiffness 420 · damping 36 · mass 1 | App close back into the icon |
| `spring-banner` | stiffness 300 · damping 30 · mass 1 | Notification banner drop / swipe-up |
| `spring-sheet` | stiffness 320 · damping 32 · mass 1 | Sheets, keyboard rise |
| `spring-press` | stiffness 600 · damping 40 · mass 0.6 | Press-down 0.97 scale and release |
| `spring-card-in` | stiffness 260 · damping 28 · mass 1 | Person cards scale 0.96 → 1 + fade, 120 ms stagger |
| `spring-bloom` | stiffness 180 · damping 26 · mass 1 | Launch: icon → hero-card bloom |
| `dur-press` | 90 ms | Press feedback must land under 100 ms |
| `dur-fade` | 200 ms, ease cubic-bezier(0.32,0.72,0,1) | Cross-fades (only where a spring makes no sense) |
| `dur-hold` | 600 ms | Settle of the 'waiting' strip after Hold |
| `stagger` | 120 ms | Sibling cards / rows |
| `transcript-rate` | ~6 words/s (166 ms per word) | Live transcript words landing |
| `caret-blink` | 1.06 s, steps(1) | Text caret (un-caret) |

Reduced motion: every spring falls back to a 200 ms opacity cross-fade. Transform and opacity only; 60 fps; interruptible.

### 2.7 Components

| Component | Styling |
|---|---|
| Tone chip (missing / overwhelmed / tired) | un-surface-raised fill, un-violet 12/16/600 label, radius pill, 8×4 pt padding |
| Person card (from the rant) | un-surface, radius un-r-hero, 16 pt padding; name un-row-name; his words un-compose scaled to 22/28/700; count chip un-meta |
| Mic button (Talk) | 88 pt circle, un-pill-gradient, white 32 pt mic glyph, un-shadow-pill; pressed: scale 0.94 + a ring of un-violet at 40% |
| Waveform | bars 3 pt wide, 3 pt gap, radius 1.5, un-violet (live) / un-text-3 (idle) |
| Waiting strip | un-surface row, 56 pt, avatar 32, label un-row-name, time un-meta un-violet, trailing 'cancel' un-text-3 |
| Time chip ('8:11 AM for Mom') | un-surface-raised, un-meta, moon/sun glyph 14 pt un-text-2 |
| Safety screen | un-bg; resources as un-surface rows; NO gradient on this screen (calm), white outline pills |
| Handoff button ('Open WhatsApp' etc.) | outline pill (348×52, 1.5 pt white stroke) with the target app's look-alike glyph 20 pt at leading |

| Primary pill | 366×56 (full width minus 2×18), radius pill, `un-pill-gradient`, white `un-button` label, `un-shadow-pill`; pressed scale 0.97 in under 100 ms |
| Outline pill | 348×52, 1.5 pt white stroke, transparent fill, white `un-button` label |
| Row | 76 pt, `un-surface`, radius 16, 16 pt inset, 44 pt avatar at 16 pt, name over preview, trailing meta |
| Sheet | `un-surface`, 24 pt top radius, 36×5 grabber in `un-text-4`, dimmed backdrop rgba(0,0,0,0.5) |
| Toast | `un-surface-raised`, radius 16, `un-caption` in `un-text`, bottom-centered above the tab bar; it auto-dismisses after 2.4 s |
| Avatar | a circle with an illustrated person (never a stock photo of a real person); unread = 2 pt `un-pill-gradient` ring with a 2 pt `un-bg` gap |
| Letter card | `un-letter` #EEEAFB, radius 28, padding 24, `un-shadow-letter`; text in `un-letter-ink`; it is reserved for letters only |

### 2.8 How to read the reference (`assets/ui-reference/unsaid-ui-reference.png`)

The reference has three dark iPhone screens: Home, Compose and Received letter. At its scale, 1 px is about 1.5 pt.
- **Home:** the "Un-Said" wordmark sits top-left, with your 44 pt avatar top-right. The headline is "Some words take a little longer." (`un-display`). Then comes the gradient hero card "What have you been meaning to say?", with the white “ glyph and the dark 56 pt "+" square. Below it is the "Your words" section of dark rounded rows (avatar, name, a one-line preview and "Draft ›"). The tab bar is Home / Letters / You, with the active item in `un-violet`.
- **Compose:** the nav is "‹ · To Sarah · Save", with the overline "ONLY A DRAFT". The draft is in huge, heavy white type with an indigo caret. A mic and paperclip tool row sits over a hairline. Then the gradient pill "Preview letter" and the one centered caption, "You decide when it leaves."
- **Received letter:** the nav is "‹ · From Sarah". The lavender letter card has an indigo “ and the overline "FOR YOU". "I missed you too." is huge, with a hand-drawn indigo underline under "you too.". Then "I'm glad you told me." and the signature. Under the card: the caption "Take your time.", the outline pill "Write back" and the text button "Keep this moment".
- **Feel:** near-black, generous space, heavy rounded type and blue → violet light. That gradient family matches the Meta AI ring, which is what makes Un-Said feel like a Meta app without using any Meta asset.
- The reference's "Maya" is **Sarah** (Gurneal's cast). Every other string is used exactly.

**Quality bar:** a screenshot of any Un-Said screen should pass as something Meta's own design team shipped. None of these may appear:
- default Tailwind/shadcn looks or gray-200 borders
- any gradient other than the three above
- glass on content cards
- emoji used as icons
- values off the 4/8 grid
- centered hero layouts (these are app screens, so leading-aligned)
- random shadows
- AI sparkle icons

---

## 3. Screens

Each screen is described for a single phone screen, top to bottom: the status bar, then content, then the tab bar where noted. Copy marked *(proposed)* is Gurneal's draft and still needs his OK. **COPY NEEDED** means the string doesn't exist yet: ask Gurneal and don't invent it. Feature IDs in [brackets] are listed in `FEATURE_IDS.md`.

### 3.0 Launch

- **Splash:** `un-bg` fills the screen. The app icon (120 pt, squircle mask) is centered slightly above the middle, with "Un-Said" (`un-wordmark`, white) 20 pt below it.
- **Bloom into Home** (`spring-bloom`):
  - The icon tile grows into the Home hero card's rect, and its corner radius goes from 22.37% to 28 pt.
  - Its art cross-fades into `un-card-gradient`.
  - The white “ travels to the card's top-left glyph position at 40 pt.
  - The wordmark slides up into the header.
  - Then the headline, rows and tab bar fade up (8 pt rise, 30 ms stagger).
- **Reduced motion:** a 200 ms cross-fade from the splash to Home.

### 3.1 Home (tab: Home)

**Layout, top to bottom:**
- Header row, 44 pt: the "Un-Said" wordmark leading at 24 pt; your 44 pt avatar trailing at 24 pt (it opens You).
- Headline: "Some words take a little longer." (`un-display` 36/42/800, 2 lines, 16 pt below the header).
- Hero card: 370×288, 16 pt inset, radius 28, `un-card-gradient`, `un-shadow-hero`.
  - A white “ glyph (40 pt) sits at 24 pt padding, top-left.
  - "What have you been meaning to say?" (`un-card-title` 32/40/800, white, 3 lines).
  - A 56×56 `un-surface-raised` #211E39 square (radius 16) with a white 22 pt "+" sits 16 pt from the card's right and bottom edges [draft-new]. Tapping the card body does the same.
- "Your words" (`un-section` 18/24/700), 24 pt below the card.
- Draft rows (76 pt, 8 pt gap), each with "Draft ›" (`un-meta`, `un-text-3`) trailing [draft-open]:
  - Sarah · "I miss the way we used to talk."
  - Dad · "I never said thank you."
- Then, in the same column under the drafts:
  - **"Say it out loud" card** (opens Talk): a 44 pt mic glyph in an `un-pill-gradient` circle, the title "Say it out loud" and the caption "Only you can hear this." *(proposed)*
  - **Waiting strip** (only when something is held): one 56 pt row per held letter. It shows the recipient avatar (32), "Mom" and "arrives 8:00 AM her time" (`un-meta`, `un-violet`), a thin `un-pill-gradient` progress line and a trailing "Cancel" [pending-unsend-cancel]. Empty state: the strip isn't shown at all, with no filler text.
  - **Waiting on you:** "Michael (Best Friend) · waiting on you" over "3 reels this week" *(proposed)*, with a trailing outline pill "Open Instagram" [handoff-instagram].
- The tab bar.

**States:**
- default: no strip
- held: Mom's waiting strip
- after: Mom delivered, Sarah's letter has arrived, Michael is "waiting on you"

### 3.2 Tab bar

- 49 pt plus the 34 pt home-indicator area, on `un-bg`, with a 0.5 pt `un-hairline` on top.
- Three items, each a 24 pt icon over a label (`un-tab` 11/13/600): **Home · Letters · You**.
- Active: `un-violet` #A890F6 with a filled icon. Inactive: `un-text-3` with an outline icon.
- Navigation only.

### 3.3 Compose

- **Nav bar:** "‹" back · the title "To Sarah" (`un-nav-title` 17/22/600) · a trailing "Save" (`un-button`, white) [draft-save].
- **Overline:** "ONLY A DRAFT" (`un-overline`, uppercase, `un-text-4`), at the 24 pt inset.
- **Draft text,** editable: "I miss the way we used to talk.\n\nI didn't know how to say that." (`un-compose` 34/42/700, white), with a 2 pt `un-caret` #5B59F2 caret.
- **Recipient line:** "Goes to Sarah in Messages" (`un-row-preview`) with a "Change" text button [delivery-channel-pick].
  - The picker is a sheet: WhatsApp · Messages · Instagram.
  - Defaults: Mom → WhatsApp, Sarah → Messages, Michael → Instagram.
- **Tool row** above a 0.5 pt `un-hairline`: mic [compose-dictate] and paperclip [unsend-attach-photos], 24 pt glyphs in `un-text-3`.
- **Primary pill:** "Preview letter" [letter-preview].
- **Caption:** "You decide when it leaves." (`un-caption`, `un-text-3`), centered under the pill. It is the one centered element, as in the reference.
- **No AI tools of any kind:** no "rewrite gently", no sparkle, no suggestions.
- **States:**
  - empty: the caret alone and "Preview letter" disabled at 40%
  - editing: the keyboard is up and the pill rides above it
  - reply: opened from "Write back", titled "To Sarah", with the empty draft

### 3.4 Preview letter

- **Nav:** "‹ Edit" · the title "To Sarah".
- **The letter card,** exactly as Sarah will see it (see 3.5):
  - "FOR YOU"
  - the draft's first sentence at `un-letter-hero`, stepping down 64 → 48 → 36 pt to fit
  - the rest at `un-letter-body`
  - signed "Riley"
- **Caption:** "This is how Sarah will see it."
- **Primary pill:** "Send when they're ready" [unsend-queue-send].
- **Text link:** "Keep editing".

### 3.5 Received letter ("From Sarah")

- **Nav:** "‹" · the title "From Sarah".
- **Letter card:** 370×520, 16 pt inset, radius 28, `un-letter` #EEEAFB, padding 24. Contents:
  - a `un-letter-accent` #504FF3 “ glyph, 40 pt, top-left
  - the overline "FOR YOU" (`un-overline`, `un-letter-label` #3B3570)
  - "I missed you too." (`un-letter-hero` 64/72/800, `un-letter-ink` #1D1742), with the lines breaking as "I missed / you too."
  - a hand-drawn `un-letter-accent` underline under "you too.": an SVG path with a 4 pt stroke, round caps and a slight upward arc
  - "I'm glad you told me." (`un-letter-body` 22/28/500)
  - the signature "Sarah" (`un-signature` 17/22/700), bottom-left
- **Caption:** "Take your time." (`un-caption`, centered).
- **Outline pill:** "Write back" (348×52, 1.5 pt white stroke) [letter-write-back], which opens Compose in its reply state.
- **Text button:** "Keep this moment" (`un-caption`, weight 600, `un-text-2`) [vault-save].
- **Footer line:** "about this letter" · arrived 6:40 PM. When a voice note is attached, a "listen" row [unsend-play] appears.

### 3.6 Letters (tab: Letters)

- **Header:** "Letters" (`un-display` 36/42/800, like Home's headline).
- **Story rings** for people who sent letters. An `un-pill-gradient` ring means unread.
- **Received-letter rows** (`un-surface`) [letter-open]:
  - Sarah · "I missed you too." · 6:40 PM
  - Mom · "voice reply · 0:24" · 8:14 AM her time
- Opening Sarah's row shows 3.5. Mom's opens a letter-card variant with a "listen" play row [unsend-play] instead of text. Her words are audio only, and no transcript is shown.
- **Empty state:** COPY NEEDED.

### 3.7 Talk (the rant, "Say it out loud")

**States:**
- idle
- recording
- transcript (words arriving)
- stopped
- split
- type
- safety

**Recording screen:**
- **Nav:** "‹" plus the title "Say it out loud".
- **Overline:** "ONLY YOU CAN HEAR THIS" (`un-text-4`).
- **Live transcript:** `un-compose` 34/42/700, white. Words land at about 6 per second (`transcript-rate`), with a 2 pt `un-caret` at the end [rant-transcribe-live].
- **Bottom of the screen:**
  - a waveform (24 bars, 3 pt wide, `un-violet` while live)
  - the 88 pt mic button [rant-record / rant-stop]
  - the caption "Tap to talk" or "Tap to stop"
- **Secondary text buttons:**
  - "Type instead" [rant-type], which turns the transcript into an editable field
  - "Start over" [rant-discard], which opens an iOS action sheet: "Delete recording" in red, then "Cancel"
- **Before stopping,** one quiet line sits under the transcript: "Nothing leaves without you." (`un-caption`, `un-text-3`).

**Split** [rant-split]:
- After Stop there's a 600 ms hold. Then Un-Said says its one line, "Here's who that was for." *(proposed)*.
- The person cards stagger in (`spring-card-in`, 120 ms): Mom, Sarah, Michael.
- **Person card** [pile-open]:
  - a 44 pt avatar with an `un-pill-gradient` ring, and the name
  - a tone chip: Mom "missing her", Sarah "sorry", Michael "missing him" *(proposed)*
  - up to 3 of **his own lines**, as verbatim spans of the transcript in quotes
  - "+N more" and a chevron
- **Under the cards:** "Keep it just for me" [rant-save-private], with the toast "Saved. Only you can see it."
- **The rule:** every line on a card, in a pile and in a letter is cut verbatim from his transcript. Un-Said never writes or rewrites his words.

**Mock transcript** *(proposed, in Riley's voice)*:
> "i don't know. mom keeps calling and i keep letting it ring and then i send her one letter back. she made dal on sunday and i didn't even say thank you. i miss her. i just don't know how to call when it's been this long. and sarah. she said please just say something and i said i don't feel like talking. that's not true. i miss the way we used to talk. i'm sorry i bailed on barton springs. i'm not mad at her, i'm just tired all the time. and michael keeps sending me reels and i haven't sent one back in like two weeks. i still think about the sunrise on 290. i want to do that again."

How it splits:
- Mom: "mom keeps calling … been this long."
- Sarah: "she said please just say something … tired all the time."
- Michael: "michael keeps sending me reels … do that again."
- Filler ("i don't know.", "and sarah.") belongs to nobody.

### 3.8 Per-person piles ("For Mom" / "For Sarah" / "For Michael")

**States:**
- default
- all-on
- some-off

**Layout:**
- **Nav:** "‹" · "For Mom".
- **Overline:** "IN YOUR WORDS".
- **One row per line of his:** the line is set in `un-compose` at 22/28, white when on and `un-text-4` when off. A trailing round toggle (`un-pill-gradient` fill when on) [pile-line-toggle]. Tapping the row toggles it.
- **Header card:** the person's avatar and name, then "Goes to Mom on WhatsApp" with "Change" [delivery-channel-pick].
- **Time chip** (Mom only, in the header card): "8:11 AM for Mom", with a clock glyph [recipient-timezone-set]. It opens a time-zone sheet.
- **Primary pill:** "Preview letter" [letter-preview]. The letter uses only the lines that are on, in his order.
- **Secondary:** "Edit as a draft" opens Compose, pre-filled with the lines that are on.

### 3.9 Mom preview and "Hold until her morning"

**Preview:**
- The letter card as Mom will see it, made of his lines only and signed "Riley".
- The caption "This is how Mom will see it."
- **Delivery card:** "Mom's morning" (`un-row-name`) and "Arrives 8:00 AM her time" (`un-row-preview`), with a choice of:
  - **"Hold until her morning"** (default, checked) [unsend-hold-until-morning]
  - "Send now"

  *(proposed)*
- **Pill:** "Send when they're ready" [unsend-queue-send].

**Held state:** a quiet confirmation, "Held for Mom's morning." *(proposed)* plus the time chip. Home gains the waiting strip. Cancelling it [pending-unsend-cancel] shows the toast "Kept as a draft."

**On delivery:** Un-Said hands off to WhatsApp on Mom's thread, with the letter link ready, and Riley taps Send himself.
- The link preview is the white “ on `un-card-gradient`, titled "A letter from Riley", with the domain unsaid.app.
- The preview never includes a sentence of his.
- The waiting strip shows "Delivered", then goes away.

**The hallway rule:** Un-Said never renders a chat, thread or call itself. Every delivery leaves through the person's real app: WhatsApp for Mom, Messages for Sarah [unsend-share-sms] and Instagram for Michael [handoff-instagram].

### 3.10 Mom's letter page (opened from the WhatsApp link; no app, no account)

**Layout:**
- A mobile browser page at unsaid.app, styled as Un-Said (Gurneal's palette), not as WhatsApp.
- **The letter card on `un-bg`:**
  - "FOR YOU"
  - his first included line as the hero, then the rest as body
  - signed "Riley"
  - an optional "listen" row [unsend-play]
- **Under the card:**
  - a primary pill "Hold to reply" [reply-page-record]. While pressed it shows the waveform and "Release to send" *(proposed)*.
  - an outline pill "Call Riley" [call-start], which starts a WhatsApp call

**States:**
- letter
- reply-recording
- reply-sent

Her voice reply arrives in his Letters as "Mom · voice reply · 0:24".

### 3.11 Self note ("for you, later")

**States:**
- idle
- recording
- saved

**Layout:**
- A front-camera look (an illustrated still of Riley, mirrored), with the overline "FOR YOU, LATER".
- **Record button** [self-note-record]: a white ring with a red inner dot, which becomes a rounded square while recording. A tabular timer runs next to it.
- **After stopping:** a "Save for later" pill [self-note-save] and "Retake".
- **"Notes to yourself":** a list of saved notes, each showing its duration.
- *(proposed copy)*

### 3.12 You (tab: You)

- **Header:** a 72 pt avatar and "Riley".
- **Grouped `un-surface` rows:**
  - "Notes to yourself"
  - "Your people"
  - "Connect photos" [photo-connectors-open]
  - "Safety and support"
  - "Settings"
- **A "Not in this build" group** of parked ideas, with the labels COPY NEEDED.
- **Footer:** "powered by Meta AI" in `un-text-4`, as text only, with no sparkle.

### 3.13 Face grouping and photo connectors (on-device, opt-in)

**Connect photos** (`?state=list | connected`):
- **Source rows,** each with a 44 pt drawn icon and an `un-pill-gradient` "Connect" pill:
  - "Photos" · "on this iPhone" [camera-roll-scan]
  - "Instagram photos" · "your posts and tagged photos" [graph-api-photo-import]
  - "Facebook photos" · "albums and tagged photos" [graph-api-photo-import]
- **Notes underneath:**
  - "grouped on your phone. only you can see this."
  - "faces never leave your phone" · "you name people, not us" · "delete face data anytime"

**Faces popup** (a bottom sheet with a grabber) [face-cluster-popup-event]:
- **Title:** "We found 4 people in your photos", with the subtitle "grouped on your phone. only you can see this."
- **Four avatars** with `un-pill-gradient` rings [face-cluster-photos], each with its count and a chip:
  - "Mom?" 212
  - "Sarah?" 148
  - "Michael?" 96
  - "Name this person" 31 [face-cluster-name]

  The chips with a name [face-cluster-suggestion-accept] confirm the suggestion.
- **Pill:** "see who" [face-clusters-list]. **Text button:** "not now" [face-cluster-dismiss].

**A person's photos:**
- The header chip, then "212 photos · from Photos, Instagram, Facebook".
- A pill "add to Mom's memories" [face-cluster-link-person].
- On each photo: "not them" [face-cluster-photo-remove].

**Safety:** in safety mode, no cluster is ever shown for a blocked or reported person.

### 3.14 Safety

This is a calm screen with **no gradient**: `un-bg`, `un-surface` rows and white outline pills only. Plain fades only.
- **Header:** "You deserve to feel safe. Here's real help."
- **Resource rows,** with the numbers as plain visible text:
  - 988 Suicide & Crisis Lifeline · Call or text 988 [hotline-988]
  - National Domestic Violence Hotline · Call 1-800-799-7233 [hotline-ndvh-call] · Text START to 88788 [hotline-ndvh-text]
  - Immediate danger · Call 911 [emergency-911]
- **Footer:** "Un-Said isn't a crisis service. These people are."
- **What triggers it:** if a rant is flagged as a concern, no person cards form and this screen shows instead. No memories, person cards, photos or letters show while safety mode is on.

### 3.15 The knock (notification)

- **App name:** "Un-Said". The icon is the PNG.
- **Body** (default A): "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"
- **Alternatives:**
  - B: "Mom, Sarah and Michael all reached out this week. Some things are easier to say here first."
  - C: "You started a few messages tonight and only sent the short ones. Want a quiet place to say the rest?"
- **Tone:** gentle, never clinical. No "we detected", no "risk". Tapping it [drift-nudge-open] opens the app.

---

## 4. Applying this to your app (suggestions; you own the code)

Your `backend/web/app.css` `:root` still carries the earlier palette. This is how each variable maps to Gurneal's tokens (`tokens/unsaid-tokens.css` defines the right-hand side):

| Your variable | Becomes |
|---|---|
| `--accent` (#e8a15a) | primary actions use `--un-pill-gradient`; single-color accents use `--un-indigo` #4046EE (on dark, `--un-violet` #A890F6) |
| `--accent-soft` | `--un-surface-raised` #211E39 |
| `--ink` | `--un-text` #FFFFFF |
| `--ink-muted` | `--un-text-3` #9C99AA |
| `--ink-faint` | `--un-text-4` #6F6A80 |
| `--cream`, `--bg-dusk` | `--un-bg` #0F0D15 (the app is dark) |
| `--cream-deep`, `--card` | `--un-surface` #191622 |
| `--line` | `--un-hairline` #322E3E |
| `--dusk-rose`, `--peach` (avatars) | illustrated avatars with the `un-icon-*` colors; unread = `un-pill-gradient` ring |
| `--safety` | `--un-surface-raised`, no gradient (3.14) |
| `--logo-gradient` | the PNG icon; fallback `--un-icon-gradient` |
| `--hand` (Caveat) | removed: a person's words use `--un-compose` / `--un-letter-hero` (heavy sans) |
| `--ui` (Inter) | `--un-sans` (system stack) |

Your classes, matched to the components above:

| Your class | Component |
|---|---|
| `.wordmark`, `.mark` | the wordmark and the white “ |
| `.card` | Row or Letter card |
| `.chip` | Tone chip / time chip |
| `.btn.primary` | Primary pill |
| `.btn.outline` / `.btn.ghost` | Outline pill / text button |
| `.btn.dark` | the `un-surface-raised` square/button |
| `.person`, `.avatar`, `.person-card` | Person card |
| `.strip` | Waiting strip |
| `.mic`, `.wave` | Mic button and waveform |
| `.safety` | Safety |
| `.sheet` | Sheet |
| `.toast` | Toast |
| `.hand` | drop it (no handwriting) |

**Changes for `index.html`:**
- **Title:** `<title>` and `apple-mobile-web-app-title` become "Un-Said".
- **Colors and status bar:** `theme-color` becomes #0F0D15, and `apple-mobile-web-app-status-bar-style` becomes `black-translucent`.
- **Fonts:** remove the Google Fonts link.
- **Icons:** replace `icon.svg` with `icon-32.png`/`favicon.ico`, use `icon-180.png` as the apple-touch-icon, and use 192/512 in the manifest.
- **Manifest:** name and short_name "Un-Said", with background and theme color #0F0D15.

**Names and copy:** your demo data uses other names and some different strings. `COPY_AND_NAMES.md` has Gurneal's cast and every string. Where they differ, his wins.
