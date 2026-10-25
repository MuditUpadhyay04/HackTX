# COPY NEEDED: the web app and Mom's letter page

For Gurneal. This file lists every string in `backend/web/` that isn't in `design/COPY_AND_NAMES.md`. Nothing here is new copy except section 1, which the "Write back" feature needed. Section numbers (3.x) match DESIGN_SPEC.md. When you change a string, the web app uses the new version.

## 1. New strings (the letter page's "Write back")

| Where | String | Note |
|---|---|---|
| 3.10 letter page, after "Write back" | Send | the primary pill under her text field |
| 3.10 letter page, after "Write back" | Cancel | a text button, the same word as in 3.7's action sheet |
| 3.10 letter page, the text field | *(no placeholder)* | left empty until you write one. The field's accessible label is "Write back" |
| 3.10 letter page, while sending | sending… | already shown for voice replies (section 2), now also for text |

## 2. Kept from before the restyle

**3.10 Letter page**
- "this link has expired." / "this link isn't open yet." (the two error pages)
- "sending…", "that didn't send. try again?", "the microphone isn't available"
- "sent. Riley will hear it." (the reply-sent state, which has no string in the table)
- Hindi captions under the pills when her language is Hindi: "दबाकर रखें और बोलें" (hold and speak), "कॉल करें" (call), "भेज दिया।" (sent)
- "sent with Un-Said" (the footer, formerly "sent with unsaid"; only the name changed)
- the overline above the translation, which is her language name from the server, e.g. "HINDI"

**3.1 Home**
- "your lane" (the photo lane)
- "+ add a photo" and its sheet: "who's in it", "caption", the placeholder "kitchen, with mom", "add to the lane", and the toast "added to your lane"
- "for the next hard day" / "leave yourself a note" / "2 notes to yourself" (the self-note row)
- the "mock ai" chip and the "demo" link (demo builds only)

**3.7 Talk and split**
- "sorting it by person…" (the mic caption after he stops) and "the microphone isn't available here"
- Type instead: the placeholder "say it here." and the pill "done"
- the toast "couldn't hear that: …"
- "you left yourself this, for a night like this." (shown when a self note comes back)
- "nothing in that was about anyone yet. it's kept, just for you."
- "what was heard" / "safe to hold · sorted by muse spark" (the transcript disclosure)

**3.8 Pile, 3.4 and 3.9 Preview**
- "nothing is picked for you. choose what she hears."
- each line's meta: "tonight · missing", "oct 11 · overwhelmed"
- the toasts "sent to Sarah" / "sent to Mom on whatsapp"

**3.14 Safety**
- "we're not going to show memories right now." (shown after a rant that raised a concern)
- "back home"
- the pills "Call 988", "Text 988", "Call 1-800-799-7233", "Text START to 88788", "Call 911" (the server's labels with the first letter capitalized)

**3.11 Self note**
- "only you see this. it comes back the next time a night sounds like tonight."
- the toast "saved. to: me"

**Key screen and demo panel** (not part of the design): every string is kept. "this unsaid needs its key." became "this Un-Said needs its key." to follow the name rule.

## 3. Table strings used in a new place, or adapted

- **"Your people"** (a 3.12 You row) is the Home section title above the people rows. Home's "Your words" rows are drafts, and the web has no list of drafts; it lists people and their local time instead.
- **"Open WhatsApp" / "Open Messages"** follow the pattern of "Open Instagram", for the waiting-on-you card on the other channels.
- **"about this letter · arrived 6:40 PM"** shows the time when the letter came today, otherwise the server's day: "arrived yesterday", "arrived on tuesday". The Letters rows use the same rule ("6:40 PM", "yesterday", "on tuesday").
- **Held** reads "Held for Mom's morning." with the chip "arrives 8:00 AM her time" (the waiting strip's words).
- In **"Hold until her morning"** and **"Arrives 8:00 AM her time"**, "her" follows the person's pronoun (his, their).
- **Talk with a reply:** when he opens a photo of someone who wrote back, their letter sits above the transcript, signed "Mom · on tuesday".

## 4. Still COPY NEEDED in the table

- 3.6 Letters empty state: the screen shows only the "Letters" header.
- 3.12 parked group: those rows aren't shown.
- Mom's city and time zone: the web shows whatever the server's time label says.

## 5. Not built yet (each needs backend work first)

- "Keep this moment" [vault-save] (3.5)
- "· Change" next to the channel (3.3, 3.8)
- "Edit as a draft" (3.8)
- Connect photos and the faces popup (3.13), and the You rows "Your people" and "Connect photos" (3.12)
- the "Delivered" strip (3.9)
- the link preview title "A letter from Riley": the page says "A letter" until the server adds the sender's name

## 6. Strings the server writes (change them in backend/app, not here)

- The knock's title and body, e.g. "it's 8:02 AM for Mom. send it now?" / "it'll come from you." Knock bodies A, B and C from 3.15 can't appear until the server sends them.
- Row previews ("5:02 AM for Mom · asleep"), tone chips ("missing", "overwhelmed"), reminder text ("Priya asked twice."), the time chip.
- The demo's seed names (Jordan, Priya) instead of Sarah and Michael.
- In mock mode, the caption under a reply: "no emergency. just wanted to hear your voice. [mock caption]".
