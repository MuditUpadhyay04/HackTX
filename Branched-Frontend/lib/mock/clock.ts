/**
 * lib/mock/clock.ts: the mock clock (CLAUDE_PROMPT.md section 2, Phase 2 "Mock clock").
 *
 * NOW on Riley's phone is Saturday, Oct 24, 2026, 9:41 PM (America/Chicago). The clock starts at NOW
 * and advances in real time; `?clock=frozen` pins it at 9:41, `?clock=HH:MM` pins it at that time on
 * Oct 24, and the opening (Phase 4) drives it with `setDriven(t)`.
 *
 * This is the ONLY module that reads the real time (Date.now). Every time in the build is a MockTime
 * or an ISO local string "2026-10-24T21:41" (no time zone: everything is Riley's local time).
 */
import { useSyncExternalStore } from "react";

export type MockTime = { y: number; mo: number; d: number; h: number; mi: number };

export const NOW: MockTime = { y: 2026, mo: 10, d: 24, h: 21, mi: 41 };
export const NOW_ISO = "2026-10-24T21:41";

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(t: MockTime): string {
  return `${t.y}-${pad(t.mo)}-${pad(t.d)}T${pad(t.h)}:${pad(t.mi)}`;
}

export function parseISO(s: string): MockTime {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s);
  if (!m) throw new Error(`mock clock: bad time "${s}"`);
  return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] };
}

export function asTime(t: MockTime | string): MockTime {
  return typeof t === "string" ? parseISO(t) : t;
}

/** Minutes since 1970-01-01 00:00 (local wall time, no zone). */
export function toMinutes(t: MockTime | string): number {
  const v = asTime(t);
  return Date.UTC(v.y, v.mo - 1, v.d, v.h, v.mi) / 60000;
}

export function fromMinutes(minutes: number): MockTime {
  const d = new Date(minutes * 60000);
  return {
    y: d.getUTCFullYear(),
    mo: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    mi: d.getUTCMinutes(),
  };
}

/** Status-bar label: "9:41". */
export function clockLabel(t: MockTime): string {
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${h12}:${pad(t.mi)}`;
}

// ---------------------------------------------------------------------------
// The clock store (live / frozen / driven)
// ---------------------------------------------------------------------------

type Mode = "live" | "frozen" | "driven";
type ClockState = { mode: Mode; base: number; startedAt: number };

const NOW_MINUTES = toMinutes(NOW);
let state: ClockState = { mode: "live", base: NOW_MINUTES, startedAt: -1 };
let snapshot = NOW_MINUTES;
const listeners = new Set<() => void>();
let ticker: ReturnType<typeof setInterval> | null = null;

function compute(): number {
  if (state.mode !== "live") return state.base;
  if (state.startedAt < 0) state = { ...state, startedAt: Date.now() };
  return state.base + Math.floor((Date.now() - state.startedAt) / 60000);
}

function emit() {
  const next = compute();
  if (next === snapshot) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

function ensureTicker() {
  if (ticker || typeof window === "undefined") return;
  ticker = setInterval(() => {
    if (state.mode === "live") emit();
  }, 1000);
}

/**
 * Applies the `?clock=` flag: "frozen" pins NOW, "HH:MM" pins that time on Oct 24, null runs live
 * from NOW. Idempotent (calling it again with the same flag keeps the running clock).
 */
let lastFlag: string | null | undefined;
export function configureClock(flag: string | null) {
  if (flag === lastFlag) return;
  lastFlag = flag;
  if (flag === "frozen") state = { mode: "frozen", base: NOW_MINUTES, startedAt: -1 };
  else if (flag && /^\d{2}:\d{2}$/.test(flag)) {
    const [h, mi] = flag.split(":").map(Number);
    state = { mode: "frozen", base: toMinutes({ ...NOW, h, mi }), startedAt: -1 };
  } else state = { mode: "live", base: NOW_MINUTES, startedAt: -1 };
  emit();
}

/** The opening drives the clock: pins it at `t` (receipts and timers are skipped in driven mode). */
export function setDriven(t: MockTime | string | null) {
  if (t === null) {
    state = { mode: "live", base: snapshot, startedAt: -1 };
  } else {
    state = { mode: "driven", base: toMinutes(t), startedAt: -1 };
  }
  emit();
}

export function isDriven(): boolean {
  return state.mode === "driven";
}

/** Current mock time (non-hook; for store actions stamping a sent message). */
export function mockNow(): MockTime {
  return fromMinutes(typeof window === "undefined" ? NOW_MINUTES : compute());
}

export function mockNowISO(): string {
  return toISO(mockNow());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureTicker();
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => NOW_MINUTES;

/** `{ now, minutes, label }`: re-renders when the minute changes. */
export function useMockClock(): { now: MockTime; minutes: number; label: string } {
  const minutes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = fromMinutes(minutes);
  return { now, minutes, label: clockLabel(now) };
}
