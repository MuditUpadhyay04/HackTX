// Notifications that don't nag. The backend decides what is worth one (backend/app/push.py): her
// reply, a held letter that needs his tap at her morning, and a rare weekly nudge. This file only
// connects the phone to it.
//
// Remote push needs a development or store build with an EAS projectId (`npx eas-cli init`).
// Expo Go dropped remote push in SDK 53: https://docs.expo.dev/push-notifications/faq/
// So in Expo Go, and in any build without a projectId, the app schedules LOCAL notifications
// instead: one per held letter that will need his tap, at the remind_at /api/home gives it.
// Local notifications work in Expo Go on iOS and Android.
//
// Permission is never asked at launch. It's asked once, right after he holds a letter
// (preview.tsx), and only when there's something we can actually deliver.
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { api, type Card, type Home, type Person } from "./api";

const CHANNEL = "default"; // Android; the backend's pushes name the same one (push.ANDROID_CHANNEL)

const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

/** Remote push can work in this build: not Expo Go, and there's an EAS projectId. */
export const remotePushPossible = !isRunningInExpoGo() && Boolean(projectId);

let granted = false; // the OS permission, as of the last check
let remote = false; // a push token is registered with the backend
let channel: Promise<unknown> | null = null;

/** Mirrors store.needs_his_tap: only WhatsApp with the Cloud API (and her number) goes out by itself. */
export const needsHisTap = (person: Person, providers: Home["providers"]) =>
  !(person.channel === "whatsapp" && providers.whatsapp === "cloud_api" && person.has_handle);

/** Android 13+ won't show the permission prompt until a channel exists. */
function ensureChannel() {
  if (Platform.OS !== "android") return Promise.resolve();
  channel ??= Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Letters",
    importance: AndroidImportance.DEFAULT,
  }).catch(() => (channel = null));
  return channel;
}

async function registerRemote() {
  if (!remotePushPossible || remote) return;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    remote = (await api.pushRegister(data, Platform.OS)).active;
  } catch {
    remote = false; // the local reminders below still cover held letters
  }
}

// ---------------------------------------------------------------- the root layout

const handled = new Set<string>();

function onTap(response: Notifications.NotificationResponse) {
  const { identifier, content } = response.notification.request;
  if (handled.has(identifier)) return;
  handled.add(identifier);
  const data = content.data ?? {};
  // He opened it. That's what keeps the weekly nudge from backing off further.
  if (typeof data.attention_id === "string") api.attentionOutcome(data.attention_id, "opened").catch(() => {});
  // navigate, not push: if he's already on that screen, it isn't stacked twice.
  if (data.kind === "reply" && typeof data.ref_id === "string") router.navigate({ pathname: "/letter/[id]", params: { id: data.ref_id } });
  else if (data.kind === "drift") router.navigate("/talk");
  else router.navigate("/home");
}

/** Foreground rules, taps, and the push token if he already said yes. Never asks for anything. */
export function usePushSetup() {
  useEffect(() => {
    // Web (the local preview build) has no notification taps or push; native behavior is unchanged.
    if (Platform.OS === "web") return;
    // He's already in the app: only a person's reply or a letter that needs him gets a banner, never a sound.
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const kind = notification.request.content.data?.kind;
        const show = kind === "reply" || kind === "ready";
        return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: false, shouldSetBadge: false };
      },
    });
    (async () => {
      await ensureChannel();
      const ok = (await Notifications.getPermissionsAsync()).granted;
      if (ok) await registerRemote();
      granted = ok; // only now, so local reminders never double a push the server will send
    })().catch(() => {});

    const last = Notifications.getLastNotificationResponse(); // the tap that launched the app
    if (last) onTap(last);
    const sub = Notifications.addNotificationResponseReceivedListener(onTap);
    return () => sub.remove();
  }, []);
}

// ---------------------------------------------------------------- the one ask

type Ask = "morning" | "reply" | null;

async function whatToAsk(needsTap: boolean): Promise<Ask> {
  try {
    const [settings, permission] = await Promise.all([api.settings(), Notifications.getPermissionsAsync()]);
    if (settings.permission_asked || !settings.push_enabled || permission.granted || !permission.canAskAgain) return null;
    if (needsTap) return "morning"; // a push in a build that has push; a local reminder in Expo Go
    return remotePushPossible ? "reply" : null; // the letter goes by itself; only her answer is worth a heads-up
  } catch {
    return null;
  }
}

/**
 * The one permission ask, shown once he's held a letter (preview.tsx). It's worked out before he
 * taps send, so the held screen knows whether to wait for his answer.
 */
export function useHeadsUpAsk(name: string | undefined, needsTap: boolean) {
  const [ask, setAsk] = useState<Ask>(null);

  useEffect(() => {
    if (!name) return;
    let alive = true;
    whatToAsk(needsTap).then((next) => {
      if (alive) setAsk(next);
    });
    return () => void (alive = false);
  }, [name, needsTap]);

  const answer = useCallback(async (yes: boolean) => {
    setAsk(null);
    let ok = false;
    try {
      await ensureChannel();
      ok = yes && (await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } })).granted;
    } catch {}
    await api.pushPermission(ok).catch(() => {}); // asked: never again
    if (ok) await registerRemote();
    granted = ok;
  }, []);

  const question =
    ask === "morning"
      ? `Want a quiet heads-up when it's ${name}'s morning?`
      : ask === "reply"
        ? `Want a quiet heads-up when ${name} answers?`
        : null;
  return { question, answer };
}

// ---------------------------------------------------------------- local reminders (Expo Go)

type Reminded = Card & { remind_at: string; remind_body: string };

const scheduled = new Map<string, number>(); // card id -> the device time its reminder is set for
let seeded = false;
let syncing: Promise<void> = Promise.resolve();

/**
 * Without a push token, a held letter that will need his tap gets a local reminder at its
 * remind_at, moved onto the device clock (the server's demo clock may run ahead). Called with
 * every /api/home (useHome). A letter that's no longer held loses its reminder.
 */
export function syncHeldLetterReminders(home: Home) {
  syncing = syncing.then(() => sync(home)).catch(() => {});
  return syncing;
}

async function sync(home: Home) {
  if (!granted) return;
  if (!seeded) {
    seeded = true; // reminders set before the app last closed
    for (const n of await Notifications.getAllScheduledNotificationsAsync()) {
      if (n.identifier.startsWith("held-")) scheduled.set(n.identifier.slice("held-".length), 0);
    }
  }
  // With a push token, the server sends this one itself: no local copies.
  const held = remote ? [] : home.cards.filter((c): c is Reminded => c.status === "held" && !!c.remind_at && !!c.remind_body);
  const ids = new Set(held.map((c) => c.id));
  for (const id of [...scheduled.keys()]) {
    if (ids.has(id)) continue;
    scheduled.delete(id); // sent, cancelled, or released
    await Notifications.cancelScheduledNotificationAsync(`held-${id}`);
  }
  const skew = Date.parse(home.clock.now) - Date.now();
  for (const card of held) {
    const at = Date.parse(card.remind_at) - skew;
    const before = scheduled.get(card.id);
    if (at < Date.now() + 5_000 || (before !== undefined && Math.abs(before - at) < 20_000)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `held-${card.id}`,
      content: { title: "Un-Said", body: card.remind_body, data: { kind: "ready", ref_id: card.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
    scheduled.set(card.id, at);
  }
}
