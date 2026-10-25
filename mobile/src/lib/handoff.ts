// The hallway rule: Un-Said never shows a chat. Every send leaves through the person's real app.
import * as Clipboard from "expo-clipboard";
import { Linking, Platform } from "react-native";

import type { Card, Channel } from "./api";
import { DEMO_DATA } from "./demo";
import { toast } from "./toast";

export type App = "messages" | "whatsapp" | "instagram" | "facebook";

export const APP_LABEL: Record<App, string> = {
  messages: "Messages",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
};

export const CHANNEL_APP: Record<Exclude<Channel, "self">, App> = {
  whatsapp: "whatsapp",
  imessage: "messages",
  instagram: "instagram",
};

/** The other way: the app he picked in "Change" -> the person's channel, so the pick sticks (PATCH /api/people/{id}). */
export const APP_CHANNEL: Partial<Record<App, Exclude<Channel, "self">>> = {
  whatsapp: "whatsapp",
  messages: "imessage",
  instagram: "instagram",
};

/** Inside the phone mock (Branched-Frontend): the web build runs in an iframe, and the look-alike apps answer. */
function inPhoneMock(): boolean {
  return Platform.OS === "web" && typeof window !== "undefined" && window.parent !== window;
}

function post(message: Record<string, unknown>) {
  window.parent.postMessage(message, "*");
}

/**
 * Demo guard: on the borrowed phone nothing may open the owner's real WhatsApp, Messages or Instagram
 * or touch the clipboard. In the phone mock the parent page gets a message; on a native demo build a
 * toast stands in. Returns true when it handled the hand-off.
 */
function demoHandoff(app: App, text: string): boolean {
  if (inPhoneMock()) {
    post({ type: "unsaid:handoff", app, text });
    return true;
  }
  if (DEMO_DATA) {
    toast(`Opening ${APP_LABEL[app]}…`);
    return true;
  }
  return false;
}

type Who = { id: string; name: string; channel: Channel };

/** "Call on WhatsApp" (Mom is waiting...). Un-Said never places the call; WhatsApp does. */
export async function callPerson(person: Who, url?: string | null) {
  if (inPhoneMock()) return post({ type: "unsaid:call", person: person.id, name: person.name, channel: "whatsapp" });
  if (DEMO_DATA) return toast(`Calling ${person.name} on WhatsApp…`);
  return open(url || "whatsapp://", "https://wa.me/");
}

/** "Reply to Michael on Instagram": opens their app on his side. Un-Said never answers for him. */
export async function openChannel(person: Who, url?: string | null) {
  const app: App = person.channel === "self" ? "messages" : CHANNEL_APP[person.channel];
  if (inPhoneMock()) return post({ type: "unsaid:open", app, person: person.id, name: person.name });
  if (DEMO_DATA) return toast(`Opening ${APP_LABEL[app]}…`);
  const fallback = app === "instagram" ? "instagram://direct-inbox" : app === "whatsapp" ? "whatsapp://" : "sms:";
  return open(url || fallback);
}

/** Any other link out to a person's app (Home's "waiting on you" rows), demo-guarded. */
export async function openLink(app: App, url: string) {
  if (demoHandoff(app, "")) return;
  return open(url);
}

async function open(primary: string, fallback?: string) {
  try {
    await Linking.openURL(primary);
  } catch {
    if (fallback) await Linking.openURL(fallback);
  }
}

/** Opens the chosen app with his words and the letter link ready. He taps Send himself. */
export async function handOff(app: App, card: Card) {
  const share = card.share;
  const url = share?.url ?? "";
  const text = share?.text ?? url;
  if (demoHandoff(app, text)) return;
  switch (app) {
    case "whatsapp":
      return open(share?.whatsapp ?? `whatsapp://send?text=${encodeURIComponent(text)}`, `https://wa.me/?text=${encodeURIComponent(text)}`);
    case "messages": {
      const sms = Platform.OS === "ios" ? share?.sms_ios : share?.sms_android;
      return open(sms ?? `sms:&body=${encodeURIComponent(text)}`);
    }
    case "instagram":
      // Instagram has no way to prefill a DM, so the words go on the clipboard first.
      await Clipboard.setStringAsync(text);
      return open(share?.instagram ?? "instagram://direct-inbox", "https://www.instagram.com/direct/inbox/");
    case "facebook":
      await Clipboard.setStringAsync(text);
      return open("fb-messenger://", "https://www.messenger.com/");
  }
}
