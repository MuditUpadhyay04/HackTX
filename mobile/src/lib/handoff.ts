// The hallway rule: Un-Said never shows a chat. Every send leaves through the person's real app.
import * as Clipboard from "expo-clipboard";
import { Linking, Platform } from "react-native";

import type { Card, Channel } from "./api";

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
