// Client for the Un-Said backend in ../backend (FastAPI). Shapes mirror backend/README.md.

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
};

export type Piece = { id: string; person_id: string; text: string; tone: string; created_at: string; rant_id: string | null; has_audio: boolean };

export type SortGroup = { person: Person; pieces: Piece[]; kept_total: number; tone: string; reflection: string };

export type Resource = { name: string; detail: string; links: { label: string; href: string }[] };

export type Rant = { id: string; transcript: string; provider: string; sorted_by: string | null };

export type SortResult = {
  rant: Rant;
  safety: "ok" | "self_harm" | "harm_to_others" | "abuse_or_control";
  resources: Resource[];
  groups: SortGroup[];
  self_note: { id: string; url: string } | null;
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
  share?: Share;
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
};

export type Reminder = { id: string; person_id: string; person_name: string; channel: Channel; text: string; handoff: string | null };

export type Home = {
  me: Person;
  people: Person[];
  cards: Card[];
  replies: Reply[];
  reminders: Reminder[];
  self_notes: { id: string; url: string; created_at: string }[];
  providers: { spark: string; transcribe: string; whatsapp: string };
  clock: { now: string };
};

export const mediaUrl = (path: string | null) => (path ? `${API_URL}${path}` : null);

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

  uploadRant: (wavUri: string) => {
    const form = new FormData();
    form.append("file", file(wavUri, "rant.wav", "audio/wav"));
    return call<Rant>("/api/rants/audio", { method: "POST", body: form });
  },
  typedRant: (text: string) => call<Rant>("/api/rants/text", post({ text })),
  sortRant: (rantId: string) => call<SortResult>(`/api/rants/${rantId}/sort`, post()),

  pieces: (personId: string) => call<Piece[]>(`/api/people/${personId}/pieces`),

  uploadPhoto: (jpegUri: string, personId: string, caption = "") => {
    const form = new FormData();
    form.append("file", file(jpegUri, "photo.jpg", "image/jpeg"));
    form.append("person_id", personId);
    form.append("caption", caption);
    return call<{ id: string }>("/api/photos", { method: "POST", body: form });
  },

  createCard: (recipientId: string, pieceIds: string[], when: "her_morning" | "now", photoId?: string | null) =>
    call<Card>("/api/cards", post({ recipient_id: recipientId, piece_ids: pieceIds, when, photo_id: photoId ?? null })),
  markShared: (cardId: string) => call<Card>(`/api/cards/${cardId}/shared`, post()),
  revoke: (cardId: string) => call<Card>(`/api/cards/${cardId}/revoke`, post()),

  heard: (replyId: string) => call<Reply>(`/api/replies/${replyId}/heard`, post()),
  reminderDone: (id: string) => call<{ ok: boolean }>(`/api/reminders/${id}/done`, post()),
};
