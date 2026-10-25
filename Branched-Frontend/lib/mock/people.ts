/**
 * lib/mock/people.ts: the cast (CLAUDE_PROMPT.md section 2; App-UI-Final COPY_AND_NAMES.md section 1).
 * Names are Gurneal's and fixed. Avatars are our own illustrations in public/mock/.
 */

export type PersonId =
  | "riley"
  | "mom"
  | "dad"
  | "sarah"
  | "michael"
  | "fam"
  | "roommates"
  | "marfa"
  | "goldenhour"
  | "recleague"
  | "dormlife"
  // background chats that fill each inbox under the main threads
  | "priya"
  | "nani"
  | "masi"
  | "omar"
  | "studygroup"
  | "soccer"
  | "ethan"
  | "lena"
  | "clinic"
  | "jess"
  | "marcus"
  | "ava"
  | "dani"
  | "outdoors";

export type Person = {
  id: PersonId;
  /** shown as, word for word */
  name: string;
  avatar: string;
  /** Instagram handle (profile peek / reel cards only) */
  handle?: string;
  /** IANA zone (Mom: section 3 row 10, America/Chicago like Riley) */
  tz?: string;
  group?: boolean;
};

const avatar = (id: string) => `/mock/avatar-${id}.svg`;

export const people: Record<PersonId, Person> = {
  riley: { id: "riley", name: "Riley", avatar: avatar("riley") },
  mom: { id: "mom", name: "Mom", avatar: avatar("mom"), tz: "America/Chicago" },
  dad: { id: "dad", name: "Dad", avatar: avatar("dad") },
  sarah: { id: "sarah", name: "Sarah ❤️🤍", avatar: avatar("sarah") },
  michael: { id: "michael", name: "Michael (Best Friend)", avatar: avatar("michael"), handle: "michael.ortiz" },
  // WhatsApp background chats (Phase 2 ROUTES: "then Fam, Roommates, Marfa Trip")
  fam: { id: "fam", name: "Fam", avatar: avatar("fam"), group: true },
  roommates: { id: "roommates", name: "Roommates", avatar: avatar("roommates"), group: true },
  marfa: { id: "marfa", name: "Marfa Trip", avatar: avatar("marfa"), group: true },
  // reel posters (Michael's thread, Reels viewer)
  goldenhour: { id: "goldenhour", name: "goldenhour.pups", handle: "goldenhour.pups", avatar: avatar("goldenhour") },
  recleague: { id: "recleague", name: "rec.league.legends", handle: "rec.league.legends", avatar: avatar("recleague") },
  dormlife: { id: "dormlife", name: "dormlife.tx", handle: "dormlife.tx", avatar: avatar("dormlife") },
  // background chats under the main threads (avatars: scripts/make-mock-avatars.py)
  priya: { id: "priya", name: "Priya", avatar: avatar("priya") },
  nani: { id: "nani", name: "Nani ❤️", avatar: avatar("nani") },
  masi: { id: "masi", name: "Neha Masi", avatar: avatar("masi") },
  omar: { id: "omar", name: "Omar", avatar: avatar("omar") },
  studygroup: { id: "studygroup", name: "CH 301 Study Group", avatar: avatar("studygroup"), group: true },
  soccer: { id: "soccer", name: "IM Soccer ⚽️", avatar: avatar("soccer"), group: true },
  ethan: { id: "ethan", name: "Ethan", avatar: avatar("ethan") },
  lena: { id: "lena", name: "Lena (Lab Partner)", avatar: avatar("lena") },
  clinic: { id: "clinic", name: "UT Health Austin", avatar: avatar("clinic") },
  jess: { id: "jess", name: "Jess Nguyen", handle: "jess.nguyenn", avatar: avatar("jess") },
  marcus: { id: "marcus", name: "Marcus Webb", handle: "marcus.webb_", avatar: avatar("marcus") },
  ava: { id: "ava", name: "Ava Lopez", handle: "avalopez.atx", avatar: avatar("ava") },
  dani: { id: "dani", name: "Dani Reyes", handle: "dani.reyes", avatar: avatar("dani") },
  outdoors: { id: "outdoors", name: "UT Outdoors Club", handle: "ut.outdoorsclub", avatar: avatar("outdoors") },
};

export function person(id: PersonId): Person {
  return people[id];
}
