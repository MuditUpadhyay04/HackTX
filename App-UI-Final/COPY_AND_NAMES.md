# Un-Said: cast, names and every user-facing string

**Owner:** Gurneal Chandi. Names and copy are his and are fixed. **For:** Mudit's app (and anything else that shows Un-Said).

Conventions:
- *(proposed)*: Gurneal wrote it as a draft and still has to OK it. Use it as written until he does.
- **COPY NEEDED**: there's no string yet. Ask Gurneal; never invent one. In the meantime, keep whatever your app shows now and add it to a list for him.
- The app name is always **"Un-Said"**, with the hyphen. See `assets/wordmark.md`.

## 1. Cast

| Who | Shown as | Their app | Notes |
|---|---|---|---|
| Riley | "Riley" (the user, "you") | Riley's own phone | A student in Austin. He signs letters "Riley" |
| Mom | "Mom" | WhatsApp | She calls a lot; "I love you beta". She gets her letter through a WhatsApp link |
| Dad | "Dad" | WhatsApp | Has a draft on Home ("I never said thank you."); he leans into Mom's video call |
| Sarah ❤️🤍 | "Sarah ❤️🤍" in Messages; **"Sarah"** inside Un-Said | Messages (iMessage) | His girlfriend. Her letter back is "I missed you too." / "I'm glad you told me." |
| Michael (Best Friend) | "Michael (Best Friend)" (his Instagram nickname); "Michael" on person cards | Instagram DMs | Sends reels; the sunrise on 290 |

**Names in your demo data:** if your seed or demo uses other names (for example Arjun, Jordan or Priya), map them to Gurneal's cast:
- the user → **Riley**
- the girlfriend on Messages → **Sarah**
- the friend on Instagram → **Michael (Best Friend)**
- the parent on WhatsApp → **Mom**

Changing only display strings and seed names is enough; IDs can stay. (The reference image says "Maya", but she is **Sarah**.)

**Clock:** Riley's phone shows Saturday, Oct 24, 2026, 9:41 PM in Austin. Mom's time zone is a setting, with "8:11 AM for Mom" as the example chip. **COPY NEEDED:** Gurneal still has to confirm Mom's time zone and city.

## 2. Strings, screen by screen (the section numbers match DESIGN_SPEC.md)

| Screen | Element | String |
|---|---|---|
| everywhere | app name / wordmark | Un-Said |
| 3.0 Launch | wordmark under the icon | Un-Said |
| 3.1 Home | headline | Some words take a little longer. |
| 3.1 Home | hero card | What have you been meaning to say? |
| 3.1 Home | section | Your words |
| 3.1 Home | rows | Sarah · I miss the way we used to talk. / Dad · I never said thank you. |
| 3.1 Home | row meta | Draft › |
| 3.1 Home | talk card | Say it out loud / Only you can hear this. *(proposed)* |
| 3.1 Home | waiting strip | Mom · arrives 8:00 AM her time · Cancel |
| 3.1 Home | waiting on you | Michael (Best Friend) · waiting on you / 3 reels this week *(proposed)* / Open Instagram |
| 3.2 Tab bar | tabs | Home · Letters · You |
| 3.3 Compose | nav | To Sarah · Save |
| 3.3 Compose | overline | ONLY A DRAFT |
| 3.3 Compose | draft | I miss the way we used to talk. ⏎⏎ I didn't know how to say that. |
| 3.3 Compose | channel | Goes to Sarah in Messages · Change |
| 3.3 Compose | channel sheet | WhatsApp · Messages · Instagram |
| 3.3 Compose | pill / caption | Preview letter / You decide when it leaves. |
| 3.4 Preview | nav / caption | ‹ Edit · To Sarah / This is how Sarah will see it. |
| 3.4 Preview | pill / link | Send when they're ready / Keep editing |
| 3.5 Received | nav | From Sarah |
| 3.5 Received | letter | FOR YOU / I missed you too. / I'm glad you told me. / Sarah |
| 3.5 Received | under the card | Take your time. / Write back / Keep this moment |
| 3.5 Received | footer | about this letter · arrived 6:40 PM · listen |
| 3.6 Letters | header | Letters |
| 3.6 Letters | rows | Sarah · I missed you too. · 6:40 PM / Mom · voice reply · 0:24 · 8:14 AM her time |
| 3.6 Letters | empty state | **COPY NEEDED** |
| 3.7 Talk | title / overline | Say it out loud / ONLY YOU CAN HEAR THIS |
| 3.7 Talk | mic captions | Tap to talk / Tap to stop |
| 3.7 Talk | secondary | Type instead / Start over |
| 3.7 Talk | action sheet | Delete recording / Cancel |
| 3.7 Talk | quiet line | Nothing leaves without you. |
| 3.7 Talk | split line | Here's who that was for. *(proposed)* |
| 3.7 Talk | tone chips | missing her (Mom) / sorry (Sarah) / missing him (Michael) *(proposed)* |
| 3.7 Talk | card overflow | +N more |
| 3.7 Talk | private save / toast | Keep it just for me / Saved. Only you can see it. |
| 3.7 Talk | mock transcript | see DESIGN_SPEC 3.7 *(proposed)* |
| 3.8 Pile | title / overline | For Mom (For Sarah, For Michael) / IN YOUR WORDS |
| 3.8 Pile | channel / chip | Goes to Mom on WhatsApp · Change / 8:11 AM for Mom |
| 3.8 Pile | actions | Preview letter / Edit as a draft |
| 3.9 Mom preview | caption | This is how Mom will see it. |
| 3.9 Mom preview | delivery card | Mom's morning / Arrives 8:00 AM her time / Hold until her morning / Send now *(proposed)* |
| 3.9 Mom preview | held | Held for Mom's morning. *(proposed)* |
| 3.9 cancel toast | toast | Kept as a draft. |
| 3.9 link preview | title / domain | A letter from Riley / unsaid.app |
| 3.9 delivered | strip | Delivered |
| 3.10 Letter page | card | FOR YOU / (his lines) / Riley / listen |
| 3.10 Letter page | pills | Hold to reply / Release to send *(proposed)* / Call Riley |
| 3.11 Self note | overline / actions | FOR YOU, LATER / Save for later / Retake / Notes to yourself *(proposed)* |
| 3.12 You | name / rows | Riley / Notes to yourself / Your people / Connect photos / Safety and support / Settings |
| 3.12 You | parked group | Not in this build (row labels **COPY NEEDED**) |
| 3.12 You | footer | powered by Meta AI |
| 3.13 Connect | rows | Photos · on this iPhone / Instagram photos · your posts and tagged photos / Facebook photos · albums and tagged photos / Connect |
| 3.13 Connect | notes | grouped on your phone. only you can see this. / faces never leave your phone / you name people, not us / delete face data anytime |
| 3.13 Faces popup | title / chips | We found 4 people in your photos / Mom? 212 · Sarah? 148 · Michael? 96 · Name this person 31 |
| 3.13 Faces popup | actions | see who / not now |
| 3.13 Person | header / actions | 212 photos · from Photos, Instagram, Facebook / add to Mom's memories / not them |
| 3.14 Safety | header | You deserve to feel safe. Here's real help. |
| 3.14 Safety | rows | 988 Suicide & Crisis Lifeline · Call or text 988 / National Domestic Violence Hotline · Call 1-800-799-7233 · Text START to 88788 / Immediate danger · Call 911 |
| 3.14 Safety | footer | Un-Said isn't a crisis service. These people are. |
| 3.15 Knock | title / body A | Un-Said / We noticed you've been quieter with the people closest to you lately. Want to say what you haven't? |
| 3.15 Knock | body B | Mom, Sarah and Michael all reached out this week. Some things are easier to say here first. |
| 3.15 Knock | body C | You started a few messages tonight and only sent the short ones. Want a quiet place to say the rest? |

## 3. Copy rules

- **Un-Said speaks rarely.** Its own voice is limited to labels, captions and at most one short line after the split. It never writes his words: every line on a person card, in a pile, on a letter and in a link preview is verbatim from what he said.
- **Banned words:** none of "we detected", "risk", "depressed" or "sad", and no clinical tone anywhere.
- **Case:** Un-Said's UI uses sentence case, as written above. The overlines are uppercase. Riley's own messages are lowercase with no punctuation.
- **Emoji** appear only where a person typed them, plus in the "Sarah ❤️🤍" contact name inside Messages.
- **Anything your app shows that isn't in this table is COPY NEEDED.** Keep it as it is for now and list it for Gurneal. Don't write new copy.
