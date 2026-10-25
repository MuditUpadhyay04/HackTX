// "Try Un-Said": the web build judges open from a QR code on their own phones (EXPO_PUBLIC_TRY_MODE=1).
// Each browser gets its own sandbox on the server, keyed by a random guest id kept in localStorage.
// Nothing here runs in the Expo app on the Fold, where the flag is off.

export const TRY_MODE = process.env.EXPO_PUBLIC_TRY_MODE === "1";

const ID_KEY = "unsaid.try.guest";
const OK_KEY = "unsaid.try.accepted";

let memoryId: string | null = null; // when storage is blocked (private mode), the sandbox lasts this visit
let memoryOk = false;

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function read(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    const s = storage();
    if (!s) return;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {}
}

function newId(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** This browser's sandbox id: 32 lowercase hex characters. */
export function guestId(): string {
  const stored = read(ID_KEY);
  if (stored && /^[0-9a-f]{32}$/.test(stored)) return stored;
  if (!memoryId) memoryId = newId();
  write(ID_KEY, memoryId);
  return memoryId;
}

export function accepted(): boolean {
  return memoryOk || read(OK_KEY) === "1";
}

export function accept() {
  memoryOk = true;
  write(OK_KEY, "1");
  guestId();
}

/** "Delete my data": forget this sandbox. The server deletes it within 24 hours; the next visit starts fresh. */
export function forgetMe() {
  memoryId = null;
  memoryOk = false;
  write(ID_KEY, null);
  write(OK_KEY, null);
}

/** The server rejected the id (400): start a fresh sandbox, still accepted. */
export function newGuestId(): string {
  memoryId = newId();
  write(ID_KEY, memoryId);
  return memoryId;
}

/** Screens a guest may open. Everything else (sending, Letters, Connect, settings, demo controls) is off. */
const ALLOWED = [/^\/$/, /^\/privacy$/, /^\/gallery$/, /^\/photo\//, /^\/talk$/, /^\/pile\//, /^\/preview$/, /^\/safety$/];

export const tryAllows = (pathname: string) => ALLOWED.some((r) => r.test(pathname));
