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

## Un-Said (added Oct 25, 2026)
The phone's Un-Said icon opens the **real Un-Said app**: the newest `main` (Gurneal's overhaul, merged by Mudit at `3db5cd5`). Nothing is re-implemented.

`scripts/build-unsaid.sh` exports Un-Said's web build into `public/unsaid/` (git-ignored). The phone serves it at `/unsaid/`, and `components/apps/unsaid/UnsaidApp.tsx` shows it in the display. Because it's served from the phone itself, the phone can:
- dress it like a native app (no web scrollbars, no focus boxes);
- keep the Un-Said screen you're on through a fold or unfold;
- launch it cleanly: Un-Said's splash rides the icon zoom, and the live app appears once the zoom lands (measured: 0–1 slow frames).

**For the demo, one command:** `npm run demo`. It starts the backend, builds Un-Said in if needed, and runs the phone. Use `npm run demo -- --rebuild` to pull Un-Said's latest `main` first.

**Or step by step:**
1. `git worktree add ../HackTX-unsaid-main origin/main` (already done at `~/HackTX-unsaid-main`).
2. **Backend:** `cd ~/HackTX-unsaid-main/backend && uv sync && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000`. Its `.env` has `CORS_ORIGINS=*` and no keys, so it runs on clearly labelled mock AI; add `MODEL_API_KEY` etc. for the real Muse models.
3. **Build Un-Said into the phone:** `scripts/build-unsaid.sh` (about 30 s). Re-run it whenever Un-Said's `main` changes (`git -C ~/HackTX-unsaid-main pull`). `UNSAID_API=` sets the backend address baked into the build (default `http://localhost:8000`).
4. **Phone:** `npm run dev` here, then tap Un-Said.

**Known limits:**
- Mic and camera features need the browser's permission.
- On the short folded screen, Un-Said's tab labels sit right at the bottom edge. That's Un-Said's own layout.
