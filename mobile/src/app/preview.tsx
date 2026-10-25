// Preview letter + "Hold until her morning" (DESIGN_SPEC 3.4 / 3.9).
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip, LetterCard, NavBar, PrimaryPill, styles as ui, T, TextButton } from "../components/ui";
import { api, type Piece } from "../lib/api";
import { type App, handOff } from "../lib/handoff";
import { uploadGalleryPhoto } from "../lib/photos";
import { needsHisTap, useHeadsUpAsk } from "../lib/push";
import { useHome } from "../lib/useHome";
import { color, inset, radius, space } from "../theme/tokens";

const POSSESSIVE = { her: "her", him: "his", them: "their" } as const;

function morningLabel(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export default function Preview() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ person: string; pieces: string; app: App; photo?: string }>();
  const { home } = useHome(30000);
  const person = home?.people.find((p) => p.id === params.person);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [hold, setHold] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [held, setHeld] = useState<string | null>(null);
  // The one notification ask, at the moment it means something: once he's held a letter (lib/push.ts).
  const headsUp = useHeadsUpAsk(person?.name, person && home ? needsHisTap(person, home.providers) : false);

  const ids = useMemo(() => (params.pieces ?? "").split(",").filter(Boolean), [params.pieces]);
  useEffect(() => {
    api.pieces(params.person).then((all) => setPieces(all.filter((p) => ids.includes(p.id)))).catch(() => {});
  }, [params.person, ids]);

  if (!person || !home) return <View style={ui.screen}><NavBar backLabel="Edit" /></View>;

  const holdable = person.channel === "whatsapp";
  const holding = holdable && (hold ?? person.is_asleep);
  const pos = POSSESSIVE[person.pronoun];

  const send = async () => {
    setSending(true);
    try {
      let photoId: string | null = null;
      if (params.photo) {
        try {
          photoId = await uploadGalleryPhoto(params.photo, person.id);
        } catch {
          photoId = null; // the letter still goes without the photo
        }
      }
      const card = await api.createCard(person.id, ids, holding ? "her_morning" : "now", photoId);
      if (card.status === "held") {
        setHeld(card.release_label);
        if (!headsUp.question) setTimeout(() => router.dismissTo("/home"), 1800); // else wait for his answer
        return;
      }
      if (card.status === "released") {
        router.dismissTo("/home");
        return;
      }
      await api.markShared(card.id);
      await handOff(params.app, card);
      router.dismissTo("/home");
    } catch (e) {
      Alert.alert("That didn't send", (e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={ui.screen}>
      <NavBar backLabel="Edit" title={`To ${person.name}`} />
      <ScrollView contentContainerStyle={{ paddingTop: space.s16, paddingBottom: insets.bottom + 160 }}>
        <LetterCard lines={pieces.map((p) => p.text)} signature={home.me.name} />
        <T v="caption" style={{ textAlign: "center", marginTop: space.s16 }}>{`This is how ${person.name} will see it.`}</T>

        {holdable ? (
          <View style={styles.delivery}>
            <T v="rowName">{`${person.name}'s morning`}</T>
            <T v="rowPreview">{`Arrives ${morningLabel(person.morning)} ${pos} time`}</T>
            <Choice featureId="unsend-hold-until-morning" label={`Hold until ${pos} morning`} on={holding} onPress={() => setHold(true)} />
            <Choice label="Send now" on={!holding} onPress={() => setHold(false)} />
          </View>
        ) : null}

        {held ? (
          <View style={{ alignItems: "center", gap: space.s8, marginTop: space.s24 }}>
            <T v="rowName">{`Held for ${person.name}'s morning.`}</T>
            <Chip icon="moon" label={`arrives ${held}`} />
            {headsUp.question ? (
              // Wiring for the one permission ask (lib/push.ts). Copy is proposed; styling is Gurneal's.
              <View style={{ alignItems: "center", marginTop: space.s16 }}>
                <T v="caption" style={{ textAlign: "center" }}>{headsUp.question}</T>
                <View style={{ flexDirection: "row", gap: space.s24 }}>
                  <TextButton label="Yes" tone="text" onPress={() => headsUp.answer(true).finally(() => router.dismissTo("/home"))} />
                  <TextButton label="Not now" onPress={() => headsUp.answer(false).finally(() => router.dismissTo("/home"))} />
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {!held ? (
        <View style={[styles.dock, { paddingBottom: insets.bottom + space.s8 }]}>
          <PrimaryPill featureId="unsend-queue-send" label="Send when they're ready" disabled={sending || pieces.length === 0} onPress={send} />
          <View style={{ alignItems: "center" }}>
            <TextButton label="Keep editing" onPress={() => router.back()} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Choice({ label, on, onPress, featureId }: { label: string; on: boolean; onPress: () => void; featureId?: string }) {
  return (
    <Pressable testID={featureId} onPress={onPress} style={styles.choice}>
      <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={22} color={on ? color.violet : color.text3} />
      <T v="rowName" style={{ color: on ? color.text : color.text2 }}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  delivery: { marginHorizontal: inset.card, marginTop: space.s24, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s4 },
  choice: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s8, marginTop: space.s4 },
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: space.s16, backgroundColor: color.bg },
});
