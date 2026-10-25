// Client for the Un-Said backend in ../backend (FastAPI). Shapes mirror backend/README.md.
import { Platform } from "react-native";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
export const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY ?? "";

export type Channel = "self" | "whatsapp" | "imessage" | "instagram";

export type Person = {
  id: string;
  name: string;
  relation: string;
  pronoun: "her" | "him" | "them";
  channel: Channel;
  has_handle: boolean;
  timezone: string;
  local_time: string;
  is_asleep: boolean;
  time_label: string;
  morning: string;
  language?: string;
};

export type Piece = {
  id: string;
  person_id: string;
  text: string;
  tone: string;
  created_at: string;
  rant_id: string | null;
  has_audio: boolean;
  audio_url?: string | null; // his own voice for this line; play with authedUrl()
  status?: "kept" | "in_card" | "discarded";
};

/** What he had said about this person before this rant. */
export type History = { earlier_count: number; first_at: string | null; last_spoken_at: string | null };

export type SortGroup = {
  person: Person;
  pieces: Piece[];
  kept_total: number;
  tone: string;
  reflection: string;
  history?: History;
  /** "Tell them how you feel. Communication helps." on at most one card, rarely. */
  encourage?: string | null;
};

export type Resource = { name: string; detail: string; links: { label: string; href: string }[] };

export type Rant = { id: string; transcript: string; provider: string; sorted_by: string | null; asset_id?: string | null };

/** What a gallery photo is about, learned only from what he said while looking at it. */
export type PhotoMemory = {
  asset_id: string;
  people: { person: Person; times: number; letters: number; first_at: string; last_at: string; kept: number }[];
  previous: (Piece & { person_name: string; day: string })[];
  kept_by_person: Record<string, number>;
};

export type SortResult = {
  rant: Rant;
  safety: "ok" | "self_harm" | "harm_to_others" | "abuse_or_control";
  resources: Resource[];
  groups: SortGroup[];
  self_note: { id: string; url: string } | null;
};

/** The server's answer to "may Un-Said knock on this photo now?" Almost always no. */
export type KnockDecision =
  | { knock: false; reason: string }
  | {
      knock: true;
      id: string;
      kind: "reply" | "linked" | "first";
      title: string;
      body: string;
      person_id: string | null;
      person_name: string | null;
      reason: string;
    };

export type AttentionOutcome = "opened" | "dismissed" | "ignored";

export type Settings = {
  knock_mode: "gentle" | "off" | "demo";
  quiet_start: string; // his quiet hours, HH:MM in his time zone
  quiet_end: string;
  push_enabled: boolean;
  permission_asked: boolean;
};

export type Share = { url: string; text?: string; whatsapp?: string; sms_ios?: string; sms_android?: string; instagram?: string };

export type Card = {
  id: string;
  recipient_id: string;
  recipient_name: string;
  lines: { text: string; created_at: string }[];
  status: "held" | "releasing" | "ready" | "released" | "revoked";
  release_label: string | null;
  delivered_via: string | null;
  audio_url: string | null;
  /** A video he attached (POST /api/cards/{id}/video); her card page plays it. */
  video_url?: string | null;
  share?: Share;
  /** /api/home, held letters that will need his tap: when the app may remind him, and what it says. */
  remind_at?: string;
  remind_body?: string;
  release_at?: string | null;
  /** When it went out (demo clock); Home shows a short "Delivered" beat right after. */
  released_at?: string | null;
  created_at?: string;
};

export type Reply = {
  id: string;
  from_person_id: string;
  from_name: string;
  audio_url: string | null;
  transcript: string;
  translation: string | null;
  day: string;
  created_at: string;
  heard_at: string | null;
  /** "Keep this moment": kept in his private vault. */
  kept_at?: string | null;
};

export type Reminder = { id: string; person_id: string; person_name: string; channel: Channel; text: string; handoff: string | null };

export type LanePhoto = { id: string; person_id: string; url: string; caption: string; taken_at: string | null };

/** GET /api/people/groups: who each person is to him, and the photos he has given them (no face recognition). */
export type PeopleGroup = "mom" | "dad" | "brother" | "sister" | "best_friend" | "partner" | "other";
export type PersonPhotos = { person: Person; group: PeopleGroup; family: boolean; photos: LanePhoto[]; asset_ids: string[] };
export type PeopleGroups = { groups: PeopleGroup[]; has_family: boolean; people: PersonPhotos[] };

export type Nudge = { kind: "reply" | "ready"; id: string; person_id: string; title: string; body: string };

export type SelfNote = { id: string; url: string; created_at: string; mime?: string; label?: string; duration_ms?: number | null };

/** Compose "ONLY A DRAFT": one private draft per person. */
export type Draft = { person_id: string; text: string; updated_at: string };

export type PhotoSource = "photos" | "instagram" | "facebook";
/** Connect photos, demo build: imported photos arrive already put into groups; nothing is linked until he says. */
export type FaceCluster = {
  id: string;
  suggested: Person | null;
  linked_person_id: string | null;
  count: number;
  sources: string[];
  photos: LanePhoto[];
};
export type Faces = { clusters: FaceCluster[]; pending: string[]; dismissed: boolean };

export type Home = {
  me: Person;
  people: Person[];
  cards: Card[];
  replies: Reply[];
  reminders: Reminder[];
  self_notes: SelfNote[];
  photos?: LanePhoto[];
  nudges?: Nudge[];
  providers: { spark: string; transcribe: string; whatsapp: string };
  clock: { now: string };
};

export const mediaUrl = (path: string | null) => (path ? `${API_URL}${path}` : null);

/** For /api URLs played or loaded outside fetch (audio players): the key rides in the query. */
export const authedUrl = (path: string | null | undefined) =>
  path ? `${API_URL}${path}${APP_KEY ? `${path.includes("?") ? "&" : "?"}key=${encodeURIComponent(APP_KEY)}` : ""}` : null;

const norm = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** The letter's lines: a piece that only repeats another (same words, or contained in a longer one) is
 *  dropped, so a seeded line and a later rant saying the same thing don't read twice. The backend
 *  builds the card with the same rule (backend/app/delivery.py letter_lines). */
export function letterLines(pieces: Pick<Piece, "text">[]): string[] {
  const keys = pieces.map((p) => norm(p.text));
  return pieces
    .filter((_, i) => {
      const k = keys[i];
      if (!k) return false;
      return !keys.some((other, j) => j !== i && other.includes(k) && (other.length > k.length || j < i));
    })
    .map((p) => p.text);
}

export function wsUrl(path: string) {
  const base = API_URL.replace(/^http/, "ws");
  return `${base}${path}${APP_KEY ? `?key=${encodeURIComponent(APP_KEY)}` : ""}`;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...(APP_KEY ? { "X-App-Key": APP_KEY } : {}), ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {}
    throw new Error(String(detail));
  }
  return res.json() as Promise<T>;
}

const post = (body?: unknown): RequestInit =>
  body === undefined
    ? { method: "POST" }
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };

// React Native's FormData takes {uri, name, type} for files.
const file = (uri: string, name: string, type: string) => ({ uri, name, type }) as unknown as Blob;

export const api = {
  home: () => call<Home>("/api/home"),
  safetyResources: () => call<Resource[]>("/api/safety/resources"),
  patchPerson: (
    personId: string,
    changes: { timezone?: string; morning?: string; language?: string; channel?: Exclude<Channel, "self"> },
  ) =>
    call<Person>(`/api/people/${personId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    }),

  // assetId: the gallery photo he was looking at, so the photo remembers what he said.
  uploadRant: (wavUri: string, assetId?: string | null) => {
    const form = new FormData();
    form.append("file", file(wavUri, "rant.wav", "audio/wav"));
    if (assetId) form.append("asset_id", assetId);
    return call<Rant>("/api/rants/audio", { method: "POST", body: form });
  },
  typedRant: (text: string, assetId?: string | null) => call<Rant>("/api/rants/text", post({ text, asset_id: assetId ?? null })),
  // personId: Talk was opened from this person's page; words that name nobody are filed under them.
  sortRant: (rantId: string, personId?: string | null) =>
    call<SortResult>(`/api/rants/${rantId}/sort`, personId ? post({ person_id: personId }) : post()),

  peopleGroups: () => call<PeopleGroups>("/api/people/groups"),
  pieces: (personId: string) => call<Piece[]>(`/api/people/${personId}/pieces`),

  memory: (assetId: string) => call<PhotoMemory>(`/api/memory/photo?asset_id=${encodeURIComponent(assetId)}`),

  uploadPhoto: (jpegUri: string, personId: string, caption = "", assetId?: string | null) => {
    const form = new FormData();
    form.append("file", file(jpegUri, "photo.jpg", "image/jpeg"));
    form.append("person_id", personId);
    form.append("caption", caption);
    if (assetId) form.append("asset_id", assetId);
    return call<{ id: string }>("/api/photos", { method: "POST", body: form });
  },

  createCard: (recipientId: string, pieceIds: string[], when: "her_morning" | "now", photoId?: string | null) =>
    call<Card>("/api/cards", post({ recipient_id: recipientId, piece_ids: pieceIds, when, photo_id: photoId ?? null })),
  markShared: (cardId: string) => call<Card>(`/api/cards/${cardId}/shared`, post()),
  uploadCardVideo: async (cardId: string, uri: string, mime: string) => {
    const ext = mime === "video/quicktime" ? "mov" : mime === "video/webm" ? "webm" : "mp4";
    const form = new FormData();
    if (Platform.OS === "web") {
      // On web the picker hands back a blob: URL; FormData needs the actual bytes.
      const blob = await (await fetch(uri)).blob();
      form.append("file", new Blob([blob], { type: mime }), `video.${ext}`);
    } else {
      form.append("file", file(uri, `video.${ext}`, mime));
    }
    return call<Card>(`/api/cards/${cardId}/video`, { method: "POST", body: form });
  },
  revoke: (cardId: string) => call<Card>(`/api/cards/${cardId}/revoke`, post()),

  heard: (replyId: string) => call<Reply>(`/api/replies/${replyId}/heard`, post()),
  keepReply: (replyId: string) => call<Reply>(`/api/replies/${replyId}/keep`, post()),

  // Compose
  drafts: () => call<Draft[]>("/api/drafts"),
  saveDraft: (personId: string, text: string) =>
    call<Draft>(`/api/drafts/${personId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }),
  writePieces: (personId: string, text: string, replaces: string[] = []) =>
    call<Piece[]>(`/api/people/${personId}/pieces`, post({ text, replaces })),

  // Self note (a short video to himself, "for the next hard day")
  uploadSelfNote: async (uri: string, mime: string, durationMs?: number | null) => {
    const ext = mime === "video/quicktime" ? "mov" : mime === "video/webm" ? "webm" : "mp4";
    const form = new FormData();
    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob();
      form.append("file", new Blob([blob], { type: mime }), `note.${ext}`);
    } else {
      form.append("file", file(uri, `note.${ext}`, mime));
    }
    if (durationMs) form.append("duration_ms", String(Math.round(durationMs)));
    return call<SelfNote>("/api/self-notes", { method: "POST", body: form });
  },

  // Connect photos (demo import) and the face groups
  connectState: () => call<{ connected: Record<PhotoSource, boolean> }>("/api/connect"),
  connect: (source: PhotoSource) =>
    call<{ connected: Record<PhotoSource, boolean>; added: number; pending: FaceCluster[] }>(`/api/connect/${source}`, post()),
  faces: () => call<Faces>("/api/faces"),
  linkFaces: (clusterId: string, personId: string) =>
    call<{ linked: number }>(`/api/faces/${clusterId}/link`, post({ person_id: personId })),
  notThem: (photoId: string) => call<{ ok: boolean }>(`/api/faces/photos/${photoId}/not-them`, post()),
  dismissFaces: () => call<{ ok: boolean }>("/api/faces/dismiss", post()),
  reminderDone: (id: string) => call<{ ok: boolean }>(`/api/reminders/${id}/done`, post()),

  // The attention budget (backend/app/attention.py decides; the app only asks).
  knockCheck: (body: { asset_id: string; dwell_ms: number; zoomed: boolean; revisit: boolean; session_id: string }) =>
    call<KnockDecision>("/api/knock/check", post(body)),
  attentionOutcome: (id: string, outcome: AttentionOutcome) =>
    call<{ ok: boolean }>(`/api/attention/${id}/outcome`, post({ outcome })),
  settings: () => call<Settings>("/api/settings"),
  patchSettings: (changes: Partial<Omit<Settings, "permission_asked">>) =>
    call<Settings>("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) }),

  // Push (backend/app/push.py). The token is an ExponentPushToken[...] from a development or store build.
  pushRegister: (token: string, platform: string) =>
    call<{ ok: boolean; active: boolean }>("/api/push/register", post({ token, platform })),
  pushPermission: (granted: boolean) => call<Settings>("/api/push/permission", post({ granted })),
};
