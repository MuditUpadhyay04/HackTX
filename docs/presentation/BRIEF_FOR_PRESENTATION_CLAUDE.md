# Brief: the Un-Said judging-table presentation

**For:** a Claude session with no prior context. **From:** the Un-Said team (Mudit Upadhyay, Gurneal Chandi), HackTX 2026, UT Austin, Oct 24–25, 2026.

**Your job:** build one claude.ai artifact. It's an animated, keyboard-driven presentation that Mudit runs on his laptop at the judging table. It explains Un-Said's pipeline, how one app runs on iPhone and Android, and how the parts fit together.

Everything you need is in this file:
- the facts, numbers and copy
- the design tokens
- the scene list
- the engine to copy

The rule above all others: **only show as real what is real**. Anything else is labeled "next, not built".

---

## 1. The judging table

Three screens, side by side:

| Where | What | Why |
|---|---|---|
| Laptop 1 (left) | The premade demo film, about 2 to 3 minutes, on loop or on cue | The fallback. If Wi-Fi or a phone fails, the story still lands. |
| Middle | A borrowed **Samsung Galaxy Z Fold 8** running Un-Said in **Expo Go**, in demo-data mode | Judges hold it and try it. |
| Mudit's laptop (right) | **This artifact** | Explains the pipeline, the iPhone and Android story, and how everything integrates while judges play with the phone. |

So the artifact is a **companion**, not the demo. It must work without the phone, run full screen at 1920×1080, and let Mudit step through scenes with the arrow keys while he talks.

---

## 2. Un-Said in plain words

**One line:** Un-Said is a quiet place to say what you haven't said yet. It gets your own words to the person they're for, at their hour, in the app they already use.

**The thesis:** people don't drift apart because they stop caring. They drift because the words don't come in time. Un-Said doesn't write feelings for you; the AI is not allowed to. It notices the moment, listens, sorts what you said by person **in your exact words**, and waits for the right hour to deliver it.

**The cast** (the names are fixed; use them exactly):
- **Riley:** an international student in Austin. This is the user.
- **Mom:** in India (IST), speaks Hindi. She sends lots of check-in messages ("Beta, did you eat?"). Riley keeps replying "busy these days, will talk later".
- **Sarah:** Riley's girlfriend. In Messages she appears as "Sarah ❤️🤍"; inside Un-Said, just "Sarah". Riley sent her "it's like you don't understand me anymore".
- **Michael:** Riley's best friend, on Instagram. He sends reels and asks "You okay?". Riley answers "just busy".

**Why it matters** (real numbers):
- More than **1.17 million** international students were in the US last year, **363,019** of them from India ([IIE Open Doors 2025](https://opendoorsdata.org/wp-content/uploads/2025/11/OD25_Fast-Facts.pdf)).
- Phones already deliver about **63 notifications a day** ([Pielot et al., MobileHCI 2014](https://ic.unicamp.br/~oliveira/doc/MHCI2014_An-in-situ-study-of-mobile-phone-notifications.pdf)), so Un-Said has to earn every interruption.

**The film**, which plays on Laptop 1. You may reference these beats; don't re-create the film.

1. **0:00–0:40.**
   - Riley types a long message to Sarah, deletes it, and sends "it's like you don't understand me anymore".
   - In WhatsApp, Mom's check-ins have piled up. He types "mumma i", deletes it, and sends "busy these days, will talk later".
   - An Instagram notification from Michael arrives (a reel, then "You okay?"). Riley replies "just busy".
2. **0:40–1:40.**
   - Un-Said appears on a lingering photo with Sarah: "You haven't talked to Sarah in a while, and she keeps texting. You have un-said things for her. Let her know you're thinking of her. Sometimes, talking is all you need."
   - He says it out loud, and it sorts into piles.
3. **1:40–end.**
   - On Mom's pile: "Mom is waiting to hear this from you." with a **Call on WhatsApp** button. He calls.
   - On the photo with Sarah: "Take that step. However it goes, they'll know how you feel. And there are people who love you, no matter what."
   - He sends. Sarah replies: "omg I didn't know you felt like that" → "I just saw this" → "why didn't you say something sooner" → "Can we talk?". They're on a call: 35:40 and counting.
   - Back in Un-Said, he sees "Reply to Michael on Instagram". He sends a reel with "so funny bro", and Michael replies. He's back.

**The live demo on the phone** (what judges try):
1. The gallery opens. **Linger on a photo for about 8 seconds.**
2. Un-Said knocks: **"You miss them, right?"**
3. Then: **"Send the words you're keeping to yourself. They're waiting for your answer."**
4. Say it out loud, or type it.
5. **"Here's who that was for."** The piles show Mom, Sarah and Michael, each holding only Riley's own sentences about them.
6. Open Mom's pile and preview the letter. Under the Hindi translation, Gemini reads it back: *"she'll read: …"*.
7. Choose **Hold until her morning**. It arrives at 8:00 AM her time.
8. She opens a link. No app, no account. She can **Hold to reply**, **Write back**, or **Call**.
9. Her voice reply comes back, transcribed in Hindi and captioned in English for Riley.

---

## 3. The real pipeline (animate this)

These are the actual components and the actual data flow. Every arrow is real code in the repo.

```
His phone (Expo app)
  │  live mic → 16-bit PCM resampled to 24 kHz → WebSocket (wss)
  ▼
Caddy (automatic HTTPS, WebSocket passthrough) on a Vultr VM, Dallas
  ▼
FastAPI backend (Python 3.13, SQLite in WAL mode, media on disk, Docker Compose)
  │
  ├─► Muse Voice Transcribe (Meta)      realtime ASR over WebSocket, endpointing; Hindi + English
  │      ← live transcript streams back to the phone while he talks
  │
  ├─► Muse Spark (Meta)                 the server NUMBERS his sentences; Spark returns only
  │      {person, sentence ids, tone}   (JSON schema). The server copies his verbatim words
  │      into each pile. The AI cannot write a single word on any card.
  │
  ├─► Safety gate                       phrase list (incl. transliterated Hindi) + Spark;
  │      the stricter one wins; unknown output counts as a concern →
  │      no letters, only 988 / DV hotline / 911
  │
  ├─► Piles: For Mom / For Sarah / For Michael (he picks the lines; nothing pre-picked)
  │
  ├─► Muse Spark translates only the lines he approved (Hindi for Mom)
  │
  ├─► Gemini reads that translation back into English ("she'll read: …").
  │      Never edits the letter; Send never waits on it.
  │
  ├─► Scheduler: hold until 8:00 AM her time (IANA time zones, quiet hours)
  │
  └─► Letter page link /c/<token> (unguessable, expires in 30 days, revocable, sealed until release)
         handed to HIS OWN WhatsApp / Messages / Instagram, so it comes from him
              ▼
         Her browser: his words, Hindi caption, his voice (only the audio entirely about her)
              │  Hold to reply (voice) / Write back (text) / Call
              ▼
         Muse Voice Transcribe (her voice, Hindi) → Spark caption in English → gentle notification to him
```

**The attention budget** (rules, not a model):
- At most **1 knock per session**, **2 per day**, **3 hours apart**.
- **72 h** of quiet for a person after "not now". **2 "not now"s in a row** pause knocks for **7 days**.
- **Quiet hours 22:30–08:00** his time.
- No knocks for **24 h** after a safety concern.
- Knocks only on photos of people he has talked about.
- No streaks, no counts, no guilt. "You haven't called Mom in 12 days" never appears anywhere.

**Where AI deliberately isn't:**

| What | Handled by |
|---|---|
| timing | time-zone math |
| the words | his, enforced by a test |
| who it goes to | he picks |
| the knock | a rule budget |
| delivery | his own apps |

**The fallback chain**, which keeps the demo up:
- If Muse Spark doesn't answer, Gemini takes the **same prompt and the same JSON schema**, so it still only returns sentence ids.
- The app's Settings shows which model sorted.
- Gemini itself tries the next model if one is busy.

Real story: Meta's API answered Spark from our laptops but returned `model_not_found` from the Vultr VM with the same key, so the fallback actually saved us.

**Demo-data mode (borrowed phone):**
- The Fold 8 is borrowed, so with `EXPO_PUBLIC_DEMO_DATA` on, Un-Said never reads the owner's photos or contacts.
- It uses the seeded cast and demo photos from the server. Only the mic and local notifications are real.
- Share and call buttons open simulated screens, never the owner's real WhatsApp or Instagram.

**The phone mock** (used to record the film):
- A Next.js web mock of the Fold 8: One UI home, look-alike WhatsApp, Google Messages, Instagram, Phone and Gallery.
- The **real** Un-Said web build runs inside it, against the real backend.
- A "scene director" plays the look-alike-app beats one tap at a time. Un-Said itself is never scripted; its buttons tell the mock which look-alike app to open.
- `/phone` fills a real Fold's screen and switches between the cover and inner layouts when the phone physically folds.

---

## 4. Muse on a Vultr GPU (flagged: show only when it's live)

Mudit is setting up Meta's open-weight **Muse Spark Open** on a **Vultr Cloud GPU** instance. The backend would call it for sorting, and the result is the same: sentence ids only, verbatim words.

Put a flag in the SCENARIO: `museOnVultrGpu: false` by default.

- **When `false` (default, the honest state today):**
  - The Vultr box in the pipeline reads "Vultr Cloud Compute · Dallas: FastAPI + Caddy HTTPS".
  - Muse Spark is drawn as "Meta Model API".
  - The fallback to Gemini is shown as a dashed path.
  - A roadmap card reads: **"Next: Muse Spark Open on a Vultr GPU, so sorting runs on Meta's open weights on our own server."**
- **When `true`:**
  - The Muse Spark node moves inside a "Vultr Cloud GPU" box, reading "Muse Spark Open · self-hosted on a Vultr GPU".
  - The arrow from FastAPI shows "private network".
  - Meta Model API remains for Voice Transcribe.
  - Speaker note: "Sorting runs on Meta's open-weight Muse model on our own Vultr GPU."

**Instruction:** set the flag to `true` **only when Mudit confirms it's live**. The proof is the backend health check: `https://45-32-200-63.sslip.io/api/health` reports `"spark": "muse-spark-open (vultr gpu)"` (the default label; Mudit may tell you a different one). Never present it as live otherwise, not in copy, not in speaker notes. The same honesty applies to every claim in the deck.

---

## 5. iPhone and Android

**Real today:**
- **One Expo (React Native) codebase.**
- It ran on an iPhone through Expo Go during development.
- It now runs on a **Samsung Galaxy Z Fold 8** (Android) through Expo Go.
- The same backend and the same letter page serve both.

**Roadmap (label it "next, not built"):**
- **Android: AppFunctions.** Un-Said would expose a few functions, like "is a letter waiting for Mom?" or "open Mom's pile". Gemini could call them from anywhere on the phone. Google's launch example was Samsung Gallery on the Galaxy S26; Gemini's side was in private preview as of May 2026.
  - Sources: [Android AppFunctions overview](https://developer.android.com/ai/appfunctions), [Android Developers Blog](https://android-developers.googleblog.com/2026/02/the-intelligent-os-making-ai-agents.html), [9to5Google](https://9to5google.com/2026/02/25/android-appfunctions-gemini/).
- **iPhone: App Intents.** The same functions as App Intents, so Siri, Spotlight and Apple Intelligence can surface a held letter. Siri acting inside third-party apps had reported delays; don't claim it shipped.
  - Sources: [MacTrast](https://www.mactrast.com/2025/08/apple-testing-revamped-siri-with-select-third-party-apps-like-amazon-facebook-others/amp/), [Macworld](https://www.macworld.com/article/2874077/report-outlines-how-siri-is-holding-up-apples-entire-product-launch-strategy.html).
- **The principle, shown on screen:** *The assistant can ask Un-Said what's waiting. It never reads the words.* The phone's assistant learns only that a letter exists and who it's for. The words stay inside Un-Said, with Muse.

Show it as two lanes, Android (Gemini → AppFunctions → Un-Said → Muse) and iPhone (Apple Intelligence → App Intents → Un-Said → Muse), meeting at one shared Un-Said core. Never phrase it as an assistant "scanning other apps".

---

## 6. Numbers to animate (all real, use exactly)

| Number | Meaning | Source |
|---|---|---|
| **10/10** | concerning rants routed to support resources, with Muse Spark | 30-rant safety eval, Oct 25 |
| **0/20** | ordinary rants blocked, with Muse Spark | same eval |
| **9/10** | concerning rants caught by the phrase layer alone; Spark caught the subtle one ("there's no point… I don't see a reason to keep going") | same eval |
| **92** | backend tests passing; one asserts every card line is a substring of what he said | `backend/tests` |
| **≈2 s** | to sort a rant into piles, measured live | live runs |
| **1 / 2 / 3 h** | knocks per session / per day / hours apart | attention budget |
| **8:00 AM** | Mom's letter arrives at her morning (IST) | scheduler |
| **1.17M / 363,019** | international students in the US / from India | IIE Open Doors 2025 |
| **~63** | notifications a day | Pielot et al. 2014 |

Good chart choices:
- The safety eval as two bars: concerning routed, 10 of 10; ordinary blocked, 0 of 20.
- Phrases-only versus phrases + Spark as a before and after.

---

## 7. Tracks: what each judge should see

- **Meta, "Bringing People Closer Together with AI":**
  - Muse Voice Transcribe hears it, and Muse Spark sorts, translates and gates safety.
  - The AI can't write his words.
  - It leaves through WhatsApp, Messages and Instagram, so success is a conversation happening somewhere else.
- **MLH Vultr:**
  - The backend, the live transcript WebSocket, the letter pages and the replies run on a Vultr Cloud Compute VM in Dallas: Docker Compose, Caddy HTTPS, one update script.
  - Add the GPU scene only if `museOnVultrGpu` is true.
- **MLH Gemini:**
  - "she'll read: …" on the preview catches a bad translation before Mom sees it.
  - Gemini stands in when Spark can't answer, with the same schema, so it still can't write his words.
  - The Android AppFunctions roadmap.
- **Best Overall:** the design system, the restraint (the attention budget), the safety eval, the live backend, and the phone you can hold.

---

## 8. Design

Make it look like **Un-Said**, clearly different from PitCrew's slate and teal. Reuse the engine, not the look.

**Tokens** (from Gurneal's design system):

```css
--paper:    #FFFFFF;   /* app is a white, light theme */
--stage:    #F4F2FB;   /* soft lilac stage */
--ink:      #1D1742;   /* primary text */
--ink-2:    #3B3570;   /* secondary text */
--indigo:   #3949EA;   /* gradient start */
--blue:     #4F62F4;
--violet:   #504FF3;   /* accent / links */
--lavender: #A890F6;
--lilac:    #B9ABF6;
--orchid:   #C6A9F4;
--letter:   #EEEAFB;   /* her letter card */
--night:    #0F0D15;   /* her letter page background (dark) */
/* gradients */
--card-gradient: radial-gradient(60% 70% at 100% 0%, #B9ABF6 0%, transparent 100%),
                 radial-gradient(60% 60% at 0% 100%, #728CF4 0%, transparent 100%),
                 linear-gradient(135deg, #3949EA 0%, #4755F0 45%, #6E6CF2 100%);
--pill-gradient: linear-gradient(90deg, #4F62F4 0%, #4046EE 45%, #9885F4 100%);
```

**Type and visuals:**
- **Type:** heavy, rounded system sans (`"SF Pro Display", -apple-system, "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif`). Display at weight 800 with tight tracking (−0.02em). Sentence case. Uppercase overlines with letter-spacing.
- **Icon:** a white quote mark (") on a blue → violet → lilac gradient squircle. Mudit can provide it (`icon-1024.png`); otherwise draw it in SVG.
- **Feel:** calm, warm, unhurried. One accent at a time. No emoji as section markers, no clinical tone, and no Meta, Google or Samsung logos.
- **Model colours:** Muse in violet/indigo, Gemini in a distinct but quiet tone (for example lilac-outlined), safety in the ink colour rather than alarm red.

**Copy rules** (Gurneal's `design/COPY_AND_NAMES.md`; these are law):
- The app is always **"Un-Said"**, with the hyphen.
- Sentence case everywhere.
- Riley's own messages are lowercase with no punctuation, as in the film.
- **Banned words:** "we detected", "risk", "depressed", "sad", and never "unsend". His unsent words are "un-said things" or his "pile".
- Un-Said speaks rarely, and the model never talks to the user. Every line on a card is his.

---

## 9. The engine to copy (from Mudit's PitCrew pitch simulation)

Mudit built an earlier deck in this style: https://claude.ai/artifact/38A6zP7zdZAdn38xG3p1iz (shared with his org). If you can read it, mirror its engine. If not, rebuild it from this description:

- **Stage:** a fixed `#stage` of **1920×1080 px**, scaled with `transform: scale()` to fit the window and letterboxed. Absolute positioning inside. `user-select: none`.
- **Header** (about 88 px tall):
  - brand mark and name on the left
  - on the right, a dark **clock chip** (day and time, flips when it changes)
  - **progress dots**, the current one wider and in the accent colour
  - a **Resources** button and a **Reset** button
- **One `SCENARIO` object** holds **every** name, number and on-screen sentence, plus `script[]`: per step, the clock, the caption, the agent bubble text, and `say` (the speaker notes). Changing the story never requires touching the engine.
- **`STEPS[]`:**
  - One entry per key press.
  - Each is `{ clock, beats: [...] }`, and the beats run **one after another; each beat moves exactly one thing**: a card appears, a packet travels, a caption types.
  - Beat types are small functions in a `BEATS` table, for example `appear`, `arrow`, `toQueue`, `qcap`, `tag`, `dialog`, `caption`, `ship`, `badges`, `agent`, `complete`, `closing`.
- **Animations:**
  - **Typing-dots bubbles:** three dots bounce, then the sentence appears.
  - **SVG paths** with **packets** moving along them, using `getPointAtLength` and `requestAnimationFrame`.
  - **Connectors** that draw themselves with `stroke-dashoffset`.
  - **Cards** that arc into slots with CSS transforms and a shared easing, `cubic-bezier(.65,0,.35,1)`.
  - A **dialog that grows out of a bar** (`transform-origin` at the bar; `scale(.55)` → `none`).
  - **Ripples** on arrival, and **badges** with counters that tick.
- **Navigation:**
  - **→ / Space** next step, **←** previous. Rebuild state instantly by replaying steps with transitions off, using an `.instant` class.
  - **M** toggles **Resources mode** (extra pages, its own dots).
  - **N** toggles the **speaker notes** panel (the current step's `say`).
  - **R** or the Reset button goes back to the start.
  - Show a faint hint "→ next · ← back" that fades out.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, fade instead of fly, and stop looping animations.
- **No external libraries.** Inline SVG icons from an `ICONS` table, system fonts only, one self-contained HTML file.

---

## 10. Suggested scenes (→ steps)

Use 10 main steps plus Resources. The `say` lines are speaker notes; keep them short, and Mudit will speak around them.

1. **The night it doesn't get said.** Three message bubbles type and then get deleted (Sarah, Mom, Michael), ending on "busy these days, will talk later". A clock chip reads 10:38 PM.
   - *say:* "Nothing is wrong. That's exactly why nothing gets said."
2. **Why it matters.** Counters tick up to 1.17M and 363,019, and "~63 notifications a day" fades in. Un-Said has to earn every interruption.
3. **One gentle knock.**
   - A photo card is lit, and an 8-second dwell ring fills.
   - The knock slides in: "You miss them, right?", then "Send the words you're keeping to yourself. They're waiting for your answer."
   - A side panel shows the budget: 1 a session, 2 a day, 3 h apart, quiet hours.
4. **Say it out loud.** The mic waveform animates, PCM packets flow along a path to "Vultr · Caddy HTTPS · FastAPI", then to "Muse Voice Transcribe", and transcript words stream back to the phone (Hindi and English mixed).
5. **Here's who that was for.**
   - The transcript splits into numbered sentences [1][2][3][4].
   - Muse Spark returns only `{person, ids}`; show the JSON appear.
   - The server cuts his exact sentences into three piles: Mom, Sarah, Michael.
   - Caption: "The AI points. It never writes."
6. **Safety first.** A fork in the path: phrases + Spark, stricter wins. The concerning branch goes to the resources card (988, DV hotline, 911), with no letters. The bar chart animates to **10/10** and **0/20**.
7. **Mom is waiting to hear this from you.**
   - Her pile shows the line and the Call on WhatsApp button.
   - Spark translates to Hindi, then **Gemini** reads it back ("she'll read: …"), drawn as a checking loop that never edits the letter.
   - The fallback path (Spark → Gemini, same schema) is dashed.
8. **Hold until her morning.** Two clocks, Austin and India: 10:31 PM for Mom, so it's held. Time fast-forwards to 8:00 AM IST and the link goes out through his own WhatsApp.
9. **No app on her side.** Her dark letter page: his words, the Hindi caption, Hold to reply. Her voice flows back through Muse Voice Transcribe and an English caption to a gentle notification for him.
10. **One app, every phone.** The iPhone and Fold 8 lanes share one core; the roadmap lanes (AppFunctions, App Intents) are dashed and labeled "next, not built". Close on the principle line: "The assistant can ask Un-Said what's waiting. It never reads the words."
11. **Team** (closing; see §11). End frame: "Some words take a little longer."

**Resources mode (M):**
- **R1, the architecture diagram:** the full pipeline from §3. It includes the `museOnVultrGpu` variant and the deploy details: Vultr Dallas, Docker Compose, Caddy, sslip.io HTTPS, SQLite in WAL mode.
- **R2, the safety eval:** 30 rants (20 ordinary, 10 concerning, some code-switched), phrases-only versus phrases + Spark, and the subtle miss that Spark caught.
- **R3, "Where AI isn't":** the table from §3.
- **R4, the roadmap:**
  - AppFunctions and App Intents
  - Muse Spark Open on a Vultr GPU, unless it's already live
  - the knock on Meta's own memory surfaces (Instagram and Facebook memories)
  - notifications inside WhatsApp and Instagram
  - home-culture dates

---

## 11. Closing scene: the team

People:
- **Mudit Upadhyay:** backend, app, Meta integrations.
- **Gurneal Chandi:** product, design system, cast and copy, film.

**The AI we built with**, presented honestly as tools:
- **Claude:** Claude Code wrote much of the code from our specs. "claude" is a GitHub contributor.
- **Cursor Agent:** 20 commits that restyled the Expo app and kept the handoff notes. "cursoragent" is a GitHub contributor.
- **Grok:** reviewed the product and wrote the first Gemini echo. The repo's notes record it being used through Cursor.
- Every change was reviewed and tested by us.

Mudit will attach a screenshot of the repo's **GitHub Contributors panel** (MuditUpadhyay04 · NotGurneal · claude · cursoragent). Place it in this scene. If no image is provided, rebuild it as HTML rows with simple avatar circles and handles, and don't use company logos.

A playful line is fine, for example "Our AI teammates", as long as the cards say what each one actually did.

---

## 12. Assets Mudit can upload

All of these are in the repo under `docs/presentation/assets/`:

| File | Shows |
|---|---|
| `gallery/1-un-said.png` | 3:2 cover: Home ("Some words take a little longer.") plus Mom's letter page |
| `gallery/2-the-knock.png` | The gallery plus the Sarah knock over the photo of Riley and Sarah |
| `gallery/3-sorted-by-person.png` | The typed rant, then "Here's who that was for." with Mom, Sarah and Michael |
| `gallery/4-mom-is-waiting.png` | Mom's pile with "Mom is waiting…" and Call on WhatsApp, plus the preview with "she'll read:" and Hold until her morning |
| `gallery/5-her-side.png` | Her dark letter page with the Hindi translation and Hold to reply, plus her reply in his Un-said tab |
| `gallery/6-safety.png` | The safety resources screen, plus the eval numbers |
| `gallery/thumbnail-A-sorted.png`, `gallery/thumbnail-B-knock.png` | Brand thumbnails (icon, wordmark, app screen) |
| `raw/02-photo-knock.png` … `raw/11-safety.png` | Single phone screens (1236×2745): knock, typed rant, sorted piles, Mom's pile, preview, home, her letter, her letter scrolled, the reply list, safety |

- The raw gallery screen (`01-gallery.png`) was skipped because it's over 3 MB; it's in Mudit's local scratch folder.
- The app icon is `mobile/assets/brand/icon-1024.png` in the repo.

Artifacts can't load arbitrary external images. Either embed uploaded images as data URIs (watch the size; prefer JPEG-compressed thumbnails, which are well under 16 MB total) or draw phone screens as simplified HTML mockups using the tokens above. Simplified mockups animate better.

**Links:**

| What | Link |
|---|---|
| Code | https://github.com/MuditUpadhyay04/HackTX |
| Live backend | https://45-32-200-63.sslip.io |
| Phone mock | https://phone.45-32-200-63.sslip.io/phone (show only once Mudit confirms it's deployed) |

---

## 13. Ready-to-paste prompt

```
Build me a claude.ai artifact: an animated, keyboard-driven presentation for our HackTX 2026 judging
table. Read the attached brief (BRIEF_FOR_PRESENTATION_CLAUDE.md) first and follow it exactly. It has
every fact, number, copy rule, design token and the scene list.

What I need:
- One self-contained HTML artifact, no external libraries, a fixed 1920×1080 stage scaled to the
  window, built on the same engine as my PitCrew pitch simulation
  (https://claude.ai/artifact/38A6zP7zdZAdn38xG3p1iz): one SCENARIO object holding all text and
  numbers, STEPS of beats where each beat moves one thing, typing-dots bubbles, SVG paths with
  packets flowing, cards arcing into slots, a header with brand, clock chip and progress dots,
  → / ← / Space navigation, M for Resources mode, N for speaker notes, R to reset, and a
  reduced-motion fallback.
- The look is Un-Said's, not PitCrew's: the light lilac stage, the blue → violet → lilac gradient
  family, heavy rounded system sans, the quote-mark icon. Follow the copy rules (Un-Said with the
  hyphen, sentence case, the banned words list).
- The 11 scenes in §10, ending on the Team scene with our GitHub Contributors screenshot (attached)
  and honest cards for Claude, Cursor Agent and Grok.
- Resources mode: the architecture diagram, the safety eval chart (10/10 and 0/20), "Where AI
  isn't", and the roadmap.
- A SCENARIO flag museOnVultrGpu, default false. Only when I tell you it's live, switch the pipeline
  to show Muse Spark Open on a Vultr Cloud GPU. Never show it as live otherwise.
- Label everything that isn't built as "next, not built" (AppFunctions, App Intents and the rest).
  Never imply an assistant reads other apps or his words.

Use real numbers only (§6). Make it calm and warm, with one orchestrated animation per scene. Each
step should take under 2 seconds to play so I can talk over it. Put my speaker notes in each
step's `say`.
```
