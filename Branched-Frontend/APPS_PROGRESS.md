# Phone apps: progress and what's left

Updated Oct 25, 2026, early morning. Branch: `iphone-duo-template`. On GitHub it's still at `a5144cc`.

**Nothing below is committed yet.** Everything is uncommitted edits in the working tree. Type-check and lint both pass.

## Done

### Tapping
- **No blurry flash when an app opens.** The app used to scale up from its icon, and inside the 3D phone a scaled layer draws soft. Now the full-size app is revealed through a clip that grows out of its icon. (`components/home/AppHost.tsx`)
- **Icons, widgets and Search darken when pressed** instead of shrinking, like iOS.
- **Typing "f" in an app no longer folds the phone.** The F fold shortcut is ignored while an app's keyboard is up.
- **Each key types once.** Every hidden copy of a screen used to hear the physical keyboard, so each key typed 4 times. Now only the visible copy listens.

### Buttons (`lib/apps/registry.tsx`)
- **One table for both screens.** A button that appears on the outer and the inner screen opens the same app on either.
- **Linked:** `whatsapp`, `messages`, `instagram`, `photos`.
- **Empty (tapping does nothing):** everything else, including the hardware buttons (`hw-volume-up`, `hw-volume-down`, `hw-touch-id`, `hw-camera`).
- **Un-Said:** `unsaid: null`, left empty on purpose for you to link. Its code wasn't touched.
- **To link your own app:** set the entry to your component, e.g. `facebook: MyFacebook`.
- Your app gets `{ target, display, close }`. `display` is `"cover"` (402×573 pt) or `"inner"` (822.5×573 pt).
- **An app stays open when you fold or unfold the phone.**

### Shared app kit (`components/apps/kit.tsx`)
- `AppFrame`: fills the screen and draws the in-app status bar.
- `useStack` / `StackView`: the iOS push/pop slide.
- `Split`: list left, detail right, for the unfolded screen.
- `Tap`, `Avatar`, `Scroll`: small shared pieces.
- The chat parts (thread layout, bubbles, keyboard, status bar) read their width from `components/lookalike/shared/pane.tsx`, so they fit both screens.
- **Home bar:** sits on top of everything and turns white over dark screens (Reels, the call screen).

### The apps
Each one works folded (one column) and unfolded (split view).

- **WhatsApp** (`components/apps/whatsapp/WhatsAppApp.tsx`):
  - **Chats tab:** large title, "Ask Meta AI or Search", filter chips, Archived, and Mom, Fam, Roommates and Marfa Trip with real previews, ticks, unread badges and times.
  - **Mom's thread:** type, send, and the ticks go grey → blue.
  - **Calls tab:** Mom under Favorites, then missed calls in red.
  - **Call screen:** blurred avatar, "Calling…", and the controls; End goes back.
  - **Updates, Communities and Settings tabs.**
  - **Tab bar** with badges.
- **Messages / iMessage** (`components/apps/messages/MessagesApp.tsx`):
  - **List:** Edit, compose button and Search.
  - **Sarah's thread:** grey and blue bubbles with tails, centered time stamps ("Wednesday 8:15 PM"), the composer with + / "iMessage" / mic / blue send arrow, and the keyboard.
  - **After you send:** "Delivered", then "Read 9:41 PM", then her typing dots.
- **Instagram** (`components/apps/instagram/InstagramApp.tsx`):
  - It opens on the DMs inbox, where Michael's notification lands.
  - **Inbox:** "Ask Meta AI or Search", your note, and Michael with the green active dot, "· now" and the blue unread dot.
  - **Michael's thread:** profile card, shared reel cards, the 290 sunrise photo, grey incoming bubbles and purple-to-blue outgoing ones.
  - **Composer:** blue camera button, "Message…", mic / gallery / sticker, and a blue "Send" once you type.
  - **Reels viewer:** tap a reel card. It shows the like (tap toggles), comment and share counts, Follow, the audio line, and swipe to the next reel.
- **Photos** (`components/apps/photos/PhotosApp.tsx`):
  - **Grid:** a 3-column grid folded, 7 unfolded, under the "Photos" title with Select and Search, and the Years / Months / All switch. It opens at the newest photos.
  - **Photo view:** date and time, Back, Edit, and share / heart / info / adjust / delete. Tap the left or right third to page.

### Images
- `scripts/make-mock-photos.py` draws 24 illustrated photos into `public/mock/photos/`:
  - the story images: Mom's dal, the 290 sunrise (two people on a car hood, seen from behind), the Fam kitchen and the Marfa lake
  - a 20-photo camera roll
- The avatars and reel stills were copied into `public/mock/` (they were missing).
- **These are flat illustrations, not photos.** That follows the project's rule against stock photos and real faces. Photo-real images would need generating (that costs image credits) or supplying.

### Full audit (review agent, then I re-checked the key claims)
- **Checks:**
  - `tsc` clean.
  - `lint`: 6 errors → 0.
  - `fold-check`: updated for the new hinge, 26/26 passing.
  - `check:placeholders`: 165 failures → 32.
  - `check:tokens`: 539 hits → 430. All hard-coded colours in the apps moved to tokens.
- **Real-click test in Chrome of all four apps, folded and unfolded:** open, thread, type, send (one bubble, no doubled letters), back, close. Apps stay open through fold/unfold. Empty buttons do nothing. No page errors, console errors or 404s.
- **Dead code removed:** `ExampleApp.tsx`, `HingeRipple.tsx`, the ripple counter, old dimming helpers and temp scripts.
- **Docs updated:** `BUILD_LOG.md` (new Oct 25 entry), `docs/PLACEHOLDERS.md` (regenerated, with a /device buttons section), `docs/RULES.md` (as-built notes), `README.md`, `REVIEW_FINDINGS.md`.
- **New `scripts/lib/browser.ts`:** the check scripts use your installed Chrome when the Playwright browser isn't downloaded.
- **Added `app/icon.svg`** (fixes a favicon 404).

## What's left

1. **Commit and push** to `iphone-duo-template` once you've looked through it.
2. **`check:placeholders`, 32 failures:** `lib/scenes-apps.ts` lists `/scene/threads/sarah`, `/scene/threads/michael` and `/scene/threads/whatsapp-chats`, but those routes were never built (only `/scene/threads/mom` exists). Either build those three route pages or remove those scenes. That's your call.
3. **`check:tokens`, 430 hits:** mostly raw pixel sizes in the four apps. The proper fix is moving them into `components/lookalike/metrics.ts`, which would take a few hours. The rest are hinge shader gradient stops and the drawn Photos icon's petal colours (intentional).
4. **Small visual items:**
   - Unfolded with the keyboard up, the keyboard only spans the chat pane; on a real iPad it spans the full width. The home bar then straddles the list and the keyboard.
   - The unfolded Photos grid shows two similar food images in the same row.
5. **Not built:**
   - **Phone app** (dock icon empty). It could show Recents with Mom's missed calls.
   - **Facebook and Meta AI shells** from the spec.
   - **Incoming-call screen from Mom**, with the quick replies.
   - **Typing indicator for WhatsApp.**
   - **The scripted opening storyboard (Phase 4)**, which drives these apps.
6. **Unused spec tokens:** `--motion-hinge-ripple`, `--device-hinge-ripple` and `durations.hingeRipple` are still defined but nothing uses them.

## Where things are
- **Link buttons to apps:** `lib/apps/registry.tsx`.
- **App opening and home bar:** `components/home/AppHost.tsx`. **Open-app state:** `lib/apps/store.ts`.
- **Fake data (word for word):** `lib/mock/threads.ts`, `lib/mock/people.ts`, `lib/mock/reels.ts`. **Message state:** `lib/store/messaging.ts`.
- **Spec:** `docs/CLAUDE_PROMPT.md` (Phase 2 has each app's look and copy).
- **Older phone versions:** `~/Desktop/DUO old/`.
