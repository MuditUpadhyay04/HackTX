# Devpost draft: Un-Said

*Draft for the HackTX 2026 submission (Meta track: Bringing People Closer Together with AI). Before submitting, resolve every `[pending: …]` tag: fill it in if the work landed, delete the sentence if it didn't.*

**Name:** Un-Said
**Tagline (under 200 characters):** A quiet place to say what you haven't said yet, and a gentle way to get your own words to the person they're for, at their hour, in the app they already use.

---

## Inspiration

The last thing a lot of kids text their mom is "k."

More than 1.17 million international students were in the US last year, 363,019 of them from India ([IIE Open Doors 2025](https://opendoorsdata.org/wp-content/uploads/2025/11/OD25_Fast-Facts.pdf)). Many have a mom on the other side of the world checking her phone at 9 PM her time, wondering if today is a call day. It usually isn't. Nothing is wrong, and that's exactly why nothing gets said. Friends drift the same way, and so do relationships, when the words don't come in time.

Facebook brought back the people. Instagram kept the photos. Nothing kept the words that never got attached to them. That's what we wanted to build: not another chatbot or a journal that swears secrecy, but a way for unsaid words to actually reach someone.

We also knew what we didn't want to be. Phones already deliver about 63 notifications a day ([Pielot et al., MobileHCI 2014](https://ic.unicamp.br/~oliveira/doc/MHCI2014_An-in-situ-study-of-mobile-phone-notifications.pdf)). Un-Said had to earn every interruption.

## What it does

1. **Your photos, on your phone.** Un-Said opens on your own camera roll, read on the device.
2. **One knock.** You stop on a photo of you and Mom and stay there. Un-Said knocks, once: *"We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"* Open the next photo and it stays quiet. `[pending: memory & knocks branch — today the knock is a simple timer]`
3. **The photo remembers.** If you've talked on this photo before, you see *"You said this here before."* with your own words and voice from Tuesday. `[pending: memory & knocks branch]`
4. **Say it out loud.** Tap the mic and talk, as messy as you need. **Muse Voice Transcribe** writes it as you speak, Hindi and English in the same breath. Nothing leaves without you.
5. **Here's who that was for.** **Muse Spark** sorts what you said by person: Mom, Sarah, Michael. Every line on every card is cut verbatim from your transcript. Under the person you keep saying things to, once: *"Tell them how you feel. Communication helps."* `[pending: memory & knocks branch for that line]`
6. **Your words, your pick.** Open Mom's pile, choose which of your lines she'll read (nothing is pre-picked), and preview the letter as she'll see it.
7. **Hold until her morning.** It's 5:02 AM in her kitchen. Un-Said holds the letter until 8:00 AM her time, then it goes out through **WhatsApp**. With the WhatsApp Cloud API it arrives by itself; otherwise Un-Said hands it to your own WhatsApp to send.
8. **No app on her side.** Mom taps the link and gets a page with the photo, your words with a Hindi caption, and your voice (only the part that was about her). She can **Hold to reply** or **Call** you.
9. **Her voice comes back.** Her reply lands in **Letters**, transcribed in Hindi and captioned in English.
10. **Safety first.** If what you said is about fear, control or hopelessness, no cards form. You get 988 and the domestic violence hotline instead.

## How it strengthens human connection (meaningfully, not metrically)

- **It's a hallway, not a fifth app.** Every send leaves through the person's real app: WhatsApp for Mom, Messages for Sarah, Instagram for Michael. Success is a conversation happening somewhere else.
- **No streaks, no counts, no guilt.** There's no "you haven't called Mom in 12 days" anywhere.
- **An attention budget, in code:** at most one knock per session, two per day, three hours apart. It only knocks on photos of people you've already talked about. It goes quiet for that person after you say not now, and stays quiet after a safety concern. `[pending: memory & knocks branch]`
- **Manners both ways.** Your letter waits for her morning. Un-Said also holds its own notifications for yours. `[pending: push, memory & knocks branch]`
- **The comfort comes from people.** In a whole evening, Un-Said shows three short lines, each written by a person and shown by a rule. The model never talks to you. Mom, Sarah and your own words do the rest.

## Why AI is essential (and where it isn't)

| Without AI, this breaks | How |
|---|---|
| Understanding a raw, code-switched rant as it's spoken | **Muse Voice Transcribe** realtime (`wss://api.meta.ai/v1/asr/realtime`, ENDPOINTING, `languageBias: ["English","Hindi"]`). The phone streams 24 kHz PCM to our relay; the API key never touches the phone. If the socket drops, the WAV the phone also recorded is transcribed as a file instead |
| Knowing which sentence is for whom | **Muse Spark** (`muse-spark-1.3`, `response_format: json_schema`, low reasoning effort). The server numbers the sentences, and Spark returns only `{person, sentence ids, tone}`. The server cuts the text, so Spark **can't** write a word on any card. Bad ids, unknown people and reused sentences are dropped |
| Telling an ordinary hard day from danger | **Spark** classification plus a phrase list that includes transliterated Hindi. The stricter one wins, and unknown output counts as a concern |
| Mom reading his words in her language | **Spark** translates only the lines he approved. Her voice reply is transcribed in Hindi and captioned in English for him |

| Where AI deliberately isn't | Why |
|---|---|
| Timing | Her morning, and his, are time-zone math (IANA zones, quiet hours) |
| The words | Every word is his, enforced in code and checked by a test |
| Who it goes to | He picks the lines and the person |
| The knock | A budget written as rules, not a model's judgment |
| Delivery | It leaves through apps he already uses |

## How we built it

- **App:** Expo SDK 58 with Expo Router, running on an iPhone through Expo Go.
  - `expo-media-library` (the SDK 58 `Query` API) reads his gallery on the device.
  - `expo-audio`'s **AudioStream** captures 16-bit PCM, resampled to 24 kHz, and streams it over a WebSocket.
  - `expo-image-manipulator` turns the one photo he sends into a 1200 px JPEG.
  - `react-native-svg` and `expo-linear-gradient` carry Gurneal's three gradients.
- **Backend:** FastAPI and Uvicorn, with SQLite.
  - A WebSocket relay to Muse Voice Transcribe realtime, with the handshake authenticated on the server.
  - Turn timestamps, so his audio can be cut per person: Mom never hears the sentence he said about Sarah.
  - Muse Spark through Meta Model API's OpenAI-compatible Chat Completions.
  - A scheduler that releases held letters at her morning, and **WhatsApp Cloud API** template sends. `[pending: template approval and a real send]`
  - A public letter page behind unguessable tokens. Links expire in 30 days, can be revoked, and stay sealed until release.
- **Design:** Gurneal's App-UI-Final system: dark `#0F0D15`, a blue → violet → lilac gradient family, heavy rounded system type, and no handwriting fonts or Meta logos anywhere.
- **Process:** spec first. Three AI reviewers (Claude, Grok, Codex) helped us cut the scope down to one evening and one loop. Claude Code wrote much of the code from our specs.
- **Testing:**
  - 19 backend tests, including the whole evening end to end on labeled mock AI. A test asserts that every card line is a substring of what he said.
  - A Playwright walk of the web client with a fake mic and camera: 15 screenshots across the whole flow, zero console errors.
  - A 30-rant safety eval.
  - The iOS bundle compiles. `[pending: full flow rehearsed on the phone with a real key]`
- **Deploy:** Render blueprint and Docker. `[pending: AWS deploy with Caddy HTTPS]`

## Safety

- **The gate runs before any card forms.** A concern means no cards and no reconnection prompts, only the resources: **988 Suicide & Crisis Lifeline** (call or text 988), **National Domestic Violence Hotline** (1-800-799-7233, text START to 88788), and **911**. *Un-Said isn't a crisis service. These people are.*
- **The eval, 30 rants** (20 ordinary, 10 concerning, some code-switched):
  - phrase layer only: **10 concerning, 9 routed to resources; 20 ordinary, 0 blocked.** The miss was the subtle one ("there's no point… I don't see a reason to keep going"), which is what Spark's layer is for.
  - with Muse Spark: `[pending: real-key run — fill in X/10 and Y/20]`.
- **No knocks after a concern.** `[pending: memory & knocks branch]`
- **Privacy:**
  - Photos stay on the phone; only the photo you send is uploaded, as one resized JPEG.
  - There's no face recognition.
  - Rants are private until you pick lines.
  - Mom hears only audio that was entirely about her.
  - We use Meta's Model API in Standard mode, which doesn't use your content to train Meta models ([docs](https://dev.meta.ai/docs/models)).

## What's real today vs. what needs Meta

**Real (in the video and on the phone):**
- the gallery and the photo view
- the live transcript through Muse Voice Transcribe `[pending: real-key run]`
- the split by Muse Spark
- the safety gate
- piles, letter previews and hold until her morning
- WhatsApp delivery (Cloud API, or the share-sheet fallback)
- Mom's letter page with her voice reply
- Letters

**Acted in the video:** Sarah's and Michael's replies are teammates `[pending: Sarah's reply becomes real if the letter page gets a text "Write back"]`. The kitchen call is a real family on a real call, filmed at her real 8 AM.

**What needs Meta (our Round 2 ask):**
- the knock on photos people already scroll in Instagram and Facebook memories, not only inside Un-Said
- notifications that live inside WhatsApp and Instagram
- sending as the person inside WhatsApp, rather than from a business number

## Challenges we ran into

- **Live transcription from a phone without exposing the key.** Expo's AudioStream gives raw PCM. We resample it to 24 kHz, relay it through our server to Meta's realtime socket, and fall back to file transcription when the socket drops.
- **Making it impossible for the AI to write his words.** Our first design asked the model for character offsets, and models are bad at counting. We switched to numbered sentences, which is more reliable and still guarantees verbatim text.
- **Cutting his voice per person.** Voice Transcribe gives turn-level timestamps only, so a turn is played to Mom only if every sentence in it was about her.
- **Restraint.** Designing a knock that helps without nagging took longer than building one.
- **Moving targets:** Expo SDK 58 replaced the media-library API, Expo Go now requires matching sign-ins, and pushing over a phone hotspot kept dropping.

## Accomplishments we're proud of

- An AI feature that **refuses** to write your feelings, and a test that proves it.
- A whole evening, from the knock to Mom's 8 AM, that runs on real Meta models, real WhatsApp and real time zones.
- A design system strict enough that nothing looks like a default component.
- The kitchen call. `[pending: filmed Saturday 9:30 PM CDT]`

## What we learned

- The hardest part of an AI product about feelings is deciding what the AI must never do.
- Timing is part of kindness. "Record at 3 AM, deliver when they're awake" changed how the whole product feels more than any model choice did.
- Saying where we *didn't* use AI made our use of it more believable.

## What's next

- The knock on Meta's own memory surfaces (Round 2).
- Text replies and "Write back" letters both ways.
- Home-culture dates (Diwali, Lunar New Year, Eid, Mother's Day in her country).
- Drafts you can type into.
- An on-device, opt-in "who's in this photo," built so faces never leave the phone.

## Built with

`expo` · `react-native` · `expo-router` · `typescript` · `python` · `fastapi` · `uvicorn` · `websockets` · `sqlite` · `meta-model-api` · `muse-spark` · `muse-voice-transcribe` · `whatsapp-cloud-api` · `docker` · `caddy` · `pytest` · `playwright` · `claude-code` · `grok`

`gemini` `[pending: only if GEMINI_API_KEY is set and a preview showed "she'll read"]` · `vultr` `[pending: only if that is the host]` · `unsaid.tech` `[pending: only if the A record is live]`

## Team

**Gurneal Chandi:** product, design system, cast and copy, film. **Mudit Upadhyay:** backend, app, Meta integrations.

## Links

- Code: https://github.com/MuditUpadhyay04/HackTX
- Demo video: `[pending]`
- Try it: `[pending: deployed URL and QR]`

## Tracks to check on the Devpost form

Opt in only where the bracket above is filled. Muse stays the model that hears, sorts, translates, and gates safety.

- **Meta.** The product as described above.
- **Best Overall.** Design system, the live backend, the safety eval numbers, one public URL.
- **Best Pitch.** Someone is in the room. The film is Demo v3.
- **Cursor + Grok (SpaceXSI).** Describe the tools that were actually used, then opt into the raffle. Grok reviewed the product in `docs/notes/claude-grok-collab.md` and this draft. Cursor counts only if it was the coding agent for a real change. Do not write that it was if the code came from Claude Code.
- **.tech.** `unsaid.tech` pointed at the server. Say the name and that Mom's letter opens on it.
- **Vultr.** One sentence: the FastAPI app, the WebSocket transcript, and Mom's reply page run on a Vultr Ubuntu VM behind Caddy. Skip this line if the host is AWS.
- **Gemini.** One sentence: on the letter preview, Gemini reads Muse's Hindi translation back into English (`she'll read: …`). It cannot edit the letter, and Send works if Gemini is down. It does not summarize the rant.
- **DEV writing.** After freeze, publish this draft. No code.

Leave Snowflake, Tiger Data, Solana, and the hardware tracks unchecked. Moving off SQLite or adding a third model the night before puts the demo at risk.
