/**
 * lib/director/director.ts: the scene director for the one-take film (PLAN.md section 5).
 *
 * It drives the look-alike apps only (Messages, WhatsApp, Instagram, Phone). It never scripts inside
 * Un-Said: scene 2 just opens the real app, and scene 3 reacts to Un-Said's own postMessage hand-offs.
 *
 * Controls (on /device and /phone; ?director=off turns it off):
 *   N (or PageDown)  next beat          two-finger tap anywhere   next beat
 *   B (or PageUp)    back a beat        three-finger tap          back a beat
 *   R                restart the scene  long-press the status-bar clock 1.5 s: restart menu
 *   1 / 2 / 3        jump to a scene    ?scene=1..3&beat=K starts there (K = the beat the next N plays)
 *
 * All data is simulated (lib/mock): no contacts, device APIs or network calls.
 */
import type { HomeDisplay } from "@/components/home/layout";
import { RING_MS } from "@/components/apps/phone/CallScreen";
import { NUMBERS } from "@/components/apps/phone/data";
import { useAppStore } from "@/lib/apps/store";
import type { AppTarget } from "@/lib/apps/registry";
import { useFoldStore } from "@/lib/device/store";
import { setLiveFrom } from "@/lib/mock/clock";
import { people, type PersonId } from "@/lib/mock/people";
import type { Message, ThreadId } from "@/lib/mock/threads";
import { onBannerTap, tapBanner } from "@/lib/notify";
import { useBanners } from "@/lib/store/banners";
import { setAutoReceipts, useMessaging } from "@/lib/store/messaging";
import type { UnsaidMessage } from "./bridge";
import { installUnsaidBridge } from "./bridge";

// ---------------------------------------------------------------------------
// Copy (PLAN.md section 5; Riley's own lines are lowercase with no punctuation)
// ---------------------------------------------------------------------------

export const FILM = {
  sarahLong: "i feel like i keep messing up and i don't know how to tell you what's going on with me",
  sarahSent: "it's like you don't understand me anymore",
  momTry: "mumma i",
  momSent: "busy these days, will talk later",
  michaelSent: "just busy",
  sarahReplies: ["omg I didn't know you felt like that", "I just saw this", "why didn't you say something sooner", "Can we talk?"],
  sarahCallElapsed: 35 * 60 + 40,
  michaelShare: "so funny bro",
  michaelReplies: ["LMAOOO finally", "missed you man"],
  momCheckIns: [
    ["2026-10-24T19:02", "Beta, did you eat?"],
    ["2026-10-24T19:40", "Call when you're free"],
    ["2026-10-24T20:15", null],
    ["2026-10-24T21:05", "Everything okay?"],
    ["2026-10-24T22:21", "Papa is asking about you"],
  ] as [string, string | null][],
  /** status-bar time at the start of the film (the backend's demo clock is 22:40) */
  startClock: "2026-10-24T22:38",
} as const;

/** Un-Said person ids (backend seed) -> the look-alike cast. */
const UNSAID_PEOPLE: Record<string, PersonId> = { jordan: "sarah", sarah: "sarah", mom: "mom", priya: "michael", michael: "michael" };

/** Each person's thread and the app it lives in. */
const THREAD_OF: Partial<Record<PersonId, { app: "messages" | "whatsapp" | "instagram"; id: ThreadId }>> = {
  sarah: { app: "messages", id: "sarah" },
  mom: { app: "whatsapp", id: "mom" },
  michael: { app: "instagram", id: "michael" },
};

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

type Ctx = { fast: boolean; signal: AbortSignal };
const ABORT = new Error("director: aborted");

function wait(ctx: Ctx, ms: number): Promise<void> {
  if (ctx.fast) return Promise.resolve();
  if (ctx.signal.aborted) return Promise.reject(ABORT);
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    ctx.signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(ABORT);
      },
      { once: true },
    );
  });
}

const msg = () => useMessaging.getState();
const apps = () => useAppStore.getState();

function display(): HomeDisplay {
  return apps().open?.display ?? (useFoldStore.getState().folded ? "cover" : "inner");
}

function routesFor(app: "messages" | "whatsapp" | "instagram", id: ThreadId): unknown[] {
  if (app === "messages") return [{ kind: "list" }, { kind: "thread", id }];
  if (app === "whatsapp") return [{ kind: "home", tab: "chats" }, { kind: "chat", id }];
  return [{ kind: "inbox" }, { kind: "thread", id }];
}

/** Back to the home screen (the close zoom), then a beat on home. */
async function goHome(ctx: Ctx, linger = 650) {
  if (!apps().open) return;
  apps().closeApp();
  await wait(ctx, linger);
}

/** Opens an app on the display facing the viewer (from home: the icon launch zoom). */
async function launch(ctx: Ctx, target: AppTarget, routes?: unknown[]) {
  if (routes) apps().setRoutes(target, routes);
  apps().openApp(target, display());
  await wait(ctx, 700);
}

async function openThread(ctx: Ctx, id: ThreadId, fromHome: boolean) {
  const t = msg().threads[id];
  if (fromHome) await goHome(ctx);
  msg().markRead(id);
  await launch(ctx, t.app, routesFor(t.app, id));
}

/** The element of this selector in the screen copy the viewer sees (not an inert fold copy). */
function liveElement(selector: string): HTMLElement | null {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
    if (el.closest("[inert]")) continue;
    if (el.getClientRects().length === 0) continue;
    if (getComputedStyle(el).visibility !== "visible") continue;
    return el;
  }
  return null;
}

/** One key on the Samsung Keyboard look-alike: through its own key bridge, so the key pops. */
function keyTap(id: ThreadId, key: string) {
  const before = msg().threads[id].draft;
  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  // the keyboard isn't up on a visible display (a fold, a hidden pane): type into the store directly
  if (msg().threads[id].draft === before) {
    if (key === "Backspace") msg().backspace(id);
    else msg().type(id, key);
  }
}
function keyUp() {
  window.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift" }));
}

async function keyboardUp(ctx: Ctx, id: ThreadId) {
  if (msg().threads[id].keyboard) return;
  msg().focus(id);
  await wait(ctx, 550);
}

/** Types at a human pace: about 9 to 14 characters a second, slower after words and commas. */
async function typeText(ctx: Ctx, id: ThreadId, text: string) {
  if (ctx.fast) {
    msg().setDraft(id, msg().threads[id].draft + text);
    return;
  }
  for (const ch of Array.from(text)) {
    keyTap(id, ch);
    await wait(ctx, 45);
    keyUp();
    let pause = 30 + Math.random() * 55;
    if (ch === " ") pause += Math.random() < 0.3 ? 140 + Math.random() * 160 : 20;
    if (ch === "," || ch === ".") pause += 220;
    await wait(ctx, pause);
  }
}

/** Holds backspace until the draft is empty: once, a 400 ms wait, then faster and faster. */
async function holdDelete(ctx: Ctx, id: ThreadId) {
  if (ctx.fast) {
    msg().setDraft(id, "");
    return;
  }
  let interval = 110;
  keyTap(id, "Backspace");
  await wait(ctx, 420);
  while (msg().threads[id].draft.length > 0) {
    keyTap(id, "Backspace");
    await wait(ctx, interval);
    interval = Math.max(28, interval * 0.9);
  }
  keyUp();
}

/** Taps backspace n times (deleting a short word or two by hand). */
async function tapDelete(ctx: Ctx, id: ThreadId) {
  if (ctx.fast) {
    msg().setDraft(id, "");
    return;
  }
  while (msg().threads[id].draft.length > 0) {
    keyTap(id, "Backspace");
    await wait(ctx, 60);
    keyUp();
    await wait(ctx, 90 + Math.random() * 70);
  }
}

function lastMine(id: ThreadId): Message | undefined {
  return [...msg().threads[id].messages].reverse().find((m) => m.from === "me");
}

/** Sends the draft and runs that app's receipts (the director keeps the automatic ones off). */
async function send(ctx: Ctx, id: ThreadId) {
  await wait(ctx, 350);
  msg().send(id);
  const m = lastMine(id);
  const app = msg().threads[id].app;
  if (!m) return;
  if (app === "whatsapp") {
    const tick = (receipt: "delivered" | "read", ms: number) =>
      ctx.fast ? msg().setReceipt(id, m.id, receipt) : setTimeout(() => msg().setReceipt(id, m.id, receipt), ms);
    tick("delivered", 300);
    tick("read", 1300);
  }
}

/** Their typing dots, then their message. */
async function theyReply(ctx: Ctx, id: ThreadId, text: string, typingMs = 1700) {
  msg().setTyping(id, true);
  await wait(ctx, typingMs);
  msg().receive(id, { kind: "text", text });
  if (isThreadOpen(id)) msg().markRead(id);
}

function isThreadOpen(id: ThreadId): boolean {
  const t = msg().threads[id];
  const open = apps().open?.target;
  if (open !== t.app) return false;
  const r = apps().routes[t.app] as { kind: string; id?: string }[] | undefined;
  return !!r?.some((x) => x.id === id);
}

function pushBanner(app: "messages" | "whatsapp" | "instagram", threadId: ThreadId, body: string) {
  useBanners.getState().push({ app, threadId, title: people[msg().threads[threadId].contactId].name, body });
}

/** Opens the thread a banner points at (a real tap on the banner does the same). */
function openFromBanner(threadId: ThreadId | null) {
  if (!threadId) return;
  const t = msg().threads[threadId];
  msg().markRead(threadId);
  apps().setRoutes(t.app, routesFor(t.app, threadId));
  apps().openApp(t.app, display());
}

/** The WhatsApp call screen (outgoing; they pick up after a few rings and the timer runs). */
async function whatsappCall(ctx: Ctx, who: PersonId) {
  const thread = THREAD_OF[who];
  const chat = thread?.app === "whatsapp" ? [{ kind: "chat", id: thread.id }] : [];
  apps().setRoutes("whatsapp", [{ kind: "home", tab: "chats" }, ...chat, { kind: "call", with: who, video: false, answer: true }]);
  apps().openApp("whatsapp", display());
  await wait(ctx, 600);
}

function dropCallRoute(target: "whatsapp" | "phone") {
  const r = (apps().routes[target] as { kind: string }[] | undefined) ?? [];
  apps().setRoutes(
    target,
    r.filter((x) => x.kind !== "call" && x.kind !== "incoming"),
  );
}

/** Ends the call on screen (its end button, so "Call ended" shows), then goes back to Un-Said. */
async function endCallBackToUnsaid(ctx: Ctx, target: "whatsapp" | "phone") {
  const button = ctx.fast ? null : liveElement(target === "phone" ? '[data-action="call-end"]' : '[data-action="tap:End call"]');
  if (button) {
    button.click();
    await wait(ctx, target === "phone" ? 1300 : 500);
  }
  dropCallRoute(target);
  await launch(ctx, "unsaid");
}

// ---------------------------------------------------------------------------
// The film
// ---------------------------------------------------------------------------

type Beat = { name: string; run: (ctx: Ctx) => Promise<void> };
type Scene = { title: string; setup: (ctx: Ctx) => Promise<void>; beats: Beat[] };

/** Mom's check-in pile-up (simulated), stacked at the end of her thread. */
function seedMomCheckIns() {
  const m = msg();
  const base = m.threads.mom.messages.filter((x) => !x.id.startsWith("mom-film-"));
  const extra: Message[] = FILM.momCheckIns.map(([at, text], i) =>
    text
      ? { id: `mom-film-${i}`, threadId: "mom", from: "them", kind: "text", text, at }
      : { id: `mom-film-${i}`, threadId: "mom", from: "them", kind: "missed-call", callLabel: "Missed voice call", at },
  );
  useMessaging.setState((s) => ({
    threads: { ...s.threads, mom: { ...s.threads.mom, messages: [...base, ...extra], unread: s.threads.mom.unread + 4 } },
  }));
}

/** ?time=HH:MM overrides the status-bar time the film starts at. */
function startClock(): string {
  const t = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("time");
  return t && /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? `2026-10-24T${t}` : FILM.startClock;
}

async function freshStart(ctx: Ctx) {
  useBanners.getState().clear();
  msg().reset();
  seedMomCheckIns();
  setLiveFrom(startClock());
  apps().closeApp();
  await wait(ctx, 300);
}

const SCENE_1: Scene = {
  title: "Opening (look-alike apps)",
  setup: freshStart,
  beats: [
    { name: "Messages: open Sarah's thread", run: (ctx) => openThread(ctx, "sarah", true) },
    {
      name: "Sarah: type the long message, then hold backspace",
      run: async (ctx) => {
        await keyboardUp(ctx, "sarah");
        await typeText(ctx, "sarah", FILM.sarahLong);
        await wait(ctx, 1100);
        await holdDelete(ctx, "sarah");
      },
    },
    {
      name: "Sarah: type and send \"it's like you don't understand me anymore\"",
      run: async (ctx) => {
        await keyboardUp(ctx, "sarah");
        await wait(ctx, 500);
        await typeText(ctx, "sarah", FILM.sarahSent);
        await send(ctx, "sarah");
      },
    },
    { name: "Home, then WhatsApp: Mom's thread", run: (ctx) => openThread(ctx, "mom", true) },
    {
      name: "Mom: type \"mumma i\", then delete it",
      run: async (ctx) => {
        await keyboardUp(ctx, "mom");
        await typeText(ctx, "mom", FILM.momTry);
        await wait(ctx, 1200);
        await tapDelete(ctx, "mom");
      },
    },
    {
      name: "Mom: type and send \"busy these days, will talk later\"",
      run: async (ctx) => {
        await wait(ctx, 400);
        await typeText(ctx, "mom", FILM.momSent);
        await send(ctx, "mom");
      },
    },
    {
      name: "Instagram banners: Michael sent a reel, then \"You okay?\"",
      run: async (ctx) => {
        msg().receive("michael", { kind: "reel", reelId: "recleague" });
        pushBanner("instagram", "michael", "sent a reel");
        await wait(ctx, 1600);
        msg().receive("michael", { kind: "text", text: "You okay?" });
        pushBanner("instagram", "michael", "You okay?");
      },
    },
    {
      name: "Tap the banner: Michael's DM",
      run: async (ctx) => {
        const top = useBanners.getState().stack[0];
        if (top) tapBanner(top);
        else openFromBanner("michael");
        useBanners.getState().clear();
        await wait(ctx, 600);
      },
    },
    {
      name: "Michael: type and send \"just busy\"",
      run: async (ctx) => {
        await keyboardUp(ctx, "michael");
        await typeText(ctx, "michael", FILM.michaelSent);
        await send(ctx, "michael");
      },
    },
  ],
};

const SCENE_2: Scene = {
  title: "Un-Said (live, not scripted)",
  setup: async (ctx) => {
    useBanners.getState().clear();
    await goHome(ctx, 0);
  },
  beats: [
    {
      name: "Home, then open Un-Said (launch animation). The rest is live.",
      run: async (ctx) => {
        await goHome(ctx);
        await launch(ctx, "unsaid");
      },
    },
  ],
};

const SCENE_3: Scene = {
  title: "Reconnection",
  // jumped to by key: the opening's state, back on Un-Said
  setup: async (ctx) => {
    await freshStart({ ...ctx, fast: true });
    for (const b of SCENE_1.beats) await b.run({ ...ctx, fast: true });
    useBanners.getState().clear();
    apps().closeApp();
    apps().openApp("unsaid", display());
  },
  beats: [
    { name: "WhatsApp call screen: Mom (Un-Said's \"Call on WhatsApp\")", run: (ctx) => whatsappCall(ctx, "mom") },
    { name: "End the call, back to Un-Said", run: (ctx) => endCallBackToUnsaid(ctx, "whatsapp") },
    { name: "Messages: Sarah's thread", run: (ctx) => openThread(ctx, "sarah", false) },
    ...FILM.sarahReplies.map((text) => ({ name: `Sarah replies: "${text}"`, run: (ctx: Ctx) => theyReply(ctx, "sarah", text) })),
    {
      name: "Sarah calls (incoming)",
      run: async (ctx) => {
        dropCallRoute("phone");
        apps().setRoutes("phone", [
          { kind: "home", tab: "recents", dial: "", sel: null, added: [] },
          { kind: "incoming", who: "sarah", number: NUMBERS.sarah!, elapsed: FILM.sarahCallElapsed },
        ]);
        apps().openApp("phone", display());
        await wait(ctx, 500);
      },
    },
    {
      name: "Answer: the timer at 35:40 and counting",
      run: async (ctx) => {
        const r = (apps().routes.phone as { kind: string; who?: PersonId; number?: string; elapsed?: number }[] | undefined) ?? [];
        const ring = r.find((x) => x.kind === "incoming");
        if (!ring) return;
        const startedAt = performance.now() - RING_MS - (ring.elapsed ?? 0) * 1000;
        apps().setRoutes("phone", [r[0], { kind: "call", who: ring.who ?? null, number: ring.number ?? "", startedAt }]);
        await wait(ctx, 300);
      },
    },
    { name: "End the call, back to Un-Said", run: (ctx) => endCallBackToUnsaid(ctx, "phone") },
    { name: "Instagram: Michael's DM (Un-Said's \"Reply to Michael on Instagram\")", run: (ctx) => openThread(ctx, "michael", false) },
    {
      name: "Michael: share a reel, type and send \"so funny bro\"",
      run: async (ctx) => {
        await wait(ctx, 400);
        msg().sendReel("michael", "goldenhour");
        await wait(ctx, 900);
        await keyboardUp(ctx, "michael");
        await typeText(ctx, "michael", FILM.michaelShare);
        await send(ctx, "michael");
      },
    },
    {
      name: "Michael replies: \"LMAOOO finally\", \"missed you man\"",
      run: async (ctx) => {
        await theyReply(ctx, "michael", FILM.michaelReplies[0], 1500);
        await theyReply(ctx, "michael", FILM.michaelReplies[1], 1300);
      },
    },
  ],
};

export const SCENES: Scene[] = [SCENE_1, SCENE_2, SCENE_3];

/** Scene 3 beat indexes Un-Said's hand-offs land on. */
const CALL_MOM_BEAT = 0;
const OPEN_MICHAEL_BEAT = 10;

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

type DirectorState = { scene: number; cursor: number; running: boolean };
const state: DirectorState = { scene: 0, cursor: 0, running: false };
let controller = new AbortController();
let chain: Promise<void> = Promise.resolve();

function log(what: string) {
  const s = SCENES[state.scene];
  console.info(`[director] scene ${state.scene + 1} · ${state.cursor}/${s.beats.length} · ${what}`);
}

function abortRunning() {
  controller.abort();
  controller = new AbortController();
  state.running = false;
}

async function runSafely(fn: (ctx: Ctx) => Promise<void>, fast: boolean) {
  const ctx: Ctx = { fast, signal: controller.signal };
  try {
    await fn(ctx);
  } catch (e) {
    if (e !== ABORT) console.error("[director]", e);
  }
}

/** Sets a scene up and plays its first `cursor` beats instantly (B, R, 1-3, ?scene=&beat=). */
function rebuild(scene: number, cursor: number) {
  abortRunning();
  state.scene = scene;
  state.cursor = Math.max(0, Math.min(cursor, SCENES[scene].beats.length));
  const target = state.cursor;
  chain = chain.then(async () => {
    const s = SCENES[scene];
    await runSafely(s.setup, true);
    for (let i = 0; i < target; i++) await runSafely(s.beats[i].run, true);
    log(target ? `ready after "${s.beats[target - 1].name}"` : "ready");
  });
}

/** Plays beat `i` of the current scene at full speed (ignored while a beat is still playing). */
function play(i: number) {
  const s = SCENES[state.scene];
  if (state.running || i >= s.beats.length) {
    if (i >= s.beats.length) log("end of scene (press 1/2/3)");
    return;
  }
  state.running = true;
  state.cursor = i + 1;
  const beat = s.beats[i];
  log(`playing "${beat.name}"`);
  chain = chain.then(async () => {
    await runSafely(beat.run, false);
    state.running = false;
  });
}

export function next() {
  // the end of a scene rolls into the next one (scene 1 -> 2 -> 3) without a setup
  if (!state.running && state.cursor >= SCENES[state.scene].beats.length && state.scene < SCENES.length - 1) {
    state.scene += 1;
    state.cursor = 0;
  }
  play(state.cursor);
}
export function back() {
  rebuild(state.scene, state.cursor - 1);
}
export function restart(scene = state.scene) {
  rebuild(scene, 0);
}

function toCast(person: string | undefined): PersonId | null {
  if (!person) return null;
  return UNSAID_PEOPLE[person] ?? (person in people ? (person as PersonId) : null);
}

/** Each app's thread when a hand-off names no person (the film's cast). */
const APP_THREAD: Partial<Record<string, ThreadId>> = { whatsapp: "mom", messages: "sarah", instagram: "michael" };

/**
 * His letter, handed off from Un-Said: that look-alike app opens on the matching thread with the
 * letter as a message he sent. (Facebook has no look-alike app on this phone: nothing opens.)
 */
function handoff(app: string, text: string, person?: string) {
  const who = toCast(person);
  const byPerson = who ? THREAD_OF[who] : undefined;
  const id = byPerson && byPerson.app === app ? byPerson.id : APP_THREAD[app];
  if (!id || !text.trim()) return;
  log(`Un-Said: hand-off to ${app} (${id})`);
  chain = chain.then(() =>
    runSafely(async (ctx) => {
      await openThread(ctx, id, false);
      await wait(ctx, 500);
      msg().sendText(id, text);
      const m = lastMine(id);
      if (m && msg().threads[id].app === "whatsapp") {
        setTimeout(() => msg().setReceipt(id, m.id, "delivered"), 300);
      }
    }, false),
  );
}

/** Un-Said's hand-offs: they move the film to that beat of scene 3 and play it. */
export function onUnsaidMessage(m: UnsaidMessage) {
  if (m.type === "unsaid:handoff") {
    handoff(m.app, m.text, m.person);
    return;
  }
  const who = toCast(m.person);
  if (!who) return;
  abortRunning();
  state.scene = 2;
  if (m.type === "unsaid:call") {
    if (who === "mom" || m.channel === "whatsapp") {
      state.cursor = CALL_MOM_BEAT + 1;
      log(`Un-Said: call ${who} on WhatsApp`);
      chain = chain.then(() => runSafely((ctx) => whatsappCall(ctx, who), false));
      return;
    }
    const thread = THREAD_OF[who];
    if (thread) chain = chain.then(() => runSafely((ctx) => openThread(ctx, thread.id, false), false));
    return;
  }
  const thread = THREAD_OF[who];
  if (!thread) return;
  if (who === "michael") state.cursor = OPEN_MICHAEL_BEAT + 1;
  log(`Un-Said: open ${m.app} for ${who}`);
  chain = chain.then(() => runSafely((ctx) => openThread(ctx, thread.id, false), false));
}

// ---------------------------------------------------------------------------
// Input: keys, touch gestures, the clock long-press menu (all invisible on camera)
// ---------------------------------------------------------------------------

function onKey(e: KeyboardEvent) {
  if (!e.isTrusted || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target as HTMLElement | null;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  const k = e.key.toLowerCase();
  const act =
    k === "n" || k === "pagedown"
      ? next
      : k === "b" || k === "pageup"
        ? back
        : k === "r"
          ? () => restart()
          : k === "1" || k === "2" || k === "3"
            ? () => restart(Number(k) - 1)
            : null;
  if (!act) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (!e.repeat) act();
}

/** A tap with 2 (next) or 3 (back) fingers: all down and up within 450 ms, barely moving. */
function gestureListeners(target: Document | Window) {
  let max = 0;
  let start = 0;
  let moved = false;
  let x0 = 0;
  let y0 = 0;
  target.addEventListener(
    "touchstart",
    (ev) => {
      const e = ev as TouchEvent;
      if (max === 0) {
        start = performance.now();
        moved = false;
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
      }
      max = Math.max(max, e.touches.length);
    },
    { passive: true, capture: true },
  );
  target.addEventListener(
    "touchmove",
    (ev) => {
      const e = ev as TouchEvent;
      const p = e.touches[0];
      if (p && Math.hypot(p.clientX - x0, p.clientY - y0) > 24) moved = true;
    },
    { passive: true, capture: true },
  );
  target.addEventListener(
    "touchend",
    (ev) => {
      const e = ev as TouchEvent;
      if (e.touches.length > 0) return;
      const quick = performance.now() - start < 450 && !moved;
      if (quick && max === 2) next();
      else if (quick && max === 3) back();
      max = 0;
    },
    { passive: true, capture: true },
  );
}

/** Long-press (1.5 s) on the status-bar clock opens the restart menu. */
function clockLongPress() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let x0 = 0;
  let y0 = 0;
  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  window.addEventListener(
    "pointerdown",
    (e) => {
      const bar = (e.target as HTMLElement | null)?.closest?.("[data-status-bar]");
      if (!bar) return;
      const r = bar.getBoundingClientRect();
      if (e.clientX > r.left + r.width * 0.4) return;
      x0 = e.clientX;
      y0 = e.clientY;
      cancel();
      timer = setTimeout(openMenu, 1500);
    },
    true,
  );
  window.addEventListener("pointermove", (e) => {
    if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > 12) cancel();
  });
  window.addEventListener("pointerup", cancel, true);
  window.addEventListener("pointercancel", cancel, true);
}

function openMenu() {
  document.getElementById("director-menu")?.remove();
  const root = document.createElement("div");
  root.id = "director-menu";
  root.setAttribute(
    "style",
    "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font:16px system-ui,sans-serif",
  );
  const card = document.createElement("div");
  card.setAttribute("style", "background:#fff;color:#111;border-radius:20px;padding:16px;min-width:260px;display:flex;flex-direction:column;gap:8px");
  const title = document.createElement("div");
  title.textContent = `Scene ${state.scene + 1} · beat ${state.cursor}/${SCENES[state.scene].beats.length}`;
  title.setAttribute("style", "font-weight:600;padding:4px 4px 8px");
  card.appendChild(title);
  const close = () => root.remove();
  const button = (label: string, fn: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("style", "font:inherit;padding:12px 14px;border-radius:12px;border:0;background:#eef1f6;text-align:left");
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
      fn();
    });
    card.appendChild(b);
  };
  button(`Restart this scene (${state.scene + 1})`, () => restart());
  SCENES.forEach((s, i) => button(`Scene ${i + 1}: ${s.title}`, () => restart(i)));
  button("Back a beat", back);
  button("Close", () => {});
  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });
  root.appendChild(card);
  document.body.appendChild(root);
}

/** Same-origin frames (Un-Said) swallow keys and touches: listen inside them too. */
const wired = new WeakSet<Document>();
function wireFrames() {
  for (const frame of Array.from(document.querySelectorAll("iframe"))) {
    try {
      const doc = frame.contentDocument;
      if (!doc || wired.has(doc)) continue;
      wired.add(doc);
      doc.addEventListener("keydown", onKey, true);
      gestureListeners(doc);
    } catch {
      // cross-origin: nothing to wire
    }
  }
}

let installed = false;

/** Arms the director on the phone routes (/device, /phone). Idempotent. */
export function installDirector() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  installUnsaidBridge();
  const params = new URLSearchParams(window.location.search);
  const onPhoneRoute = /^\/(device|phone)(\/|$)/.test(window.location.pathname);
  if (!onPhoneRoute || params.get("director") === "off") return;

  setAutoReceipts(false);
  useBanners.getState().setHold(true);
  onBannerTap((b) => openFromBanner(b.threadId));
  window.addEventListener("keydown", onKey, true);
  gestureListeners(window);
  clockLongPress();
  setInterval(wireFrames, 1000);

  const scene = Math.min(3, Math.max(1, Number(params.get("scene")) || 1)) - 1;
  const beat = Math.max(1, Number(params.get("beat")) || 1);
  rebuild(scene, beat - 1);

  // for the laptop console and Playwright: window.__director.next() etc.
  (window as unknown as { __director: unknown }).__director = {
    next,
    back,
    restart,
    state: () => ({ ...state, beats: SCENES[state.scene].beats.map((b) => b.name) }),
    message: onUnsaidMessage,
  };
}
