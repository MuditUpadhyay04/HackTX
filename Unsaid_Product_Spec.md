# Unsaid

### *For the words we never got to say.*

**Product Specification · HackTX 2026**
UT Austin · October 24–25, 2026
Meta Title-Sponsor Track: **Bringing People Closer Together with AI**

Team lead: Gurneal Chandi
Status: Working draft · Working name (see [Appendix E](#appendix-e--a-note-on-the-name))

---

**Spec version: v3** · see [Version History](#version-history) to revert to any earlier version.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Concept: The Power of Words Never Said](#1-core-concept-the-power-of-words-never-said)
3. [Voice Rants → Unsends](#2-voice-rants--unsends)
4. [Posthumous Timed Messages & the Proxy System](#3-posthumous-timed-messages--the-proxy-system)
5. [Missed-Call Reminders & Parent Unsends](#4-missed-call-reminders--parent-unsends)
6. [Group-Chat Unsends](#5-group-chat-unsends)
7. [The Ex Feature](#6-the-ex-feature)
8. [Safety First](#7-safety-first)
9. [Delivery Timing: The Phone-Activity Trigger](#8-delivery-timing-the-phone-activity-trigger)
10. [Plans](#9-plans)
11. [Past Unsends Resurface](#10-past-unsends-resurface)
12. [Powered by Meta: The AI & API Stack](#11-powered-by-meta-the-ai-api-stack)
13. [Inside Meta's Apps: The Unsaid Logo Overlay](#12-inside-metas-apps-the-unsaid-logo-overlay)
14. [Making It Felt: An Emotional Deep Dive](#13-making-it-felt-an-emotional-deep-dive-v2)
15. [Why It Wins](#why-it-wins)
16. [Weekend MVP Scope](#weekend-mvp-scope)
17. [The Demo Moment](#the-demo-moment)
18. [Animated Demo Plan](#animated-demo-plan)
19. [Animation Production](#animation-production)
20. [Appendix](#appendix)

---

## Executive Summary

Most relationships don't end in one big explosion. They fade — through an argument nobody apologized for, a call that went unreturned, a "we should catch up" that never happened, or a goodbye that came too late.

**Unsaid** is an AI companion for the moments when words are hardest. It listens when you're hurt or angry, reminds you of the good times you've shared with that person using your own photos, and helps you turn raw emotion into a heartfelt message — an **unsend** — when you're ready. It also lets you leave words for the future: messages timed to arrive years from now, or released only after you're gone, protected by trusted proxies.

Our promise is simple: **this too shall pass.** Unsaid sells that feeling not with platitudes but with proof — the photos and memories that show what a relationship is really worth.

| | |
|---|---|
| **Who it's for** | Family and friends who've drifted apart · People grieving or planning for loss · Couples in the middle of an argument |
| **What it does** | Turns rants into reflection, memories into reassurance, and reassurance into reconnection |
| **Why AI is essential** | Transcription, emotional understanding, memory retrieval, and message drafting are the product — not add-ons |
| **Why it's safe** | Abuse and threat signals switch off reconciliation content entirely and surface real help resources |
| **Built on** | Meta Muse Spark, Muse Voice Transcribe, Muse Image, Muse connector, Facebook Graph API, on-device face clustering |

---

## 1. Core Concept: The Power of Words Never Said

Some of the most important things we'll ever say are the ones we hold back: *I'm sorry. I miss you. I was wrong. I'm proud of you. I love you.* Unsaid exists to give those words a safe place to start — and a gentle path to the person who needs to hear them.

### The emotional thesis: "This too shall pass"

In the middle of a fight, it's easy to forget everything that came before it. Unsaid's core move is to **hold up a mirror of shared joy** at exactly the moment it's hardest to remember: the beach trip, the graduation, the birthday dinner, the 2 AM laughing fit. Not to erase the conflict, but to put it in perspective.

### Who we serve

| Audience | The unsaid moment | How Unsaid helps |
|---|---|---|
| **Family & friends who've grown apart** | "I don't even know how to start that conversation anymore." | Surfaces shared memories, notices drift, and offers a warm, low-pressure way to reach out — a photo and a few honest words. |
| **Deceased loved ones** (and those planning ahead) | "I never got to tell them…" / "I want them to hear from me after I'm gone." | Timed and posthumous messages, saved forever and released through a trusted-proxy system. A private space to say what wasn't said. |
| **Couples in arguments** | "I'm too angry to talk right now, but I don't want to lose this." | Voice rants that are heard, not sent; a reminder of the good; and an optional heartfelt unsend once the heat fades. |

### Core vocabulary

| Term | Meaning |
|---|---|
| **Rant** | A private voice recording of how you feel right now. Never sent automatically. |
| **Unsend** | A heartfelt message — text, voice, or video — paired with shared photos, sent when you're ready. |
| **Memory** | A photo or moment tied to one or more people in your life. |
| **Proxy** | A trusted person who confirms a user's passing before posthumous messages are released. |
| **Plan** | A restaurant, date, and time attached to an unsend — an invitation to repair in person. |

---

## 2. Voice Rants → Unsends

> *You're not ready to talk. You just need to be heard.*

### The flow

1. **Record.** The user taps and talks — as long, messy, and honest as they need.
2. **Transcribe.** **Muse Voice Transcribe** converts the rant to text. The AI identifies who the rant is about and the emotional tone.
3. **Remember.** Unsaid scans the user's camera roll (on-device face clusters + photo metadata) for **good-time photos with that person** — trips, celebrations, everyday joy.
4. **Reassure.** The photos are surfaced alongside a calm, personal message: *"Everything will be okay. Here's what you two have been through together."*
5. **Optionally send.** If and when the user is ready, Unsaid helps draft an **unsend** — a heartfelt message with selected photos — to send to their partner, friend, or family member. The user reviews and edits every word.

### Design principles

| Principle | What it means in practice |
|---|---|
| **The rant is private** | Raw rants are never shared. Only the user-approved unsend leaves the app. |
| **The user is always the author** | AI suggests; the user edits and decides. Nothing sends without an explicit tap. |
| **Reassurance, not dismissal** | The "everything will be okay" message acknowledges the hurt before pointing to the good. |
| **Safety gate first** | Every rant passes through the safety check (Section 7) before any good-memory surfacing. |

### Example

> **Rant (transcribed):** "I can't believe she forgot again. It's like I'm the only one who cares about this stuff…"
>
> **Unsaid:** "That sounds really frustrating — feeling like the effort is one-sided hurts. When you're ready, here are a few moments from this year with Maya." *[Lake trip, June · Her birthday dinner · Moving-day selfie]*
>
> **Suggested unsend (draft):** "Hey. I was upset earlier and I didn't say it well. I looked back at these and remembered how much you mean to me. Can we talk tonight?"

---

## 3. Posthumous Timed Messages & the Proxy System

> *Some words are meant for later.*

### Timed messages

- Users schedule messages to be delivered **1, 5, or 10 years** in the future — to a child on their graduation, a partner on an anniversary, a friend on a milestone.
- Messages can be text, voice, or video, and can include photos.
- On delivery, the **recipient can accept or reject** the message. Rejecting is always a respected choice — some people aren't ready.
- Accepted messages are **saved forever** in the recipient's Unsaid vault.

### Posthumous release: the proxy system

Posthumous messages are released only after the user's passing has been confirmed by people they trust.

| Rule | Detail |
|---|---|
| **Number of proxies** | Minimum **2**, maximum **3** named proxies. |
| **Release condition** | **All** active proxies must confirm the user's death before messages are released. |
| **Unresponsive proxy** | If a proxy doesn't respond for **30 days**, a **named backup proxy's** confirmation — or the remaining proxy's confirmation — suffices. |
| **Proxy passes away** | Same fallback: the named backup proxy or the remaining proxy's confirmation completes release. |
| **Recipient choice** | Recipients still choose to accept or reject each message. |
| **Storage** | Released, accepted messages are saved permanently. |

### Release flow

```
User names 2–3 proxies (+ optional backup)
        │
        ▼
A proxy reports the user's passing
        │
        ▼
All other active proxies are asked to confirm
        │
        ├── All confirm ───────────────────────────► Messages released
        │
        └── A proxy is unresponsive 30 days / has passed
                    │
                    ▼
            Backup proxy or remaining proxy confirms ─► Messages released
                                                            │
                                                            ▼
                                            Recipient accepts → saved forever
                                            Recipient rejects → not shown
```

### Why it matters

Grief is often full of words we wish we'd heard. Unsaid lets people leave those words behind on purpose — with safeguards so they arrive only when they should.

---

## 4. Missed-Call Reminders & Parent Unsends

> *"Call your mom" — but kinder, and with pictures.*

### Missed-call reminders

When a parent or close family member calls and the user misses it — and doesn't call back — Unsaid gently nudges: *"Your dad called on Tuesday. Here's a photo from his birthday last year. Want to send him something?"*

| Platform | Feasibility |
|---|---|
| **Android** | Supported with the user's permission to read call history. |
| **iPhone** | **Not possible** — iOS apps cannot read call history. |
| **Hackathon demo** | Uses **mock/fake call-log data** to demonstrate the experience on any device. |

### Parent unsends

From the reminder, the user can send a parent an **unsend with photos** — a quick, warm message paired with shared memories. Designed for the user who loves their parents but is bad at staying in touch.

---

## 5. Group-Chat Unsends

> *For the friend group that went quiet.*

Group chats are where friendships live — and where they quietly die. Unsaid lets users send an **unsend to a whole group**: a message plus a curated set of photos the group shared together.

- AI selects photos where multiple group members appear together.
- Drafts a message in the group's natural tone (e.g., *"Found these and miss you all. Reunion soon?"*).
- Pairs naturally with **Plans** (Section 9) to turn nostalgia into an actual meetup.
- Sent via deep links into the group's existing messaging app (see Appendix D).

---

## 6. The Ex Feature

> *Closure on your terms — never a back door.*

When a relationship ends, a **breakup toggle** on the user's profile gives them two clear choices about the ex:

| Option | What happens |
|---|---|
| **Block** | No unsends, plans, or messages can be exchanged. Effective immediately. |
| **Allow up to 3 future messages** | The ex may send at most **3** messages total — video, text, or voice. A hard cap, not a renewable allowance. |

### Recipient protections

- The recipient can **block after any one** of the messages — the cap is a ceiling, not a guarantee.
- **Block and report are available from day one**, independent of the breakup toggle, for every user and every relationship.
- No good-memory surfacing or reconciliation prompts are directed at a recipient who has blocked or reported the sender.

---

## 7. Safety First

> *Unsaid helps people reconnect. It must never help someone return to harm.*

This is a non-negotiable product principle: **we never give motivational or reconciliation content to abuse victims.** "This too shall pass" is the right message after a fight about dishes. It is the wrong message — a dangerous one — for someone experiencing control, threats, or violence.

### Triggers

| Trigger | Example signals |
|---|---|
| **Report filed** | User or recipient reports the other person. |
| **Control language detected** | Monitoring, isolation, restricting money or contact, "you're not allowed to…" |
| **Threat language detected** | Threats of harm to self or others, intimidation, fear for safety. |
| **Self-harm signals** | Expressions of hopelessness or intent to self-harm. |

### Response when triggered

1. **Stop** all good-memory surfacing for that relationship.
2. **Suppress** reconciliation drafts, Plans suggestions, and resurfaced unsends involving that person.
3. **Show real help resources**, clearly and calmly:

| Resource | How to reach |
|---|---|
| **National Domestic Violence Hotline** | Call **1-800-799-7233** · Text **START** to **88788** |
| **988 Suicide & Crisis Lifeline** | Call or text **988** |
| **Immediate danger** | Call **911** |

### What still works

**Normal small arguments are still fully supported.** Most conflict is healthy and ordinary — forgotten plans, miscommunication, stress. Safety detection is designed to separate everyday friction from patterns of control or danger, so Unsaid stays useful for the vast majority of moments while stepping aside where it would cause harm.

### Safety design notes

- Safety classification runs **before** any memory retrieval or message drafting.
- When in doubt, the system errs toward showing resources rather than reconciliation.
- Users can always reach resources from a persistent "Get help" entry point.
- Unsaid is not a crisis service and says so clearly.

---

## 8. Delivery Timing: The Phone-Activity Trigger

> *Record at 3 AM. Deliver when they're actually awake.*

The feelings come at 3 AM. The right moment to receive them almost never does. So Unsaid separates **when you say it** from **when they hear it**.

- The sender **records whenever the feeling hits**, even at 3 AM.
- The unsend then waits for the **recipient's phone activity**. This is the **only** way Unsaid times everyday unsends; there is no random scheduling. (Posthumous and 1/5/10-year messages in Section 3 keep their own milestone dates.)
- Unsaid watches for the recipient's **second or third phone unlock of the day**, skipping the first, groggy unlock right after waking up.
- Delivery is **weighted toward later in the day**, when they're awake, settled, and ready to take it in.
- When the moment comes, the unsend appears with a gentle notification: *"XYZ is missing you. They sent you an unsaid, take a look."*
- The sender never wakes anyone up, and the recipient opens it when they can actually feel it.
- The sender can review or cancel a pending unsend until it's delivered, and every unsend still passes the safety check at delivery time.

---

## 9. Plans

> *From "we should hang out" to "see you Friday at 7."*

Any unsend can carry a **Plan**: a **restaurant, date, and time**.

| Field | Example |
|---|---|
| Restaurant | Your old favorite taco spot |
| Date | Friday, Nov 6 |
| Time | 7:00 PM |
| Recipient action | **Accept** or **Reject** |

- Accepting confirms the plan for both people.
- Rejecting is low-pressure; no follow-up nagging.
- Plans turn digital reconnection into **real, in-person time together** — the strongest form of closeness.

---

## 10. Past Unsends Resurface

> *You've made it through before.*

When a user starts a new rant about someone, Unsaid can **resurface past unsends** they've exchanged with that person — the apology after last spring's fight, the "I'm proud of you" from graduation.

- Proof that this relationship has weathered conflict before.
- A reminder of how the user wants to show up — in their own words.
- Respects safety: never resurfaces content involving a reported or blocked person.

---

## 11. Powered by Meta: The AI & API Stack

> *Without Meta's stack, Unsaid is just a journal. With it, Unsaid knows your people, remembers your moments, and helps you reach them.*

Meta's AI and APIs aren't add-ons here. They are the reason the app works. Every core experience depends on one of them, and that's what makes the **"AI is essential"** case for the judges.

### The stack

| Meta technology | What it powers in Unsaid | How we use it (and its real limits) |
|---|---|---|
| **Muse Spark** (Meta's text and reasoning model) | Emotion and sentiment analysis of voice rants; detecting control or threat language for the safety branch; picking which memories match the moment; writing memory captions; the "Everything will be okay" message; relationship guessing for the brain graph | Called through the Meta Model API. It's the brain of the rant-to-emotion pipeline. |
| **Muse Voice Transcribe** (Meta's real-time audio model) | Live transcription of voice rants and voice replies, plus tone cues from the voice itself | Streams audio while the user is talking, so the transcript and emotional read land the moment they stop. |
| **Muse Image** (Meta's image model) | Illustrated memory cards, unsend cover art, year-end friendship recaps | Generates artwork from real shared moments. It never invents a memory. |
| **Muse** (Meta's personal AI agent) + **Muse connectors** | "Who should I reach out to?" and "Send Mom a memory" asked straight to Meta's assistant | We expose Unsaid's brain graph and "send an unsend" action as tools Muse can call. Very few teams build connectors, so it's a strong originality point. |
| **Facebook Graph API** | The user's own photos, posts, tagged photos, events, and memories, which feed the brain graph and photo surfacing | Uses the user's own consented data. Photo and post permissions need Meta app review, but work for app admins and testers in development mode, which covers the demo. The friends list only shows friends who also use Unsaid. |
| **Instagram Graph API** | Photos and memories from Instagram | Only covers Instagram business and creator accounts. Personal accounts come in through Meta's data export (next row). |
| **Meta "Download Your Information" export** | Full Messenger, Instagram DM, and Facebook group chat history; tagged photos and their metadata | The user uploads their own export. It's the richest source of group chats and shared memories, and doubles as a clear consent moment. |
| **Messenger, Instagram, and WhatsApp (delivery)** | Delivering unsends and "Remember this?" memories | Personal unsends go out through each app's share flow (Messenger `m.me` links, WhatsApp `wa.me` links, the share sheet), so they come from the user, not a bot. The Messenger Platform, Instagram Messaging API, and WhatsApp Business Platform are built for business accounts, so they're a roadmap path (for example, an official Unsaid account for posthumous deliveries), not the main channel for person-to-person messages. |

### Every feature's Meta dependency

| Feature | Meta dependency |
|---|---|
| **Voice rant → emotion → unsend** | Muse Voice Transcribe turns the rant into text; Muse Spark reads emotion and sentiment and decides whether to comfort, surface memories, or switch to safety mode. |
| **"Everything will be okay" photo surfacing** | Muse Spark picks the right good-time photos from Facebook/Instagram memories and the camera roll, and writes the caption. |
| **Gallery face matching** | Faces are grouped on the device. Facebook and Instagram photo tags and metadata (who was tagged, when, where) attach a name to each face group. Meta has no face recognition API, so the faces themselves stay on the phone. |
| **Brain graph** | Group-chat hubs, people nodes, and memory leaves are built from Facebook, Instagram, and Messenger data (Graph API plus the data export). Muse Spark extracts the memories and guesses relationships. |
| **Unsend delivery** | Delivered through Messenger, WhatsApp, or Instagram DMs using each app's share flow, triggered by the phone-activity rule (Section 8). |
| **Safety branch** | Muse Spark flags control or threat language and turns off memory surfacing, showing real help resources instead. |
| **Group-chat unsends** | Group membership and shared history come from the Messenger and Facebook group data in the export. |
| **Ask Meta's assistant** | Muse connectors let people use Unsaid from inside Meta's own AI. |

### Why this wins the "AI is essential" criterion

- **Take Meta away and nothing is left that matters.** Without Muse, there's no emotional read of the rant, no safety detection, and no memory picked for the moment. Without Meta's data, there are no shared photos, no group chats, and no graph of your people. It would just be a notes app.
- **AI connects people; it doesn't replace them.** Every Meta call either understands the user's feelings or finds the real moments they share with someone, and the message is always written by the user.
- **It uses all of Meta's tools.** Spark, Voice Transcribe, Image, Muse connectors, and the Graph API each have a clear job. That's the deepest Meta integration a judge is likely to see.

---

## 12. Inside Meta's Apps: The Unsaid Logo Overlay

**Unsaid lives right inside Instagram, Facebook, and WhatsApp.** A small Unsaid logo sits in the **top-right corner of each image on a friend's post**. Tap it and you go straight into Unsaid, opened to that friend: your shared memories, your brain-graph node for them, and a blank unsend waiting for words.

### How it works

| Surface | Where the logo appears | What tapping it opens |
|---|---|---|
| **Instagram** | Top-right corner of a friend's feed post or carousel image | That friend's memory page in Unsaid, with this photo pinned as a "Remember this?" starter |
| **Facebook** | Top-right corner of a friend's photo post or a "Memories" (On This Day) card | The friend's node in the brain graph, plus the shared group chats behind it |
| **WhatsApp** | Top-right corner of a photo shared in a chat or a friend's Status | An unsend draft to that person (or to the group, for a group-chat unsend) |

- **This is how people find and open the app.** People don't remember to open a journaling app. They're already scrolling past the people they love. The overlay turns that moment into a reason to reach out.
- **It only appears where it's relevant.** It shows on friends' posts, especially people the drift detector flags ("you haven't talked in 4 months"), so it never clutters the feed.
- **Private by design.** Only the viewer sees the logo; the friend sees nothing until an unsend actually arrives.

### Every generation, already there

> **Demo talking point:** *"Unsaid meets you where you already are: Instagram for Gen Z, WhatsApp for your parents, Facebook for the grandparents."*

| App | Who's already there | Why it matters for Unsaid |
|---|---|---|
| **Instagram** | Gen Z and young adults | The people most likely to answer a parent with "k" are already scrolling past their family's posts here. |
| **WhatsApp** | Parents, older generations, and immigrant families | For many families, WhatsApp *is* the family group chat, often across countries and time zones, where the unsaid things build up. |
| **Facebook** | Boomers and grandparents | Grandparents post photos and "Memories" here; the overlay lets them send an unsend without learning a new app. |

- **No new habit to form.** The logo shows up on friends' posts in whichever Meta app someone already uses every day, so Unsaid works for a 19-year-old, their mom, and their grandpa at the same time.
- **The whole family, connected across apps.** A grandparent can tap the logo on Facebook, and the unsend reaches the grandkid through Instagram. Unsaid connects generations that live in different Meta apps.
- **In the Meta-native version, nothing new to download.** Inside Meta's apps, Unsaid would open as a built-in experience. For the HackTX concept it opens the Unsaid app, but discovery always starts in the app people already use.
- **Why it wins with Meta judges:** it uses Meta's biggest advantage, reaching every generation across its apps, which no standalone app can match.

### Contextual triggers: unsends that find the right moment

Unsaid doesn't wait for someone to open it. It notices the moment when someone is free to listen and delivers the unsend **right inside the Meta app they're already using**.

**Example: the 10 missed calls**

1. Mom calls 10 times. Her kid is in class and can't answer. Mom records an unsend: *"I just wanted to hear your voice. No emergency. I miss you."*
2. Later, Mom sees her kid's **Instagram story**: they're at the library, studying. That shows the kid is on their phone and at a natural break.
3. Unsaid picks up on that moment and shows Mom's unsend **as a notification inside Instagram**, not only in the Unsaid app.
4. The notification gives the kid two options:
   - **Reply with an unsend.** Record or write one back to Mom without leaving Instagram.
   - **Call Mom.** One tap starts the call straight from the notification.

| Trigger | Context signal | What Unsaid does |
|---|---|---|
| Missed-call unsend waiting | The recipient posts or is active on an Instagram story | Delivers the unsend inside Instagram with Reply and Call options |
| Unsend waiting for a family group | Someone is active in the family WhatsApp chat | Shows the unsend in that chat with a Reply option |
| A drifting friendship | A friend posts a Facebook memory that includes you both | Suggests a "Remember this?" unsend on that memory |

- **Proactive, but gentle.** It builds on the phone-activity trigger (Section 8): the unsend waits until the person is clearly awake and on their phone, and an app they're actively using is an even better signal.
- **Not surveillance.** It only uses things the sender could already see (a public or shared story) and the recipient's own activity. It never reveals location or extra details to the sender, and there's a cooldown so it never nags.
- **Closing the loop.** The goal isn't another message to read. It's getting Mom and her kid **actually talking**, and the Call button makes that one tap.

**In the demo:** this is an **animated look-alike Instagram story screen**. The kid's library story is playing, and an Unsaid notification slides down from the top with Mom's message and two buttons: **"Reply with an unsend"** and **"Call Mom."** The kid taps Call, and the screen shows Mom picking up.

**Feasibility:** real notifications inside Instagram, Facebook, or WhatsApp, and reading story activity as a trigger, would need **a partnership with Meta and access beyond its public APIs**. Third-party apps can't post notifications inside Meta's apps today. Like the logo overlay, it's pitched as a Meta-native feature.

### Honest feasibility note

A real overlay inside Instagram, Facebook, or WhatsApp would need **a partnership and API access from Meta that goes beyond its standard developer and business APIs**. No public API lets a third-party app draw on top of posts inside Meta's apps. That's exactly why it's pitched as a **Meta-native feature**: it only makes sense if Meta builds it in, which is the story for Round 2 in Menlo Park.

**For the HackTX demo**, the overlay is shown as **animated recreations** of an Instagram-style feed, a Facebook-style photo post, and a WhatsApp-style chat, all within the all-animation demo plan. The screens use generic, look-alike layouts and placeholder friends. They don't use Meta's actual logos or copy assets, and they're clearly labeled as a concept. Suggested beat: open the animation (before or right after the "k" beat) on a scrolling feed, show the Unsaid mark glowing softly on Mom's post, tap it, and transition into Unsaid.

### Logo concept

- **Mark:** a speech bubble outline drawn with a single line that is **left slightly open**, a gap where the words never got said. It sits inside a small rounded square, so it reads as an app badge.
- **Wordmark:** "unsaid" in lowercase, in a soft rounded sans-serif. The dot of the "i" is the same open bubble, used alone as the overlay icon.
- **Color:** a warm amber (#E8A15A) to deep plum (#4A1F35) gradient. That's distinct from Instagram's pink-orange-purple gradient while still feeling at home in social apps.
- **Overlay treatment:** 24–28 px, a white mark on a frosted, semi-transparent circle with a faint shadow, so it's readable on any photo and looks like part of the app (similar to how the carousel and tag icons sit on images) without copying Instagram's icons.
- **Motion:** in the demo, the mark pulses once very gently, like a heartbeat, on posts from people you've drifted from.

---

## 13. Making It Felt: An Emotional Deep Dive *(v2)*

Judges see dozens of demos in a day. They remember the one that made them feel something. Every idea below comes from a feature Unsaid already has, and each one notes **why it works emotionally** and **where it fits in the demo** (see `Demo_Script.md` for timings).

| # | Idea | Why it works emotionally | Where it fits in the demo |
|---|---|---|---|
| 1 | **The "k" cold open.** Black screen and silence for a few seconds before any interface appears. Then a single bubble: "k." Then the line: *"The last thing my kid ever texted me was 'k.'"* | Silence makes the room lean in. No logo or interface means nothing distracts from the feeling. Everyone has sent a "k" to someone they love. | Scene 1, the first 12 seconds. No music until the line has landed. |
| 2 | **Emptiness as the pitch.** The brain graph starts sparse, with labeled gaps on faded links: *"last talked: 2019,"* *"4 months,"* *"never replied."* Then it fills in. | People feel loss before they see the fix. The labels turn vague guilt into a specific person and date, and the filling-in feels like relief. | Scene 3. Hold on the empty graph a moment before the first hub lights up. |
| 3 | **The exact future date.** Posthumous release shows a specific date on screen: *June 12, 2034, Graduation Day*, after "Proxy confirmation 3 of 3 received." | A specific date makes it real. Judges picture their own kid's graduation. A vague "someday" doesn't. | Scene 5. The date card turns forward slowly; hold it for a full second. |
| 4 | **The resurfacing interrupt.** Mid-argument, an old unsend slides in and interrupts the fight: *"Remember this?"* with photos and *"Everything will be okay."* | The interruption mirrors what a good memory does in real life. The tension makes the release land harder. | Scene 6. Let the sharp messages build first, then a beat of stillness before the card. |
| 5 | **Mom and the Instagram story.** Ten missed calls, a voice unsend, then the kid's study story, and Mom's message appears inside Instagram with **Call Mom**. | It answers the "k" from the cold open. The whole pitch comes full circle, from a dismissive text to a phone call. | Scene 4. End on the call connecting, with the timer counting 0:01, 0:02. |
| 6 | **Swipeable reminisce mode.** A full-screen story layout (name and profile picture at the top, progress bars) that plays a person's unsends and memories: Mom's unsends, photos from Instagram, the camera roll, and WhatsApp. Tap right to go forward, left to go back. | Everyone already knows how to use stories, so reminiscing feels effortless. Swiping through someone's love for you, one moment at a time, feels like opening a box of old letters. | A short beat after scene 4 or in the close: the kid opens "Mom" and taps through three or four moments. |
| 7 | **Muse quietly listening.** Muse transcribes and categorizes every unsend in the background (missing someone, gratitude, apology, pride) and keeps them hidden. When the user says they miss someone ("I miss Mom"), Muse surfaces the right ones. | It feels like the app knows you without showing you a dashboard. Nothing is pushed on you; it shows up when you need it. It's also the clearest proof that the AI is essential. | Voiceover during scene 3 or 6: *"Muse heard every unsend. It waited until you needed this one."* |
| 8 | **Sensory details.** A soft chime when an unsend lands, ambient room tone under the quiet moments, a gentle haptic pulse when the phone-activity trigger delivers, and the warm amber and plum palette throughout. | Sound and touch reach people faster than words. A consistent chime becomes the sound of someone thinking of you. Warm colors feel like a lamp, not a screen. | Through the whole video. Use the chime on every delivery (scenes 4, 5, 6) and show the haptic as a small ripple ring. |
| 9 | **Human micro-copy.** Short, plain, slightly imperfect sentences: *"Mom left you something."* *"you haven't talked in a while."* *"no emergency. just miss you."* Never "Strengthen your relationships today!" | Polished marketing lines sound like an ad; imperfect ones sound like a person. Lowercase and short sentences feel like a real text. | Every notification, card, and caption. Check them all against a "would a person say this?" test. |
| 10 | **The "this too shall pass" motif.** A subtle repeating visual, a slow tide line or a softly turning clock hand, that appears in the argument-support flow and the posthumous flow. | Repeating it ties moments together, so the audience feels a theme without being told one. A tide always comes back, the way a hard moment always passes. | Scenes 5 and 6 in the background, and in the closing card under the wordmark. |

### Principles behind all ten

- **Stillness beats motion.** The most powerful frames hold still.
- **Specific beats general.** Use a name, a date, a "k." Real details make people feel.
- **Show loss before the fix.** Emptiness, missed calls, and an argument come before the relief.
- **The AI stays in the background.** Muse is felt through good timing, not shown off with charts, and the user always writes the words.
- **End on connection, not the app.** The strongest moment is Mom picking up, not a feature list.

---

## Why It Wins

Mapped directly to the Meta track's judging criteria:

| Criterion | How Unsaid delivers |
|---|---|
| **Meaningfully strengthens human connection** | Targets the exact moments relationships break — arguments, drift, missed calls, loss — and gives people a concrete, warm path back. Plans turn reconnection into real-world time together. |
| **AI is essential & well-integrated** | Remove the AI and there's no product: voice transcription (Muse Voice Transcribe), emotional and safety understanding, who-is-this-about detection, memory retrieval from your photos, message drafting (Muse Spark), and illustrated memory cards (Muse Image). |
| **Originality** | Not another messaging app or journaling app — an *emotional intermediary* that sits between feeling and sending. Posthumous messages with a multi-proxy confirmation system and a capped ex-messaging model are distinctive designs. |
| **Strength of working demo** | One end-to-end, emotionally resonant flow: rant → transcription → good-memory photos → heartfelt unsend with a Plan. Visible, fast, and feels real in under two minutes. |
| **Responsibility** | Safety-first design that refuses reconciliation content for abuse signals — a thoughtful answer to the obvious "what could go wrong?" judge question. |

---

## Weekend MVP Scope

### Build this weekend

| Feature | MVP scope |
|---|---|
| **Voice rant → transcription** | Record in-app; transcribe with Muse Voice Transcribe. |
| **Person + tone detection** | Muse Spark identifies who the rant is about and the emotional tone. |
| **Safety gate** | Keyword + LLM classification for control/threat/self-harm signals; resource screen with real hotline info. |
| **Good-memory surfacing** | Pre-tagged demo photo set (or on-device clustering if time allows); "everything will be okay" message. |
| **Unsend composer** | AI-drafted heartfelt message + selected photos; send via iOS message composer / `sms:` / `wa.me` link. |
| **Plans** | Attach restaurant/date/time; recipient accept/reject screen (mocked recipient). |
| **Phone-activity delivery** | Hold an unsend until the recipient's 2nd or 3rd unlock of the day (demo by simulating unlock events). |
| **Missed-call reminder** | Mock call-log data → nudge → parent unsend. |

### Roadmap (post-hackathon)

| Feature | Why later |
|---|---|
| Posthumous messages + proxy system | Requires robust identity, verification, and long-term storage guarantees. Show as designed flow/mockups. |
| Timed 1/5/10-year delivery | Requires durable infrastructure; demoable as a scheduled-message UI. |
| Ex feature (breakup toggle, 3-message cap) | Needs real two-sided accounts; design is ready. |
| Group-chat unsends | Builds on unsend composer; needs group-member photo matching. |
| Past unsends resurfacing | Needs message history over time. |
| Full gallery face clustering & relationship guessing | Heavier on-device ML work (Appendix A). |
| Brain graph | High-impact visual; stretch goal if the core flow is solid (Appendix B). |
| Real Android call-log integration | Platform permission work. |

### Frontend build spec

The clickable UI shell for this scope is specified in `Unsaid_Frontend_Build_Spec.md` (and its PDF): 15 frontend-only screens with mock data, where every button is marked NOT YET CONNECTED and mapped to a backend feature ID in a contract table that Mudit fills in.

---

## The Demo Moment

### Pitch video opening line

> **"The last thing my kid ever texted me was 'k.'"**

The pitch video opens cold on this line, before any product shows. It names the fear every judge recognizes, the conversation that just stops, and sets up everything Unsaid exists to prevent.

### Live demo

**Setting:** A judge watches the presenter's phone, mirrored on screen.

1. **The rant (20 sec).** The presenter records a real-sounding frustrated rant about a partner or sibling: *"I'm so tired of always being the one who reaches out…"*
2. **Heard (5 sec).** The transcription appears. Unsaid responds with empathy first: *"That sounds exhausting."*
3. **The turn (15 sec).** Photos fade in — a road trip, a birthday, a goofy selfie — with: *"Everything will be okay. Look at what you two have been through."* Let the room sit with it for a beat.
4. **The unsend (20 sec).** Tap "I'm ready." Unsaid drafts a short, honest message. The presenter edits one line, attaches two photos, and adds a **Plan**: dinner Friday at 7.
5. **The answer (10 sec).** On a second phone, the recipient gets the unsend and taps **Accept**.
6. **The safety beat (15 sec).** Record a second rant containing control language. Good memories don't appear; instead, a calm screen shows the National Domestic Violence Hotline (1-800-799-7233, text START to 88788) and 988. *"We built Unsaid to bring people closer — never back to harm."*

**Closing line:** *"Every relationship has things left unsaid. We help you say them."*

---

## Animated Demo Plan

**The demo is 100% animation.** No real device, no iPhone hardware, no Apple developer account, no provisioning, no live gallery or camera access, and no live data. Every visual is a pre-made, motion-designed sequence showing Unsaid's interface and emotional beats. Earlier phone-based build plans are retired.

### Visual style

- **Warm and minimal:** soft gradients (dusk rose to peach to warm cream), lots of breathing room, rounded phone-style frames floating on the gradient.
- **Gentle motion:** slow fades, soft scale-ins, and easing curves. Nothing snaps; everything settles.
- **Handwritten-style text for unsends**, so the user's own words feel personal next to the clean interface type.
- **Restrained palette:** cream backgrounds, deep plum for text, a single warm accent (amber) for the moments that matter.
- **Sound:** soft piano or ambient pads, and real silence on the "k."

### Storyboard: the four pitch beats

| Beat | Animated sequence | Emotional goal |
|---|---|---|
| **1. The "k" opening** | Black screen. A single message bubble fades in from a contact named "Mom": the user's last reply, **"k."** A timestamp ages by itself: *2 weeks ago, 3 months ago, 1 year ago*. Voiceover or on-screen text: **"The last thing my kid ever texted me was 'k.'"** Hold in silence. | Gut punch. Every judge has sent a "k." |
| **2. The sparse brain graph fills in** | Near-empty dark-cream canvas with a few faint, disconnected nodes. Group-chat hubs light up one by one ("Fam," "Roommates," "Marfa Trip"), people nodes drift into orbit, and memory leaves bloom with tiny photo thumbnails. Drifting links glow faintly and pulse, as if waiting. | "Your people were always there; you just couldn't see them." |
| **3. Posthumous release with a future date** | A calm confirmation screen: *"Proxy confirmation 3 of 3 received."* A date card turns forward to **a date years in the future** (for example a graduation day). A sealed, illustrated letter opens with handwritten text and a voice waveform. | Love that outlives you. The quietest, most moving beat. |
| **4. A past unsend resurfaces mid-argument** | A tense chat between partners, with sharp, short messages. A soft card slides up: *"Remember this?"* An earlier unsend reappears with photos from a good day and the handwritten words *"Everything will be okay."* The chat's tone softens, and the next message is "I'm sorry. Dinner Friday?" | "This too shall pass." It turns the fight around. |

**Closing card:** the Unsaid wordmark on the gradient, with *"For the words we never got to say."* and "Powered by Meta AI."

---

## Animation Production

**Tool: Claude** creates the full animated demo. The animation *is* the entire demo, with no real device, no Apple developer access, and no live data, so every sequence is designed and rendered ahead of time.

### Ready-to-paste prompt for Claude

*Identical copy in `Demo_Script.md`, which also has the timed storyboard. The two are kept in sync.*

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

### What to enable or install for Claude

| Item | Purpose |
|---|---|
| **Claude Code** (or Claude with code execution turned on) | Lets Claude write, run, and render the animation project instead of only describing it. |
| **Node.js (LTS) + npm** | Runs the React-based animation project. |
| **Remotion** (`npx create-video@latest`) | Builds the video in React and renders it to MP4. This is the core animation engine. |
| **FFmpeg** | Video encoding Remotion uses for the final export (Remotion usually bundles it; install it if rendering complains). |
| **Framer Motion** or **GSAP** | Motion-design libraries for smooth easing in the browser preview version. |
| **react-force-graph** or **D3** | Physics for the brain graph so nodes drift and settle naturally. |
| **Google Fonts** (e.g., Caveat, Inter) | Handwritten-style unsend text and clean interface type. |
| **Image generation** (e.g., Meta's Muse Image, or any image generator) | Claude doesn't generate images itself. Use this for illustrated photo placeholders, the envelope, and memory thumbnails, then pass the files to Claude. |
| **Claude Artifacts** (claude.ai) | Quick live previews of each scene as HTML before rendering the final video. |
| **Google Drive connector** (or GitHub) | Saves the rendered MP4 and project files somewhere the whole team can grab them, including the HackTX repo. |
| **A screen recorder** (QuickTime or OBS) | Backup export: record the HTML preview if the MP4 render fails. |

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

### Production notes

- Render early and keep an MP4 on two devices plus the cloud; never rely on Wi-Fi for the demo.
- Keep the "k" beat silent. The quiet is the point.
- Meta branding stays honest: "Powered by Meta AI" refers to the Muse models and Graph data described in Section 11.

---

## Appendix

### Appendix A — Gallery Scanning & Relationship Understanding (earlier feature set)

**Gallery scanning**
- **On-device face clustering** groups photos by person; faces never leave the phone.
- **Photo metadata** (date, location) anchors each memory in time and place.
- **"Who's this?"** — the user names a face cluster once, and that name then **tags every photo of that person**.

**Relationship guessing**

| Signal | What it suggests |
|---|---|
| **Frequency** | How often a person appears in photos. |
| **Recency** | How recently they've appeared. |
| **1:1 vs. group photos** | One-on-one photos suggest closer ties than group-only appearances. |
| **Holiday photos** | Recurring presence at holidays suggests family or very close friends. |

- The user can **edit any guessed relationship** (e.g., change "friend" to "cousin").
- **Drift detection:** when someone who used to appear often stops appearing, Unsaid can gently suggest reaching out.

### Appendix B — The Brain Graph (Obsidian-style)

A living, visual map of the user's relationships.

| Element | Representation |
|---|---|
| **Group chats** | Hub nodes |
| **People** | Nodes orbiting their group chats |
| **Shared memories** | Leaf nodes |
| **Edge thickness** | Relationship strength |
| **Edge/node color** | Relationship type |
| **Faded nodes** | Drifting relationships |
| **Time slider** | Watch the graph evolve over months and years |

- **Memory sources:** group chats, Facebook, Instagram, iMessage, WhatsApp (via the access methods in Appendices C and D).
- **Suggested library:** `react-force-graph`.

### Appendix C — Meta APIs Mapping

| Meta capability | Use in Unsaid |
|---|---|
| **Muse Spark** | Memory extraction, relationship guessing, captions, "ask your graph" (e.g., *"When did I last see Sam?"*). |
| **Muse Image** | Illustrated memory cards and recaps. |
| **Muse Voice Transcribe** | Rants and voice replies. |
| **Muse connector** | Expose the relationship graph and "send a memory" as tools Muse can call. |
| **Facebook Graph API** | The user's own photos and posts. Permissions work for app admins/testers in development mode. The friends list only shows friends who also use the app. |
| **Meta Download Your Information** | Export of Messenger, Instagram, and group-chat history. (The Instagram API only covers business/creator accounts.) |

**Privacy pitch:** Meta has no face recognition API, so **faces stay on the device**. Unsaid's face clustering is local by design — a feature, not a limitation.

### Appendix D — Message Linking: What's Possible

**Sending works:**

| Method | How |
|---|---|
| iOS message composer | Prefilled text + photo |
| SMS | `sms:` links |
| WhatsApp | `wa.me/<number>?text=` |
| Messenger | `m.me/<username>` |

**Reading is partial:**

| Platform | Read access |
|---|---|
| **iPhone** | Impossible — apps cannot read message history. |
| **Mac** | The local Messages database is readable with Full Disk Access (e.g., the open-source `imessage-exporter`). |
| **Android** | SMS with permission; **not RCS**. |
| **WhatsApp** | Per-chat export. |
| **Messenger / Instagram** | Via Meta data export (Download Your Information). |

**Limitation:** no app can deep-link back to a specific old iMessage.

### Appendix E — A Note on the Name

"Unsaid" is a **working name**. A different project called "unsaid" won a Capital One prize at DivHacks 2026, so a rename may be wise to avoid confusion with judges and to keep the brand distinct. Candidate directions should keep the core idea — the words we hold back, and the courage to finally say them.

---

*Unsaid · HackTX 2026 · Built with care for the people we love.*

---

## Living Document & Sync Policy

This spec is the team's **live, shared source of truth** for Unsaid.

- **Standing instruction (Gurneal):** after every exchange during planning, this markdown file gets updated with whatever new was discussed, as an amendment to this same file. No separate docs.
- Every update is **pushed to the team's GitHub HackTx repository** ([MuditUpadhyay04/HackTX](https://github.com/MuditUpadhyay04/HackTX)), so everyone always builds from the latest version.
- **Dual-format rule:** every update produces **two files kept in sync** from the same content: `Unsaid_Product_Spec.md` (this file) and a detailed PDF, `Unsaid_Product_Spec.pdf`. Both are pushed together on every change.
- **Six-file live-sync rule (project rule):** the HackTX repo holds six Unsaid files, and **all six stay updated live after every exchange**:
  1. `Unsaid_Product_Spec.md`: the product spec (this file).
  2. `Unsaid_Product_Spec.pdf`: the PDF of this spec, regenerated from the markdown every time.
  3. `Unsaid_Presentation.md`: the pitch deck, slide by slide.
  4. `Demo_Script.md`: the timed animation storyboard, talking points, and the ready-to-paste Claude prompt.
  5. `Unsaid_Frontend_Build_Spec.md`: the frontend-only UI build spec (15 screens and the button-to-backend contract for Mudit).
  6. `Unsaid_Frontend_Build_Spec.pdf`: the PDF of the frontend build spec, regenerated with `build_frontend_pdf.sh`.

  Any new idea, correction, or decision goes into whichever file it belongs to right away, and every affected file is pushed together in one commit. No file should lag behind the others.
- **Push method:** git from a local clone of the HackTX repo, using Gurneal's `gornil` terminal alias, once that clone and alias are reachable.

### Version History

Every edit after v1 gets a new version number. Each entry says exactly what changed, so any version can be restored from git history (`git log -- Unsaid_Product_Spec.md`, then `git checkout <commit> -- Unsaid_Product_Spec.md`).

| Version | Date (CT) | What changed | Git commit |
|---|---|---|---|
| **v1** | Oct 24, 2026 | Baseline: Sections 1–12, the Meta stack, Inside Meta's Apps, the animated demo plan, Animation Production with the Claude prompt and recommended skills, and the sync rules. | `baabed7` (includes the first push `7a7d2a5` and the skills table) |
| **v2** | Oct 24, 2026 | Added Section 13, Making It Felt: ten emotional ideas (the cold open, the sparse graph with labeled gaps, the exact future date, the resurfacing interrupt, the Mom and story trigger, swipeable reminisce mode, Muse quietly categorizing unsends, sensory details, human micro-copy, the "this too shall pass" motif), each with why it works and where it fits. Added the versioning system. | `2fc29f4` |
| **v3** | Oct 24, 2026 | Added the companion `Unsaid_Frontend_Build_Spec.md` / `.pdf`: a frontend-only UI spec covering its 15 screens and the button-to-backend contract table for Mudit. | see git log |

- **Versioning rule:** every future edit bumps the version (v3, v4, …), updates the version line at the top, and adds a row here. The detailed changelog below stays as well.

### Changelog

| Date (CT) | Change |
|---|---|
| Oct 24, 2026 | Initial spec: core concept, sections 1–10, MVP scope, demo moment, appendices A–E. |
| Oct 24, 2026 | Added the phone-activity delivery trigger (2nd–3rd unlock, weighted later in the day) to Section 8, replacing random timing in that case. Added this sync policy. |
| Oct 24, 2026 | Added the dual-format rule (markdown + PDF kept in sync, both pushed on every change) and linked the HackTX repo. |
| Oct 24, 2026 | Removed all random and 3 AM scheduling. The phone-activity trigger is now the only delivery method ("record at 3 AM, deliver when they're actually awake"). |
| Oct 24, 2026 | Added the pitch video opening line: "The last thing my kid ever texted me was 'k.'" |
| Oct 24, 2026 | Added Section 11, Powered by Meta: the full Meta AI and API stack, each feature's Meta dependency, and why it makes the AI-essential case. |
| Oct 24, 2026 | Demo is now entirely animation (no device, no Apple developer access, no live data). Added the Animated Demo Plan (style and four-beat storyboard) and Animation Production (a ready-to-paste Claude prompt and a tool checklist). |
| Oct 24, 2026 | Added Section 12, Inside Meta's Apps: the Unsaid logo on friends' Instagram, Facebook, and WhatsApp posts with tap-to-launch, a Meta partnership feasibility note, the animated look-alike demo screens, and the logo concept. |
| Oct 24, 2026 | Section 12: added the generational talking point, "Unsaid meets you where you already are: Instagram for Gen Z, WhatsApp for your parents, Facebook for the grandparents." |
| Oct 24, 2026 | Section 12: added Contextual triggers: a waiting unsend shows up inside Instagram when the recipient is active (for example, Mom's missed-call unsend after the kid posts a study story), with Reply and Call options. Animated in the demo; the real version would need a Meta partnership. |
| Oct 24, 2026 | Added the four-file live-sync rule (spec .md, spec .pdf, `Unsaid_Presentation.md`, `Demo_Script.md`) and the git/gornil push method. Claude prompt extended to a ~2:00 cut with the in-app logo/generational scene and the contextual-trigger scene. |
| Oct 24, 2026 | Added the verified Claude skills and plugins for the animation (Remotion plugin, GSAP, Motion, snapcn phone frame, claudeclip, pptx). |
| Oct 24, 2026 | **v2:** added Section 13 (emotional deep dive, ten ideas) and the versioning system with Version History. |
| Oct 24, 2026 | **v3:** added the companion frontend build spec (`Unsaid_Frontend_Build_Spec.md` / `.pdf`), linked from Weekend MVP Scope, and made the live-sync rule six files. |
