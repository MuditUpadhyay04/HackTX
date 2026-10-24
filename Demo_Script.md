# Unsaid: Demo Script & Animation Production

*HackTX 2026 · Meta track: "Bringing People Closer Together with AI"*

**The demo is 100% animation.** No real device, no Apple developer access, no live gallery or camera, no live data. It's built with Claude (Remotion to MP4). This file tracks demo production separately from the product spec (`Unsaid_Product_Spec.md`) and is kept in sync with it.

---

## Timed storyboard (~2:00)

| Time | Scene | On screen | Audio | Emotional goal |
|---|---|---|---|---|
| 0:00–0:12 | **1. The "k" opening** | Black screen; Mom's thread with the reply "k."; the timestamp ages to "1 year ago"; the line *"The last thing my kid ever texted me was 'k.'"* | Silence | Gut punch |
| 0:12–0:27 | **2. Inside the apps you use** | A look-alike photo feed; the Unsaid logo pulses on Mom's post; tap leads into Unsaid; a three-panel row for Gen Z, your parents, and the grandparents | Soft piano begins | "No new app, no new habit" |
| 0:27–0:50 | **3. The brain graph fills in** | Faint dots, then the Fam, Roommates, and Marfa Trip hubs light up; people orbit; memory thumbnails bloom; drifting links pulse | Piano builds | "Your people were always there" |
| 0:50–1:10 | **4. The right moment** (contextual trigger) | Mom's 10 missed calls, then her voice unsend; the kid's library story; a notification with "Reply with an unsend" and "Call Mom"; tap Call; Mom connects | Ring, then warmth | Unsaid is proactive and gets them talking |
| 1:10–1:35 | **5. Posthumous release** | "Proxy confirmation 3 of 3 received"; the date turns to June 12, 2034 (Graduation Day); a letter unfolds | Quiet strings | Love that outlives you |
| 1:35–1:55 | **6. Resurfacing mid-argument** | A tense chat; the "Remember this?" card; warm photos with *"Everything will be okay."*; "I'm sorry. Dinner Friday?" | Tension, then release | This too shall pass |
| 1:55–2:00 | **7. Close** | Unsaid wordmark; *"For the words we never got to say."*; "Powered by Meta AI" | Final chord | Remember it |

**Talking points to say over the video:**
- *"Unsaid meets you where you already are: Instagram for Gen Z, WhatsApp for your parents, Facebook for the grandparents."* (Scene 2)
- *"Record at 3 AM, deliver when they're actually awake."* (Scene 4)
- *"Without Meta's AI, this is just a journal. With it, Unsaid knows your people and finds the moment."* (Scene 3 or the close)

**Honesty notes for judges:** the logo overlay and in-app notifications are concept features that would need a Meta partnership. Social app screens are look-alikes and don't use Meta's real logos or UI assets.

---

## Visual style

- Soft gradients (dusk rose, peach, warm cream), lots of breathing room, rounded phone-style frames.
- Gentle motion: slow fades, soft scale-ins, easing. Nothing snaps.
- Handwritten font (Caveat) for unsends; Inter for interface text.
- Cream, deep plum (#4A1F35), and one amber accent (#E8A15A).
- The Unsaid mark: a speech bubble drawn with a single line, left slightly open.

---

## Ready-to-paste prompt for Claude

```text
You are a senior motion designer and front-end engineer. Build a ~2-minute animated product demo for "Unsaid", an AI app (powered by Meta AI) that helps people say the words they never said to the people they love. The demo is pure animation: no real device, no live data.

STYLE
- Warm, minimal, emotional. Soft gradients (dusk rose -> peach -> warm cream), generous whitespace, rounded phone-style UI frames floating on the gradient.
- Gentle motion only: slow fades, soft scale-ins, ease-in-out curves; nothing snaps.
- UI type: clean sans-serif (Inter). The user's own messages ("unsends"): handwritten-style font (Caveat).
- Palette: cream backgrounds, deep plum text (#4A1F35), one warm amber accent (#E8A15A) for key moments.
- Unsaid logo: a single-line speech-bubble outline left slightly open (a gap where the words went unsaid), white on a frosted semi-transparent circle when overlaid on photos.
- Social app screens are generic LOOK-ALIKES (photo feed, story viewer, chat). Do NOT use Instagram, Facebook, or WhatsApp logos or exact UI assets.
- 1920x1080, 30fps.

SCENES
1. THE "k" OPENING (0:00-0:12): Black screen. One message bubble in "Mom"'s thread shows the user's last reply: "k." Timestamp below ages: "2 weeks ago" -> "3 months ago" -> "1 year ago". Centered text fades in: "The last thing my kid ever texted me was 'k.'" Hold 3 seconds of stillness, no music.
2. UNSAID LIVES INSIDE THE APPS YOU USE (0:12-0:27): A photo feed scrolls gently. On Mom's post, a small Unsaid logo in the top-right corner of the image pulses once, like a heartbeat. A finger tap ripples on it and the screen softly morphs into Unsaid. Then a quick three-panel row: photo-feed look-alike labeled "Gen Z", chat-app look-alike labeled "Your parents", social-feed look-alike labeled "The grandparents", each showing the logo on a post. Text: "Unsaid meets you where you already are."
3. THE BRAIN GRAPH FILLS IN (0:27-0:50): Near-empty cream canvas with a few faint, disconnected dots. Group-chat hub nodes light up one at a time, labeled "Fam", "Roommates", "Marfa Trip". Person nodes drift into orbit around their hubs with soft physics. Small memory nodes bloom off people with tiny rounded photo thumbnails (soft illustrated placeholders). A few links glow faintly and pulse slowly, as if waiting.
4. THE RIGHT MOMENT (0:50-1:10): Mom's phone shows "10 missed calls" to her kid. She records a voice unsend (waveform): "No emergency. I just wanted to hear your voice." Cut to the kid's story: a cozy library study scene. A soft Unsaid notification slides down from the top of the story: "Mom left you something." with two buttons: "Reply with an unsend" and "Call Mom". The finger taps "Call Mom"; the screen warms and shows "Mom" connected, 0:01... 0:02...
5. POSTHUMOUS RELEASE (1:10-1:35): Calm confirmation card: "Proxy confirmation 3 of 3 received." A date card turns forward several years to "June 12, 2034 - Graduation Day". An illustrated sealed envelope opens; a handwritten letter unfolds ("I'm so proud of you. I always was.") with a gentle voice waveform beneath.
6. RESURFACING UNSEND MID-ARGUMENT (1:35-1:55): A tense chat between partners: short, sharp bubbles ("whatever." / "you always do this."). A soft card slides up from the bottom: "Remember this?" It reveals a past unsend: 2-3 warm photo cards from a good day plus handwritten text "Everything will be okay." The chat calms; the next bubble types in: "I'm sorry. Dinner Friday?"
7. CLOSE (1:55-2:00): Unsaid wordmark on the gradient. Tagline: "For the words we never got to say." Small line: "Powered by Meta AI".

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

No dual-screen or foldable phone mockup tool exists (and there's no real "iPhone Duo"). For a two-screen look, place two phone frames side by side.

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
