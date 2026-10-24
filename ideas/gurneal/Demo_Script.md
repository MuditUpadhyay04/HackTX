# Unsaid: Demo Script & Animation Production

*HackTX 2026 · Meta track: "Bringing People Closer Together with AI"*

**The demo is 100% animation.** No real device, no Apple developer access, no live gallery or camera, no live data. It's built with Claude (Remotion to MP4). This file tracks demo production separately from the product spec (`Unsaid_Product_Spec.md`) and is kept in sync with it.

---

## Timed storyboard (~2:12)

| Time | Scene | On screen | Audio | Emotional goal |
|---|---|---|---|---|
| 0:00–0:24 | **1. The "k" opening** | Black; the line *"The last thing my kid ever texted me was 'k.'"*; the camera pulls back and the black turns out to be the screen of a folded **white iPhone Duo**; the screen wakes to Mom's Messages thread ending in the kid's "k" while the timestamp ages to last year; the screen sleeps; the Duo unfolds on its hinge; zoom out to a blurred wallpaper; *"Some things go unsaid."* across both panels; swipe up, and the app closes into the Messages dock icon; the home screen settles (Meta apps prominent); tap Unsaid, and it zooms open to its splash and Home | Silence, then a low swell, a hinge click, one piano note | Gut punch, then curiosity |
| 0:24–0:39 | **2. Inside the apps you use** | A look-alike photo feed; the Unsaid logo pulses on Mom's post; tap leads into Unsaid; a three-panel row for Gen Z, your parents, and the grandparents | Soft piano begins | "No new app, no new habit" |
| 0:39–1:02 | **3. The brain graph fills in** | Faint dots, then the Fam, Roommates, and Marfa Trip hubs light up; people orbit; memory thumbnails bloom; drifting links pulse | Piano builds | "Your people were always there" |
| 1:02–1:22 | **4. The right moment** (contextual trigger) | Mom's 10 missed calls, then her voice unsend; the kid's library story; a notification with "Reply with an unsend" and "Call Mom"; tap Call; Mom connects | Ring, then warmth | Unsaid is proactive and gets them talking |
| 1:22–1:47 | **5. Posthumous release** | "Proxy confirmation 3 of 3 received"; the date turns to June 12, 2034 (Graduation Day); a letter unfolds | Quiet strings | Love that outlives you |
| 1:47–2:07 | **6. Resurfacing mid-argument** | A tense chat; the "Remember this?" card; warm photos with *"Everything will be okay."*; "I'm sorry. Dinner Friday?" | Tension, then release | This too shall pass |
| 2:07–2:12 | **7. Close** | Unsaid wordmark; *"For the words we never got to say."*; "Powered by Meta AI" | Final chord | Remember it |

**Talking points to say over the video:**
- *"Unsaid meets you where you already are: Instagram for Gen Z, WhatsApp for your parents, Facebook for the grandparents."* (Scene 2)
- *"Record at 3 AM, deliver when they're actually awake."* (Scene 4)
- *"Without Meta's AI, this is just a journal. With it, Unsaid knows your people and finds the moment."* (Scene 3 or the close)

**Honesty notes for judges:** the logo overlay and in-app notifications are concept features that would need a Meta partnership. The "iPhone Duo" is a fictional device. Social app screens and icons are recreated look-alikes (drawn in SVG/CSS, real app names as text); no official logo files, icons, screenshots, or fonts are used. Concept mock, not affiliated with Apple or Meta.

**Length note:** the new 24-second opening pushes the demo from ~2:00 to ~2:12. If it must be exactly 2:00, trim 6 s from Scene 3 and 6 s from Scene 5.

---

## Visual style

- Soft gradients (dusk rose, peach, warm cream), lots of breathing room. Every screen sits on the fictional **white iPhone Duo** (book-style, two panels on a hinge; folded it reads as a single white iPhone).
- Gentle motion: slow fades, soft scale-ins, easing. Nothing snaps.
- Handwritten font (Caveat) for unsends; Inter for interface text.
- Cream, deep plum (#4A1F35), and one amber accent (#E8A15A).
- The Unsaid mark: a speech bubble drawn with a single line, left slightly open.

---

## Emotional direction (spec v2, Section 13)

- **Cold open:** 3+ seconds of black and silence before the "k."
- **Sparse graph:** faded links labeled *"last talked: 2019"*, *"4 months"*; hold on emptiness before anything fills in.
- **Exact date:** hold "June 12, 2034, Graduation Day" for a full second.
- **Interrupt:** a beat of stillness before the "Remember this?" card cuts into the argument.
- **Call Mom:** end scene 4 on the call timer counting up.
- **Reminisce mode** (optional beat after scene 4): a story-style full screen for "Mom" with her name and photo, progress bars, and taps through 3–4 unsends and photos.
- **Muse voiceover:** *"Muse heard every unsend. It waited until you needed this one."*
- **Sound and touch:** a soft chime on every delivery, room tone in the quiet parts, the haptic shown as a ripple ring.
- **Micro-copy:** short, lowercase, human ("Mom left you something." "no emergency. just miss you.").
- **Motif:** a slow tide line or clock hand behind scenes 5, 6, and the close.

---

## Ready-to-paste prompt for Claude

```text
You are a senior motion designer and front-end engineer. Build a ~2:12 animated product demo for "Unsaid", an AI app (powered by Meta AI) that helps people say the words they never said to the people they love. The demo is pure animation: no real device, no live data.

STYLE
- Warm, minimal, emotional. Soft gradients (dusk rose -> peach -> warm cream), generous whitespace, rounded phone-style UI frames floating on the gradient.
- Gentle motion only: slow fades, soft scale-ins, ease-in-out curves; nothing snaps.
- UI type: clean sans-serif (Inter). The user's own messages ("unsends"): handwritten-style font (Caveat).
- Palette: cream backgrounds, deep plum text (#4A1F35), one warm amber accent (#E8A15A) for key moments.
- Unsaid logo: a single-line speech-bubble outline left slightly open (a gap where the words went unsaid), white on a frosted semi-transparent circle when overlaid on photos.
- Device: the fictional WHITE iPhone Duo (book-style dual panels on a hinge; folded = one white iPhone). Built as a component in the frontend (Claude_Code_Frontend_Prompt.md Phase 1); reuse it.
- Meta apps (Instagram, WhatsApp, Facebook, Messenger, Threads, Meta AI, Edits) appear as LOOK-ALIKES: icons and screens recreated in SVG/CSS from brand colors and simple glyphs, with the real app names as plain text. Never download or embed official logo files, icons, wordmarks, screenshots, or fonts. Keep a small "concept mock · not affiliated with Apple or Meta" credit at the end.
- 1920x1080, 60fps.

SCENES
1. THE "k" OPENING (0:00-0:24): One second of black and silence. Centered text fades in: "The last thing my kid ever texted me was 'k.'" ('k.' in amber), then fades out. The camera pulls back: the black was the OFF screen of a folded white iPhone Duo. The screen wakes into the kid's iOS Messages thread with "Mom": her warm messages ("hi sweetheart 💛 tried calling you a few times today" / "no emergency. just miss you." / "I made your favorite this weekend and saved you some. call me when you can? love you") and his reply "k"; the timestamp ages Today -> Yesterday -> last week -> last month -> last year. The screen sleeps. The Duo unfolds on its hinge (3D, a specular sweep across the white back, a soft hinge click). Zoom out to a blurred wallpaper. "Some things go unsaid." appears across both panels ("unsaid." in amber). Swipe up: the Apple-style app-close shrinks it into the Messages dock icon; the home screen settles with the Meta apps prominent. The Unsaid icon glows; a tap zooms it open to the Unsaid splash and Home. Exact beat timings: see "Animation Production Notes" below.
2. UNSAID LIVES INSIDE THE APPS YOU USE (0:24-0:39): A photo feed scrolls gently. On Mom's post, a small Unsaid logo in the top-right corner of the image pulses once, like a heartbeat. A finger tap ripples on it and the screen softly morphs into Unsaid. Then a quick three-panel row: photo-feed look-alike labeled "Gen Z", chat-app look-alike labeled "Your parents", social-feed look-alike labeled "The grandparents", each showing the logo on a post. Text: "Unsaid meets you where you already are."
3. THE BRAIN GRAPH FILLS IN (0:39-1:02): Near-empty cream canvas with a few faint, disconnected dots. Group-chat hub nodes light up one at a time, labeled "Fam", "Roommates", "Marfa Trip". Person nodes drift into orbit around their hubs with soft physics. Small memory nodes bloom off people with tiny rounded photo thumbnails (soft illustrated placeholders). A few links glow faintly and pulse slowly, as if waiting.
4. THE RIGHT MOMENT (1:02-1:22): Mom's phone shows "10 missed calls" to her kid. She records a voice unsend (waveform): "No emergency. I just wanted to hear your voice." Cut to the kid's story: a cozy library study scene. A soft Unsaid notification slides down from the top of the story: "Mom left you something." with two buttons: "Reply with an unsend" and "Call Mom". The finger taps "Call Mom"; the screen warms and shows "Mom" connected, 0:01... 0:02...
5. POSTHUMOUS RELEASE (1:22-1:47): Calm confirmation card: "Proxy confirmation 3 of 3 received." A date card turns forward several years to "June 12, 2034 - Graduation Day". An illustrated sealed envelope opens; a handwritten letter unfolds ("I'm so proud of you. I always was.") with a gentle voice waveform beneath.
6. RESURFACING UNSEND MID-ARGUMENT (1:47-2:07): A tense chat between partners: short, sharp bubbles ("whatever." / "you always do this."). A soft card slides up from the bottom: "Remember this?" It reveals a past unsend: 2-3 warm photo cards from a good day plus handwritten text "Everything will be okay." The chat calms; the next bubble types in: "I'm sorry. Dinner Friday?"
7. CLOSE (2:07-2:12): Unsaid wordmark on the gradient. Tagline: "For the words we never got to say." Small line: "Powered by Meta AI".

TECH
- Build it with Remotion (React) so it renders to an MP4. Put each scene in its own component, use spring/interpolate for easing, and keep all timings in one config object so they're easy to retime.
- Use react-force-graph (or D3 force) physics for scene 3.
- Also provide a standalone HTML/CSS/JS preview version I can open in a browser and screen-record as a backup.
- Give me the exact commands to install dependencies and render the MP4.
```

---

## Tools to enable or install for Claude

| Item | Purpose |
|---|---|
| **Claude Code** (or Claude with code execution turned on) | Lets Claude write, run, and render the project instead of only describing it. |
| **Node.js (LTS) + npm** | Runs the React-based animation project. |
| **Remotion** (`npx create-video@latest`) | Builds the video in React and renders it to MP4. |
| **FFmpeg** | Video encoding for the final export (usually bundled with Remotion). |
| **Framer Motion** or **GSAP** | Smooth easing for the browser preview version. |
| **react-force-graph** or **D3** | Physics for the brain graph scene. |
| **Google Fonts** (Caveat, Inter) | Handwritten unsend text and clean interface type. |
| **Image generation** (e.g., Meta's Muse Image) | Claude doesn't generate images itself. Use it for illustrated photos, the envelope, and the library story frame. |
| **Claude Artifacts** (claude.ai) | Quick live previews of each scene before rendering. |
| **Google Drive connector** (or GitHub) | Saves the MP4 and project files where the team can get them. |
| **Screen recorder** (QuickTime or OBS) | Backup: record the HTML preview if rendering fails. |

### Recommended Claude skills and plugins (verified Oct 24, 2026)

| Skill or tool | Where to get it | Use for Unsaid |
|---|---|---|
| **Remotion Claude Code plugin** (official) | `claude plugin marketplace add remotion-dev/claude-code-plugin`, then `claude plugin install remotion@remotion` ([repo](https://github.com/remotion-dev/claude-code-plugin)) | Remotion skills for creating, rendering, and adding captions to the demo |
| **GSAP AI Skills** (official) | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | Correct GSAP timelines for the scenes |
| **Motion AI Kit** (official, Framer Motion team) | `npx motion-ai` ([docs](https://motion.dev/docs/ai-kit)) | Interface micro-animations |
| **snapcn Phone Frame** (community, Remotion) | [snapcn.dev](https://snapcn.dev/docs/screens/phone-frame) | Wraps each screen in a realistic iPhone frame |
| **claudeclip** (community FFmpeg) | [gulkoa/claudeclip](https://github.com/gulkoa/claudeclip) | Trimming, adding audio, GIF export |
| **Anthropic pptx skill** (official) | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pptx) | Turning `Unsaid_Presentation.md` into slides |

No off-the-shelf dual-screen mockup exists, so the device is the custom **white iPhone Duo** component (fictional; built in `Claude_Code_Frontend_Prompt.md` Phase 1). It is the default device everywhere. snapcn is optional now.

## Animation Production Notes (for the later animation prompt)

The current Claude Code frontend prompt (`Claude_Code_Frontend_Prompt.md`) deliberately does **not** build the scripted animation. These notes save the full timed opening, motion specs, tour timing, taglines, render settings, and the frame checklist for the separate animation prompt that comes later.

```text
Saved for the LATER animation prompt (not part of the current Claude Code frontend prompt). It animates the opening (cold-open card, white iPhone Duo reveal, Messages "k" thread, unfold, wallpaper, phrase, app-close to home, tap Unsaid) and the feature tour, then renders with Remotion. Every visual already exists as a static ?state= frame in the frontend build (Claude_Code_Frontend_Prompt.md Phases 1-5). The app-close (B09-B10), the home settle, the tap, and the app-open (B12-B13), plus every app change in the tour, must DRIVE THE BUILT iOS NAVIGATION SHELL programmatically (window.__unsaidShell / shell.open, shell.close, shell.switchTo) instead of re-implementing those transitions. The beat values below are the targets for the shell's springs in those moments. Open question for that prompt: Remotion renders frame by frame, so the shell will need a "driven" mode (its transitions take a progress value from the timeline instead of running on wall-clock springs). Otherwise, screen-record the live shell for those beats.

INSTALL / USE
- npm i remotion @remotion/player @remotion/cli @remotion/google-fonts (ask before adding anything else).
- Use the Remotion plugin skills (remotion@remotion), the GSAP skills, and the Motion AI Kit. For iOS-feel springs, use heyimjames:the-final-5-percent + apple-design-skill motion guidance.
- ONE DETERMINISTIC TIMELINE: write the opening as a pure function of time, getOpeningFrame(t: seconds) -> props for every element, using remotion's interpolate() and spring() (both are pure and work in the browser). The SAME function drives (a) the Remotion composition and (b) the web page /opening via @remotion/player. So seeking with ?t= gives the exact same pixels in both. Framer Motion and GSAP are for in-app micro-interactions during the tour (sheet slides, ripple rings, staggers). Express every spring below as {stiffness, damping, mass}; the same numbers work in remotion spring({config}) and in framer-motion {type:"spring"}.
- 1920x1080, 60 fps. Remotion compositions: "Opening" (24 s = 1440 frames), "Tour" (108 s = 6480 frames), "UnsaidDemo" (Opening + Tour in a Series, 132 s = 7920 frames).

PAGE CONTROLS
- /opening and /tour embed the Player with: a Replay button (outside the artboard; hidden with ?frame=bare), ?t=<seconds> (seek + pause on that exact frame), ?autoplay=1, ?loop=1, ?scene=opening|apps|graph|moment|posthumous|resurfacing|close (jumps to that scene's start), ?badges=off&labels=off for recording.
- prefers-reduced-motion: replace scale/rotate/blur moves with 400 ms crossfades between the same key states.

ELEMENT NAMES USED BELOW
camera = a wrapper around everything except the stage background (transform-origin 960px 540px). duo = <IPhoneDuo> (openAngle, tilt, specular, screenOn, scale). display = the content inside the displays. wallpaper = Stage "wallpaper" layer. coldText, phrase, appCard (the card that morphs between app and icon), home = Phase 3 home screen, touch = the touch-indicator dot, splash = /splash content.
Easings: ease-soft cubic-bezier(0.22,1,0.36,1) · ease-ios cubic-bezier(0.32,0.72,0,1) · ease-breath cubic-bezier(0.45,0,0.55,1).
Display font for on-screen titles: "SF Pro Display", -apple-system, BlinkMacSystemFont, Inter, sans-serif (renders SF on a Mac; Inter elsewhere).

OPENING BEAT TABLE (artboard px; t in seconds; "a->b" = from -> to)
| # | t start-end | On screen | Properties (from -> to) | Easing / spring | Text styling | Sound cue |
| B01 | 0.00-1.00 | Pure black. It is secretly the folded white Duo's OFF display, magnified. | camera scale 5.2 (the 382x830 display covers the full 1920x1080 frame); duo state folded-off; stage bg #000. No movement. | none | none | Room tone only, -40 dB. Silence. |
| B02 | 1.00-4.20 | Cold-open card, centered. | coldText opacity 0->1, blur(10px)->blur(0), translateY 12px->0 over 1.00-1.90; hold 1.90-3.80; out 3.80-4.20: opacity 1->0, blur 0->6px. | in: ease-soft 900 ms; out: ease-ios 400 ms | "The last thing my kid ever texted me was 'k.'" Display font 54px, weight 600, letter-spacing -0.022em, line-height 1.15, color #F5F5F7, max-width 1400px, centered; "'k.'" in #E8A15A. Fade method: opacity + blur + rise (no typewriter). | Silence. |
| B03 | 4.20-6.40 | Pull back: the black was the screen of a folded WHITE phone. | camera scale 5.2->1.0; camera rotateX 4deg->0; duo rim light opacity 0->1 (4.60-6.00, linear); stage stays #000. | spring {stiffness:70, damping:20, mass:1.2} (settles ~2.2 s) | none | Low sub swell 40 Hz, -30 -> -18 dB, fades out by 6.2. |
| B04 | 6.40-10.40 | The display wakes into the Messages thread; the timestamp ages. | duo screenOn; display opacity 0->1 and filter brightness(0.4)->brightness(1) 6.40-6.80; messages state today (6.80) -> yesterday (7.60) -> last-week (8.40) -> last-month (9.20) -> last-year (10.00); each swap: old timestamp+receipt opacity 1->0 & blur 0->4px (160 ms), new opacity 0->1 & blur 4px->0 (200 ms); k-focus dim (others 1->0.35) 9.60-10.00; camera scale 1.0->1.06 slow push 6.40-10.40. | wake: ease-ios 400 ms; swaps: ease-soft; push: linear | iOS chrome as in Phase 2 (SF Text 17 pt bubbles, 11 pt timestamps) | Soft UI tick (our own sound, not Apple's) at each age step, -24 dB. |
| B05 | 10.40-10.90 | Screen sleeps. | display opacity 1->0, brightness 1->0.3; camera scale 1.06->1.0. | ease-ios 500 ms | none | Soft lock click, -20 dB. |
| B06 | 10.90-13.30 | UNFOLD: the left panel swings out from behind on the hinge. We see its glossy white back and camera bump, then its black display as it passes 90deg. | duo openAngle 0->180 (-> left panel rotateY -180deg->0deg; group translateX -215px->0; tilt rotateY = -8deg*sin(openAngle) and rotateX = 3deg*sin(openAngle), so 0 -> -8deg/3deg at 90 -> 0); specular sweep 0->1 across the back glass 11.20-12.40; perspective 2400px; screenOn false. Clamp openAngle to <=180 (overshootClamping). | openAngle: spring {stiffness:90, damping:18, mass:1.4}; specular: ease-breath | none | Soft whoosh 10.9-12.3 (-20 dB); a small hinge "click" when openAngle first reaches 178 (~12.9). |
| B07 | 13.30-15.10 | Zoom out; the blurred Apple-style wallpaper fades in behind the unfolded white Duo. | camera scale 1.0->0.86; wallpaper opacity 0->1 and scale 1.15->1.0 (blur fixed at 80px); duo rim light 1->0; drop shadow + contact shadow opacity 0->1. | ease-soft 1.8 s | none | Warm pad enters, -30 -> -16 dB. |
| B08 | 15.10-18.10 | The phrase, centered across both panels, on black displays. | duo screenOn with a pure-black display bg; phrase in the spanning slot, one line centered on the hinge gap (the hinge falls between "things" and "go"); each word opacity 0->1, blur 8px->0, translateY 10px->0, 700 ms, stagger 160 ms starting 15.30; hold 17.30-18.10. | ease-soft per word | "Some things go unsaid." Display font 44px (artboard px before camera scale), weight 600, letter-spacing -0.02em, #F5F5F7; "unsaid." in #E8A15A. | Single piano note (C4) at 15.30, long sustain. |
| B09 | 17.70-18.25 | Swipe up from the home indicator (overlaps B08's hold). | home indicator (134x5 pt, white) visible on the right display from 17.70; touch at the indicator: opacity 0->0.35, scale 0.6->1 (17.90-18.02); touch translateY 0->-220px (18.00-18.25); appCard (both displays' content as one card) scale 1->0.96, translateY 0->-20px (18.00-18.25). | ease-ios | none | Soft swipe whoosh, -22 dB. |
| B10 | 18.25-19.05 | APPLE-STYLE APP-CLOSE: the phrase "app" shrinks into the Messages icon in the dock (the app the kid left). | appCard rect: both displays (x 554-1366, y 125-955 before camera scale) -> getIconRect('messages') (FLIP: animate left/top/width/height, not scale, so the radius stays true); border-radius 52px->13.6px (64 pt x 0.95 x 22.37%); content crossfade: phrase opacity 1->0 over progress 0-0.45, Messages icon opacity 0->1 over progress 0.45-0.85; home layer opacity 0->1, scale 1.08->1.0, blur 16px->0 (18.25-18.85); touch opacity ->0. | appCard: spring {stiffness:260, damping:30, mass:1}; home: ease-ios 600 ms | none | Soft downward "swoop" (our own), -20 dB. |
| B11 | 19.05-20.40 | The home screen settles; Meta apps are prominent; Unsaid gently calls attention. | icons scale 1.04->1.0, opacity 0.85->1, stagger 12 ms ordered by distance from the Messages icon; widgets same, +40 ms; Unsaid icon (19.90-20.30): scale 1->1.06->1 and amber glow 0 0 24px rgba(232,161,90, 0->0.6->0.3); camera scale 0.86->0.88, translateX 0->-60px (a slight push toward the right panel). | icons: spring {stiffness:400, damping:28, mass:0.8}; glow: ease-breath 400 ms; camera: ease-soft | Labels as in Phase 3 | Soft warm chime at 19.95, -22 dB. |
| B12 | 20.40-20.95 | Tap Unsaid. | touch at the Unsaid icon center: opacity 0->0.35, scale 0.6->1 (20.40-20.52); icon scale 1->0.9 and black overlay 0->15% (20.55-20.67); release scale 0.9->1, overlay ->0 (20.75-20.87); touch opacity ->0 (20.75-20.95). | ease-ios 120 ms each | none | Soft tap, -18 dB. |
| B13 | 20.87-21.67 | APP-OPEN: Unsaid zooms open from its icon across both panels. | appCard rect getIconRect('unsaid') -> both displays; border-radius 13.6px->52px; content: icon opacity 1->0 (progress 0-0.3), splash opacity 0->1 (progress 0.2-0.6); home scale 1->0.94, blur 0->12px, opacity 1->0; camera scale 0.88->1.0, translateX -60px->0. | appCard: spring {stiffness:300, damping:32, mass:1}; home: ease-ios 500 ms; camera: ease-soft 800 ms | none | Warm swell; the first soft piano phrase begins. |
| B14 | 21.67-23.40 | Unsaid splash (Phase 4 /splash). | logo scale 0.96->1.0 (ease-soft 900 ms); left-display Caveat line opacity 0->1, blur 6px->0 (22.00-22.70); footer "powered by Meta AI" opacity 0->1 (22.40-22.90). | ease-soft | Caveat 34px/40 #4A1F35 "for the words we never got to say."; footer 12 pt per M9 | Piano continues, -16 dB. |
| B15 | 23.40-24.00 | Into the Unsaid Home (Screen 1). The tour starts at 24.00. | splash opacity 1->0; home screen 1 translateY 12px->0, opacity 0->1. | ease-soft 600 ms | per Phase 4 | Piano continues. |

FEATURE TOUR (follows Demo_Script.md scene order; the new opening above is prepended; all times absolute)
| Scene | t | Routes / states used | Motion notes |
| 2 Inside the apps you use | 24.0-39.0 | /apps/instagram/feed (24.0-30.0): the Unsaid mark on Mom's post pulses once at 26.0, tap ripple at 27.5, morph into /memories?state=selected (28.0-30.0); then /overlays (30.0-39.0): three folded Duos, the marks pulse 600 ms apart, line "unsaid meets you where you already are." | Pulse: scale 1->1.12->1, ease-breath 600 ms; ripple-ring 1.2 s; morph = the B13 app-open pattern from the mark's rect |
| 3 The brain graph fills in | 39.0-62.0 | /graph empty -> hubs (Fam, Roommates, Marfa Trip light one at a time, 1.2 s apart) -> full (people orbit, memory thumbnails bloom, gap links pulse) -> node-open | Graph physics seeded and frame-driven (positions precomputed per frame from the seed, so renders are deterministic) |
| 4 The right moment | 62.0-82.0 | /story-notification: story (Mom's phone: 10 missed calls + record "No emergency. I just wanted to hear your voice."; kid's library story) -> notification slides down (spring-soft + ripple) -> tap "Call Mom" -> call (cream->peach warm over 1.2 s, "0:01... 0:02...") | Optional 2 s cutaway to /apps/meta-ai/glasses ("record an unsend hands-free") |
| 5 Posthumous release | 82.0-107.0 | /proxy?state=3-of-3 -> /posthumous?state=date-turned (date card turns forward to "June 12, 2034 · Graduation Day") -> letter unfolds ("I'm so proud of you. I always was.") + waveform | Date turn: rotateX -90deg->0 per card, ease-soft 900 ms, 120 ms stagger |
| 6 Resurfacing mid-argument | 107.0-127.0 | Tense Messenger look-alike chat ("whatever." / "you always do this.") -> the "Remember this?" sheet slides up -> warm photos + "Everything will be okay." (Caveat) -> next bubble types "I'm sorry. Dinner Friday?" -> /plans?state=recipient | Sheet: spring {stiffness:220, damping:26, mass:1}; typing dots 3x |
| 7 Close | 127.0-132.0 | Unsaid wordmark on bg-dusk; tagline; "powered by Meta AI" | Fade + 2% scale settle, ease-soft 1.2 s |
Total ~2:12. If we need exactly 2:00, trim Scene 3 by 6 s and Scene 5 by 6 s (ask me first).

**Optional face-grouping beat (v2 prompt / frontend spec v3; adds no time):** if we use it, it goes **inside Scene 3's existing 39.0–62.0 window, replacing the "faint dots" lead-in rather than adding to it**.
- 39.0–42.5: the `/memories?state=faces-popup` sheet slides up ("We found 4 people in your photos": Mom? 212 · Jordan? 148 · Priya? 96 · Name this person 31). The sheet uses spring {stiffness:220, damping:26, mass:1}, and the avatars scale in with 120 ms stagger.
- ~41.5: a tap ripple lands on "Mom?".
- 42.5–43.5: the Mom avatar flies into her node as the graph hubs start lighting up.
- The graph beats then continue as written, compressed by 3.5 s. Scene 3 stays 23 s and the cut stays ~2:12.
- VO stays the same ("Your people were always there"). Skip the beat entirely if it makes Scene 3 feel rushed.

TAGLINES (use the defaults unless I pick another)
- Cold open (fixed): "The last thing my kid ever texted me was 'k.'"
- Duo phrase, B08 (default): "Some things go unsaid." Alternatives: "Say it while you still can." / "For everything we never said."
- Close (default): "For the words we never got to say."

RENDERING AND RECORDING
- Preview: npx remotion studio. Render: npx remotion render UnsaidDemo out/unsaid-demo.mp4 --codec=h264 --crf=16 (and "Opening" alone for quick checks). Stills: npx remotion still UnsaidDemo --frame=<t*60> out/frames/t-<t>.png.
- Fonts: load Inter and Caveat with @remotion/google-fonts. SF Pro is never bundled. Render on a Mac (Chrome there resolves -apple-system to SF); on Linux the stack falls back to Inter, which is acceptable.
- Backup: screen-record /opening?autoplay=1&frame=bare&badges=off&labels=off at 1920x1080, 60 fps (OBS or QuickTime), browser zoom 100%, a hardware-accelerated Chrome.
- Performance: will-change only on the elements that animate in a beat; keep backdrop-filter to the dock/widgets; pre-render the wallpaper blur to a PNG at build time if it drops frames.

FRAME-BY-FRAME ACCEPTANCE CHECKLIST
Verify each line by SCREENSHOTTING that exact timestamp (npx remotion still ... --frame=t*60, AND Playwright on /opening?t=<t>&frame=bare&badges=off&labels=off), then LOOK at both images; they must match. Put all of them in screenshots/opening/ and report a pass/fail per line.
[ ] t=0.50  Fully black frame (no frame edge, no island visible).
[ ] t=2.80  Cold-open line fully visible, sharp, centered; 'k.' in amber; still black behind.
[ ] t=4.30  Text gone; still pure black.
[ ] t=5.00  The white frame edges are entering the frame from outside; the black is clearly a screen.
[ ] t=6.40  A single white iPhone (folded Duo) centered on black, rim-lit, display off; right-edge buttons visible.
[ ] t=7.00  Messages thread visible, "Today" timestamps, "k" bubble bottom-right.
[ ] t=8.80  Timestamps read "Thu, Oct 15..." (last-week).
[ ] t=10.20 Timestamps read "Oct 23, 2025..."; everything except "k" dimmed.
[ ] t=10.90 Display black again; camera back at scale 1.0.
[ ] t=11.60 Left panel's white back + camera bump peeking out behind the right panel (about unfold-45).
[ ] t=12.00 Left panel near edge-on (about unfold-90); the device is tilted about -8deg; no missing faces.
[ ] t=12.40 Left panel's black display facing forward (about unfold-135); the specular band has crossed the back.
[ ] t=13.30 Fully unfolded white Duo centered, hinge with 5 segments, both displays black, on black.
[ ] t=14.20 Wallpaper half-faded in, the device at about 0.92 scale, shadow appearing.
[ ] t=15.10 Wallpaper full; device at 0.86; no rim light.
[ ] t=16.50 "Some things go unsaid." fully visible, centered across the hinge, "unsaid." amber.
[ ] t=18.10 Touch dot on the right display's home indicator, moving up; the phrase card slightly lifted.
[ ] t=18.55 Mid app-close: a rounded card, radius between 52 and 14, heading to the Messages dock icon; home screen half visible, slightly blurred.
[ ] t=19.05 Home screen fully settled; Messages icon in the dock; no ghost card.
[ ] t=20.10 Unsaid icon glowing amber and slightly enlarged; Meta apps prominent on the right panel.
[ ] t=20.60 Unsaid icon pressed (0.9 scale, darkened), touch dot on it.
[ ] t=21.20 Mid app-open: a rounded card expanding from the Unsaid icon, splash fading in; the home screen blurring away.
[ ] t=22.80 Splash: logo on the right display, Caveat line on the left, "powered by Meta AI" footer.
[ ] t=24.00 Unsaid Home (Screen 1) fully visible; the tour begins.
[ ] Tour spot checks: t=26.0 (mark pulse), 34.0 (three folded Duos), 50.0 (graph hubs), 72.0 (notification over story), 95.0 (date card June 12, 2034), 118.0 ("Remember this?"), 130.0 (close tagline).
[ ] No frame shows a placeholder badge or concept label when ?badges=off&labels=off (the rendered video).
[ ] Rendered MP4 is 1920x1080, 60 fps, about 2:12; plays smoothly; no dropped frames visible in the opening.

DONE WHEN: every checklist line passes, the Replay button and ?t=/?scene= work, and the MP4 renders. Commit; do not push.

STOP AND LET ME REVIEW: send me the MP4 path, the checklist with pass/fail, and the screenshot folder.
```

## Production checklist

- [ ] Generate illustrated assets (photos, envelope, library story, avatars)
- [ ] Paste the prompt into Claude Code and scaffold the Remotion project
- [ ] Review each scene in preview; retime in the config
- [ ] Render the MP4; keep copies on two devices plus the cloud (never rely on Wi-Fi)
- [ ] Rehearse the talking points over the video

## Changelog

| Date (CT) | Change |
|---|---|
| Oct 24, 2026 | Created: timed ~2:00 storyboard (the four pitch beats plus the in-app logo/generational scene and the contextual-trigger scene), talking points, Claude prompt, tool checklist. |
| Oct 24, 2026 | Added the verified Claude skills and plugins for the animation (Remotion plugin, GSAP, Motion, snapcn phone frame, claudeclip, pptx). |
| Oct 24, 2026 | Added emotional direction notes from spec v2 (Section 13). |
| Oct 24, 2026 | New 24-second opening: cold-open card → reveal that the black is the folded **white iPhone Duo**'s screen → Messages "k" thread with the aging timestamp → unfold → blurred wallpaper + "Some things go unsaid." → Apple-style app-close to a home screen with Meta apps → tap Unsaid. Storyboard retimed (~2:12), 60 fps, the white Duo replaces "two phone frames side by side", and Meta apps are now SVG/CSS look-alikes with real names (never official assets). Added "Animation Production Notes" (the beat table with start/end times, properties, springs, text styling, and sound cues; the feature tour timing; taglines; Remotion render; the frame-by-frame screenshot checklist). These were moved out of the frontend prompt, which now only builds the static screens and the interactive iOS navigation shell; the later animation drives that shell programmatically. |
| Oct 24, 2026 | Prompt v2 / frontend spec v3 / product spec v5: the frontend build now keeps a build log, pushes `frontend/` only after each change, and runs 10 parallel Haiku reviewers. Added an **optional face-grouping beat** (the "We found 4 people in your photos" sheet, then a tap on "Mom?" that flies into her graph node) inside Scene 3's existing window; it adds no time and the total stays ~2:12. |
