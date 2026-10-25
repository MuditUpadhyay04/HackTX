import type { Scene } from "./scenes";

/**
 * Phase 2 app scenes (owned by the apps builder); lib/scenes.ts appends them.
 * Every route takes &device=folded (default) and &caret=static (ROUTES AND STATES).
 */
type Row = [id: string, route: string, label: string, query?: Record<string, string>];

const rows = (group: string, phase: number, list: Row[]): Scene[] =>
  list.map(([id, route, label, query]) => ({ id, route, label, group, phase, query }));

export const appScenes: Scene[] = [
  ...rows("WhatsApp", 2, [
    ["mom-read", "/scene/threads/mom", "Mom · read (default)", { state: "read" }],
    ["mom-history", "/scene/threads/mom", "Mom · history", { state: "history" }],
    ["mom-compose-0", "/scene/threads/mom", "Mom · compose, empty", { state: "compose", typed: "0" }],
    ["mom-compose-10", "/scene/threads/mom", "Mom · compose \"love you t\"", { state: "compose", typed: "10" }],
    ["mom-compose-11", "/scene/threads/mom", "Mom · compose \"love you to\"", { state: "compose", typed: "11" }],
    ["mom-compose-12", "/scene/threads/mom", "Mom · compose \"love you too\"", { state: "compose", typed: "12" }],
    ["mom-seen-off", "/scene/threads/mom", "Mom · read, Seen off", { state: "read", seen: "off" }],
    ["mom-off", "/scene/threads/mom", "Mom · display off", { state: "off" }],
    [
      "mom-compose-0-banner-sarah",
      "/scene/threads/mom",
      "Mom · empty field + Sarah banner",
      { state: "compose", typed: "0", banner: "sarah" },
    ],
    ["whatsapp-chats", "/scene/threads/whatsapp-chats", "WhatsApp · Chats"],
  ]),
  ...rows("Messages", 2, [
    ["sarah-read", "/scene/threads/sarah", "Sarah · read (default)", { state: "read" }],
    ["sarah-history", "/scene/threads/sarah", "Sarah · history", { state: "history" }],
    ["sarah-compose-0", "/scene/threads/sarah", "Sarah · compose, empty", { state: "compose", typed: "0" }],
    ["sarah-compose-33", "/scene/threads/sarah", "Sarah · compose, full reply", { state: "compose", typed: "33" }],
    ["sarah-sent", "/scene/threads/sarah", "Sarah · sent (Delivered)", { state: "sent" }],
    ["sarah-read-receipt", "/scene/threads/sarah", "Sarah · Read 9:41 PM", { state: "read-receipt" }],
    ["sarah-typing", "/scene/threads/sarah", "Sarah · typing dots", { state: "typing" }],
    [
      "sarah-read-receipt-banner-michael",
      "/scene/threads/sarah",
      "Sarah · read + Michael banner",
      { state: "read-receipt", banner: "michael" },
    ],
  ]),
  ...rows("Instagram", 2, [
    ["michael-read", "/scene/threads/michael", "Michael · read (default)", { state: "read" }],
    ["michael-history", "/scene/threads/michael", "Michael · history", { state: "history" }],
    ["michael-compose-0", "/scene/threads/michael", "Michael · compose, empty", { state: "compose", typed: "0" }],
    ["michael-compose-11", "/scene/threads/michael", "Michael · compose \"im good bro\"", { state: "compose", typed: "11" }],
    ["michael-compose-22", "/scene/threads/michael", "Michael · compose, full reply", { state: "compose", typed: "22" }],
    ["michael-sent", "/scene/threads/michael", "Michael · sent", { state: "sent" }],
    [
      "michael-sent-banner-unsaid",
      "/scene/threads/michael",
      "Michael · sent + Un-Said banner",
      { state: "sent", banner: "unsaid" },
    ],
  ]),
];
