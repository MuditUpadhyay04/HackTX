/**
 * lib/store/messaging.ts: the local messaging store (docs/RULES.md rule 3a; Phase 2 INTERACTIVE
 * MESSAGING). One zustand store holds every thread, its messages, receipts and composer drafts.
 * Seeded from lib/mock/threads.ts; survives in-app navigation; resets on reload or ?reset=1.
 * Every action is callable from code (the Phase 4 opening drives these same actions).
 */
import { create } from "zustand";
import { isDriven, mockNowISO } from "@/lib/mock/clock";
import { partialWord } from "@/lib/mock/predict";
import {
  SEEDS,
  THREAD_META,
  TYPED_SCRIPT,
  TYPING_AFTER_READ,
  type Message,
  type Receipt,
  type Thread,
  type ThreadId,
} from "@/lib/mock/threads";
import type { ReelId } from "@/lib/mock/reels";

export type { Message, Thread, ThreadId, Receipt } from "@/lib/mock/threads";

/** The exact ?state= frames (ROUTES AND STATES). */
export type SeedState = "read" | "history" | "compose" | "sent" | "read-receipt" | "typing";

/** Receipt timing per app (RECEIPTS; INTERACTIVE MESSAGING "Send"). */
export const RECEIPT_TIMING = {
  whatsappDelivered: 300,
  whatsappRead: 1200,
  rcsRead: 1500,
  rcsTypingIn: 1000,
  rcsTypingFor: 2500,
  instagramSeen: 2000,
} as const;

type State = {
  threads: Record<ThreadId, Thread>;
  /** ?replies=on: Instagram "Seen" and canned replies (testing only) */
  replies: boolean;
  /** ids of messages added after seeding (they get the send motion) */
  fresh: Record<string, true>;
  focus: (id: ThreadId) => void;
  blur: (id: ThreadId) => void;
  type: (id: ThreadId, ch: string) => void;
  backspace: (id: ThreadId) => void;
  setDraft: (id: ThreadId, text: string) => void;
  predict: (id: ThreadId, word: string) => void;
  send: (id: ThreadId) => void;
  /** sends a fixed text (quick replies) without touching the draft */
  sendText: (id: ThreadId, text: string) => void;
  /** shares a reel back into a thread (Reels share sheet) */
  sendReel: (id: ThreadId, reelId: ReelId) => void;
  receive: (id: ThreadId, partial: Partial<Message> & Pick<Message, "kind">) => Message;
  markRead: (id: ThreadId) => void;
  setUnread: (id: ThreadId, n: number) => void;
  /** inbox long-press: read → back to its seeded unread count (at least 1); unread → read */
  toggleUnread: (id: ThreadId) => void;
  setTyping: (id: ThreadId, on: boolean) => void;
  /** sets one message's receipt (the scene director's scripted ticks) */
  setReceipt: (id: ThreadId, msgId: string, receipt: Receipt) => void;
  seed: (id: ThreadId, state: SeedState, params?: { typed?: number }) => void;
  setReplies: (on: boolean) => void;
  reset: () => void;
};

function seedThread(id: ThreadId): Thread {
  return {
    ...THREAD_META[id],
    messages: SEEDS[id].map((m) => ({ ...m })),
    draft: "",
    keyboard: false,
    theirTyping: false,
  };
}

function seedAll(): Record<ThreadId, Thread> {
  return Object.fromEntries((Object.keys(SEEDS) as ThreadId[]).map((id) => [id, seedThread(id)])) as Record<
    ThreadId,
    Thread
  >;
}

// timers per thread, cleared on seed/reset
const timers = new Map<ThreadId, ReturnType<typeof setTimeout>[]>();
/** The scene director turns the automatic receipts and typing off and runs them itself. */
let autoReceipts = true;
export function setAutoReceipts(on: boolean) {
  autoReceipts = on;
}

function later(id: ThreadId, ms: number, fn: () => void) {
  if (!autoReceipts || isDriven() || typeof window === "undefined") return;
  const list = timers.get(id) ?? [];
  list.push(setTimeout(fn, ms));
  timers.set(id, list);
}
function clearTimers(id?: ThreadId) {
  for (const [key, list] of timers) {
    if (id && key !== id) continue;
    list.forEach(clearTimeout);
    timers.delete(key);
  }
}

let counter = 0;
const newId = (id: ThreadId) => `${id}-n${++counter}`;

export const useMessaging = create<State>()((set, get) => {
  const patch = (id: ThreadId, fn: (t: Thread) => Partial<Thread>) =>
    set((s) => ({ threads: { ...s.threads, [id]: { ...s.threads[id], ...fn(s.threads[id]) } } }));

  const setReceipt = (id: ThreadId, msgId: string, receipt: Receipt) =>
    patch(id, (t) => ({ messages: t.messages.map((m) => (m.id === msgId ? { ...m, receipt } : m)) }));

  /** Appends an outgoing message and runs that app's receipt sequence. */
  const appendMine = (id: ThreadId, partial: Partial<Message> & Pick<Message, "kind">) => {
    const thread = get().threads[id];
    const msg: Message = {
      id: newId(id),
      threadId: id,
      from: "me",
      at: mockNowISO(),
      ...partial,
      receipt: thread.app === "whatsapp" ? "sent" : thread.app === "messages" ? "delivered" : null,
    };
    set((s) => ({
      fresh: { ...s.fresh, [msg.id]: true },
      threads: { ...s.threads, [id]: { ...s.threads[id], messages: [...s.threads[id].messages, msg], theirTyping: false } },
    }));
    if (thread.app === "whatsapp") {
      later(id, RECEIPT_TIMING.whatsappDelivered, () => setReceipt(id, msg.id, "delivered"));
      if (thread.presence === "online") later(id, RECEIPT_TIMING.whatsappRead, () => setReceipt(id, msg.id, "read"));
    } else if (thread.app === "messages") {
      later(id, RECEIPT_TIMING.rcsRead, () => {
        setReceipt(id, msg.id, "read");
        if (TYPING_AFTER_READ[id]) {
          later(id, RECEIPT_TIMING.rcsTypingIn, () => patch(id, () => ({ theirTyping: true })));
          later(id, RECEIPT_TIMING.rcsTypingIn + RECEIPT_TIMING.rcsTypingFor, () =>
            patch(id, () => ({ theirTyping: false })),
          );
        }
      });
    } else if (thread.app === "instagram" && thread.presence === "active" && get().replies) {
      later(id, RECEIPT_TIMING.instagramSeen, () => setReceipt(id, msg.id, "seen"));
    }
    return msg;
  };

  return {
    threads: seedAll(),
    replies: false,
    fresh: {},
    focus: (id) => patch(id, () => ({ keyboard: true })),
    blur: (id) => patch(id, () => ({ keyboard: false })),
    type: (id, ch) => patch(id, (t) => ({ draft: t.draft + ch })),
    backspace: (id) => patch(id, (t) => ({ draft: Array.from(t.draft).slice(0, -1).join("") })),
    setDraft: (id, text) => patch(id, () => ({ draft: text })),
    predict: (id, word) =>
      patch(id, (t) => {
        const part = partialWord(t.draft);
        return { draft: t.draft.slice(0, t.draft.length - part.length) + word + " " };
      }),
    send: (id) => {
      const text = get().threads[id].draft.replace(/\s+$/, "");
      if (!text.trim()) return;
      patch(id, () => ({ draft: "" }));
      appendMine(id, { kind: "text", text });
    },
    sendText: (id, text) => {
      appendMine(id, { kind: "text", text });
    },
    sendReel: (id, reelId) => {
      appendMine(id, { kind: "reel", reelId });
    },
    receive: (id, partial) => {
      const msg: Message = { id: newId(id), threadId: id, from: "them", at: mockNowISO(), ...partial };
      set((s) => ({
        fresh: { ...s.fresh, [msg.id]: true },
        threads: {
          ...s.threads,
          [id]: {
            ...s.threads[id],
            messages: [...s.threads[id].messages, msg],
            unread: s.threads[id].unread + 1,
            theirTyping: false,
          },
        },
      }));
      return msg;
    },
    markRead: (id) => patch(id, () => ({ unread: 0 })),
    setUnread: (id, n) => patch(id, () => ({ unread: n })),
    toggleUnread: (id) => patch(id, (t) => ({ unread: t.unread > 0 ? 0 : Math.max(1, THREAD_META[id].unread) })),
    setTyping: (id, on) => patch(id, () => ({ theirTyping: on })),
    setReceipt: (id, msgId, receipt) => setReceipt(id, msgId, receipt),
    seed: (id, state, params) => {
      clearTimers(id);
      const base = seedThread(id);
      const script = (TYPED_SCRIPT as Partial<Record<ThreadId, string>>)[id] ?? "";
      const next: Thread = { ...base };
      if (state === "compose") {
        const n = Math.max(0, Math.min(script.length, params?.typed ?? 0));
        next.keyboard = true;
        next.draft = script.slice(0, n);
      } else if (state === "sent" || state === "read-receipt" || state === "typing") {
        const receipt: Receipt =
          base.app === "whatsapp" ? "read" : base.app === "messages" ? (state === "sent" ? "delivered" : "read") : null;
        next.keyboard = true;
        next.messages = [
          ...base.messages,
          { id: `${id}-sent`, threadId: id, from: "me", kind: "text", text: script, at: "2026-10-24T21:41", receipt },
        ];
        next.theirTyping = state === "typing";
      }
      set((s) => ({ threads: { ...s.threads, [id]: next } }));
    },
    setReplies: (on) => set({ replies: on }),
    reset: () => {
      clearTimers();
      set({ threads: seedAll(), fresh: {} });
    },
  };
});

/** Convenience selector: one thread. */
export function useThread(id: ThreadId): Thread {
  return useMessaging((s) => s.threads[id]);
}

/** Non-hook access for code (the opening, notify()). */
export const messaging = {
  get: () => useMessaging.getState(),
  thread: (id: ThreadId) => useMessaging.getState().threads[id],
};
