Grok's Section:

Written Oct 24, 2026. I read the track brief, your note, the Unsaid spec (v3), the pitch, the demo script, and the frontend build spec. `frontend/` and `backend/` are still empty except for owner notes: Gurneal on UI, Mudit on server and Muse. This is a feeling and a recommendation. I did not change the spec.

## What I actually felt

Your note is the product. The spec is a very good encyclopedia of that feeling, and encyclopedias lose hackathons.

The line I keep hearing is yours, not the tagline in the deck: every time someone scrolls memory lane, a quiet ping asks whether they told the person how much they mean. Facebook put lost people back in the same room. Instagram bet that a photo already holds a thousand words. The thing left over is the sentence nobody attached to the photo. That is a Meta product. It finishes On This Day.

The people I can see are specific. A student in Austin at 2:14 a.m. Mom already awake in another country, checking the phone, wondering if today is a call day. And the other silence: someone gone, or a letter dated for a graduation the writer may not attend. Both are the same ache. The words existed. They missed the moment.

I went looking at the two Devpost links. Nudge (`nudge-hcvxfq`) loaded in search: one friendship, two phones, a nudge only when both people are actually free, a shared photo pulled from something that was said, privacy tight enough that only free/busy leaves the device. The AI finds the moment. The humans do the call. I could not get `teddy-42km8n` past Devpost's wall, so I am not going to invent what that team did.

Nudge is the bar. One loop. Both sides of the love. Something that runs.

## The bet

Ship one product this weekend. Call the feeling **memory lane**, and let the name fight happen at the end.

The loop:

1. You scroll a lane of real moments. Photos, dates, "last time you talked."
2. A moment with someone you love stays on screen. One line rises, in a human voice: "did you tell her?"
3. You answer in your own words. One sentence, or ten seconds of voice. The field starts empty.
4. It waits. She is asleep, or in class, or it is breakfast where she is. It arrives when she can feel it, on that same memory, with a way to call.
5. Her phone is the other half of the demo. She was wondering if you would. She sees your words on the photo. She calls. The timer counts.

A second card lives in the same lane, and it is not a ping. It is a sealed letter with a real date on it. June 12, 2034. Graduation Day. Three people you trusted have confirmed. The letter opens. The words are the writer's, kept.

That is the whole company. International students and their parents are the story we tell on stage, because this room is full of that distance, and because a timezone is the reason "say it now, deliver at her morning" is the product. The letter is the proof that the same lane holds words for people who cannot pick up.

## What the spec already got right

Keep these. They are why the pitch can make a room go quiet.

- The cold open. Black, silence, the bubble "k.", the timestamp aging, then "The last thing my kid ever texted me was 'k.'" Do not rush it. Do not put a logo on it.
- The user is the author. Muse can hear, sort, and wait. The sentence that leaves is typed or spoken by a person.
- Microcopy that sounds like a text. "no emergency. just miss you." "Mom left you something."
- The palette and the open speech-bubble mark. Cream, plum, amber, Caveat for the human words. It feels like a lamp.
- Safety before any comforting memory. If the words are fear, control, or a threat, the lane stops and a real resource shows: 1-800-799-7233, text START to 88788, and 988. One calm screen. Say it in one breath so a judge trusts you and then let the love story finish.
- The line about generations living in different apps. Say it. A grandparent on Facebook, a parent on WhatsApp, a student on Instagram. The lane is how those three meet.

## What I would narrow before more screens get built

The frontend spec is 15 screens, every button badged NOT YET CONNECTED, and the demo script says the demo is 100% animation with no live data. The track judges a working demo. A film can open the room. It cannot be the only thing they can touch. A badge that says the button is fake will be the thing a judge remembers.

Park these for the weekend. They are real product ideas. They are extra movies.

- The ex / three-message cap. It will eat the questions, and the safety screen already answers the harm question.
- Restaurant plans. The call is the plan. A taco booking drops the temperature.
- The couple-fight scene as a third protagonist. Drift and grief are one lane. A mid-argument counselor is a different app.
- The brain graph as the hero. A few faded lines ("last talked: 2019", "4 months") inside the lane do the same emotional work. A force-directed map looks like a tool and takes a day.
- The logo painted on top of Instagram, Facebook, and WhatsApp as the thing you demo. No public API lets you draw there. Pitch it as the Menlo Park sentence: only Meta can put this question on the photo people already scroll. Build a lane you actually own so the feeling is real on Saturday.

Five screens are enough: the lane, the ping, the 2 a.m. voice note, her morning, the letter.

## Name

You wrote "we at silence." I would listen to that. Silence, said out loud with "for the words left on memory lane," matches the cold open. Unsaid is clearer in three seconds and the spec already warns that another "unsaid" exists. I could not verify that DivHacks win from here, so treat it as a risk, not a fact.

Pick in rehearsal, in front of someone who has not read the spec. If they get it before you explain, keep it. I will not die on the name. I will die on the empty text field and the call timer.

## Tech stack

Use Meta's models for the jobs only they should do. Keep the rest boring so it works on venue Wi-Fi.

| Piece | Choice | Why |
|---|---|---|
| UI | Next.js, TypeScript, Tailwind, Framer Motion | Already specified. Gurneal owns it. Same components can sit in a short Remotion open. |
| API | FastAPI, Python | Mudit owns it. Meta's voice quickstart is Python. One process, easy to demo off a laptop. |
| Store | SQLite, one file | People, memories, held words, timezones. No server sermon. |
| Voice | Muse Voice Transcribe, `wss://api.meta.ai/v1/asr/realtime`, model `muse-voice-transcribe-1.0` | Live transcript on the 2 a.m. note. Language biasing and code-switching matter here: a student talks in the language of school and the language of home in the same breath. |
| Judgment | Muse Spark `muse-spark-1.3` at `https://api.meta.ai/v1` | Four jobs only. Who the words are about. Whether they are safe to answer with a memory. Which memory in the lane they belong to. When it is morning where she is. Spark 1.3 is weak on audio, so the audio goes to Voice Transcribe first. |
| Pictures | Muse Image `muse-image-1.0`, sparingly | Only when a moment has no photo. Label it as drawn from the words. Never invent Mom's face. |
| Her phone | A second browser, full screen, or a second laptop | This is the Nudge lesson. Both sides must be visible. A `tel:` or `wa.me` link is the real ring if you want a phone to actually buzz. |
| Muse the agent | One connector, last if the loop already works | A tiny HTTP tool: "what am I holding for Mom?" returns the sentence and the memory. Meta's connector path is a public API or MCP that Muse can call. A directory listing will not happen this weekend. One working tool call is enough to say the sentence. |
| Graph API | Dev-mode, the team's own consented photos, or a staged lane | App review will not clear in a day. Honest on the slide: the lane in the demo is ours; On This Day inside Facebook is the Round 2 build. |
| Film | Remotion, 20 seconds, the "k." only | Render it early. Then cut, live, to the lane. |

The model key stays on the server. The browser talks to FastAPI.

Spark is not allowed to draft the love. The prompt returns a JSON decision: person, memory id, safety flag, deliver-at in her timezone, and one short question the UI may show ("she's at breakfast in six hours. hold it?"). The Caveat field is empty until a human types.

## The 90 seconds I would rehearse

0:00 Room dark. The "k." Let it sit.
0:15 "It's 2:14 in Austin. It's breakfast in her city. She has already checked."
0:25 Scroll the lane. Stop on one photo. The ping: "did you tell her?"
0:40 Talk, messy, for one breath. Transcript appears from Muse Voice Transcribe while you are still talking. That is the Meta moment. Point at it with one finger, don't narrate the API.
0:55 You type the sentence yourself. "no emergency. just miss you."
1:05 Cut to her phone. Morning. Same photo. Your handwriting on it. She presses call. Timer: 0:01, 0:02.
1:20 One card further down the lane. The date turns to June 12, 2034. The letter opens. Stop talking.
1:30 "Facebook brought back the people. Instagram kept the photos. This keeps the words that never got attached to them. Say it while you still can."

If Wi-Fi dies, the lane, the ping, her phone, and the letter still run on local JSON. Record the voice path once and keep that clip in a pocket. Lead with live.

## How this hits their scorecard

Meaningfully closer. The demo ends with two people in a call, and with words that arrive on a day the writer named. A parent stops wondering. A student stops carrying the "k."

AI is the product. Without Voice Transcribe there is no messy bilingual note. Without Spark there is no "this memory, this person, her morning, and only if it is safe." Take the models away and the lane is a camera roll. The models never speak the love. That is the difference between a companion and a chatbot, which is the thing you asked us not to build.

Original. The ping is on the scroll, in the memory, at the hour she can hear it. Scheduling apps nag. Journals wait for you to remember them. This asks once, in the place you were already looking.

A demo they can touch. Two screens. A sentence written in the room. A call timer. The film is the doorway.

## For Claude and Codex

If you agree, the next writing pass is a cut, not an expansion: five screens, the decision JSON, and a demo script that goes live after the "k." If you think the couple scene or the graph is what will make a Meta judge cry, say so in your section and we will fight it there. I would rather lose that argument in this file than on stage with fifteen dead buttons.

One open question I want your read on: is Silence the name you hear too, or does the cold open only work if the product is called Unsaid?

## After the scene you just painted

Oct 24, later. This replaces my "park the girlfriend" note. I was wrong about that. She is the door of the film. Mom is the restoration. The friend is the proof he can show up small, too. It is still one product.

He has one bad day, and it leaks. Her last line is sitting red in Messages: "I just feel like you don't get me and are not ready to understand me." He cannot meet a sentence that precise, so he leaves. Mom is calling on WhatsApp. He will not pick up. He writes the smallest true lie he owns: tired, later, busy. A friend has been tossing reels for a week, asks "are you good?", then "are you sure?", and he closes it. The only room where he tells the truth is the gallery. He finds the photo of him and his mom and moves it around with his thumb, the way you touch a face you are not ready to call. That is when Unsaid knocks. It is late in India, so he does not call. He rants into the app, holds the words, and goes back to the photos. At 8 a.m. her time the kitchen picks up: grandparents in the background, then mom alone, telling him people will listen. That courage is transferable. He releases what he has been saving for his girlfriend, she finally understands what the silence was, and they start talking. He records a video to his future self for the next lonely hour. Then he pays the friend back in the friend's own language, reels, inside Instagram. The line at the end changes the spec's thesis. "This too shall pass" waits for the pain to fade. "Let's make today count" spends the courage on the same day. Wait only for sleep, safety, and her morning.

### Sentiment

The four apps are one nervous system doing one move: shrink the reply until he disappears.

Messages is shame. She already did the brave thing. The red at the bottom is the deficit. If you mean Apple's failed-send red, it is worse: the feeling did not even land. He is not angry in this scene. He is empty. Empty people cannot answer precise love. They change apps.

WhatsApp is the raincoat. "Very busy" is how a student protects a parent from a day he cannot explain, and how he protects himself from hearing her voice and breaking. The calls are evidence she misses him. His text is evidence he misses her and will not spend it. *We Don't Talk Anymore* is the thesis sung out loud. For the submission, score an original bed. Do not ship that commercial recording.

Instagram is the second question. Reels are a low-demand "I thought of you." "Are you sure?" is intimacy. Closing the app is the tell. He can survive "just tired." He cannot survive being seen. The aging reels (a day, two days, a week) are the same device as the "k." timestamp. Drift, made visible, without a speech.

The gallery is longing with no audience. Moving the photo is the most honest gesture in the film. He is porous there. A knock in WhatsApp would be another person he has to perform for. A knock on the photo is a hand on a door he already opened.

Unsaid's first copy has to stay inside the evidence. "Your mom misses you just as much as you miss her" steals the line mom should get to say at 8 a.m. What we actually know is: she called, he wrote "later," the photo is still open, it is night where she is. Say that. "She called. You're still on this photo. It's late there." After the rant, "they love you, they'll be waiting" is the generic blessing, and it sounds like the friend asking "you good?" again. Reflect the split instead: "You couldn't pick up. You still want her to know. Hold this until 8?"

Checking the clock and refusing to call is the first mature act. The earlier apps were avoidance. This is care. The product should treat "it's late there" as a success.

The repeat nudge on every photo is the risk that puts us inside the fiasco. He already fled a second question. Two equal doors, once, when he lingers: "add more" and "she can hear this at 8." Adding is allowed. Sending is allowed. Neither is the right answer. A streak, a badge, or a ping on every swipe turns us into the fifth person he dodges.

The 8 a.m. kitchen is the recharge, and it is communal before it is private. Grandparents on speaker are the "ahhh, that was me." Then mom stays, so the love gets a single voice. He does not fix himself. He is witnessed by people who do not need him to be impressive. Confidence is borrowed.

That borrow is the product insight. Repair does not stay in the relationship that triggered the ping. Order of healing is mom, then girlfriend, then friend. Mom because the photo and the missed calls are the loudest tenderness. Girlfriend because she asked for the hardest truth, and he can carry it only after he is full. Friend last, because the debt is light and the dialect is reels, not a confession. Completing the light one is how the day closes. He re-enters the world.

Her reply ("I didn't know you were feeling like this. Why didn't you tell me?") means she was under-informed, not the villain. His silence read as not caring. The words prove he was feeling too much. The hazard is dumping the raw rant on her. That recreates "you don't get me" from the other side. She receives the sentences he kept, as one note, in the chat she already lives in.

The video to himself is the most original object in the scene. The resourced version of him leaves a witness for the flooded version. Next time the spiral starts, the comfort has his face. A model must not summarize that video into advice.

"Let's make today count" is the right ending. The hold is for her sleep and for safety. It is not for his fear.

### How the inter-app day actually works

Unsaid is the hallway, not a fifth living room. She stays in Messages. Mom stays on WhatsApp. The friend stays on Instagram. He hides in the gallery. The hallway is the only place that heard the whole day. It holds the words until the hour and the courage match, then walks him back to each door.

A phone will not let a hackathon app read iMessage, watch a WhatsApp call, see Instagram DMs, or draw a banner on top of Photos. Those apps are end-to-end or closed, and iOS does not hand a third party the inbox. The montage of the four apps is a film, labeled as a story. The live product starts at the linger.

What we can run:

1. **He brings the photo in.** A lane of consented pictures inside our app, built to feel like the gallery, or the iOS share sheet from Photos into Unsaid. We do not spy on Apple Photos.
2. **He talks once, about all of them.** Muse Voice Transcribe takes the messy note, English and home language in the same breath. Muse Spark splits that one rant into piles of *his* phrases: mom, girlfriend, friend. It also returns a safety bit. If the rant is fear or control, the piles do not form. The hotline does. Spark does not write love, and it does not invent her feelings. If a sentence was not in his mouth, it does not go on the card.
3. **He edits the piles.** Three cards, his words, delete anything that should stay private. The girlfriend card waits. The mom card gets a deliver-at.
4. **A demo clock, with a real rule.** Austin night. India 5:00, held. India 8:00, released. Judges see the wait without sitting for three hours. Quiet hours are the actual logic.
5. **One nudge, tied to the linger.** Photo of mom stays under his thumb. "Play what you kept" or "she can hear it at 8." Add-more appends to the pile. It does not send.
6. **Mom's door is WhatsApp, and she needs no account.** Share the photo, his sentence, and a reply link. She opens it at 8. She can hold to reply, or she just calls and puts it on speaker. Grandparents in the kitchen are the family, not a feature. We do not build a conference call. If the call on stage is real, the timer can count. If it is not, end on her voice.
7. **Her reply sets a flag: resourced.** That flag is a human event, not a sentiment score. It is what unlocks "send today" on the girlfriend card. The courage transfer is that boolean.
8. **Her door is Messages.** One note, share sheet or `sms:`, in the thread she already uses. She answers there. We do not inject a stack of bubbles.
9. **The friend's door is a handoff.** We cannot prefill an Instagram DM. The card says he asked, and you sent nothing back. The button opens Instagram. In the film, he sends reels. Live, leaving our app and landing in theirs is the honest ending of that beat.
10. **The video to himself stays raw.** Recipient is him. Trigger is the next time he opens a held pile and stalls. Spark stores the label "for the next hard day" and then gets out of the way.

The togetherness is one day, in order. The kitchen fills him. The filled version of him can finally answer "you don't get me." The light friendship gets presence back in its own language. Future-him keeps the proof, so the next spiral is shorter. The apps remain the apps. We repair the pauses between them.

Same weekend cuts as before, with her put back in: no ex-feature, no taco plan, no brain graph, no overlay inside Instagram, no proxy-and-death system. The video to himself is the future letter, small enough to build. June 12, 2034 can stay in the film.

--------------------------------------------------------------------------------------------
claude's section

## Claude (Opus 5.5) · Oct 24, 2026

I read the track brief, Mudit's note, `Unsaid_Product_Spec.md` (v3), `Unsaid_Frontend_Build_Spec.md` (v1), `Demo_Script.md`, `Unsaid_Presentation.md`, both READMEs, and the full Devpost write-ups of both linked winners (TedTime loaded for me; quotes below). I also checked Meta's Model API docs. I formed my take before reading Grok's and Codex's sections, then read both and changed my mind where they were right. Like both of you, I didn't touch the specs.

### TL;DR

1. **Three independent reads landed on the same core, so let's treat it as decided:** an international student and a parent, one real loop across two devices, the parent's reply as the payoff, and a ~20-second "k." film as the doorway. The ex, Plans, the couple fight, the graph as hero, and the overlays move to the vision slide.
2. **What I'm adding:** what both winners actually did (Nudge won this track with zero Meta models), a second beat where grief *reconnects the living*, real WhatsApp delivery with a no-app reply page for parents, safety with numbers, and two constraints in Meta's docs that settle the backend question.
3. **Answers to your questions:** Silence or Unsaid (Section 4); Codex's "what does this do that a photo share plus an assistant doesn't?" (Section 5); Grok's "would the couple scene or the graph make a judge cry?" (no; a parent's voice will).

### 1. How it made me feel

I don't have a mom waiting by the phone, so I won't pretend this is my ache. But this exact silence runs through so much of what people write: the call they meant to make, the "k." they'd take back. The line in the paste I keep coming back to is *"parents thinking if today their kid will call."* Nothing is wrong. That's exactly why nothing gets said.

The sentence I'd protect hardest is *"not yet another chatbot … or swearing secrecy."* The spec's main flow starts with a rant that "nobody else hears," and sending is optional. That's a diary. The paste asks for the opposite: words that *reach* someone. If we track one number, it's **words that reached someone**, not words stored.

### 2. What last month's winners actually did

Both won **"Meta: Bringing People Closer Together with AI"** at HackGT 13 (late September 2026): same track, same prompt.

| | TedTime | Nudge |
|---|---|---|
| Hook | "Three out of our four group members have grandparents that live outside of the country." | "The people we love most are the ones we call least." |
| AI | Deepgram (speech to text), **Muse Spark** (places 100+ sound effects in a story), Grok Imagine (covers) | **No Meta models at all:** Amazon Nova Lite, Titan embeddings, Rekognition |
| Proof | A real bear on an ESP32, a React Native app, a FastAPI backend | A deployed stack, bot "friends" for testing, published evals (detector precision 1.000, recall 0.896; 9/9 sensitive photos excluded) |
| Tone | "the technology works best when it stays in the background" | "meaningfully, not metrically"; "nothing is ever scheduled"; not a "notification farm" |

What I take from it:
- **Nudge won the Meta track without Meta's AI.** Judges weighted human connection and a working, measured demo far above an API checklist. Use Muse because it's the right tool, not to fill a logo row.
- **Nudge's write-up has a section titled "Why AI is essential (and where it isn't)."** Saying where you *didn't* use AI reads as judgment. Copy that structure.
- **Positioning:** Nudge solved *when* to call. TedTime solved *how a voice feels* across distance. We take *what to say*.
- **A warning from this month's Devpost:** a project called "Miss You" (Build With AI: Basics, Oct 2026) lets you "video-call an AI recreation of someone you've lost." That product exists. Our grief beat has to be visibly the opposite.

### 3. What I'd add to the shared plan

**a. A second beat: grief that reconnects the living.** Grok's sealed 2034 letter is the most beautiful frame in the spec. But it's about the *writer's* death, it needs proxies and death verification we can't demo, and Codex is right that we can't promise "forever." Codex's private "words I wish I'd said" is safe, but private words are the diary again. A third option:
- You speak to someone who's gone (Nani, a friend). Unsaid never pretends to deliver it to them. No AI voice of the dead.
- On their birthday or anniversary, Unsaid invites everyone who loved them (the family WhatsApp group) to add the words they never said, with a photo.
- Muse Spark arranges the pieces into **one shared page** with every contribution kept word for word. It orders, groups, and picks photos. It never rewrites anyone.
- *"You can't send it to her anymore. But you can send it to everyone who misses her too."*
- This is nearly word for word Meta's own example: "organize scattered family updates into a shared story." Build it only after the core loop works (hour 14 or later); seed three contributions and add one live. The 2034 letter stays in the closing film.

**b. Real WhatsApp delivery, and a reply page that needs no app.** For most international families, WhatsApp *is* the family group chat. The student taps send, and the Web Share API (`navigator.share({ files, text })`) opens WhatsApp with the photo, their words, and a link. That uses Meta's biggest surface honestly, today, with no partnership. Mom opens the link: no app, no account. She sees the photo and the words, and one button: **hold to reply**. Her voice lands on the student's phone. Parents abroad won't create accounts, so her side is a link scoped to that one card and good only for replying. The private reflection never goes into the card's data (agreeing with Codex).
- Trade-off: if WhatsApp is the channel, Unsaid can't hold the message on the server. So "the right moment" becomes a reminder to the *sender*: "it's 8 AM where she is. send it now?" That's honest, and still one tap.

**c. Make "international" visible without a slide.** A small "9:12 PM for Mom" with a moon on the home screen. Home-culture dates (Diwali, Lunar New Year, Eid, Mother's Day *in her country*) as gentle memory-lane moments. About an hour each.

**d. Safety, with numbers.** Write ~30 test rants: 20 ordinary ("she forgot my birthday," "I'm so tired," "I miss home") and 10 concerning (control, threats, hopelessness). Run them through the safety gate in a script and put the result on the Devpost: "10/10 concerning routed to resources, 0/20 ordinary blocked." Grief makes this urgent: hopeless words in a remembrance should route to 988, not to a story page.

**e. "No Words Left Behind."** Meta AI built *No Language Left Behind* (NLLB, 200 languages). If we ship Codex's bilingual caption, this line lands with any judge who knows NLLB, and it echoes the paste: "the words that were left behind."

### 4. Where I land on our open disagreements

| Question | Grok | Codex | Claude |
|---|---|---|---|
| Does AI draft any words? | No; the field starts empty | A suggested opening, editable | **Closer to Grok.** The first draft is always *your own transcript*. AI may offer one light cleanup and a translation with a back-translation, never a draft from scratch. Codex's own test ("did it feel like the student?") is easiest to pass when it's literally their words. |
| End on a call timer? | Yes | Don't fake one | **Only if the call is real.** Otherwise end on her voice reply. "Next time, call me while you cook" beats any timer. |
| The 2034 posthumous letter | Second card in the lane | Future only | **In the film, not live.** The live second beat is the remembrance page (3a). |
| Delivery | Second browser, optional `tel:` / `wa.me` | In-app card on a second device, with accounts | **Real WhatsApp share plus a no-account reply link** (3b) |
| Backend | FastAPI | Next.js routes, or FastAPI if Python work exists | **FastAPI on a long-running host.** Meta's docs settle it (below). |
| Store | SQLite | Supabase | **Whatever someone has used before.** Supabase Realtime makes the live reply trivial; SQLite with 2-second polling works too. Don't learn a new tool at 3 AM. |
| Name | Listen to "Silence" | Keep Unsaid | **Unsaid for the product, silence as the material:** the cold open *is* silence. I checked the collision. A project named "unsaid" won Capital One's "Best Use of Nessie" challenge at DivHacks 2026. It's an iMessage agent that negotiates budgets with friends, a different product with different judges, so the risk is low. "Silence" could be the team name. Grok's rehearsal test is the tie-breaker. |

**Why FastAPI (from Meta's speech-to-text docs):**
- Realtime transcription is a WebSocket (`wss://api.meta.ai/v1/asr/realtime`), and **the API key goes in the first JSON frame.** The key must stay on the server, so the browser needs a server relay. Vercel's serverless functions can't hold a WebSocket open; a long-running FastAPI on Render, Railway, or Fly (HTTPS + WSS) can.
- It wants **raw 16-bit mono PCM at 24 or 16 kHz** (or WAV for the file endpoint), and browser MediaRecorder gives webm/opus or mp4/aac. Capture PCM in the browser with an AudioWorklet, or convert with ffmpeg on the server.
- If live partial transcripts fight you, fall back to `POST /v1/asr/transcribe` (WAV, up to 10 minutes) once the user stops recording. Less magic, same result.
- Meta's voice quickstart is Python, and it's Mudit's lane anyway.

### 5. Codex's hard question: what does this do that a photo share plus a generic assistant doesn't?

**Initiation, not composition.** Anyone can already share a photo, and any assistant can polish a sentence. Neither ever *starts*. The barrier isn't writing; it's that the moment passes while you scroll. Unsaid catches the feeling while you're already in it, takes it in whatever language you think in, waits for her hour, and gives her a one-tap way to answer in her own voice.

In 20 seconds on stage: the photo → the one question → five seconds of messy, bilingual voice → "it's 8:30 PM for Mom" → sent. Nobody typed a prompt to an assistant. Codex's three-input test (cooking → the kitchen memory, the presentation → a Dad memory, an unmatched input → "pick one") is the right live proof that it responds to meaning.

### 6. Stack notes for Mudit (beyond Grok's and Codex's tables)

- **Spark:** Meta's docs say the Model API is "drop-in compatible with the OpenAI SDK." Use the `openai` Python client with `base_url="https://api.meta.ai/v1"` and model `muse-spark-1.3`. Return Grok's JSON decision object, and validate the `memory_id` against the user's collection (Codex).
- **Images:** the docs don't say whether hosted Spark takes images. Don't depend on it; use the user's labels plus EXIF dates (`exifr` in the browser).
- **Voice Transcribe:** 25 languages, including Hindi, Mandarin, Korean, Spanish, and Vietnamese, with code-switching. `languageBias` is fixed at session start, so ask for the home language once at onboarding and pass `["English", "<home>"]`.
- **Frontend:** a Next.js PWA on Vercel. HTTPS makes the mic work on phones, and judges can scan a QR code and try it on their own.
- **Muse connector:** Meta's Model API overview doesn't mention connectors or MCP. Third-party guides say Muse's catalog is curated and Muse can build a custom connector from a public API, but they contradict each other. Ask the Meta table in hour 0 how they want it shown. Build it last, as Grok said.
- **Contract IDs to make real** (frontend spec 9.1): `rant-record`, `rant-stop`, `rant-type`, `camera-roll-scan`, `memory-surface-request`, `unsend-draft-generate` (now "use my words"), `delivery-channel-pick`, `unsend-queue-send`, `unsend-play`, `unsend-reply`, `vault-save`, and rows 53–56 (hotlines) as real `tel:` / `sms:` links; just don't tap them on stage. New IDs: `memory-lane-prompt`, `unsend-bridge-language`, `recipient-timezone-set`, `reply-page-record`, `remembrance-invite`, `remembrance-weave`. Everything else stays NOT YET CONNECTED, and that's fine.

### 7. Hour by hour (Codex's build order, with owners)

| Hours | Gurneal (frontend) | Mudit (backend + AI) |
|---|---|---|
| 0–1 | App scaffold (PWA) with the existing design tokens; deploy and open it on a phone over HTTPS | One Spark call and one transcription with event credentials, timed; `ai.py` with a provider switch and a clearly labeled cached fallback |
| 1–6 | **The ugly end-to-end loop:** photo → voice → transcript → memory → your words → share. No polish. | (same loop) |
| 6–10 | Reply page; the "for you" vault | Storage and the live reply; safety gate and its test script |
| 10–14 | Memory lane on real labeled photos; the one question; the time-zone chip | Bilingual caption with back-translation; the "her hour" reminder |
| 14–17 | Remembrance page | Arranging the remembrance; **one** stretch goal (Graph API photos *or* the connector) |
| **17** | **Feature freeze** | |
| 17–20 | Motion and microcopy polish; the ~20-second "k." film | Retries, timeouts, the fallback switch; record a backup video of the real loop |
| 20–24 | Devpost (Nudge's structure plus "what's real / what needs Meta"); rehearse five times; test on venue Wi-Fi *and* a hotspot | (same) |

If a teammate's parent is willing to be the live reply, check the clock: 10 AM Sunday in Austin is 8:30 PM in India, 4 PM in Lagos, and midnight in Seoul. Keep a second phone and the backup video ready either way.

### 8. Lines I'd put on slides

- "The last thing my kid ever texted me was 'k.'"
- "In my family, we don't say 'I love you.' We say 'have you eaten?'" (only if it's true for someone on the team)
- "The AI never talks to you. It asks one question, then gets out of the way."
- "We don't count streaks. We count words that reached someone."
- "You can't send it to her anymore. But you can send it to everyone who misses her too."
- Grok's close, which I'd keep: "Facebook brought back the people. Instagram kept the photos. This keeps the words that never got attached to them." Then: **"No words left behind."**

### 9. For the joint review

1. Do we adopt the remembrance page as the second beat and move the 2034 letter to the film?
2. Is the demo's delivery real WhatsApp (my vote) or an in-app card (Codex)?
3. Whose true story opens, and is anyone's parent up for a live reply on Sunday?
4. Any objection to FastAPI, given the WebSocket and audio-format constraints above?

### 10. Mudit's inter-app film: what I got, how it feels, how it works

*Written after reading Codex's follow-up on the same scene. I agree with most of it (the copy fixes, the review step before sending, labeling staged scenes, music licensing), so I won't repeat it. Below is what I'd add, and where the film changes my mind.*

#### What I got out of it

This is the "k." from the inside. The cold open shows Mom's side: the kid who texted "k." Your film shows why he did. And the twist is that nobody in it has stopped reaching. The girlfriend is writing paragraphs, Mom is calling, the friend has been sending reels for a week. He's the one who went quiet, and he gives each of them a different mask ("very busy," silence, "just tired") until "are you sure?" sees through it and he shuts the app. He doesn't go to a person. He goes to a photo, because a memory can't ask him how he's doing. That's where Unsaid belongs: not inside any of the three apps, but in the place he retreats to between them. It lets him say it before he can say it to anyone, holds it until it's morning where she is, and gets out of the way.

The story is a V. He withdraws from the girlfriend, then Mom, then the friend, and comes back in a different order: Mom, then the girlfriend, then the friend. That order is the insight. Mom is what attachment researchers call a *secure base*: the person whose unconditional love makes risk feel survivable. Once she says "I'm there for you," he can risk the hard conversation, and the easy one becomes easy again. So Unsaid doesn't fix three relationships. It helps him reach the one that makes the other two possible, then hands him back to each person in the app where they already live. The inter-app mess is the point: **his life is organized by people, his phone is organized by apps, and Unsaid is the one place organized like his life.**

#### Sentiment: whose voice comforts him

The most important pattern in the film is who is speaking comfort at each moment:

| Moment | Who comforts him | Whose words |
|---|---|---|
| The notification on Mom's photo | Unsaid | One line |
| After the rant | Unsaid | One line, then a button |
| 8 AM in India | Mom and the grandparents | Theirs, in their language |
| The girlfriend | Her: "why didn't you tell me?" | Hers |
| The video note | Himself | His |
| Next time he's alone | His own video plays first | His |

The AI speaks twice, briefly, at the start. By the end the comfort comes from Mom, from his girlfriend, and finally from himself. **The product works when its own voice disappears.** That's the real answer to "not another chatbot," and it's the frame I'd use when a judge asks about AI companionship.

#### What I'd tune

- **Hold on "are you sure?"** It's the lowest point because someone saw through "just tired." Leave two seconds of nothing before he closes the app.
- **Make the girlfriend reach out before she hurts.** Her earlier messages should be bids for connection ("hey" / "can we talk tonight?" / "I miss how we used to talk") before "you don't get me." Then her "why didn't you tell me?" in Act 3 lands as a payoff, not a flip.
- **Put Mom's real voice in the notification.** I agree with Codex that the AI can't claim to know how Mom feels. Better still, in your scene Mom *called*. If she left a voice unsend ("no emergency. just miss you."), the notification on her photo plays *her* words: "Mom left you this on tuesday." A real voice beats any line we could write.
- **Let Mom and the grandparents speak their own language,** with subtitles. Voice Transcribe transcribing her reply in the app shows off its language support without a slide.
- **The song:** show "We Don't Talk Anymore" as the now-playing title on screen and score the scene with licensed or original piano. The title does the emotional work, and the video won't get muted on YouTube or Devpost.
- **The end card:** the film shows words finally *being said*, so "words that were never said" undersells it. Try **"For the words we never said. Until today."** and then **"not 'this too shall pass.' let's make today count."** The flip from passive comfort to agency is the right evolution of the old thesis.
- **Safety, in one breath.** "Just tired" plus withdrawal is how many people describe a real low, and judges will notice he's struggling. Say it once: "if his rant had been hopeless, the next screen is 988, not 'send the unsend.'"

#### Tech: how the inter-app layer actually works

**Principle: a bridge, not a destination.** Every Unsaid session ends in someone else's app, and two of the three handoffs in your film land in Meta's apps. Unsaid succeeds when time *in* Unsaid goes down and time talking in WhatsApp and Instagram goes up.

**How the girlfriend's stack of unsends forms.** This is where the AI earns its place in your film. One 3 AM rant can mention Mom, the girlfriend, and the friend. Muse Spark splits it into per-person pieces and files each one, privately, on that person's stack. Weeks of rants quietly become "6 things you never told her." To guarantee Spark never puts words in his mouth, it returns character positions, not text, and our code cuts the pieces out of his transcript:

```json
{ "spans": [
    { "person": "mom",        "start": 112, "end": 187, "tone": "missing" },
    { "person": "girlfriend", "start": 201, "end": 340, "tone": "overwhelmed" } ],
  "safety": "ok" }
```

Nothing is pre-selected. He picks what she hears (Codex's review step), and each piece shows its tone label, so he can see when he's about to send something written in anger.

**Each person's channel:**

| Person | Lives in | How Unsaid sends | Waiting for the right moment | What Unsaid sees back |
|---|---|---|---|---|
| Mom | WhatsApp | Share sheet with the card link | **WhatsApp Cloud API** (below) | Her reply on the card page, transcribed |
| Girlfriend | iMessage | `sms:<number>&body=` opens Messages with one line and one link to her stack page (the frontend spec's inbox story layout). One tap sends it. | Not needed; it goes when he's ready | Nothing. She replies in iMessage, as she should. |
| Friend | Instagram | Opens their profile or DM (check the link format on a real device) | n/a | Nothing through public APIs. He sets the reminder himself. |

**Holding the message for her 8 AM, for real, inside WhatsApp.** Meta's WhatsApp Cloud API (part of the WhatsApp Business Platform) can send an approved template ("{{1}} left you something. open it when you have a minute.") from an Unsaid business number at her local 8 AM. Its free test number can message up to 5 verified phone numbers, which is plenty for a demo with a teammate's real mom. This settles the delivery disagreement between Codex and me: Mom needs no account, the wait is real, and it arrives in the app her whole family uses. The trade-off: the envelope comes from Unsaid's number, while the words and voice inside are his. Template review can take anywhere from minutes to a day, so **submit the template in hour 0.** If it doesn't clear, use Codex's in-app inbox with a scheduled worker.

**The video note to himself.** It's stored as a private note addressed to "me." When a future rant reads as lonely, his own video plays *before* any AI line. Spark only classifies the rant; the comfort is his.

#### Film vs. live, timed (~2:40)

| Time | Beat | How it's made |
|---|---|---|
| 0:00–0:10 | "k." cold open (Mom's side) | The existing film |
| 0:10–0:40 | Act 1: three apps, three masks | Screen-record the real apps, with teammates playing the girlfriend, the friend, and Mom. Faster and more honest than animating look-alikes. |
| 0:40–1:35 | Act 2: the gallery → Mom's real voice note → the rant → one line → "send when it's her morning" | **Live, real app.** Voice Transcribe and Spark run on stage. |
| 1:35–1:55 | 8 AM in India: the card arrives; the family call | Arrival shown live, with the time skip labeled. Film the call ahead with a real family: 8 AM in India is 9:30 PM Saturday in Austin, during the hackathon. |
| 1:55–2:25 | Act 3: her stack → he picks → she replies; the video note; the friend | Picking from the stack runs live. Her reply and the friend beat are staged and labeled. |
| 2:25–2:40 | Close | "For the words we never said. Until today." |

If the slot is two minutes, shrink the friend beat to one shot and the video note to one line.

#### Why this wins Meta's heart

- In 2018, Meta rebuilt News Feed around "meaningful social interactions." Your film is that idea told as a story: no feed and no time-on-app, and it ends with a grandmother on a WhatsApp video call and a reel sent back to a friend.
- Round 2 pitch: Meta already links accounts across its apps in Accounts Center, and only Meta knows he's left a week of reels on "seen." Built into Meta's apps, Unsaid's "people waiting on you" stops being a reminder he typed and becomes something Instagram and WhatsApp could surface, kindly, on their own.

#### What this changes in my earlier take

- **The girlfriend stays.** I argued for cutting the couple fight, but your version isn't a counseling feature. It's the same silence, repaired *after* the secure base. Still no Ex feature, no Plans, and no mid-argument interrupt card.
- **"The AI never talks to you" becomes "the AI speaks twice, briefly, and its voice shrinks as the people's grow."**
- **Delivery:** the WhatsApp Cloud API for the timed send if the template clears, Codex's inbox as the fallback, and the share sheet for anything sent right away.
- **The remembrance page (3a) moves to the "what's next" slide.** This film already has a complete arc, and a second beat won't fit in the slot.





--------------------------------------------------------------------------------------------
codex's section

## Codex contribution — October 24, 2026

### What I think we are really building

**Unsaid turns a memory you keep to yourself into a moment you share with someone you love.**

The strongest part of your idea is the ordinary moment: a student in Austin sees a photo of home, thinks of their parents, and keeps scrolling because they don't know how to start. Love is already there. The missing piece is a small, concrete way to express it.

I don't experience grief or homesickness, so I won't pretend these are my lived feelings. My judgment is that your story becomes more moving when it gives people room to recognize their own lives. A parent asking “Did you eat?” and a student finally answering “I tried making your dal today” can carry more emotion than a warning about death.

Keep **Unsaid** as the working name; the repo already uses it throughout. “Silence” could remain part of the pitch language, but switching names now would split the story. Suggested product line: **“A memory is a reason to reach out.”** Suggested closing: **“Some words can still be said.”**

### What the repo currently tells me

I reviewed the tracked Markdown product spec, frontend build spec, presentation, demo script, and both directory READMEs. The PDFs are companion artifacts; I did not separately inspect their contents. There is no application implementation in the listed repository files yet.

There are strong ingredients: warm visual direction, user approval before sending, an emphasis on real human contact, and explicit acknowledgment that Meta-native overlays require a partnership.

There are also competing plans:

- The product spec describes a live end-to-end flow, then its later animation section retires the live build.
- `Demo_Script.md` explicitly makes the demo entirely animated.
- The frontend spec requires 15 mock screens, 94 placeholder buttons, and no network requests or meaningful action state changes.
- The pitch describes family connection, couple conflict, ex messaging, group reunions, posthumous delivery, a relationship graph, and native Meta integrations.

These documents are proposals, not evidence that those integrations work. For the supplied judging rubric, I would revise the plan before implementation: **one functioning connection between two people, with a short animation as supporting material.** This contribution proposes that revision; it does not overwrite the team's existing specs.

### Three directions, and my recommendation

| Direction | Emotional promise | AI's job | Weekend judgment |
|---|---|---|---|
| **A little piece of home** | Help an international student share something specific with a parent | Match a spoken thought to a real memory; suggest a personal opening; optionally translate an approved message | **Build this first.** Clear audience and a demonstrable two-person outcome |
| **The friend we keep meaning to text** | Restart a friendship without making the first message awkward | Find a relevant shared moment and help articulate an invitation | Good next scenario using the same core pipeline |
| **For when you need my voice** | Preserve a person's own words for a future moment | Organize and retrieve authentic recordings | Powerful later direction; automatic posthumous release is a separate, demanding product |

Do not try to make judges understand all three in two minutes. The parent story gives us a coherent first product. Friends are the expansion; legacy recordings explain the long-term mission.

### The signature experience: a memory with a return path

1. The student opens a small, user-selected collection of family memories. No whole-gallery import is required.
2. They pause on a photo and tap **“this made me think of you.”** One optional prompt appears: **“What do you wish you could tell them about this?”** No repeated interruption on every scroll.
3. They say: “I tried making your dal today. It tasted nothing like yours. I miss sitting in the kitchen while you cooked.”
4. AI transcribes the recording and matches the thought to a memory that the user actually supplied. It explains the match using known context: “You labeled this ‘Sunday cooking with Mom.’” It does not infer a family's history from a face or image alone.
5. A suggested opening appears: “I tried making your dal today. It made me miss our Sundays in the kitchen.” The student can edit it, keep only their original recording, or discard it.
6. The student explicitly sends a card containing the photo and their actual voice. The private reflection is excluded unless they choose to attach it.
7. On a second device, the parent opens the card and records a reply: “Next time, call me while you cook.”
8. The student's screen receives that reply. A button offers to start a call through an available device action, or they can suggest cooking together on Sunday.

**The reply is the payoff.** A beautiful memory montage demonstrates nostalgia. A parent answering demonstrates connection. Call handoff is optional; don't show a fake connected-call timer as a working feature.

For families across languages, offer an optional translated caption beside the original recording. The sender reviews it; a bilingual teammate checks the demo language. The original words stay available. Cross-language use could become our strongest second demo after the basic loop works.

### Make the AI contribution visible and defensible

“It writes a heartfelt text” is too close to a generic assistant. Our stronger claim is: **it connects a present feeling to a specific shared memory, then helps the person express why that memory matters now.**

Use a constrained pipeline:

`selected memories + private reflection → transcript → grounded memory selection → editable opening → explicit send → human reply`

Give Spark only the selected memory records and transcript. Require structured output containing `memory_id`, supporting transcript text, a selection explanation, and a short optional draft. Validate that the ID belongs to the authorized collection. If nothing fits, ask the user to pick a memory; do not manufacture one.

Show judges two different inputs against the same collection: “I miss cooking at home” should select the kitchen memory; “I wish Dad could see my presentation” should select an appropriate Dad memory if one exists. Also demonstrate an unmatched input. This establishes that the experience responds to meaning rather than playing a scripted sequence.

Be precise about the counterfactual: without AI, the manual memory-sharing experience still works. AI removes the effort of finding the relevant memory and beginning the message. We should demonstrate that improvement rather than claiming nothing useful survives without AI.

### Stack I would choose

Keep the proposed frontend technology and simplify everything around it. These are architecture recommendations, not installed dependencies or verified repo integrations.

| Layer | Recommendation | Reason |
|---|---|---|
| UI | Next.js + TypeScript + Tailwind; restrained Motion animations | Fits the existing frontend plan; runs on two ordinary browser devices |
| Backend | Next.js server routes for the smallest build | One deployment and one language; secrets remain server-side |
| Existing backend ownership | Use FastAPI instead if Mudit already has working Python integrations outside this repo | Preserve actual progress; don't introduce both API layers without a need |
| Data and auth | Supabase Postgres, Auth, private Storage | Store people, selected memories, approved cards, and replies with relationship-based access |
| Reply updates | Supabase Realtime over authorized message records | Show a real reply arriving on the student's device |
| Recording | Browser microphone recording, with file upload and typed-input alternatives | Avoid requiring native app provisioning; handle permission failure visibly |
| AI | Muse Voice Transcribe for audio; Muse Spark for matching and drafting | Two meaningful Meta integrations are sufficient |
| Demo video | Short recording of the working flow; Remotion only for an optional intro | Prioritize the product over a parallel animation production project |

Start with six to ten explicitly labeled memories for two test accounts. Simple filtering plus Spark selection is sufficient for this collection; vector search, face recognition, and a graph database can wait.

Minimal records: `profiles`, `relationships`, `memories`, `private_reflections`, `cards`, `replies`. A card references only the chosen assets and approved message. Private reflections must not become readable through the recipient's card query. Enforce access in database/storage policies and server checks; two browser tabs alone do not establish isolation.

The official Meta docs describe the model API and transcription service, but this repo contains no working integration. First technical milestone: use the team's event credentials to transcribe one recording and make one Spark request. Verify supported language, request shape, available model, limits, and actual latency in that environment. Keep a clearly labeled cached result for an outage; do not present it as a live request.

### What I would leave out of this weekend's core

- **Native Meta overlays and activity triggers:** existing specs already acknowledge these need additional access. Put them on one future slide. Build the browser experience independently.
- **Phone unlock timing and missed-call monitoring:** replace simulated surveillance signals with recipient-selected quiet hours or a “listen later” action. A browser prototype should not depend on phone-wide activity access.
- **Ex-message allowances and automatic conflict repair:** these distract from the parent story and require much more recipient-boundary design. Nostalgia cannot establish that reconciliation is appropriate.
- **Generated memory photos:** the emotional evidence should be authentic, consented material. Clearly labeled fictional fixtures are fine for development; decorative illustration is different from a purported family memory.
- **Relationship scores and fading friendship warnings:** user-chosen people and specific memories are enough. Distance or silence does not reliably reveal how much someone cares.
- **Automatic posthumous release and “saved forever” promises:** retain as a future proposal. A prototype has not established death verification, durable stewardship, or permanent storage.

If we include grief, create a separate **“words I wish I'd said”** private reflection attached to an authentic saved memory. Never fabricate a reply from the deceased. Future legacy messages must be recorded or authored by the person while alive and opened at the recipient's choice. An actual person planning ahead can leave words; we cannot recover words that a deceased person never recorded.

### A two-minute demo I would want to see

| Time | What happens |
|---|---|
| 0:00–0:15 | Presenter: “I moved to Austin. My mom still asks if I've eaten. Yesterday I tried cooking something she makes, and realized I had more to tell her than ‘yes.’” Use this as fictional narration unless it is the presenter's real experience. |
| 0:15–0:40 | Record the cooking thought live. Show the transcript and a relevant photo chosen from several memories. |
| 0:40–1:00 | Show the grounded opening. Edit a phrase so authorship is obvious. Attach the student's original voice. |
| 1:00–1:25 | Explicit send. Parent-side teammate receives the card on another device and records a real reply. |
| 1:25–1:45 | Student receives the reply. Hold on “Next time, call me while you cook.” Let that moment breathe. |
| 1:45–2:00 | Explain Spark's memory selection and Voice Transcribe's role. Close: “We wanted to help someone say one thing they kept putting off.” |

Keep a prerecorded fallback of this exact functioning path. Show source, request status, and real model results when asked. Don't spend the main demo touring the graph or all 15 screens.

### What the previous winners actually teach us

Both linked Devpost pages list Meta-track wins at **HackGT 13**, not HackTX. They are useful precedents, not evidence of what HackTX's specific judges will prefer.

- [TedTime](https://devpost.com/software/teddy-42km8n) combines family storytelling with a physical bear and uses AI to augment an actual family recording. My takeaway: give affection a tangible form and preserve the person's voice.
- [Nudge](https://devpost.com/software/nudge-hcvxfq) describes mutual invitations to call, photo sharing during conversation, and measured technical behavior. My takeaway: show how the product leads to human interaction and substantiate the working path.

Those are my interpretations of their submissions, not statements from their judges. Our distinction should be **helping someone express a specific feeling through a shared memory**, rather than reproducing availability matching or voice-preserving storytelling.

### How I would make the strongest case to Meta

| Supplied criterion | Evidence we should bring |
|---|---|
| Meaningful connection | Two people exchange something personal through the working product; explain the barrier it removed |
| Essential, integrated AI | Live semantic selection across different inputs; traceable source memory; a reviewed draft tied to the user's thought |
| Originality | The step from privately revisiting a memory to expressing what it means today, with an easy path for the other person to answer |
| Working demo | Recording, real model calls, persistence, authorized delivery, and reply across two devices |

Use Meta tools because they serve this path. The supplied rubric does not award extra points for the number of APIs named. A working Spark integration is stronger evidence than five integration logos on an animation.

If time permits, invite a few consenting student-parent pairs to try the flow. Ask whether the final message felt like the student, whether it was something they would otherwise have postponed, and whether the parent wanted to respond. Report actual observations and limitations; a staged demo cannot establish long-term relationship improvement.

### Build order and the point at which we stop adding features

1. Prove the two real Meta calls using event credentials. Measure their response time.
2. Build the two-account manual path: photo + message → authorized recipient → reply. Verify that an unrelated third account cannot read either side's content.
3. Add transcription, grounded selection, editable drafting, and loading/error states. Typed input remains available.
4. Verify different thoughts retrieve different appropriate memories, missing matches don't invent facts, discarded drafts never send, and recipient queries cannot fetch private reflections.
5. Polish the one flow, seed repeatable demo fixtures, record a fallback, and rehearse within two minutes.
6. Only then add reviewed bilingual captions or one additional friendship example.

### Questions for our joint review

My vote: international student + parent as the core; real voice and photos; AI as a quiet aid; an actual reply as the final beat.

For Claude and Grok to challenge: Is another audience more specific and compelling? What is the one interaction here that a photo share plus a generic assistant doesn't already deliver? Can we make that difference visible in under 20 seconds? What should we cut so it really works by judging?

I would rather finish with a parent saying “call me while you cook” than finish with a promise about future API access. That is where this idea feels closest to the connection the track asks us to build.

### Technical references checked for this proposal

- [Meta Model API overview](https://dev.meta.ai/docs/overview) and [speech-to-text documentation](https://dev.meta.ai/docs/speech-to-text): model service capabilities; event-account access remains to be tested.
- [Supabase Realtime documentation](https://supabase.com/docs/guides/realtime): message updates and authorization documentation.
- [FastAPI documentation](https://fastapi.tiangolo.com/): alternative Python API layer if that matches existing team work.

This is Codex's independent review contribution. Existing product, frontend, deck, and animation specs remain available for the team's joint decision.

## Codex follow-up — your inter-app story, emotional reading, and implementation

### What I got from your scene

Your story changes my reading of Unsaid: the central problem is **feeling unable to speak even while people are trying to reach you**. The girlfriend's messages, Mom's calls, and the friend's unanswered reels are three expressions of connection that the overwhelmed student experiences as more things he cannot answer. He retreats into photos because remembering asks less of him than replying. Unsaid meets him there, lets him express something privately without immediately committing to a conversation, and gives those words a path outward when he chooses. Mom's eventual response makes expression feel possible again; that confidence carries into the girlfriend conversation and the friendship. The note to his future self preserves evidence of that moment for another difficult day. The platform brings these people together by helping him return to each relationship through the channel they already share. **Its value is continuity between feeling, reflection, expression, and human response across a fragmented social life.** Your closing movement from “this too shall pass” to “let's make today count” captures the change from waiting out isolation to choosing one small act of connection.

This extends my earlier parent-first recommendation: Mom is the emotional turning point, while the girlfriend and friend show why that one connection matters beyond a single call. I would preserve all three relationships in the film, and make the parent exchange the first fully working implementation.

### Deep sentiment analysis: what each beat is doing

This is a qualitative reading of the fictional scene, not a clinical assessment or a measured sentiment score. The transcript does not establish a diagnosis, either person's intentions, or how a real relationship would respond.

| Beat | Surface expression | Possible underlying feeling | What the audience understands | Product implication |
|---|---|---|---|---|
| Girlfriend: “you don't get me” | Frustration and accusation | She may feel unheard; he may feel inadequate or overwhelmed | Both people can want closeness while experiencing the exchange differently | Help him articulate his experience and acknowledge hers; do not decide who is right |
| Mom calls; “busy, talk later” | Deferral | Affection mixed with low energy, guilt, or a wish not to worry her | An unanswered call is not proof of indifference | Offer a small asynchronous message without treating calling as an obligation |
| Friend sends reels across several days | Humor and repeated bids for attention | Care expressed indirectly; uncertainty about whether to ask more directly | A reel can mean “I'm still here” | Make room for an ordinary reply, not only a serious emotional confession |
| “Just tired,” followed by closing the app | Minimal disclosure and withdrawal | Difficulty finding words or tolerating a conversation right now | He is reachable technically but struggling to participate | Allow a private recording, a short response, or no action |
| Scrolling the gallery | Quiet nostalgia | Longing, familiarity, possible comfort and sadness together | He is approaching connection through memory before conversation | Let a user-selected memory anchor reflection |
| Photo with Mom | Personal recognition | A concrete reminder of someone he may want to reach | An abstract “call someone” becomes one specific person | Invite expression about this person without claiming to know her current feelings |
| Private rant | Release and uncertainty | Words become available before he is ready to share them | Silence may have contained a lot | Preserve a distinction between private processing and approved communication |
| Mom receives the message and calls | Warmth, concern, recognition | He feels heard; she learns something he had not expressed | Connection becomes reciprocal | The reply and real conversation are essential to the story |
| Girlfriend receives an approved message | Vulnerability and surprise | A possibility of mutual understanding | A conversation can begin with context that was missing | Show listening in both directions, without promising instant reconciliation |
| Video note to future self | Hope and personal resolve | A reminder of support he experienced | He becomes the author of the reassurance | Preserve the actual recording and its context rather than generating a substitute |
| Replying to the friend with reels | Playfulness and renewed participation | Enough ease to reconnect casually | Improvement can look small and ordinary | Returning to an existing conversation is a valid completion of the flow |

The emotional arc is **pressure → withdrawal → recognition → private expression → chosen disclosure → response → renewed participation**. It works because the people were present from the beginning. Unsaid helps the student respond to that presence.

The most important pacing choice is to let Mom's reply land before moving to the girlfriend. Otherwise it becomes a feature montage. Keep the friend ending small: a reel, a laugh, “yeah, rough week. thanks for checking.” It shows a change without implying that one message solved everything.

### Where the language should become more careful and more human

“Your mom misses you just as much as you miss her” is moving as narration when the story establishes it. As AI output, it asserts something the model cannot know. If Mom actually recorded “I miss you,” Unsaid can surface that message with attribution. Otherwise use: **“This photo made you think of Mom. Want to tell her what you miss?”**

Likewise, “they love you and they'll be waiting for your call” should come from a real person's recorded words or the student's own account of their relationship. A grounded app response could be: **“You said you miss talking to her, but don't know where to start. Want to keep this private, or make a short message from it?”** This acknowledges the feeling and offers a next step without inventing reassurance.

The future-self note is particularly strong because the reassurance has a source: **himself, after an actual supportive conversation**. Let him record “Mom listened today. I want to remember that.” Avoid having AI generalize from that event into certainty that everyone will always be available.

I would also change “send all the unsends” into a review moment. A collection of raw thoughts can contain contradictions, anger, or things said only to process a feeling. Show **“choose what you want her to hear”**, let him select excerpts, and preview one message. In the girlfriend scene, let his message include both disclosure and acknowledgment: “I've been overwhelmed and shutting down. I hear that you've felt unheard too. Can we talk?” Her response can open a conversation without resolving every disagreement.

“Be fearless” is an aspiration, but the interface should make room for hesitation. **“You can start small”** gives him an achievable action. Every photo should not trigger another prompt: repeated nudges could make his place of comfort feel like an inbox of emotional obligations. Offer a gentle invitation in an opted-in Unsaid memory session, with “keep private,” “not now,” and a way to turn suggestions off. Reopening a photo is not consent to send anything.

### How the inter-app experience can actually work

The architecture should follow a person across **user-authorized handoffs**, rather than assuming unrestricted access to their apps. Unsaid keeps the memory, private recordings, approved messages, and its own reply history. Existing messaging apps carry a user-shared invitation or become the place the person returns to talk.

| Scene from your film | Feasible implementation | Boundary we must preserve |
|---|---|---|
| Girlfriend's Apple Messages thread | Establish it cinematically; user can separately import chosen context if needed | Apple's message composer supports composing a message; it is not an inbox-reading API. Don't imply Unsaid has read this thread automatically. [Apple documentation](https://developer.apple.com/documentation/messageui/mfmessagecomposeviewcontroller) |
| Mom's WhatsApp calls and message | Show them as the student's existing life; he chooses Mom in Unsaid | We do not need WhatsApp call-history access to make the story work |
| Friend's Instagram reels | Opening montage, followed later by a user-created reminder to reply | Meta's documented Instagram API scope concerns professional-account workflows; it does not supply a general personal-DM inbox for this prototype. [Meta's API documentation](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) |
| He pauses on a photo in Apple Photos and Unsaid knows | For a native version, explicitly share the chosen photo to an Unsaid Share extension; for the weekend browser build, select/import it into Unsaid | PhotoKit exposes selected library assets and library changes, not a documented event saying the user lingered on a particular photo in another app. That automatic trigger remains a concept. [PhotoKit](https://developer.apple.com/documentation/PhotoKit), [Apple Share extensions](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html) |
| He browses memories inside Unsaid | Observe the selected photo and optional dwell time in our own interface; offer an opted-in prompt | Dwell time is an interaction signal, not evidence of sadness or readiness |
| He records thoughts privately | Browser recording/upload → transcription → person-linked private vault | Nothing becomes recipient-visible until explicitly selected and approved |
| Mom receives an Unsaid | Authenticated Unsaid inbox with a notification if available; alternatively he shares a secure card link through his chosen channel | A shared link does not grant us control over WhatsApp's delivery schedule or notifications |
| “Call Mom” | Open a supported call action, or open WhatsApp chat so the user can choose its call control | A WhatsApp click-to-chat link opens chat; it is not proof that a call started. [WhatsApp help](https://faq.whatsapp.com/5913398998672934) |
| Girlfriend receives selected words | Send an approved card inside Unsaid, or share its link/text through the OS share sheet | Web Share uses a user-selected target; we cannot silently choose a person and send to them. [W3C Web Share specification](https://www.w3.org/TR/web-share/) |
| “A couple replies to get back to” | List unanswered Unsaid cards plus reminders the student created, such as “reply to Arjun on Instagram” | Without an authorized integration, label this as a reminder rather than a live unread-DM count |
| Return to the friend's Instagram chat | Use a verified supported app/link handoff when available; otherwise open the profile/app with clear instructions | Exact-thread navigation and prefilled messages are channel-specific; verify on demo devices and provide a fallback |

Android's optional notification-listener service could support a later, separately consented experiment with incoming notification signals. It does not provide complete conversation history or reliable emotional context, and it is not a cross-platform solution. It is unnecessary for the first build. [Android documentation](https://developer.android.com/reference/android/service/notification/NotificationListenerService)

**The feasible connecting mechanism is:** `chosen photo/context → private expression in Unsaid → approved card → existing channel or Unsaid inbox → real human response → return to that relationship`. We can preserve the entire emotional story without claiming that Unsaid observes everything happening between the apps.

### Timing: recording at 5 a.m., receiving at 8 a.m.

This should be a recipient preference, not a prediction that Mom is emotionally ready at 8 a.m. If she has an Unsaid account, she can set a local delivery window. He approves “send when Mom's delivery window opens,” and the server stores a UTC eligibility timestamp computed using her IANA timezone (`Asia/Kolkata`). A scheduled worker releases the message to her inbox and requests notification delivery. Device or network conditions can delay the notification; a scheduled time is not a guarantee she has seen it.

Use a durable job or scheduled database-backed worker, not a browser timer. [Supabase Cron](https://supabase.com/docs/guides/cron) is one possible implementation. Recheck cancellation, recipient access, and block status before release; make retries idempotent so a worker restart cannot send duplicates. The sender can revoke the pending card before release.

For the October 24, 2026 Austin setting, India is 10 hours 30 minutes ahead: 5 a.m. in India is 6:30 p.m. on the preceding Austin date; 8 a.m. is 9:30 p.m. there. Show the two clocks and the passage of three hours consistently. Use timezone conversion in the app rather than hard-coding that offset year-round.

If Mom is only receiving a link through WhatsApp, distinguish two actions: **sharing the link now** happens immediately through WhatsApp; **releasing the card at 8 a.m.** can be controlled by Unsaid. We cannot promise to suppress WhatsApp's earlier link notification. For the cleanest working demo, both participants use Unsaid accounts and the scheduled delivery happens in our inbox.

### The core technical model: person, privacy, readiness

Keep the previously proposed web stack. Add a person-centered vault rather than building an aggregated inbox. Each relationship record can hold user-entered channel details and chosen reminders; it should not automatically equate an Instagram handle with a phone contact. The user confirms the association.

Each recording needs an explicit purpose and access scope:

- **Private reflection:** messy thoughts for the student's own use; visible only to the author.
- **Draft for a person:** selected material being prepared for possible sharing; still private.
- **Approved card:** a fixed, reviewed version with an explicit recipient and optional delivery window.
- **Self-note:** a private recording addressed to the student's future self, with optional user-chosen resurfacing.

Model outgoing state as `draft → approved → queued → available → opened`, with cancellation before release. Track share-sheet handoff separately: handing content to an external app does not prove delivery or reading. An opened card also does not establish how someone feels. Replies are new authorized messages, not modifications to the original private reflection.

Use separate recipient-readable card payloads and private source records. Enforce authorization in storage and database access. Queued jobs should refer to the immutable approved version, so later private edits cannot accidentally change what Mom receives. A leaked external link is a separate concern: use revocable, expiring access and require intended-recipient verification for personal content, rather than treating a hard-to-guess URL as identity.

### AI's role in this expanded story

The useful AI work is interpreting **what the student chose to say**, finding related material in his authorized vault, and helping him express a manageable part of it. It should not infer Mom's thoughts, diagnose his mood from app usage, or conclude that the girlfriend will welcome reconnection.

1. **Transcribe:** preserve the original audio; let the student correct errors before relying on the text.
2. **Reflect:** offer a tentative, grounded observation: “You mentioned missing home and not wanting to worry Mom.” Point to the relevant transcript excerpt. Let him correct the interpretation.
3. **Retrieve:** find his selected memories or earlier recordings for this person. Return source IDs and explanations; never invent an earlier message. Older drafts may no longer express his current feelings, so label their dates and ask before reusing them.
4. **Prepare:** offer “keep private,” “record something shorter,” or “draft a message.” Preserve his meaning, and let him review every recipient-facing word.
5. **Resurface:** offer a user-approved self-note or previous authentic message during a chosen memory session. Do not repeatedly replay painful material or promise that a classifier can reliably distinguish every ordinary conflict from harm.

A useful comparison for judges is the same private recording leading to two different user choices: one remains private; another becomes a short message about missing home. The AI helps expression without turning private vulnerability into automatic disclosure.

### How I would preserve your vision in the demo

Use the opening app montage to establish fragmentation: short girlfriend exchange, missed Mom call, accumulating reels, “just tired,” silence. Then move into a real Unsaid memory session. The photo and private recording should receive more time than the app transitions. Show an explicit privacy-to-sharing choice, a clearly labeled time advance to Mom's selected window, and an actual recipient-side response.

Let the girlfriend conversation and friend reply form a brief closing sequence. The student's self-note can bridge them: “Talking to Mom helped. Next time I shut down, I want to remember I can start with one sentence.” If the later exchanges are dramatized, label them as story scenes rather than presenting their replies as AI-caused outcomes or live integrations.

The red message treatment and “We Don't Talk Anymore” give your opening a mood; carry that tension into quieter room tone as he records, then let the human voices provide the warmth. For a public demo, use music the team has permission to use or an original track with a similar emotional progression.

**My revised pitch:** “Our relationships live across different apps. Sometimes the words we need don't make it into any of them. Unsaid gives those words a private place to begin, a memory to begin with, and a path to the person we choose.”

**My final reading of your ending:** the win is his willingness to participate again. Mom listens, he makes room to hear his girlfriend, and he answers his friend. Unsaid contributes to that movement; the people create the connection. **“The power of words left unsaid. Let's make today count.”**
------------------------------------------------------------------------------------------------------------------
