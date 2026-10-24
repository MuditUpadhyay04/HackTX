# Un-Said feature IDs (wiring reference)

**For:** Mudit · **From:** Gurneal · Oct 24, 2026

These are the feature IDs for every Un-Said control in `DESIGN_SPEC.md`. They are a **wiring reference**. Use them as `data-feature-id` values, analytics names or route names, whichever helps. The IDs, endpoints and how they work are yours to define. The controls, labels and copy are Gurneal's (see `COPY_AND_NAMES.md`).

The **In your README** column marks the IDs that already appear in the API table of your `backend/README.md` (read-only check, `backend` branch, Oct 24). The rest are new names for controls in the design. Map, rename or drop them as you wire things up. Just keep the control and its copy as designed.

| # | Feature ID | Control (copy) | Screen in DESIGN_SPEC.md | What it does | In your README |
|---|---|---|---|---|---|
| 1 | `draft-new` | "+" on the hero card (and the card body) | Home (A) | Create a new draft (opens /compose/new with a recipient picker) |  |
| 2 | `draft-open` | a "Your words" row ("Draft ›") | Home (A) | Load a saved draft into Compose |  |
| 3 | `pile-open` | a person card after the split | Talk (split) | Open that person's pile of his lines |  |
| 4 | `drift-nudge-open` | tap the Un-Said banner (the knock) | any screen | The notification that opens Un-Said; needs the quiet-signal trigger |  |
| 5 | `rant-record` | mic, start | Talk | Start recording the rant | yes |
| 6 | `rant-stop` | mic, stop | Talk | Stop recording; finalize the transcript |  |
| 7 | `rant-discard` | Start over | Talk | Delete the recording |  |
| 8 | `rant-type` | Type instead | Talk | Typed rant instead of voice | yes |
| 9 | `rant-transcribe-live` | live transcript (event) | Talk | Streaming speech-to-text |  |
| 10 | `rant-split` | person cards appear (event) | Talk (split) | Split the transcript into verbatim spans per person (his words only) | yes |
| 11 | `rant-save-private` | Keep it just for me | Talk (split) | Save the whole rant privately |  |
| 12 | `pile-line-toggle` | line toggle | Pile | Include or exclude one of his lines |  |
| 13 | `recipient-timezone-set` | time chip "8:11 AM for Mom" | Pile (Mom), preview | Set the recipient's time zone | yes |
| 14 | `unsend-hold-until-morning` | Hold until her morning | Mom preview | Schedule delivery for the recipient's morning | yes |
| 15 | `unsend-queue-send` | Send when they're ready | Preview (C) | Queue the letter for delivery |  |
| 16 | `pending-unsend-cancel` | Cancel on the waiting strip | Home (F) | Cancel a held letter |  |
| 17 | `letter-preview` | Preview letter | Compose (B), pile | Render the letter from his lines |  |
| 18 | `draft-save` | Save | Compose (B) | Save the draft privately |  |
| 19 | `compose-dictate` | mic | Compose (B) | Dictation into the draft (his words) |  |
| 20 | `unsend-attach-photos` | paperclip | Compose (B) | Attach photos |  |
| 21 | `delivery-channel-pick` | Change (channel) | pile, compose, preview | Pick WhatsApp / Messages / Instagram |  |
| 22 | `handoff-whatsapp` | WhatsApp handoff (on delivery) | Mom's path | Create the letter link and open WhatsApp on Mom's thread |  |
| 23 | `unsend-share-sms` | Messages handoff | Sarah's path | Create the letter link and open Messages on Sarah's thread | yes |
| 24 | `handoff-instagram` | Open Instagram | Home (F) | Open Instagram on Michael's DM |  |
| 25 | `card-page-open` | tap the letter link | Mom's phone | Serve the letter page (the letter page) |  |
| 26 | `reply-page-record` | Hold to reply | Mom's letter page | Record and deliver the recipient's voice reply | yes |
| 27 | `call-start` | Call Riley / start-call buttons | Mom's letter page, Riley's call buttons | Start a call through the messaging app | yes |
| 28 | `unsend-play` | listen | letters, Mom's letter page | Play a voice note or voice reply |  |
| 29 | `letter-write-back` | Write back | Received (D) | Start a reply draft linked to the letter |  |
| 30 | `vault-save` | Keep this moment | Received (D) | Save to the private vault |  |
| 31 | `letter-open` | a Letters row | Letters | Load a received letter |  |
| 32 | `self-note-record` | record | Self note | Record a self video note | yes |
| 33 | `self-note-save` | Save for later | Self note | Save the self note privately |  |
| 34 | `hotline-988` | Call or text 988 | Safety | Resource link (never a live tel: in the mock) |  |
| 35 | `hotline-ndvh-call` | Call 1-800-799-7233 | Safety | Resource link |  |
| 36 | `hotline-ndvh-text` | Text START to 88788 | Safety | Resource link |  |
| 37 | `emergency-911` | Call 911 | Safety | Resource link |  |
| 38 | `muse-ask` | ask field and chips | Meta AI shell | Meta AI chat (shell only; never touches letters) |  |
| 39 | `photo-connectors-open` | Connect photos | You | List photo sources and their state |  |
| 40 | `camera-roll-scan` | Connect on Photos | Connect photos | On-device scan + face clustering |  |
| 41 | `graph-api-photo-import` | Connect on Instagram photos | Connect photos | Import photos via Meta APIs |  |
| 42 | `graph-api-photo-import` | Connect on Facebook photos | Connect photos | Import photos via Meta APIs (same ID) |  |
| 43 | `face-cluster-popup-event` | "We found 4 people in your photos" sheet (event) | Faces popup | Push event when clustering finishes |  |
| 44 | `face-clusters-list` | see who | faces popup | List clusters |  |
| 45 | `face-cluster-photos` | tap a cluster | popup, People | A cluster's photos |  |
| 46 | `face-cluster-suggestion-accept` | "Mom?" / "Sarah?" / "Michael?" | popup, cluster page | Confirm a suggested name |  |
| 47 | `face-cluster-name` | Name this person | popup, cluster page | Name an unknown cluster |  |
| 48 | `face-cluster-dismiss` | not now | popup | Dismiss/snooze |  |
| 49 | `face-cluster-link-person` | add to Mom's memories | cluster page | Link a cluster to a person |  |
| 50 | `face-cluster-photo-remove` | not them | cluster page | Remove a wrongly grouped photo |  |
| + | `unheard-reply-nudge` | (yours) | not in Gurneal's design yet | Your nudge about an unheard reply | yes (yours) |

**Totals:** 50 rows. There are 49 unique IDs because `graph-api-photo-import` appears twice (Instagram and Facebook). Three rows are events, not taps: `rant-transcribe-live`, `rant-split` and `face-cluster-popup-event`. `muse-ask` is the Meta AI chat. It doesn't belong inside Un-Said, so it's listed only for completeness.

**Deliberately absent:** AI rewrite or drafting controls ("rewrite gently", "I'm ready" draft generation). The rule is that nothing the model writes ever appears as his words. Letters and person cards are made of verbatim spans of what he said.

The safety rows (`hotline-*`, `emergency-911`) show numbers as plain visible text. Whether they become live `tel:`/`sms:` links in your app is your call. Gurneal's demo frontend never makes them live.
