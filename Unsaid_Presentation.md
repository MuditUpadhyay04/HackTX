# Unsaid: Pitch Deck

*HackTX 2026 · Meta track: "Bringing People Closer Together with AI"*
*One slide per section. Kept in sync live with `Unsaid_Product_Spec.md` and `Demo_Script.md`.*

---

## Slide 1: Open on silence

> **"The last thing my kid ever texted me was 'k.'"**

- Black screen and silence; the line appears. Pull back: the black was a folded **white iPhone Duo** (a fictional device). It wakes to the Messages thread where Mom's warm texts get one reply, "k," and the timestamp ages to last year. Hold the silence.
- The Duo unfolds: *"Some things go unsaid."* Swipe home (Meta apps up front), then tap Unsaid.
- *Speaker note:* Don't rush it. Let the room feel it.

---

## Slide 2: The problem

- We're more connected than ever, yet the most important things go unsaid.
- "I'm sorry." "I'm proud of you." "I miss you." They stay in our heads until it's too late.
- Drift happens quietly: the missed calls, the group chat that went silent, the parent we text "k."

---

## Slide 3: Meet Unsaid

**For the words we never got to say.**

- **Rant out loud.** Meta's Muse hears the emotion and helps you find the words, but **you** write the message.
- **Unsends.** Messages that arrive at the right moment, not whenever you happen to be awake. *"Record at 3 AM, deliver when they're actually awake."*
- **This too shall pass.** When things hurt, Unsaid brings back proof of the good times.

---

## Slide 4: Your people, mapped

*(Demo: the sparse brain graph fills in)*

- Group chats are hubs, people orbit them, and memories bloom off each person.
- Built from your Facebook, Instagram, and Messenger memories.
- Links you've let drift glow faintly, waiting for you to reach out.
- Optional line: "Connect your photos and Unsaid quietly groups faces on your phone, then asks: is this Mom?" (face grouping, product spec v5).

---

## Slide 5: Meets you where you already are

> **"Instagram for Gen Z, WhatsApp for your parents, Facebook for the grandparents."**

- A small Unsaid logo on friends' posts, in the top-right corner of the photo. Tap it and you're in.
- No new app to discover and no new habit to form. It works across all three generations.
- A grandparent can send from Facebook, and it reaches the grandkid on Instagram.

---

## Slide 6: The right moment

*(Demo: contextual trigger)*

- Mom called 10 times. Her kid was in class. She records an unsend.
- Later, the kid posts a study story, and Mom's unsend appears **inside Instagram**.
- Two options: **Reply with an unsend** or **Call Mom.** One tap, and they're talking.

---

## Slide 7: Love that outlives you

*(Demo: posthumous release with a future date)*

- Messages set for a future milestone, like a graduation or a wedding.
- Released only after three trusted proxies confirm.
- *"Proxy confirmation 3 of 3 received. June 12, 2034: Graduation Day."*

---

## Slide 8: This too shall pass

*(Demo: a past unsend resurfaces mid-argument)*

- In a tense chat, a gentle card appears: *"Remember this?"*
- Photos from a good day and your own words: *"Everything will be okay."*
- The next message: *"I'm sorry. Dinner Friday?"*

---

## Slide 9: Built on Meta

| Meta technology | Role |
|---|---|
| Muse Voice Transcribe | Live transcription of voice rants and replies |
| Muse Spark | Emotion, sentiment, safety detection, picking memories, the brain graph |
| Muse Image | Illustrated memory cards and recaps |
| Muse connectors | Use Unsaid from inside Meta's assistant |
| Facebook Graph API + Meta data export | Photos, memories, and group chats |
| Messenger, Instagram, WhatsApp | Delivery, the logo overlay, and in-app triggers (with a Meta partnership) |

**Without Meta's AI, it's just a journal. With it, Unsaid knows your people and finds the moment.**

---

## Slide 10: Safe by design

- Muse detects control or threat language, turns off memory surfacing, and shows real help resources instead.
- The Ex feature has recipient protections: they can opt out, block, and choose when to receive.
- Faces stay on the device, every data source requires consent, and the person you're messaging only sees what you send.

---

## Slide 11: Close

**Unsaid: for the words we never got to say.**

- Ask: take Unsaid to Meta Menlo Park and build the overlay and in-app triggers natively.
- *"Say it while you still can."*

---

## Changelog

| Date (CT) | Change |
|---|---|
| Oct 24, 2026 | Created: 11-slide deck covering the four pitch beats, the generational line, the contextual trigger, the Meta stack, and safety. |
| Oct 24, 2026 | Slide 1 now matches the new 24-second opening: the folded white iPhone Duo, the Messages "k" thread, the unfold, "Some things go unsaid.", home, then Unsaid. (Frontend build prompt added: `Claude_Code_Frontend_Prompt.md`.) |
| Oct 24, 2026 | Synced with product spec v5 / frontend spec v3 / build prompt v2: an optional Slide 4 line on photo connectors and on-device face grouping ("is this Mom?"). The build workflow now has a build log, a push of `frontend/` only, and 10 Haiku reviewers. |
