# Un-Said: Demo Script v3, "One Evening" on the real app

*The 3:00 slot, rebuilt for the Expo app in `mobile/` and Gurneal's cast and copy. It replaces v2 (`Demo_Script_v2.md`), which was written for the web client and the old cast.*

**For:** Gurneal (filming, edit, end cards), Mudit (talk track, live tech slide, demo panel), and whoever holds Mom's phone.
**Slot:** 2:20 video plus about 0:40 live = 3:00, then 2:00 of Q&A (see [`../STRATEGY.md`](../STRATEGY.md)).
**Copy:** [`design/COPY_AND_NAMES.md`](../../design/COPY_AND_NAMES.md) is law. Strings marked *(proposed)* still need Gurneal's OK. Banned: "we detected", "risk", "depressed", "sad".

### Status tags (cut a beat if its tag hasn't landed by recording time)

| Tag | Means |
|---|---|
| `[now]` | Works on `main` today |
| `[memory+knocks]` | Needs the memory / gentle-knock / push branch: photo memory, "you said this here before", the encourage line, the attention budget, Gurneal's cast in the seeds |
| `[deploy]` | Needs the HTTPS deploy (AWS or a paid Render plan). Mom's "Hold to reply" uses her browser mic, which only works over HTTPS |
| `[letter page]` | Needs Mom's letter page restyled to Gurneal's dark design |
| `[film]` | Filmed or acted, not the app |

---

## 0. What changed from v2

- **Real app, real cast.** The product shots are screen recordings of the Expo app on Riley's iPhone, not the web client. Arjun/Jordan/Priya are now **Riley, Sarah, Michael**, and **Dad** leans into the kitchen call.
- **The knock is real and rare.** It comes once, on the photo he can't put down. When he opens the next photo, nothing happens. That silence is a beat.
- **"You said this here before."** The photo remembers what he said on it on Tuesday, in his own voice.
- **"Tell them how you feel. Communication helps."** It appears under Mom's card after the split, once.
- **Manners both ways.** The letter waits for her morning. Un-Said also holds its own notifications until his morning.
- **Mom's page is dark Un-Said,** not cream and Caveat.

## 1. The shape

| | Time | What | Made how |
|---|---|---|---|
| Act 1: three apps, three masks | 0:00–0:29 | Sarah's thread · Mom's calls · Michael's reels | `[film]` real apps on a real phone, teammates as the cast |
| **Act 2: the photo, the knock, the words** | **0:29–1:30** | **The Un-Said app, start to finish** | **Screen recording of the real app** |
| Act 2b: her morning | 1:30–2:00 | Time skip · Mom's letter page · the kitchen call | App on Mom's phone, then `[film]` |
| Act 3: Sarah, Michael | 2:00–2:14 | His words to Sarah · a reel back to Michael | App plus `[film]` replies |
| Close | 2:14–2:20 | End cards | Edit |
| Live: tech slide | 2:20–2:52 | One slide | Mudit |
| Live: last line | 2:52–3:00 | | Mudit |

**Product on screen: about 80 s** (0:29–1:30, plus 1:34–1:44 on Mom's phone and the app parts of 2:00–2:14). The target was 1:00–1:20.

## 2. Rules this cut lives by

1. **Everyone is reaching for him. He's the one who went quiet.** He gives each person a mask: "i don't feel like talking", "very busy", "just tired". The V shape stays: he withdraws Sarah → Mom → Michael and comes back Mom → Sarah → Michael.
2. **The model never speaks to him.** Un-Said shows three lines in the whole video: the knock, "Here's who that was for.", and "Tell them how you feel. Communication helps." A person wrote each one, and a rule decides when it shows. The model only listens, sorts, translates and checks safety.
3. **Restraint is a shot.** The knock fires once. The second photo stays silent, and we hold on that silence.
4. **His words only.** Every line on a card, in a pile and in a letter is cut verbatim from his transcript.
5. **Silence is a shot.** Hold after "you sure?", after "you said this here before", and after Mom's last line. Mudit doesn't talk over them.
6. **The hallway rule.** Every send leaves through the person's real app: WhatsApp for Mom, Messages for Sarah, Instagram for Michael.
7. **Honesty lives on the tech slide,** not in captions on the film.

## 3. Cast, clocks, language

| Who | Shown as | Their app | In this cut |
|---|---|---|---|
| Riley | "Riley" | his iPhone | A student in Austin. Signs letters "Riley" |
| Mom | "Mom" | WhatsApp | Calls a lot; "I love you beta". Gets her letter through a WhatsApp link |
| Dad | "Dad" | WhatsApp | Leans into Mom's video call |
| Sarah | "Sarah ❤️🤍" in Messages, "Sarah" in Un-Said | Messages | "please just say something" |
| Michael | "Michael (Best Friend)" on Instagram, "Michael" on cards | Instagram | Sends reels; the sunrise on 290 |

**Clocks.** Austin is CDT (UTC−5) until Nov 1; India is IST (UTC+5:30), 10 h 30 min ahead. Gurneal's copy still lists Mom's city as COPY NEEDED; the app assumes `Asia/Kolkata`.

| Austin | India | Beat |
|---|---|---|
| Tue Oct 20, 9:10 PM | Wed 7:40 AM | The Tuesday line, recorded on the kitchen photo (setup, not shown) |
| Sat Oct 24, 6:32 PM | Sun 5:02 AM | The knock, the words, the hold. Mom is asleep |
| 9:30 PM | 8:00 AM | Mom's letter is released |
| 9:41 PM | 8:11 AM | Riley's clock in Gurneal's design; chip "8:11 AM for Mom" |
| 9:44 PM | 8:14 AM | Mom's 0:24 voice reply ("Mom · voice reply · 0:24 · 8:14 AM her time") |
| ~9:50 PM | | Sarah, then Michael |

The whole story is one evening. That's why the last card says *today*.

**Language.** Riley code-switches once ("mujhe bas ghar ki yaad aa rahi hai", *I just miss home*), and Mom speaks Hindi on the call. Subtitles on every non-English line: lowercase, system font.

---

## 4. Shot list

Product shots are iPhone screen recordings (Control Center → Screen Recording, **microphone on**). They're edited onto `--un-bg` (#0F0D15), not the retired dusk gradient.

### Act 1: three apps, three masks (0:00–0:29) `[film]`

| # | Time | On screen | Sound | Notes |
|---|---|---|---|---|
| 1 | 0:00–0:04 | Black. | Room tone only. | |
| 2 | 0:04–0:12 | **Messages**, "Sarah ❤️🤍". Her bubbles land one by one: *"hey"* · *"can we talk tonight?"* · *"I just feel like you don't get me and are not ready to understand me."* · *"please just say something"*. He types *"i don't feel like talking"* and sends it. | A soft tick per bubble, none on the last one. | Riley's messages are lowercase with no punctuation (copy rule). |
| 3 | 0:12–0:21 | **WhatsApp**, "Mom". History above: Mom *"khaana khaya? 🙂"* → him *"k"*. Today: *Missed voice call* ×3. It rings now; he lets it ring out. He types *"feeling tired these days we'll talk later very busy"* and sends it. Below it, Mom: *"I love you beta"*. A now-playing pill shows ♪ *We Don't Talk Anymore* (title only). | Two quiet ring cycles. Original or licensed piano bed, never the recording. | The "k." is the one letter he sends back. Callback in the rant. |
| 4 | 0:21–0:29 | **Instagram**, "Michael (Best Friend)". Reels stacking: *2w* · *1w* · *2d* · *today*. *"yo you good?"* → *"just tired"* → *"you sure?"* **Hold 2 s.** He swipes the app away. | The typing dots before "you sure?" take a full second. | |

### Act 2: the photo, the knock, the words (0:29–1:30) · product

| # | Time | On screen (exact copy) | Live or filmed | Depends on |
|---|---|---|---|---|
| 5 | 0:29–0:37 | Un-Said opens on his **Library** (his real camera roll). He scrolls, slows, stops on the kitchen photo of him and Mom. He opens it, pinches and drifts. Top right, the Un-Said icon breathes once. | Screen recording | `[now]` |
| 6 | 0:37–0:42 | After about 4 s on the photo, **the knock** slides down: app icon, **Un-Said**, *"We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"* He taps it. | Screen recording | Knock `[now]` (fixed 3.5 s timer). Once-only behavior `[memory+knocks]` |
| 7 | 0:42–0:49 | **Say it out loud** opens with the photo. A quiet card: *"You said this here before."* *(proposed)* · *tuesday* · *"mom called again. i'll call her this weekend."* with a small play button. He taps it and hears himself. **Hold 1.5 s.** Then the overline **ONLY YOU CAN HEAR THIS**. | Screen recording | `[memory+knocks]` |
| 8 | 0:49–1:03 | He taps the mic (*Tap to talk*). The words write themselves as he speaks, at about 6 words a second, with the indigo caret. The waveform is violet while live. Under it: *Nothing leaves without you.* He taps (*Tap to stop*). | Screen recording; real Muse Voice Transcribe | `[now]` with the Muse key |
| 9 | 1:03–1:10 | *Here's who that was for.* *(proposed)* Person cards stagger in: **Mom** · *missing* · **Sarah** · *sorry* · **Michael** · *missing*, each with his lines in quotes. Under Mom's card, once: ***Tell them how you feel. Communication helps.*** **Hold 1 s.** | Screen recording | Split `[now]`; encourage line `[memory+knocks]` |
| 10 | 1:10–1:17 | He taps Mom. **For Mom** · *Goes to Mom on WhatsApp* · the chip (moon icon) *5:02 AM for Mom* · **IN YOUR WORDS**. Nothing is pre-picked. He switches on *"you made dal on sunday and i didn't even say thank you."* and *"mujhe bas ghar ki yaad aa rahi hai."* → **Preview letter**. | Screen recording | `[now]` |
| 11 | 1:17–1:26 | The lavender letter: **FOR YOU**, his first line as the hero, the second as body, signed **Riley**. *This is how Mom will see it.* Delivery card: *Mom's morning* · *Arrives 8:00 AM her time* · ◉ *Hold until her morning* ○ *Send now*. **Send when they're ready** → *Held for Mom's morning.* plus the chip. Optional (2 s): the push permission ask, which comes only now, after his first held letter. | Screen recording | Hold `[now]`; permission ask `[memory+knocks]` |
| 12 | 1:26–1:30 | Back in the Library he opens a photo of Sarah and lingers for 6 s. **Nothing slides down.** | Screen recording | `[memory+knocks]` (the budget: 1 knock per session). Cut if not landed |

### Act 2b: her morning (1:30–2:00)

| # | Time | On screen | Live or filmed | Depends on |
|---|---|---|---|---|
| 13 | 1:30–1:34 | Time-skip card on `--un-bg`: two clocks cross-fade, **9:30 PM Austin · 8:00 AM India**. Small line: *3 hours later*. | Edit | (demo panel **+3 hours** releases it for real) |
| 14 | 1:34–1:44 | **Mom's phone** (filmed in her hand): WhatsApp from Un-Said's number, *"hi. Riley left you something. open it whenever you have a minute: … (sent with Un-Said)"*. She taps it, and **the letter page** opens: dark, the kitchen photo, **FOR YOU**, his words, the Hindi caption, **listen** (his voice, her part only), **Hold to reply**, **Call Riley**. She presses **Call Riley**. | Real app on her phone | WhatsApp template (fallback: share sheet) · `[letter page]` · `[deploy]` for her mic |
| 15 | 1:44–2:00 | The WhatsApp video call, from his side. The kitchen: Mom laughing, **Dad leaning into frame**, both talking at once. Then Mom alone, closer: *"Chahe kuch bhi ho raha ho, main hoon. Jab bhi kuch kehna ho, bol dena. I love you, beta."* Subtitle: *whatever's going on, I'm here. whenever you need to say something, say it. I love you, beta.* **Hold 1 s on her face.** | `[film]` the real call | Film Sat 9:30 PM CDT = Sun 8:00 AM IST |

### Act 3: Sarah, Michael (2:00–2:14)

| # | Time | On screen | Live or filmed | Depends on |
|---|---|---|---|---|
| 16 | 2:00–2:09 | Un-Said Home → *Your words* → **Sarah** → **For Sarah**. He switches on *"sarah. you said please just say something and i said i don't feel like talking."* · *"that's not true."* · *"i miss the way we used to talk."* → **Preview letter** → **Send when they're ready** → Messages opens with the note and link; he sends. Her answer arrives as a letter in **Letters → From Sarah**: *"I missed you too."* / *"I'm glad you told me."* signed **Sarah**, with *Take your time.* and **Write back**. | Screen recording, plus Sarah on her phone | Sending `[now]`. Letter back needs a text "Write back" on the letter page (the backend already accepts `text`). Fallback: her reply as Messages bubbles `[film]` |
| 17 | 2:09–2:14 | Home: *Michael · waiting on you* · *3 reels this week* → **Open Instagram**. The thread opens; he sends a reel back. Michael: *"THERE he is 😭"* | Screen recording + `[film]` reply | Michael's Instagram handle set in the demo panel (otherwise the button is hidden) |

### Close (2:14–2:20)

| # | Time | On screen | Sound |
|---|---|---|---|
| 18 | 2:14–2:20 | **Un-Said** wordmark on `--un-bg`. *For the words we never said. Until today.* Then, smaller: *not "this too shall pass." let's make today count.* Bottom: *powered by Meta AI*. | Final piano chord, then silence. |

**Optional 3 s insert, if push lands** `[memory+knocks]`: a lock screen at 8:00 AM Austin, *Un-Said · Mom left you a voice note.* She sent it at 3 AM his time, and Un-Said held it for his morning. Use it only if it fits; the talk track carries the idea anyway.

---

## 5. What Riley says (shots 7 and 8)

**The Tuesday line** (recorded during setup, kept private):

> "mom called again. i'll call her this weekend."

**Saturday's rant** (about 14 s; **pause between people** so the audio turns split cleanly and Mom only ever hears her part):

> "i don't know. mom, i keep letting it ring and then i send you one letter back. you made dal on sunday and i didn't even say thank you. mujhe bas ghar ki yaad aa rahi hai.
> *(pause)*
> sarah. you said please just say something and i said i don't feel like talking. that's not true. i miss the way we used to talk.
> *(pause)*
> and michael keeps sending me reels and i haven't sent one back in like two weeks."

The lines that go to Mom and Sarah address them as *you*, so they read as letters verbatim. "i don't know." belongs to nobody. If a line lands on the wrong person, use **Start over** → *Delete recording* and retake; never edit his words.

## 6. Mudit's talk track (verbatim)

About 175 words. A dash means stay quiet.

| Time | Say |
|---|---|
| 0:00 (black) | "Everyone in this story is reaching for him. Watch who goes quiet." |
| 0:12 (WhatsApp) | "'Very busy.' He isn't. He's protecting her from a day he can't explain." |
| 0:26 ("you sure?") | — |
| 0:30 (Library) | "He doesn't go to a person. He goes to a photo. A photo can't ask how he's doing." |
| 0:38 (the knock) | "Un-Said knocks once, on the photo he can't put down." |
| 0:43 (Tuesday) | "He said this here on Tuesday. He didn't call." then — |
| 0:52 (transcript) | "That's Muse Voice Transcribe, live. Hindi and English in one breath." |
| 1:04 (cards) | "Muse Spark sorts it by person. Every word on those cards is his. The model points at his sentences. It never writes them." |
| 1:08 (encourage line) | — (let it read) |
| 1:18 (hold) | "It's 5 AM in her kitchen. He won't wake her." |
| 1:26 (second photo) | "It knocked once tonight. It won't again." |
| 1:34 (Mom's phone) | "8 AM in India. No app, no account. His voice, her language." |
| 1:44 (kitchen) | — (don't talk until 2:00) |
| 2:00 (Sarah) | "Mom filled him up. Now he can say the hard thing, in the app where Sarah already lives." |
| 2:09 (Michael) | "The light one last. In his language: reels." |
| 2:14 (close) | — |

## 7. Live: the tech slide and the last line (2:20–3:00)

One slide, three columns. Mudit reads it in about 32 s.

**Ran for real (in the video, and on this phone right now)**
- **Expo SDK 58 app** on Riley's iPhone. His gallery is read on the device (`expo-media-library`); the mic goes through `expo-audio`'s **AudioStream** as 24 kHz PCM → our WebSocket relay → **Muse Voice Transcribe** realtime (`wss://api.meta.ai/v1/asr/realtime`, ENDPOINTING, `languageBias: ["English","Hindi"]`). The API key never touches the phone.
- **Muse Spark 1.3** with `response_format: json_schema`. It returns *sentence numbers per person*, never text; the server cuts his exact words.
- **The safety gate runs first.** Spark plus a phrase list (including transliterated Hindi), the stricter one wins. Fear, control or hopelessness → 988 and 1-800-799-7233, not a send button.
- **The WhatsApp Cloud API** for Mom's 8 AM. No app or account on her side.

**Where AI isn't**
- The knock's budget is code: once a session, twice a day, three hours apart, quiet after "not now" `[memory+knocks]`
- Her morning (and his) is time-zone math
- The words are his
- The comfort is theirs

**Acted, and the Round 2 ask**
- Sarah's and Michael's replies are teammates (Sarah's is real if the letter-page "Write back" ships)
- The knock lives inside Un-Said's photo view. Putting it on the photos people already scroll in Instagram and Facebook is what we'd build in Menlo Park.

**Say (≈32 s):**
> "Everything from the photo to Mom's 8 AM ran for real, on this phone. Expo streams the mic to our relay and on to Muse Voice Transcribe's realtime socket, Hindi and English in one session. Muse Spark returns sentence numbers, never text, so it can't put words in his mouth. A safety gate runs before any of it. The knock has a budget written in code, not AI: once a session, twice a day, and quiet after 'not now.' Mom's letter arrives through the WhatsApp Cloud API, with no app on her side. Two things were acted: the replies, and the knock living inside Un-Said. Putting it on the photos you already scroll is our Menlo Park ask."

**Last line (≈8 s):**
> "Facebook brought back the people. Instagram kept the photos. Un-Said keeps the words that never got attached to them. No words left behind."

Rehearse the whole thing to 2:55. If the slide runs long, drop the parentheses (socket URL, languageBias).

---

## 8. Reproducing every shot

### Once, before any take

1. **Backend on HTTPS** `[deploy]` with `MODEL_API_KEY`, `APP_KEY`, and the WhatsApp keys if the template is approved. Run the key check from the deploy branch; every line should read PASS. Without HTTPS, everything except Mom's "Hold to reply" still works.
2. **The WhatsApp template** body must say **Un-Said**: `hi. {{1}} left you something. open it whenever you have a minute: {{2}} (sent with Un-Said)`. The text in `backend/app/whatsapp.py` and `backend/README.md` still says "unsaid"; fix it before submitting.
3. **Riley's iPhone:**
   - Expo Go is signed in, and the laptop terminal has `EXPO_TOKEN` set.
   - `mobile/.env.local` has `EXPO_PUBLIC_API_URL=https://<deployed host>` and the key. Restart `npx expo start`.
   - Photos: **Full Access**, not Limited. Microphone: on for Expo Go.
   - Focus / Do Not Disturb: off. Screen Recording in Control Center with the mic on.
4. **Mom's phone** has WhatsApp. If you use the Cloud API, her number is a verified test recipient.
5. **Demo panel** (`https://<host>/app/?key=<APP_KEY>&demo=1` → **demo**) → **people:**
   - phone numbers for Riley, Mom and Sarah (with country code)
   - Michael's Instagram handle
   - Mom's time zone `Asia/Kolkata`
6. **Photos:** the kitchen photo (Riley and Mom) and one photo of Sarah are in Riley's real camera roll.
7. **The Tuesday line** `[memory+knocks]`:
   1. Demo panel clock → **set** `2026-10-20 21:10`.
   2. In the app: Library → kitchen photo → Un-Said icon.
   3. Tap to talk: *"mom called again. i'll call her this weekend."* → Tap to stop.
   4. **Keep it just for me.**
8. **Evening:**
   1. Demo panel clock → **set** `2026-10-24 18:32`.
   2. Reset the attention ledger and set knocks to **gentle** `[memory+knocks]`. Use whatever that branch names these controls.
   3. Check that Mom's chip reads *5:02 AM for Mom*.
9. **Force-quit and reopen the app** before each take, so it starts a new session.

### Per shot

| Shot | Do this |
|---|---|
| 5–6 | Open the app → scroll the Library → tap the kitchen photo → pinch → wait ~4 s → the knock slides down → tap it. |
| 7 | The "You said this here before." card is at the top of Say it out loud → tap play → wait 1.5 s. |
| 8 | Tap the mic → say the rant from §5 with the pauses → tap to stop. |
| 9 | The cards stagger in. The encourage line shows under Mom's card only if he has said something to her before and it hasn't shown for her in 72 h. On a retake, reset the ledger first. |
| 10 | Tap Mom → switch on the dal line and the Hindi line → **Preview letter**. |
| 11 | *Hold until her morning* is pre-selected because she's asleep → **Send when they're ready**. |
| 12 | Back → Library → Sarah's photo → wait 6 s. Nothing happens. |
| 13–14 | Demo panel → **+3 hours**. With the Cloud API: Mom's phone buzzes. Without it: Riley's Home shows the send-now strip → **Send now** → WhatsApp opens → he sends. Mom opens the link → **listen** → **Call Riley**. |
| 15 | The real call, filmed Saturday 9:30 PM CDT (Sunday 8:00 AM IST). Brief the family: no script except the last line, in their own words. |
| 16 | Home → Sarah → switch on her three lines → Preview → Send → Messages → send. Sarah opens the link and writes back *"I missed you too. I'm glad you told me."* (if the text "Write back" ships) → Riley: **Letters → From Sarah**. |
| 17 | Home → **Open Instagram** → send a reel. |
| After | Demo panel → **real time** → **reset activity**. Nothing from a take leaks into the live demo. |

## 9. A fallback for every live step

| Step | If it fails | Do this |
|---|---|---|
| The live transcript (shot 8) | The socket drops | The app uploads the WAV it was also recording when he taps stop; the words appear after stop instead of live. |
| | The Muse key isn't working | **Type instead** with the same words. Never present the "mock ai" output as real; use the recorded take. |
| The knock (shot 6) | It doesn't fire | Tap the Un-Said icon on the photo. It's always there; the knock is a bonus. Before the next take, reset the ledger. |
| "You said this here before" (7) | Empty | Cut the shot; the talk track goes straight to the transcript. |
| The encourage line (9) | Doesn't show | It's capped at once per person per 72 h: reset the ledger and retake. Or cut the hold. |
| The second-photo silence (12) | A knock appears (the budget isn't merged) | Cut the shot; say the line over shot 13. |
| WhatsApp on Mom's phone (14) | Template not approved, or the Cloud API fails | The **Send now** strip on Riley's Home → WhatsApp opens with the link → he sends it from his own number. On her phone only the sender differs. |
| "Hold to reply" on Mom's page | No HTTPS, so her mic is blocked | She uses **Call Riley**; the kitchen call is her reply. |
| Expo Go (anything) | "You need to be signed in…", or the laptop is unreachable | `EXPO_TOKEN` in the terminal, then reopen. Otherwise the web client at `/app/` on the phone, and otherwise the recorded video. |
| The network | Venue Wi-Fi blocks the phone | The deployed backend over cellular. The video lives on two phones and a drive. |

## 10. If it runs long

Cut in this order until it fits 2:20:

1. Michael's reply text (keep the tap): −2 s
2. Shot 16 down to the send plus one line of her letter: −3 s
3. Shot 4 down to three reels: −3 s
4. Shot 15 down to 12 s: −4 s
5. Shot 7 without the playback (keep the card): −3 s
6. Shot 12, with its line moved over shot 13: −4 s

**Never cut:** the 2 s after "you sure?", the knock, the live transcript, "Tell them how you feel. Communication helps.", the hold, Mom's last line and the second after it.

## 11. Assets

- [ ] The kitchen photo and a Sarah photo in Riley's real camera roll (both consented)
- [ ] The Tuesday line recorded on the kitchen photo (setup §8.7)
- [ ] The kitchen call recording (Mom, and Dad leaning in), Saturday 9:30 PM CDT
- [ ] Mom's 0:24 voice reply through **Hold to reply** after the call (for the Letters row)
- [ ] Original or licensed piano bed, the chime, room tone
- [ ] Contacts on Riley's phone: "Sarah ❤️🤍", "Mom", "Michael (Best Friend)" on Instagram
- [ ] The time-skip card and end cards on `--un-bg`
- [ ] The tech slide (§7)
- [ ] A QR code to the deployed app for judges, and the backup video on two phones and a drive

## Changelog

| Date (CT) | Change |
|---|---|
| Oct 24, 2026 | v3: rebuilt v2 for the real Expo app and Gurneal's cast (Riley, Mom, Dad, Sarah, Michael). Added the once-only knock and the silent second photo, "You said this here before.", "Tell them how you feel. Communication helps.", and notifications held for his morning. Added status tags per beat, exact reproduction steps, and a fallback per live step. |
