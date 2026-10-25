/**
 * lib/mock/threads.ts: every seed string, time and receipt in Act 1, word for word from
 * CLAUDE_PROMPT.md Phase 2 THE SCRIPTS. Components never hard-code copy; they read this file.
 *
 * Times are Riley's local wall time (ISO without zone). NOW = 2026-10-24T21:41 (lib/mock/clock.ts).
 */
import type { PersonId } from "./people";
import type { ReelId } from "./reels";

export type AppId = "whatsapp" | "messages" | "instagram";
export type ThreadId = "mom" | "sarah" | "michael" | "fam" | "roommates" | "marfa";

export type Receipt = "sending" | "sent" | "delivered" | "read" | "seen" | null;

export type Message = {
  id: string;
  threadId: ThreadId;
  from: "me" | "them" | "system";
  kind: "text" | "missed-call" | "call" | "photo" | "reel" | "encryption" | "voice";
  text?: string;
  at: string;
  receipt?: Receipt;
  imageId?: string;
  reelId?: ReelId;
  callLabel?: string;
  /** group chats: who sent it */
  sender?: PersonId;
  /** voice note length label, "0:21" */
  duration?: string;
};

export type Thread = {
  id: ThreadId;
  app: AppId;
  contactId: PersonId;
  messages: Message[];
  draft: string;
  unread: number;
  keyboard: boolean;
  theirTyping: boolean;
  presence: "online" | "active" | "offline";
};

// ---------------------------------------------------------------------------
// Seeds
// ---------------------------------------------------------------------------

type Row = [at: string, from: Message["from"], kind: Message["kind"], extra?: Partial<Message>];

function build(threadId: ThreadId, rows: Row[]): Message[] {
  return rows.map(([at, from, kind, extra], i) => ({
    id: `${threadId}-${String(i).padStart(2, "0")}`,
    threadId,
    from,
    kind,
    at,
    ...extra,
  }));
}

const t = (text: string): Partial<Message> => ({ text });
const read = (text: string): Partial<Message> => ({ text, receipt: "read" });
const missed: Partial<Message> = { callLabel: "Missed voice call" };

/** STATE 1 · MOM · WhatsApp. History (two weeks) then the default one screen. */
export const MOM_SEED: Message[] = build("mom", [
  ["2026-10-10T00:00", "system", "encryption", t("messages and calls are end-to-end encrypted.")],
  ["2026-10-10T11:04", "them", "text", t("hi beta, how's it going? 😊")],
  ["2026-10-10T11:05", "them", "text", t("how did the chem exam go?")],
  ["2026-10-10T22:51", "me", "text", read("yeah im good")],
  ["2026-10-12T19:30", "them", "missed-call", missed],
  ["2026-10-12T19:34", "them", "text", t("tried calling. no emergency")],
  ["2026-10-12T19:34", "them", "text", t("did you eat?")],
  ["2026-10-14T18:12", "them", "text", t("your dad asked about you today")],
  ["2026-10-14T18:13", "them", "text", t("he won't say it but he misses you")],
  ["2026-10-14T18:15", "them", "text", t("is everything okay?")],
  ["2026-10-14T23:58", "me", "text", read("everything's good")],
  ["2026-10-16T20:02", "them", "missed-call", missed],
  ["2026-10-16T20:09", "them", "missed-call", missed],
  ["2026-10-16T20:11", "them", "text", t("just wanted to hear your voice")],
  ["2026-10-16T20:12", "them", "text", t("I know you're busy. no pressure ❤️")],
  ["2026-10-18T13:20", "them", "text", t("made your favorite dal today. wish you were here")],
  ["2026-10-18T13:20", "them", "photo", { imageId: "dal" }],
  ["2026-10-18T13:22", "them", "text", t("I put some in the freezer for when you come home")],
  // the default one screen
  ["2026-10-21T21:15", "them", "missed-call", missed],
  ["2026-10-21T21:17", "them", "text", t("call me when you can ❤️")],
  ["2026-10-21T21:40", "them", "text", t("haven't heard from you in a bit")],
  ["2026-10-23T19:46", "them", "text", t("did you eat?")],
  ["2026-10-23T19:48", "them", "text", t("can you call me this weekend? even 5 minutes")],
  ["2026-10-23T23:36", "me", "text", read("k")],
  ["2026-10-24T18:01", "them", "missed-call", missed],
  ["2026-10-24T18:04", "them", "missed-call", missed],
  ["2026-10-24T18:05", "them", "text", t("just wanted to hear your voice")],
  ["2026-10-24T21:02", "them", "text", t("I love you beta")],
]);

/** STATE 2 · SARAH ❤️🤍 · Messages. */
export const SARAH_SEED: Message[] = build("sarah", [
  ["2026-10-10T12:31", "them", "text", t("still on for barton springs today?")],
  ["2026-10-10T12:31", "them", "text", t("I packed the good snacks 🙂")],
  ["2026-10-10T15:47", "them", "text", t("ok I guess not")],
  ["2026-10-10T15:47", "them", "text", t("are you okay?")],
  ["2026-10-13T22:58", "them", "text", t("goodnight 🤍")],
  ["2026-10-15T23:20", "them", "text", t("I miss your voice. can we facetime tomorrow?")],
  [
    "2026-10-18T00:47",
    "them",
    "text",
    t(
      "I keep thinking about the night the bus never came and it started pouring and you gave me your hoodie and we split that gas station honey bun on the curb. you used to text me goodnight every single night. I'm not mad. I just miss you so much it scares me.",
    ),
  ],
  ["2026-10-18T00:47", "them", "text", t("I don't know what I did")],
  ["2026-10-21T20:15", "them", "text", t("we haven't really hung out in almost three weeks")],
  ["2026-10-23T01:12", "them", "text", t("I really miss you")],
  ["2026-10-24T21:41", "them", "text", t("please just say something")],
]);

/** STATE 3 · MICHAEL (Best Friend) · Instagram DM. */
export const MICHAEL_SEED: Message[] = build("michael", [
  ["2026-09-19T23:12", "them", "reel", { reelId: "dormlife" }],
  ["2026-09-19T23:12", "them", "text", t("this is so us lmao")],
  ["2026-09-19T23:14", "me", "text", t("LMAOOO")],
  ["2026-09-19T23:14", "me", "text", { text: "literally last night", receipt: "seen" }],
  ["2026-09-30T16:40", "them", "reel", { reelId: "goldenhour" }],
  ["2026-09-30T16:41", "them", "text", t("bro??")],
  ["2026-10-09T01:07", "them", "photo", { imageId: "sunrise-290" }],
  [
    "2026-10-09T01:07",
    "them",
    "text",
    t("one year ago today. the night we ran out of gas on 290 and just watched the sunrise 🌅"),
  ],
  ["2026-10-09T01:08", "them", "text", t("we need to do that again")],
  ["2026-10-18T19:26", "them", "reel", { reelId: "recleague" }],
  ["2026-10-18T19:26", "them", "text", t("you alive lol")],
  ["2026-10-24T21:41", "them", "text", t("hey bro I miss you, haven't talked in a while… is everything ok?")],
]);

/**
 * WhatsApp background chats (Phase 2 ROUTES: "then Fam, Roommates, Marfa Trip").
 * COPY NEEDED: their last messages are not written; the rows show media-only previews.
 */
export const FAM_SEED: Message[] = build("fam", [
  ["2026-10-23T12:18", "them", "photo", { sender: "dad", imageId: "kitchen" }],
]);
export const ROOMMATES_SEED: Message[] = build("roommates", [
  ["2026-10-22T16:05", "them", "voice", { duration: "0:21" }],
]);
export const MARFA_SEED: Message[] = build("marfa", [
  ["2026-10-11T09:52", "them", "photo", { imageId: "lake" }],
]);

export const SEEDS: Record<ThreadId, Message[]> = {
  mom: MOM_SEED,
  sarah: SARAH_SEED,
  michael: MICHAEL_SEED,
  fam: FAM_SEED,
  roommates: ROOMMATES_SEED,
  marfa: MARFA_SEED,
};

export const THREAD_META: Record<ThreadId, Omit<Thread, "messages" | "draft" | "keyboard" | "theirTyping">> = {
  mom: { id: "mom", app: "whatsapp", contactId: "mom", unread: 3, presence: "online" },
  sarah: { id: "sarah", app: "messages", contactId: "sarah", unread: 1, presence: "offline" },
  michael: { id: "michael", app: "instagram", contactId: "michael", unread: 1, presence: "active" },
  fam: { id: "fam", app: "whatsapp", contactId: "fam", unread: 0, presence: "offline" },
  roommates: { id: "roommates", app: "whatsapp", contactId: "roommates", unread: 0, presence: "offline" },
  marfa: { id: "marfa", app: "whatsapp", contactId: "marfa", unread: 0, presence: "offline" },
};

// ---------------------------------------------------------------------------
// Header numbers, presence labels, scripts, predictions
// ---------------------------------------------------------------------------

/** The back-button counts in each header: WhatsApp "3", Messages blue pill "8". */
export const BACK_COUNT: Partial<Record<ThreadId, number>> = { mom: 3, sarah: 8 };

export const PRESENCE_LABEL = {
  whatsapp: "online",
  instagram: "Active now",
} as const;

/** Tapping a missed-call row (WHATSAPP CALLS). */
export const CALL_SHEET = { voice: "Voice call", video: "Video call", cancel: "Cancel" } as const;

/** Missed-call row sub-line (Phase 2 CHROME SPECS). */
export const MISSED_CALL_SUB = "Tap to call back";

/** "Seen" under Mom's last bubble (story annotation; RECEIPTS). */
export const SEEN_LABEL = "Seen";

/** What he types in each thread (STORYBOARD ACTION). */
export const TYPED_SCRIPT: Record<"mom" | "sarah" | "michael", string> = {
  mom: "love you too",
  sarah: "i just don't feel like talking rn",
  michael: "im good bro just tired",
};

/** Predictive bar while typing (word for word). */
export const SCRIPT_PREDICTIONS: Record<"mom" | "sarah" | "michael", [string, string, string]> = {
  mom: ["too", "to", "you"],
  sarah: ["rn", "right", "now"],
  michael: ["tired", "tbh", "bro"],
};

/** iMessage: her typing dots after "Read" (per-thread flag; default on for Sarah only). */
export const TYPING_AFTER_READ: Partial<Record<ThreadId, boolean>> = { sarah: true };

/** Composer placeholders (chrome). */
export const COMPOSER_PLACEHOLDER = {
  messages: "iMessage",
  instagram: "Message…",
} as const;

// ---------------------------------------------------------------------------
// Banners (Phase 2 STATE 2-4) and calls
// ---------------------------------------------------------------------------

export type BannerId = "sarah" | "michael" | "unsaid";

export const BANNERS: Record<BannerId, { app: AppId | "unsaid"; threadId: ThreadId | null; title: string; body: string }> = {
  sarah: { app: "messages", threadId: "sarah", title: "Sarah ❤️🤍", body: "please just say something" },
  michael: {
    app: "instagram",
    threadId: "michael",
    title: "Michael (Best Friend)",
    body: "hey bro I miss you, haven't talked in a while… is everything ok?",
  },
  unsaid: {
    app: "unsaid",
    threadId: null,
    title: "Un-Said",
    // copy A (section 3 row 6); copy B and C are COPY NEEDED
    body: "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?",
  },
};

export const BANNER_TIME = "now";

/** WhatsApp quick replies on an incoming call (WHATSAPP CALLS). */
export const QUICK_REPLIES = [
  "Can't talk now. What's up?",
  "I'll call you right back.",
  "I'll call you later.",
  "Can't talk now. Call me later?",
  "Custom message…",
] as const;

export type CallRow = {
  id: string;
  with: PersonId;
  kind: "voice" | "video";
  direction: "missed" | "incoming" | "outgoing";
  at: string;
  count?: number;
};

/** Calls tab "Recent", newest first: matches the missed-call rows in Mom's thread exactly. */
export const WA_CALLS: CallRow[] = [
  { id: "c1", with: "mom", kind: "voice", direction: "missed", at: "2026-10-24T18:04" },
  { id: "c2", with: "mom", kind: "voice", direction: "missed", at: "2026-10-24T18:01" },
  { id: "c3", with: "mom", kind: "voice", direction: "missed", at: "2026-10-21T21:15" },
  { id: "c4", with: "mom", kind: "voice", direction: "missed", at: "2026-10-16T20:09", count: 2 },
  { id: "c5", with: "mom", kind: "voice", direction: "missed", at: "2026-10-12T19:30" },
];

/** Canned replies for ?replies=on testing and the Phase 6 dev buttons: COPY NEEDED (Gurneal). */
export const REPLIES: Partial<Record<ThreadId, string | null>> = { sarah: null, michael: null };
