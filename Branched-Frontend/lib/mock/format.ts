/**
 * lib/mock/format.ts: each app's own date/time label rules, relative to the mock NOW
 * (Phase 2 THE SCRIPTS: "Date labels follow each app's own rules relative to NOW").
 */
import { NOW, asTime, type MockTime } from "./clock";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type T = MockTime | string;

function dayNumber(t: MockTime): number {
  return Date.UTC(t.y, t.mo - 1, t.d) / 86400000;
}

/** Calendar days between t and now (0 = same day, 1 = yesterday). */
export function daysAgo(t: T, now: T = NOW): number {
  return dayNumber(asTime(now)) - dayNumber(asTime(t));
}

export function weekday(t: T): string {
  const v = asTime(t);
  return WEEKDAYS[new Date(Date.UTC(v.y, v.mo - 1, v.d)).getUTCDay()];
}

const shortWeekday = (t: T) => weekday(t).slice(0, 3);
const monthDay = (t: MockTime) => `${MONTHS[t.mo - 1]} ${t.d}`;

/** "9:02 PM" */
export function time12(t: T): string {
  const v = asTime(t);
  const h = v.h % 12 === 0 ? 12 : v.h % 12;
  return `${h}:${String(v.mi).padStart(2, "0")} ${v.h < 12 ? "AM" : "PM"}`;
}

/** WhatsApp date pill: Today / Yesterday / weekday within 7 days / "Sat, Oct 10". */
export function waDatePill(t: T, now: T = NOW): string {
  const n = daysAgo(t, now);
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  if (n > 1 && n < 7) return weekday(t);
  return `${shortWeekday(t)}, ${monthDay(asTime(t))}`;
}

/** WhatsApp bubble time: "9:02 PM". */
export const waTime = time12;

/** WhatsApp chat-list / calls-list time: "9:02 PM" / "Yesterday" / "Wednesday" / "10/16/26". */
export function waListTime(t: T, now: T = NOW): string {
  const n = daysAgo(t, now);
  if (n === 0) return time12(t);
  if (n === 1) return "Yesterday";
  if (n > 1 && n < 7) return weekday(t);
  const v = asTime(t);
  return `${v.mo}/${v.d}/${String(v.y).slice(2)}`;
}

/** iMessage timestamp, split so the day reads semibold: { day: "Sunday", time: "12:47 AM" }. */
export function imsgStampParts(t: T, now: T = NOW): { day: string; time: string } {
  const n = daysAgo(t, now);
  const time = time12(t);
  if (n === 0) return { day: "Today", time };
  if (n === 1) return { day: "Yesterday", time };
  if (n > 1 && n < 7) return { day: weekday(t), time };
  return { day: `${shortWeekday(t)}, ${monthDay(asTime(t))}`, time: `at ${time}` };
}

/** "Today 9:41 PM", "Yesterday 1:12 AM", "Sunday 12:47 AM", "Sat, Oct 10 at 12:31 PM". */
export function imsgStamp(t: T, now: T = NOW): string {
  const p = imsgStampParts(t, now);
  return `${p.day} ${p.time}`;
}

/** Instagram DM timestamp: "Today 9:41 PM", "Sun 7:26 PM", "Sep 19, 11:12 PM". */
export function igStamp(t: T, now: T = NOW): string {
  const n = daysAgo(t, now);
  if (n === 0) return `Today ${time12(t)}`;
  if (n > 0 && n < 7) return `${shortWeekday(t)} ${time12(t)}`;
  return `${monthDay(asTime(t))}, ${time12(t)}`;
}

/** Short relative day under a reel card: "Today", "Sun", "Wed", else "Sep 30". */
export function relativeDay(t: T, now: T = NOW): string {
  const n = daysAgo(t, now);
  if (n === 0) return "Today";
  if (n > 0 && n < 7) return shortWeekday(t);
  return monthDay(asTime(t));
}

/** Minutes between two times (b - a). */
export function minutesBetween(a: T, b: T): number {
  const x = asTime(a);
  const y = asTime(b);
  return (Date.UTC(y.y, y.mo - 1, y.d, y.h, y.mi) - Date.UTC(x.y, x.mo - 1, x.d, x.h, x.mi)) / 60000;
}

export function sameDay(a: T, b: T): boolean {
  return daysAgo(a, b) === 0;
}
