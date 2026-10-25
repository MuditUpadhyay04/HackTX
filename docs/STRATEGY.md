# How we win the Meta track

*For Gurneal and Mudit. Written Saturday evening, Oct 24, 2026, with judging on Sunday. It goes with [`demo/Demo_Script_v3.md`](demo/Demo_Script_v3.md) and [`DEVPOST.md`](DEVPOST.md).*

**The pitch in one breath:** Un-Said is the quiet place between your apps where you can say what you haven't said yet. Then it gets your own words to the person, at their hour, through the app they already use.

**The north star:** count words that reached someone, not time spent in Un-Said. The model never speaks to him. Un-Said knocks rarely and goes quiet when told. The comfort comes from people.

Tags used below: `[now]` on `main` today · `[memory+knocks]`, `[deploy]`, `[letter page]` are the branches being built in parallel. Plan as if they land; cut the beat if one doesn't.

---

## 1. Scorecard against the four judging criteria

| Criterion | What we can show | What's missing | What closes it |
|---|---|---|---|
| **Meaningfully strengthens connection** | Every session ends in someone else's app (WhatsApp, Messages, Instagram). Mom gets his real words and his voice at her 8 AM, with no app or account, and answers in her own voice. No streaks, no counts, no "you haven't called Mom in 12 days" `[now]` | The reply loop on stage needs HTTPS for her mic `[deploy]`. Sarah's letter back needs a text "Write back" | Deploy; a text "Write back" on the letter page (§2, #7) |
| **AI essential and well integrated** | Muse Voice Transcribe realtime with Hindi and English code-switching. Muse Spark structured output that points at sentence ids and never writes. Spark plus a phrase list for safety. Spark translates his approved words and captions her reply `[now]` | It has never run with a real key on the phone. No measured latency. Safety eval numbers are phrase-layer only (9/10, 0/20) | The real-key run, a stop-to-cards latency number like Nudge's, and the safety eval with Spark (§2, #1 and #6) |
| **Originality** | An AI that refuses to write your feelings: verbatim only, enforced in code and tested. An attention budget against the notification farm. Manners both ways: her morning and his. A photo memory with no face recognition. The hallway, not a fifth app | The budget and the photo memory aren't merged `[memory+knocks]` | Merge, then *show* the restraint: the silent second photo (Demo v3, shot 12) |
| **Working demo** | Real gallery, real mic, real sorting, a real WhatsApp hand-off, a real letter page. 19 backend tests, a Playwright walk of the web client, an iOS bundle that compiles | The Expo Go sign-in, the key, the network, and a full phone run-through not rehearsed yet | The risk register (§3) and a rehearsal plan (§4) |

**Where we're strongest:** the emotional arc (the "k.", three masks, the kitchen call) plus restraint you can see. Judges have watched a dozen "AI companions" that talk too much. This one says three fixed lines in two minutes and lets Mom do the talking.

## 2. What to build or polish in the remaining hours

Ranked by (impact on the four criteria × confidence) ÷ effort. **P0** has to happen before we record; **P1** if there's time; **P2** only if everything else is done.

| # | Item | Moves | Effort | Risk if skipped | Owner | Depends on |
|---|---|---|---|---|---|---|
| 1 | **P0 · A real Muse key, end to end on the phone.** Put it in the backend env, run the key check, then a live rant on Riley's iPhone. Time stop → cards, and write the number down | AI essential, working demo | S | High: without it the "mock ai" pill is on screen and the transcript ignores what he says | Mudit | the key; key check `[deploy]` |
| 2 | **P0 · HTTPS deploy** (AWS, or a paid Render plan with a disk). Point the app's `EXPO_PUBLIC_API_URL` at it | Working demo, connection | M | High: Mom's "Hold to reply" mic is blocked without HTTPS; the free plan sleeps and wipes photos and her note | Mudit | `[deploy]` |
| 3 | **P0 · Submit the WhatsApp template now**, spelled "Un-Said" (see §6). Review can take a day | Connection | S | Medium: the share-sheet fallback works, but the "it arrived by itself at her 8 AM" moment is lost | Mudit | Meta review |
| 4 | **P0 · Merge `[memory+knocks]` and `[letter page]`**, then run the whole of Demo v3 on the phone three times | Originality, working demo | M | High: the restraint beat and Mom's dark page are the new story | Mudit | the branches |
| 5 | **P0 · Film the kitchen call** Saturday 9:30 PM CDT (Sunday 8:00 AM IST), real family, with consent. Record Mom's 0:24 **Hold to reply** right after it | Connection | S | Very high: it can't be redone tomorrow at the right hour | whoever's family | `[deploy]` for her mic |
| 6 | **P1 · Safety eval with the real key** (`uv run python scripts/eval_safety.py`), and put the numbers in the Devpost | AI essential, trust | S | Medium: the Q&A answer "we tested it" gets weaker | Mudit | #1 |
| 7 | **P1 · Sarah's letter back.** Add a text "Write back" on the letter page (the reply endpoint already accepts `text`). In the app, split a text reply into hero plus body lines with the hand-drawn underline (Gurneal's reference screen #3) | Connection, design | S–M | Low: fall back to Messages bubbles | Mudit (page) · Gurneal (screen) | `[letter page]` |
| 8 | **P1 · Gurneal's copy details:** tone chips as "missing her / sorry / missing him" (derive from pronoun), Letters rows as "voice reply · 0:24 · 8:14 AM her time", "Un-Said" in the template | Design polish | S | Low | Gurneal · Mudit | — |
| 9 | **P2 · Notifications held for his morning**, if remote push works in Expo Go SDK 58; otherwise in-app only and the talk track says it | Originality | M | Low: it's a talk-track line either way | Mudit | `[memory+knocks]` |
| 10 | **P2 · Dad's draft on Home** ("I never said thank you.") as an end-of-film beat | Connection | S | Low | — | `[memory+knocks]` seeds |

**Cut, or don't show on stage:**

- Face grouping and the faces popup: no time, and biometric law (Texas CUBI, Illinois BIPA). It's a Round 2 line.
- Recording a self-note in the app (needs `expo-camera`), Compose and drafts, the brain graph, the Ex feature, Plans, and posthumous proxies.
- **The Instagram and Facebook "Connect" rows on the Connect photos screen.** They're demo toggles that connect nothing, so never tap them on stage. If a judge asks, say "concept".
- Any Remotion animation beyond the time-skip card and the end cards.

## 3. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Venue Wi-Fi blocks phone ↔ laptop, or is slow | High | High | Use the **deployed HTTPS backend over cellular**, not the laptop. Keep the iPhone hotspot as a second network. Backup video on two phones and a drive |
| Expo Go: "You need to be signed in to Expo Go and Expo CLI" | Medium | High | Sign both in the night before, with `EXPO_TOKEN` in the terminal. Open the app 10 minutes before. Fallback: the web client at `/app/` on the phone, then the video |
| No working Muse key | Medium | High | Record the product shots only with the key. Never present "mock ai" output as real. Fallback for a live demo: **Type instead** |
| The WhatsApp template isn't approved in time | Medium | Medium | The **Send now** strip → WhatsApp opens on Riley's phone → he sends the link himself. On Mom's phone only the sender differs |
| Mic permissions: Expo Go mic off, or Mom's browser mic blocked | Medium | High | Grant the Expo Go mic in iOS Settings. Mom's page **needs HTTPS** `[deploy]`; test **Hold to reply** on her actual phone tonight |
| The Render free plan sleeps and wipes data | High on free | High | Paid instance plus a disk, or AWS `[deploy]`. Send a warm-up request 2 minutes before going on |
| The demo clock left offset, or the attention ledger blocks the knock | Medium | Medium | Checklist in Demo v3 §8: **real time** and **reset activity** after takes; reset the knock ledger before each take; force-quit the app for a new session |
| Focus / Do Not Disturb hides banners | Medium | Low | Turn Focus off on both phones |
| AudioStream gives a sample rate other than 24 kHz | Low | Medium | The app resamples, and the WAV upload is the fallback. Test on the exact demo phone |
| Old names on screen (Arjun, Jordan, Priya) | Medium | Medium | The seeds move to Gurneal's cast `[memory+knocks]`. Check every screen before recording |
| Music licensing on the uploaded video | Low | Medium | An original or licensed bed. "We Don't Talk Anymore" appears as a title only |
| Running long | Medium | Medium | The cut order in Demo v3 §10, rehearsed to 2:55 |

## 4. Rehearsal plan

| When | What | Who |
|---|---|---|
| **Sat, now → 9:00 PM** | Key in, deploy up, template submitted. Merge the branches and run the whole Demo v3 flow on Riley's phone once | Mudit |
| **Sat 9:30 PM CDT** (Sun 8:00 AM IST) | **Kitchen call**, filmed. Mom records her 0:24 **Hold to reply** on the deployed page | the family, Gurneal filming |
| Sat 10 PM → midnight | Act 2 product shots, two takes each (Demo v3 §8). Act 1 with teammates as Sarah and Michael | Gurneal, Mudit |
| Late Sat | Rough cut. Subtitles | Gurneal |
| Sun morning | Venue network check, warm-up request. **Rehearse 5× to 2:55** with the slide. Three mock Q&A rounds, one teammate as a skeptical judge using §5 | Both |
| Sun, an hour before | **Feature freeze**: no code changes after this. Phones charged, Focus off, Expo Go signed in, backup video on two phones | Both |

## 5. Judge Q&A, updated (2:00)

| They'll ask | Say |
|---|---|
| **"Isn't this a nag machine?"** | "It's the opposite, and that's written in code. Un-Said knocks at most once a session, twice a day, three hours apart. It only knocks on photos of people you've already talked about, and goes quiet for that person after you say not now. It never knocks after a safety concern. It even holds its own notifications until your morning. An average phone gets about 63 notifications a day; we didn't want to be the 64th." |
| **"Is the AI writing his feelings?"** | "No. Spark gets numbered sentences and returns only which numbers belong to which person. The server cuts his exact words out of his transcript, and a test checks that every line on a card is in what he said. The model can't put words in his mouth." |
| **"Isn't this an AI companion or a chatbot?"** | "There's no chat. In two minutes Un-Said shows three lines, all written by a person and shown by a rule. The model listens, sorts, translates and checks safety. By the end, the comfort is Mom's, Sarah's, and his own." |
| **"What happens to my photos and my voice?"** | "Photos are read on the phone. Only the one photo you send goes up, as a resized JPEG. There's no face recognition. Rants are private until you pick lines. Mom only hears the stretch of audio that was about her. We use Meta's Model API in Standard mode, which doesn't train on your content." |
| **"What if he's not okay?"** | "The safety gate runs before any card forms: Spark plus a phrase list that includes transliterated Hindi, and the stricter one wins. Hopelessness gets 988, control or fear gets the domestic violence hotline, and no reconnection prompts follow. On our 30-rant test set: [numbers from the real-key run]." |
| **"Doesn't verbatim read oddly in a letter?"** | "He chooses which lines go, and nothing is pre-picked. A letter in his real words, typos and all, lands harder than a polished one. That's the bet." |
| **"How do you know he's been quieter?"** | "We don't diagnose anyone. We use plain signals: words he kept but never sent, a photo he keeps coming back to, replies he hasn't opened. The knock's copy is gentle and never clinical." |
| **"What's real?"** | "Hand me your number." Or hand a judge the phone: "Say something about someone you love." It splits live in about [measured] seconds. |
| **"Why Meta?"** | "WhatsApp is where families already are, across countries. Voice Transcribe handles Hindi and English in one breath, which real rants need. And the Round 2 version only exists on Meta's surfaces: a knock on the memories people already scroll in Instagram and Facebook." |
| **"What if Mom doesn't use WhatsApp?"** | "The letter page is a plain link that opens in any browser. Messages and Instagram work the same way." |
| **"How is this different from Nudge or TedTime?"** | See §6. "Nudge solved *when* to call. TedTime solved *how a voice feels* across distance. We solve *what to say*, and getting it said." |
| **"Business model?"** | "It's a feature that belongs inside Meta's family of apps, and that's the Round 2 pitch. As a standalone, the hallway costs almost nothing to run." |

The attention-budget answers assume `[memory+knocks]` is merged. If it isn't, the honest answer is: "Today the knock is on a simple timer; the budget is the next commit."

## 6. Why we're not TedTime or Nudge (last month's winners of this track)

| | TedTime (HackGT 13) | Nudge (HackGT 13) | **Un-Said** |
|---|---|---|---|
| The problem | Distance flattens a grandparent's voice | "Is now okay?" stops calls | **The words never get said** |
| What AI does | Places sound effects in a recorded story | Finds the photo you mentioned in a call | **Hears the rant, sorts it by person without writing a word, checks safety, translates** |
| Restraint | — | "Nothing is ever scheduled"; mutual opt-in | **An attention budget in code; manners both ways (her morning and his)** |
| Where it ends | On a bear | In a video call | **In the person's own app: WhatsApp, Messages, Instagram** |
| Proof | Hardware you can hold | Published evals | **A live split on a judge's words, plus the safety eval** |

Lessons we're copying from Nudge's write-up: a section titled "Why AI is essential (and where it isn't)", measured numbers, and an honest "what's real today" list. Nudge won this track without using any Meta model; we use three Meta surfaces, but only where each one is the right tool.

## 7. Evidence we can cite

- People get about **63.5 notifications a day** and usually look at them within minutes (Pielot, Church & de Oliveira, *An In-situ Study of Mobile Phone Notifications*, MobileHCI 2014). [PDF](https://ic.unicamp.br/~oliveira/doc/MHCI2014_An-in-situ-study-of-mobile-phone-notifications.pdf)
- **1,177,766 international students** were in US higher education in 2024/25, a record, with **363,019 from India** (IIE Open Doors 2025). [Fast facts](https://opendoorsdata.org/wp-content/uploads/2025/11/OD25_Fast-Facts.pdf) · [ACE summary](https://www.acenet.edu/News-Room/Pages/Open-Doors-2025.aspx)
- **Muse Voice Transcribe** covers 25 languages, including Hindi, Tamil and Telugu, with code-switching. **Model API Standard mode** doesn't use your content to train Meta models. [Speech to text](https://dev.meta.ai/docs/speech-to-text) · [Models](https://dev.meta.ai/docs/models)

## 8. Decisions for Mudit

1. **Pay for always-on hosting** (a paid Render plan with a disk, or AWS). Mom's mic needs HTTPS, and the free plan loses data.
2. **The template text says "Un-Said"** before you submit it. The current docs say "unsaid".
3. **Whose family is in the kitchen call,** and their consent to be filmed and shown.
4. **Sarah's reply:** real (a text "Write back" on the letter page) or acted in Messages.
5. **Knock mode on stage:** "gentle" with a fresh ledger (recommended), so the second photo really stays silent.
6. **Copy approvals from Gurneal:**
   - "Tell them how you feel. Communication helps." (your line)
   - "You said this here before." (proposed)
   - the push permission line
   - Sarah's letter time: the copy file says 6:40 PM, but in our arc she writes after Mom's call, around 9:50 PM
   - Mom's city
