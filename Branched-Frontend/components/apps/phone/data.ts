/**
 * components/apps/phone/data.ts: the Phone app's numbers, call log and contact list.
 *
 * Mom's missed calls come from WA_CALLS (the same five she placed in her thread); the other calls
 * are the rest of the cast. Numbers use the 555-01xx block reserved for fiction.
 */
import { people, type PersonId } from "@/lib/mock/people";
import { WA_CALLS } from "@/lib/mock/threads";
import { daysAgo, weekday } from "@/lib/mock/format";
import { asTime } from "@/lib/mock/clock";

export type Direction = "missed" | "incoming" | "outgoing";

export type Recent = {
  id: string;
  /** a contact, or null for a dialed number that is not saved */
  who: PersonId | null;
  number: string;
  direction: Direction;
  /** ISO local time */
  at: string;
  /** repeated calls folded into one row: "Mom (2)" */
  count?: number;
  /** "4 min 12 sec" (answered calls only) */
  duration?: string;
};

/** Mobile numbers of the people in the Phone app. */
export const NUMBERS: Partial<Record<PersonId, string>> = {
  mom: "(512) 555-0142",
  dad: "(512) 555-0187",
  sarah: "(737) 555-0119",
  michael: "(512) 555-0163",
  priya: "(469) 555-0128",
  nani: "(713) 555-0104",
  masi: "(713) 555-0156",
  omar: "(512) 555-0171",
  ethan: "(512) 555-0135",
  lena: "(737) 555-0148",
  clinic: "(512) 555-0100",
  jess: "(512) 555-0192",
  marcus: "(737) 555-0177",
  ava: "(512) 555-0109",
  dani: "(737) 555-0124",
};

/** Riley's own card at the top of Contacts. */
export const MY_NUMBER = "(512) 555-0110";

const OTHER_CALLS: Recent[] = [
  { id: "p1", who: "michael", number: NUMBERS.michael!, direction: "incoming", at: "2026-10-24T13:22", duration: "4 min 12 sec" },
  { id: "p2", who: "dad", number: NUMBERS.dad!, direction: "outgoing", at: "2026-10-23T17:40", duration: "12 min 3 sec" },
  { id: "p3", who: "sarah", number: NUMBERS.sarah!, direction: "incoming", at: "2026-10-22T23:05", duration: "38 min 20 sec" },
  { id: "p4", who: "priya", number: NUMBERS.priya!, direction: "outgoing", at: "2026-10-20T15:30", duration: "1 min 50 sec" },
  { id: "p5", who: "clinic", number: NUMBERS.clinic!, direction: "incoming", at: "2026-10-19T10:05", duration: "3 min 2 sec" },
  { id: "p6", who: "dad", number: NUMBERS.dad!, direction: "incoming", at: "2026-10-17T19:12", duration: "6 min 41 sec" },
  { id: "p7", who: "ethan", number: NUMBERS.ethan!, direction: "missed", at: "2026-10-15T16:48" },
  { id: "p8", who: "nani", number: NUMBERS.nani!, direction: "outgoing", at: "2026-10-11T11:20", duration: "22 min 9 sec" },
];

/** The call log, newest first. */
export const RECENTS: Recent[] = [
  ...WA_CALLS.map<Recent>((c) => ({
    id: `m-${c.id}`,
    who: c.with,
    number: NUMBERS[c.with] ?? "",
    direction: c.direction,
    at: c.at,
    count: c.count,
  })),
  ...OTHER_CALLS,
].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

/** Missed calls today (the Recents subtitle). */
export const missedToday = (log: Recent[]) => log.filter((r) => r.direction === "missed" && daysAgo(r.at) === 0).reduce((n, r) => n + (r.count ?? 1), 0);

/** Recents day header: "Today", "Yesterday", "Wednesday", "October 16". */
export function dayLabel(at: string): string {
  const n = daysAgo(at);
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  if (n > 1 && n < 7) return weekday(at);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const t = asTime(at);
  return `${MONTHS[t.mo - 1]} ${t.d}`;
}

/** Contacts: everyone in the cast with a number, A-Z. */
export const CONTACTS: PersonId[] = (Object.keys(NUMBERS) as PersonId[]).sort((a, b) =>
  people[a].name.localeCompare(people[b].name),
);

export const nameOf = (r: { who: PersonId | null; number: string }) => (r.who ? people[r.who].name : r.number);

/** The letters under the keypad digits. */
export const KEYPAD: { digit: string; letters: string }[] = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

const digitsOf = (s: string) => s.replace(/\D/g, "");

/** US formatting while dialing: "512", "555-0142", "(512) 555-0142"; anything else stays raw. */
export function formatDial(raw: string): string {
  if (/[^0-9]/.test(raw) || raw.length > 10) return raw;
  if (raw.length <= 3) return raw;
  if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
}

/** The contact whose number contains what was dialed (3+ digits), for the keypad's suggestion. */
export function matchContact(raw: string): PersonId | null {
  const d = digitsOf(raw);
  if (d.length < 3) return null;
  return CONTACTS.find((id) => digitsOf(NUMBERS[id] ?? "").includes(d)) ?? null;
}

/** The contact a dialed number belongs to exactly. */
export function contactFor(raw: string): PersonId | null {
  const d = digitsOf(raw);
  return CONTACTS.find((id) => digitsOf(NUMBERS[id] ?? "") === d) ?? null;
}
