// Preview letter + "Hold until her morning" (DESIGN_SPEC 3.4 / 3.9).
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Skeleton } from "../components/motion";
import { Chip, LetterCard, NavBar, PrimaryPill, styles as ui, T, TextButton } from "../components/ui";
import { type PickedVideo, VideoAttach } from "../components/video";
import { api, letterLines, type Piece } from "../lib/api";
import { haptics } from "../lib/haptics";
import { type App, handOff } from "../lib/handoff";
import { uploadGalleryPhoto } from "../lib/photos";
import { needsHisTap, useHeadsUpAsk } from "../lib/push";
import { toast } from "../lib/toast";
import { useHome } from "../lib/useHome";
import { SPLIT_MAX, useLayout } from "../lib/useLayout";
import { color, inset, radius, space } from "../theme/tokens";

const POSSESSIVE = { her: "her", him: "his", them: "their" } as const;

function morningLabel(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export default function Preview() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const split = layout.expanded;
  const params = useLocalSearchParams<{ person: string; pieces: string; app: App; photo?: string }>();
  const { home } = useHome(30000);
  const person = home?.people.find((p) => p.id === params.person);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hold, setHold] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [held, setHeld] = useState<string | null>(null);
  const [video, setVideo] = useState<PickedVideo | null>(null);
  // The dock overlays the bottom of the scroll, so the scroll ends one dock-height lower.
  const [dockH, setDockH] = useState(0);
  // The one notification ask, at the moment it means something: once he's held a letter (lib/push.ts).
  const headsUp = useHeadsUpAsk(person?.name, person && home ? needsHisTap(person, home.providers) : false);

  const ids = useMemo(() => (params.pieces ?? "").split(",").filter(Boolean), [params.pieces]);
  useEffect(() => {
    api.pieces(params.person)
      .then((all) => setPieces(all.filter((p) => ids.includes(p.id))))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [params.person, ids]);

  if (!person || !home) {
    return (
      <View style={ui.screen}>
        <NavBar backLabel="Edit" />
        <View style={layout.column()}>
          <Skeleton height={420} r={radius.hero} style={{ marginHorizontal: inset.card, marginTop: space.s16 }} />
        </View>
      </View>
    );
  }

  // Spec 3.9: while they're asleep, Hold is the default (any channel) and he can switch to Send now.
  // Awake: there's nothing to hold for, so the choice is hidden and it goes now.
  const holdable = person.is_asleep;
  const holding = holdable && (hold ?? true);
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
      if (video) {
        // Before the handoff, so the link she opens already plays it.
        try {
          await api.uploadCardVideo(card.id, video.uri, video.mime);
        } catch {
          toast("The video didn't upload. Your letter still goes.");
        }
      }
      if (card.status === "held") {
        haptics.success();
        setHeld(card.release_label);
        if (!headsUp.question) setTimeout(() => router.dismissTo("/home"), 1800); // else wait for his answer
        return;
      }
      // Only skip the handoff when the server actually delivered it (WhatsApp Cloud API).
      // "released" via "share" still needs him to tap Send in the app.
      if (card.status === "released" && card.delivered_via && card.delivered_via !== "share") {
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

  const letter = (
    <>
      {pieces.length || loaded ? (
        <LetterCard compact lines={letterLines(pieces)} signature={home.me.name} />
      ) : (
        <Skeleton height={420} r={radius.hero} style={{ marginHorizontal: inset.card }} />
      )}
      <T v="caption" style={{ textAlign: "center", marginTop: space.s16 }}>{`This is how ${person.name} will see it.`}</T>
    </>
  );

  const choices = (
    <>
      {!held ? <VideoAttach video={video} onChange={setVideo} disabled={sending} /> : null}
      {holdable && !held ? (
        <View style={styles.delivery}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
            <View style={styles.well}>
              <Ionicons name="moon" size={18} color={color.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="rowName">{`${person.name}'s morning`}</T>
              <T v="rowPreview">{`Arrives ${morningLabel(person.morning)} ${pos} time`}</T>
            </View>
          </View>
          <View style={styles.rule} />
          <Choice featureId="unsend-hold-until-morning" label={`Hold until ${pos} morning`} on={holding} onPress={() => setHold(true)} />
          <Choice label="Send now" on={!holding} onPress={() => setHold(false)} />
        </View>
      ) : null}

      {held ? (
        <View style={styles.held}>
          <Ionicons name="checkmark-circle" size={28} color={color.accent} />
          <T v="section" style={{ textAlign: "center" }}>{`Held for ${person.name}'s morning.`}</T>
          <Chip icon="moon" label={`arrives ${held}`} />
          {headsUp.question ? (
            // Wiring for the one permission ask (lib/push.ts). Copy is proposed; styling is Gurneal's.
            <View style={{ alignItems: "center", marginTop: space.s8 }}>
              <T v="caption" style={{ textAlign: "center" }}>{headsUp.question}</T>
              <View style={{ flexDirection: "row", gap: space.s24 }}>
                <TextButton label="Yes" tone="text" onPress={() => headsUp.answer(true).finally(() => router.dismissTo("/home"))} />
                <TextButton label="Not now" onPress={() => headsUp.answer(false).finally(() => router.dismissTo("/home"))} />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );

  const dockContent = (
    <>
      <PrimaryPill featureId="unsend-queue-send" label={holding ? "Send when they're ready" : "Send now"} disabled={sending || pieces.length === 0} onPress={send} />
      <View style={{ alignItems: "center" }}>
        <TextButton label="Keep editing" onPress={() => router.back()} />
      </View>
    </>
  );

  return (
    <View style={ui.screen}>
      <NavBar backLabel="Edit" title={`To ${person.name}`} />
      {split ? (
        // Wide (unfolded, landscape): the letter on the left, when it arrives and the button on the right.
        <View style={[styles.split, layout.column(SPLIT_MAX)]}>
          <ScrollView style={styles.main} contentContainerStyle={{ paddingTop: space.s24, paddingBottom: insets.bottom + space.s32 }}>
            {letter}
          </ScrollView>
          <ScrollView style={styles.side} contentContainerStyle={{ paddingBottom: insets.bottom + space.s32 }}>
            {choices}
            {!held ? <View style={styles.sideDock}>{dockContent}</View> : null}
          </ScrollView>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={[layout.column(), { paddingTop: space.s16, paddingBottom: dockH + space.s32 }]}>
            {letter}
            {choices}
          </ScrollView>

          {!held ? (
            <View onLayout={(e) => setDockH(e.nativeEvent.layout.height)} style={[styles.dock, { paddingBottom: insets.bottom + space.s8, paddingLeft: insets.left, paddingRight: insets.right }]}>{dockContent}</View>
          ) : null}
        </>
      )}
    </View>
  );
}

function Choice({ label, on, onPress, featureId }: { label: string; on: boolean; onPress: () => void; featureId?: string }) {
  return (
    <Pressable testID={featureId} onPress={onPress} style={styles.choice}>
      <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={22} color={on ? color.accent : color.text3} />
      <T v="rowName" style={{ color: on ? color.text : color.text2 }}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  delivery: { marginHorizontal: inset.card, marginTop: space.s24, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s4 },
  well: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: color.hairline, marginVertical: space.s8 },
  choice: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s8, minHeight: 44 },
  held: { marginHorizontal: inset.card, marginTop: space.s24, alignItems: "center", gap: space.s8, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s24 },
  split: { flex: 1, flexDirection: "row", gap: space.s8 },
  main: { flex: 3 },
  side: { flex: 2 },
  sideDock: { gap: space.s4, marginTop: space.s24 },
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: space.s16, backgroundColor: color.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairline },
});
