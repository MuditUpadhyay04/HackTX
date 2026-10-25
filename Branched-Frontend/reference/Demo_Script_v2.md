# Unsaid: Demo Script v2 — "One Evening"

*The combined cut. Built from Mudit's film, Grok's and Codex's readings of it, and Claude's section of `claude-grok-collab.md`. Proposed replacement for the storyboard in `Demo_Script.md`, pending team sign-off.*

**For:** Gurneal (visuals, edit) and Mudit (talk track, tech slide) · Oct 24, 2026
**Slot:** 3:00 to present (2:20 video + 0:40 live) · 2:00 Q&A

---

## 0. The shape in one glance

| | Time | What | Made how |
|---|---|---|---|
| Act 1 — three apps, three masks | 0:00–0:38 | Jordan's thread · Mom's calls · Priya's reels · the gallery | Film. Real apps on a real phone, teammates as the cast. |
| **Act 2 — the knock, the rant, her morning** | **0:38–1:40** | **Our product, start to finish** | Screen recordings of the real app. |
| Act 2b — the kitchen | 1:40–1:56 | The WhatsApp call: Nani, Nana, then Mom alone | Filmed. Nobody talks over it. |
| Act 3 — Jordan, himself, Priya | 1:56–2:14 | He picks what Jordan hears · a video to himself · a reel back | Half product, half film. |
| Close | 2:14–2:20 | End cards | |
| Live — tech slide | 2:20–2:52 | One slide: ran live / where AI isn't / acted or Round 2 | Mudit |
| Live — last line | 2:52–3:00 | | Mudit |

**Product on screen: 76 seconds** (0:38–1:40, 1:56–2:04, 2:08–2:14). Target was 1:00–1:20.

---

## 1. Rules this cut lives by

1. **Everyone is reaching for him. He's the one who went quiet.** Jordan writes paragraphs, Mom calls three times, Priya has sent reels for a week. He gives each a mask: a deleted draft, "very busy," "just tired." The film is a V: he withdraws Jordan → Mom → Priya and comes back Mom → Jordan → Priya. Mom first, because her love makes the harder conversation survivable.
2. **The AI speaks twice, briefly, in the first minute.** After that the comfort comes from Mom, then Jordan, then his own face. The product works when its voice disappears.
3. **Unsaid is the hallway, not a fifth app.** Every beat ends in someone else's app: Mom in WhatsApp, Jordan in Messages, Priya in Instagram.
4. **Silence is a shot.** Three holds: after "are you sure?", after Mom's voice note, after Mom's last sentence. Mudit does not talk through them.
5. **Nothing the model writes ever appears as his words.** Muse Spark returns positions in his transcript; the app cuts the pieces out. The first draft is always his own voice.
6. **Honesty lives on the tech slide, not as labels on the film.** Two things are acted; we say which.
7. **The "k." survives** as thread history in Mom's WhatsApp (shot 3), under "khaana khaya?"

---

## 2. Cast, clocks, language

| Role | Name in the film | Notes |
|---|---|---|
| The kid | **Arjun** (swap in the presenter's name if it's their story) | International student, Austin |
| Girlfriend | **Jordan** | Same name as the frontend spec's mock partner |
| Best friend | **Priya** | Same as the spec's drifting best friend; the reels |
| Mom | **Mom** | In India; no app, no account |
| Grandparents | **Nani, Nana** | On speaker in the kitchen |

**Clocks (do the math once, show it twice).** Austin is CDT (UTC−5) on Oct 24; India is IST (UTC+5:30); 10 h 30 min apart.

| Austin | India | Story beat |
|---|---|---|
| 6:32 PM Sat (dusk) | 5:02 AM Sun | He's on her photo. She's asleep. |
| 9:30 PM Sat | 8:00 AM Sun | The card arrives. The kitchen calls. |
| ~9:50 PM Sat | | Jordan, the video note, Priya |

The whole story is one evening. That's why the last card says *today*.

**Language.** Hindi lines below are examples. Use whichever home language a teammate's family actually speaks, recorded by a native speaker. Subtitles on every non-English line, lowercase, Inter.

---

## 3. Shot list

Style, type, palette, and motion tokens are in `Unsaid_Frontend_Build_Spec.md` §3; nothing new here. 1920×1080, 30 fps. Phone recordings sit in the CSS `PhoneFrame` on the `bg-dusk` gradient; the gradient darkens to night at shot 11.

### Act 1 — three apps, three masks (0:00–0:38) · film

| # | Time | On screen | Motion & audio | Source |
|---|---|---|---|---|
| 1 | 0:00–0:04 | Black. | Silence. Room tone only. | Edit |
| 2 | 0:04–0:12 | **Messages**, thread "Jordan". Her bubbles land one by one: *"hey"* (4:10 PM) · *"can we talk tonight?"* (5:02) · *"i miss how we used to talk"* (5:40) · *"I just feel like you don't get me and are not ready to understand me."* (6:21). His cursor in the field. He types *"i'm sorry i"*, stops, deletes it letter by letter. Leaves. | Each bubble with a soft tick; the last one with none. The deletion is slow. Status bar 6:31 PM. | Screen-record a real iPhone; a teammate sends the lines from a contact saved as Jordan. (If you want the red from Mudit's version: his one-word *"sorry"* with a red **Not Delivered** under it, his words not even landing. Pick one; don't do both.) |
| 3 | 0:12–0:21 | **WhatsApp**, "Mom". Thread history above: Mom *"khaana khaya? 🙂"* → him *"k"* (yesterday). Today: *Missed voice call* ×3 (6:02, 6:14, 6:27). The phone rings now: *Mom · WhatsApp voice call*. He lets it ring out. Types: *"feeling tired these days. we'll talk later. very busy."* Send. Two grey ticks. | Ring quiet, two cycles, then stops. A now-playing pill slides in at the top: ♪ *We Don't Talk Anymore*. Title only; the music bed is original or licensed piano, never the recording. | Real phone; a teammate's number saved as Mom. |
| 4 | 0:21–0:30 | **Instagram** DMs, "Priya". Reels stacking with the time device: *1w* · *2d* · *1d* · *today*. Then: *"hey yo, are you good?"* He: *"just tired."* Her: *"are you sure?"* **Hold 2 s on that line.** He swipes the app away. | The typing dots before "are you sure?" take a full second. Then nothing. | Real phone; teammate as Priya. |
| 5 | 0:30–0:38 | **Photos.** Fast scroll, slowing. Stops on a photo: him and Mom in the kitchen, her hand on his shoulder. He opens it. Pinch, drift, his thumb moving it around. Hold. | No music under the hold. | Real phone, a real consented photo (a teammate and their mom, or the two of them cast). |

### Act 2 — the knock, the rant, her morning (0:38–1:40) · product

| # | Time | On screen | Motion & audio | Source |
|---|---|---|---|---|
| 6 | 0:38–0:44 | A notification slides down over the photo: Unsaid mark · **"Mom left you a voice note on tuesday."** · *you haven't heard it yet.* He taps. | `spring-soft` slide, one amber ripple ring (the haptic), the soft chime. | Composite the `NotificationSheet` (spec screen 11) over the Photos recording. It's a real push (an unheard-reply reminder); landing while her photo is open is the film's coincidence. Named on the tech slide. |
| 7 | 0:44–0:52 | Unsaid opens on the same photo (reminisce layout, spec screen 10). Waveform. Her voice note plays, in Hindi: *"Beta, koi emergency nahi hai. Bas teri awaaz sunni thi."* Subtitle: *no emergency. just wanted to hear your voice.* Under it a chip: 🌙 **5:02 AM for Mom · asleep**. **Hold 1.5 s after the note ends.** | | Real app, screen-recorded. The note is a real recording by a teammate's mom (or a teammate). |
| 8 | 0:52–1:04 | He holds the mic. He talks, messy, 12 s (text in §4). The transcript appears word by word while he's still speaking (spec screen 2's right pane, single frame). | Words land ~6/s, Caveat. The waveform breathes. | Real app. **Muse Voice Transcribe**, realtime socket. |
| 9 | 1:04–1:10 | He lets go. The transcript folds into three cards, in his words (Caveat), each with a tone chip: **Mom · 2** *missing* · **Jordan · 3** *overwhelmed* (1 tonight, 2 from earlier weeks, dates shown) · **Priya · 1** *tired*. A tiny grey check: *safe to hold*. | Cards `scale-in` with 120 ms stagger. | Real app. **Muse Spark** returns spans; the app cuts them from his transcript. |
| 10 | 1:10–1:20 | He taps Mom's card. One line from Unsaid, lowercase: ***"you couldn't pick up. you still want her to know. hold this until her 8 AM?"*** Button: **send when it's her morning**. Tap. Ripple. The card settles into a strip: *Mom · waiting · 8:00 AM her time*. Jordan's and Priya's cards sit below, dimmed. | `dur-hold` on the settle. | Real app. |
| 11 | 1:20–1:26 | Time-skip card on the gradient: dusk darkens to night; two clocks cross-fade: **9:30 PM Austin · 8:00 AM India**. Small line: *3 hours later*. | The tide line drifts across the bottom (the motif). | Remotion or the editor. |
| 12 | 1:26–1:40 | **Mom's phone** (Android, WhatsApp). A message from *Unsaid*: *"Arjun left you something. open it when you have a minute."* + link. She taps. The card page opens in her browser: the kitchen photo · ▶ his voice (the Mom turn only) · his words with the Hindi caption beside · two buttons: **hold to reply** · **call him**. She presses **call him**. | The page is cream and plum like the app. No login, no app store. | Real Android, real WhatsApp, real Cloud API template (fallback in §6). Film the phone in her hand rather than screen-recording; it's warmer. |

### Act 2b — the kitchen (1:40–1:56) · filmed

| # | Time | On screen | Motion & audio | Source |
|---|---|---|---|---|
| 13 | 1:40–1:50 | WhatsApp video call, his screen. The kitchen. Nani and Nana lean into frame, talking over each other, laughing. | Natural sound. **No narration. No music.** | Screen-record the real call on his phone at 9:30 PM Austin Saturday (8:00 AM India Sunday). A teammate's actual family if at all possible; otherwise teammates, and say so on the tech slide. |
| 14 | 1:50–1:56 | Mom alone, closer to the camera: *"Chahe kuch bhi ho raha ho, main hoon. Jab bhi kuch kehna ho, bol dena. Sunne wale log hain."* Subtitle: *whatever's going on, I'm here. whenever you need to say something, say it. there are people who'll listen.* **Hold 1 s on her face after the line.** | | Same recording. |

### Act 3 — Jordan, himself, Priya (1:56–2:14)

| # | Time | On screen | Motion & audio | Source |
|---|---|---|---|---|
| 15 | 1:56–2:04 | Back in Unsaid. Jordan's card is lit: **"3 things you never told her."** He opens it. Three lines, his, with dates. He unchecks tonight's (too raw), keeps the two from before. **send to Jordan** → Messages opens with one note (the two lines + a link to the card). He taps send. Blue. | | Real app → real `sms:` share → real Messages. **Product.** |
| 16 | 2:04–2:08 | Her reply: typing dots… *"i didn't know you were feeling like this. why didn't you tell me?"* … *"i wish we'd talked about it more. tell me everything. i'm here."* | | Acted (teammate as Jordan). Declared on the tech slide. |
| 17 | 2:08–2:11 | Unsaid: **for the next hard day.** He records a 3-second video to himself; we see one line of him: *"next time: remember tonight."* Saved: *to: me*. | | Real app. **Product.** |
| 18 | 2:11–2:14 | Unsaid home: *"waiting on you: Priya asked twice."* → **open instagram**. Instagram opens on her thread; he sends a reel back. Her: *"THERE he is 😭"* | | Real app → real handoff; her reply acted. |

### Close (2:14–2:20)

| # | Time | On screen | Audio |
|---|---|---|---|
| 19 | 2:14–2:20 | Wordmark on the gradient. ***For the words we never said. Until today.*** Then, smaller: *not "this too shall pass." let's make today count.* Bottom: *Powered by Meta AI.* | Final piano chord, then silence. |

**Brand touchpoints** (so the product is visible without a logo slide): the mark on the notification (6), the wordmark in the app chrome (7–10, 15, 17, 18), *sent with unsaid* in the footer of Mom's card page (12), the end card (19).

---

## 4. Mudit's talk track (verbatim)

About 170 words over 2:20. A dash means stay quiet. Press play on "quiet."

| Time | Say |
|---|---|
| 0:00 (black) | "Everyone in this story is reaching for him. Watch who goes quiet." |
| 0:12 (WhatsApp) | "'Very busy.' He isn't. He's protecting her from a day he can't explain." |
| 0:28 ("are you sure?") | — |
| 0:33 (gallery) | "He doesn't go to a person. He goes to a photo. A photo can't ask how he's doing." |
| 0:45 (her voice note) | "It's 6:30 in Austin. It's 5 AM in her kitchen. He won't wake her." |
| 0:56 (transcript) | "That's Muse Voice Transcribe, live. Hindi and English in one breath." |
| 1:04 (three cards) | "Muse Spark sorts it by person. Every word on those cards is his. The model only points at his transcript. It never writes the love." |
| 1:14 (hold) | "Unsaid speaks once. Then it waits for her morning." |
| 1:26 (Mom's phone) | "8 AM in India. No app, no account. His voice, her language." |
| 1:40 (kitchen) | — (do not talk until the end card after 1:56) |
| 1:56 (Jordan) | "Mom filled him up. Now he can say the hard thing, in the app where Jordan already lives." |
| 2:08 (video note) | "And he leaves a witness for the next hard night. His own face, not ours." |
| 2:11 (Priya) | "The light one last. In her dialect: reels." |
| 2:14 (close) | — |

**His rant (shot 8), ~12 s, pause between people so the turns split cleanly:**

> "I don't know, man. Jordan said I don't get her, and maybe she's right. *(pause)* Mumma called three times today and I said I'm busy. I'm not busy. Mujhe bas ghar ki yaad aa rahi hai. *(pause)* And Priya keeps sending reels and I can't even laugh right now."

**What the three cards show (shot 9):**

| Card | Lines (his, verbatim) | Tone |
|---|---|---|
| Mom · 2 | "Mumma called three times today and I said I'm busy. I'm not busy." · "Mujhe bas ghar ki yaad aa rahi hai." *(caption: I just miss home.)* | missing |
| Jordan · 3 | tonight: "Jordan said I don't get her, and maybe she's right." · Oct 11: "I didn't text back because I didn't want you to hear me like this." · Sep 30: "I miss how we used to talk too." | overwhelmed |
| Priya · 1 | "Priya keeps sending reels and I can't even laugh right now." | tired |

In shot 15 he unchecks tonight's and sends the Oct 11 and Sep 30 lines, which were already addressed to her. No rewriting needed.

---

## 5. The tech slide and the last line (live, 2:20–3:00)

One slide, three columns. Mudit reads it in ~32 s, then the last line.

**Ran for real (in the video, and on this phone right now)**
- **Muse Voice Transcribe** · `wss://api.meta.ai/v1/asr/realtime` · Hindi and English in one session · `languageBias: ["English","Hindi"]`
- **Muse Spark 1.3** · one rant → per-person spans as character positions, never text · the safety gate runs first and routes fear, control, or hopelessness to 988 and 1-800-799-7233 instead of a send button
- **WhatsApp Cloud API** · Mom's 8 AM, from an Unsaid number, no account on her side
- **Share sheet / `sms:`** · Jordan in Messages, Priya in Instagram
- Next.js PWA · FastAPI · Supabase (or SQLite)

**Where AI isn't**
- time zones are math
- the words are his
- the comfort is theirs

**Acted, and the Round 2 ask**
- Jordan's and Priya's replies: teammates
- The knock landing while he's in Photos. Only Meta can put that on the photos people already scroll. That's what we'd build in Menlo Park.

*(Optional line, only if the script in `claude-grok-collab.md` §3d was run: "safety gate: 10/10 concerning rants → resources, 0/20 ordinary blocked.")*

**Say (≈32 s):**
> "Everything from the knock to Mom's phone ran for real. Muse Voice Transcribe over the realtime socket, Hindi and English in one session. Muse Spark returns character positions in his transcript, never text, so it can't put words in his mouth. A safety gate runs before any of it: fear or hopelessness goes to 988, not to a send button. Mom's 8 AM arrives through the WhatsApp Cloud API; Jordan gets the share sheet. Two things were acted: the replies, and the knock landing while he's in Photos. That knock is our ask for Menlo Park. Only Meta can put it on the photos people already scroll."

**Last line (≈8 s):**
> "Facebook brought back the people. Instagram kept the photos. Unsaid keeps the words that never got attached to them. No words left behind."

Rehearse the whole thing to 2:55. If the slide runs long, drop the stack line (Next.js / FastAPI / Supabase); nobody is scoring it.

---

## 6. What the app needs for the recording

Only these screens. Everything else in the frontend spec stays NOT YET CONNECTED and does not appear in the video.

| Shot | Screen | From the spec | New? | Backend (Mudit) |
|---|---|---|---|---|
| 6 | Notification sheet | screen 11 `NotificationSheet` | composite only | push for an unheard reply (`unheard-reply-nudge`) |
| 7 | Memory with her voice note + time chip | screen 10, screen 3 | time-zone chip is new | `recipient-timezone-set`; replies stored from the card page |
| 8 | Rant with live transcript | screen 2 (single frame) | no | WebSocket relay to Voice Transcribe, `ENDPOINTING` mode so pauses split turns |
| 9 | Three person cards from one rant | — | **new** | `rant-split`: Spark returns `{spans:[{person,start,end,tone}], safety}`; server slices the transcript and the audio by turn |
| 10 | Hold until her morning | screen 4's delivery card, reworded | copy only | `unsend-hold-until-morning`: store UTC release time from her IANA zone |
| 11 | Time-skip card | — | video only | — |
| 12 | Mom's card page `/c/<token>` | — | **new** | no auth; expiring, revocable token; `reply-page-record`; `call-start` as `wa.me` / `tel:` |
| 15 | Jordan's pile → Messages | screens 4, 9 | pile view is new | `unsend-share-sms`: one note + card link |
| 17 | Video note to self | screen 6's record, repurposed | tiny | `self-note-record`, recipient = me, label "for the next hard day" |
| 18 | Waiting on you → Instagram | screen 1's pending strip | copy only | the list is his own reminders; the button is a handoff |

**Spark's contract (so it can never write his words):**

```json
{ "spans": [
    { "person": "mom",    "start": 61,  "end": 139, "tone": "missing" },
    { "person": "jordan", "start": 19,  "end": 60,  "tone": "overwhelmed" },
    { "person": "priya",  "start": 140, "end": 199, "tone": "tired" } ],
  "safety": "ok" }
```

Validate every span against the transcript length and every `person` against his people list. If `safety` is anything but `ok`, no cards form; the resources screen (spec screen 8) shows instead.

**Mom's 8 AM, primary and fallback.**
- *Primary:* WhatsApp Cloud API, template `{{1}} left you something. open it when you have a minute.` from the free test number (up to 5 verified recipients). **Submit the template in the first hour of backend work**; review can take minutes or a day.
- *Fallback:* at 9:30 PM the app pings *him*: *"it's 8 AM for Mom. send it now?"* → one tap → share sheet to her WhatsApp. On Mom's phone the only difference is the sender name. Record whichever is real.

**Recording settings:** `?badges=off`, 60 fps if the phone allows, device scale 3×, airplane mode off, notifications off except the one we want. Record every product shot twice.

---

## 7. Recording plan

| When | Who | What |
|---|---|---|
| Sat, by 7 PM | Gurneal + two teammates | Lock this copy. Save Jordan, Mom, Priya as contacts on the demo iPhone. Record Act 1 (shots 2–5), ~20 min. |
| Sat, first hour of backend | Mudit | Submit the WhatsApp template. One Spark call, one transcription, timed. |
| **Sat, 9:30 PM Austin** (8:00 AM India) | Whoever's family it is | The kitchen call (shots 13–14). Brief them: no script except the last line, in their own words. Record Mom's voice note (shot 7) on the same call. |
| Sun, at feature freeze | Gurneal + Mudit | Record Act 2 and Act 3 product shots (6–10, 12, 15, 17, 18) on the real app. Mom's phone in hand for shot 12. |
| Sun, after | Gurneal | Edit in whatever's fastest (CapCut, Premiere, DaVinci). Remotion only for shots 11 and 19 if wanted. Subtitles. Export 1080p. Copies on two phones and a drive. |
| Sun, before judging | Mudit | Rehearse five times to 2:55 with the slide. Hand the phone to a judge in Q&A. |

---

## 8. If it runs long

Cut in this order until it fits 2:20:

1. Priya's reply in shot 18 (keep the handoff tap): −2 s
2. Shot 16 to one bubble: −2 s
3. Shot 4 to three reels: −3 s
4. Shot 13 to 6 s: −4 s
5. Shot 17 entirely: −3 s

**Never cut:** the 2 s after "are you sure?", the 1.5 s after her voice note, the live transcript, the hold line, Mom's last sentence and the second after it.

---

## 9. Q&A prep (2:00)

| They'll ask | Say |
|---|---|
| "Isn't this a chatbot or an AI companion?" | "It spoke twice in two minutes, then got out of the way. By the end the comfort is Mom's, Jordan's, and his own. We measure words that reached a person, not time in the app." |
| "What stops it putting words in his mouth?" | "Spark returns character positions in his transcript, not text. The app slices his own words. If a sentence wasn't in his mouth, it can't be on a card." *(Show the JSON.)* |
| "What if the rant is abusive, or he's in danger?" | "The gate runs before anything else. Fear, control, or hopelessness means no cards form and 988 and the hotline show instead. We tested it on 30 rants." *(Only claim the numbers if the script ran.)* |
| "Do you read my WhatsApp, Instagram, or Photos?" | "No. Act 1 is a film of his evening. The app only sees the photos he brings in, what he says into it, and replies that come back through its own card page." |
| "What's real?" | "Hand me your phone number and I'll send you a card. Everything from the knock to Mom's 8 AM runs today. Acted: the two replies and the knock in Photos." |
| "Why Meta?" | "WhatsApp is where the family already is. Voice Transcribe handles Hindi and English in one session, which a real rant needs. And the Round 2 version only exists on Meta's surfaces: a knock on the photos people already scroll." |
| "Why would he open Unsaid instead of Photos?" | "He doesn't have to. The knock is a notification. Inside the app, the lane is his photos organized by person, not by app." |

---

## 10. Asset checklist

- [ ] The kitchen photo (consented) and 8–10 lane photos of real people who've agreed
- [ ] Mom's voice note (Hindi or the family's language), recorded Sat 9:30 PM
- [ ] The kitchen call recording
- [ ] Original or licensed piano bed; the chime; room tone
- [ ] Contacts on the demo iPhone: Jordan, Mom, Priya
- [ ] Mom's Android with WhatsApp, verified as a Cloud API test recipient
- [ ] Unsaid mark and wordmark SVG (spec §3.6)
- [ ] Time-skip card and end card (shots 11, 19)
- [ ] The tech slide (§5)
- [ ] A QR code to the PWA for judges
- [ ] Backup video on two phones; the real app on one

---

## Changelog

| Date (CT) | Change |
|---|---|
| Oct 24, 2026 | v2 created: the one-evening cut combining Mudit's inter-app film with the live product loop. 2:20 video (76 s product), 0:40 live tech slide, talk track, screen list, recording plan, cut order, Q&A prep. Proposed replacement for the storyboard in `Demo_Script.md`. |
