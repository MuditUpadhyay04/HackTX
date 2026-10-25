// Talk: "Say it out loud" (DESIGN_SPEC 3.7). Live transcript, then the split into people.
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { ActionSheetIOS, Alert, Animated, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppRail } from "../components/AppRail";
import { Avatar, Chip, NavBar, Overline, PillGradientFill, Press, PrimaryPill, styles as ui, T, TextButton } from "../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { api, type SortResult } from "../lib/api";
import { usePhotoMemory, useVoiceBack } from "../lib/memory";
import { toast } from "../lib/toast";
import { useLiveRant } from "../lib/useLiveRant";
import { color, inset, radius, shadow, space, spring, type } from "../theme/tokens";

export default function Talk() {
  const insets = useSafeAreaInsets();
  const { photo } = useLocalSearchParams<{ photo?: string }>();
  const live = useLiveRant();
  // Data wiring (mobile/src/lib/memory.ts): what he said on this photo before, and his voice back.
  const { memory } = usePhotoMemory(photo);
  const voiceBack = useVoiceBack();
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const [sorting, setSorting] = useState(false);
  const [result, setResult] = useState<SortResult | null>(null);
  const [transcript, setTranscript] = useState("");

  const recording = live.state === "recording" || live.state === "starting";
  const spoken = [...live.turns, live.partial].filter(Boolean).join(" ");

  const sort = async (rantId: string) => {
    setSorting(true);
    try {
      const res = await api.sortRant(rantId);
      setTranscript(res.rant.transcript);
      if (res.safety !== "ok") {
        router.replace({ pathname: "/safety", params: { resources: JSON.stringify(res.resources) } });
        return;
      }
      await new Promise((r) => setTimeout(r, 600)); // the 600 ms hold before Un-Said speaks
      setResult(res);
    } catch (e) {
      Alert.alert("That didn't go through", (e as Error).message);
    } finally {
      setSorting(false);
    }
  };

  const toggleMic = async () => {
    try {
      if (live.state === "idle" || live.state === "error") {
        setResult(null);
        await live.start(photo ?? null); // the photo remembers what he says here
      } else if (live.state === "recording") {
        const rant = await live.stop();
        await sort(rant.id);
      }
    } catch (e) {
      Alert.alert("Couldn't hear that", (e as Error).message);
    }
  };

  const submitTyped = async () => {
    try {
      const rant = await api.typedRant(typed.trim(), photo ?? null);
      setTranscript(typed.trim());
      await sort(rant.id);
    } catch (e) {
      Alert.alert("That didn't go through", (e as Error).message);
    }
  };

  const startOver = () => {
    const reset = () => {
      live.cancel();
      setResult(null);
      setTyped("");
      setTranscript("");
    };
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Delete recording", "Cancel"], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
        (i) => i === 0 && reset(),
      );
    } else {
      Alert.alert("", "", [{ text: "Delete recording", style: "destructive", onPress: reset }, { text: "Cancel", style: "cancel" }]);
    }
  };

  // ------------------------------------------------------------------ split

  if (result) {
    return (
      <View style={ui.screen}>
        <NavBar title="Say it out loud" />
        <ScrollView contentContainerStyle={{ padding: inset.card, paddingBottom: insets.bottom + space.s48, gap: space.s8 }}>
          {result.self_note ? <SelfNoteCard /> : null}
          <T v="section" style={{ marginHorizontal: space.s8, marginBottom: space.s16 }}>{"Here's who that was for."}</T>
          {result.groups.length === 0 ? (
            <T v="rowPreview" style={{ marginHorizontal: space.s8 }}>{"nothing in that was about anyone yet. it's kept, just for you."}</T>
          ) : null}
          {result.groups.map((g, i) => (
            <CardIn key={g.person.id} index={i}>
              <Press
                featureId="pile-open"
                onPress={() => router.push({ pathname: "/pile/[person]", params: { person: g.person.id, photo: photo ?? "" } })}
                style={styles.personCard}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
                  <Avatar name={g.person.name} ring />
                  <T v="rowName" style={{ flex: 1 }}>{g.person.name}</T>
                  <Chip label={g.tone} />
                  <Ionicons name="chevron-forward" size={18} color={color.text3} />
                </View>
                {/* Data wiring: at most one card, rarely (backend decides). Tapping the card opens their pile. */}
                {g.encourage ? <T v="caption" style={{ marginTop: space.s8, color: color.violet }}>{g.encourage}</T> : null}
                <View style={{ marginTop: space.s12, gap: space.s8 }}>
                  {g.pieces.slice(0, 3).map((p) => (
                    <T key={p.id} v="words" style={{ color: color.text2 }}>{`“${p.text}”`}</T>
                  ))}
                </View>
                {g.kept_total > Math.min(3, g.pieces.length) ? (
                  <T v="meta" style={{ marginTop: space.s8 }}>{`+${g.kept_total - Math.min(3, g.pieces.length)} more`}</T>
                ) : null}
              </Press>
            </CardIn>
          ))}
          <View style={{ alignItems: "center", marginTop: space.s16 }}>
            <TextButton
              featureId="rant-save-private"
              label="Keep it just for me"
              onPress={() => {
                toast("Saved. Only you can see it.");
                router.dismissTo("/home");
              }}
            />
          </View>
          <T v="caption" style={{ marginHorizontal: space.s8, marginTop: space.s16, color: color.text4 }}>{transcript}</T>
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------ recording / typing

  return (
    <View style={ui.screen}>
      <NavBar title="Say it out loud" />
      <ScrollView contentContainerStyle={{ paddingBottom: 280 }} keyboardShouldPersistTaps="handled">
        {photo && !recording && !spoken ? (
          <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" transition={150} />
        ) : null}
        <View style={{ paddingLeft: inset.text, paddingRight: 92, marginTop: space.s24 }}>
          {/* Data wiring: his own words from earlier visits to this photo, before he starts. */}
          {memory && memory.previous.length > 0 && !recording && !spoken && !typing ? (
            <View style={{ marginBottom: space.s24, gap: space.s12 }}>
              <Overline>Said here before</Overline>
              {memory.previous.slice(0, 3).map((p) => (
                <View key={p.id} style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
                  <View style={{ flex: 1 }}>
                    <T v="rowPreview" lines={2}>{`“${p.text}”`}</T>
                    <T v="meta">{`${p.person_name} · ${p.day}`}</T>
                  </View>
                  {p.audio_url ? (
                    <TextButton
                      featureId="memory-listen"
                      label={voiceBack.playingId === p.id ? "Pause" : "Listen"}
                      onPress={() => voiceBack.toggle(p.id, p.audio_url)}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          <Overline>Only you can hear this</Overline>
          {typing ? (
            <TextInput
              testID="rant-type"
              value={typed}
              onChangeText={setTyped}
              multiline
              autoFocus
              selectionColor={color.caret}
              style={[type.compose, { marginTop: space.s16, padding: 0, minHeight: 168 }]}
            />
          ) : (
            <T v="compose" style={{ marginTop: space.s16, minHeight: 168 }}>
              {spoken}
              {recording ? <T v="compose" style={{ color: color.caret }}>|</T> : null}
            </T>
          )}
          {sorting ? <T v="caption" style={{ marginTop: space.s16 }}>…</T> : null}
          <T v="caption" style={{ marginTop: space.s16 }}>Nothing leaves without you.</T>
          {live.provider === "mock" ? <T v="meta" style={{ marginTop: space.s8, color: color.text4 }}>mock transcription (no Muse key on the server)</T> : null}
        </View>
        <View style={{ position: "absolute", right: space.s16, top: photo && !recording && !spoken ? 248 : space.s24 }}>
          <AppRail />
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.s16 }]}>
        {typing ? (
          <View style={{ alignSelf: "stretch" }}>
            <PrimaryPill label="Done" disabled={!typed.trim() || sorting} onPress={submitTyped} />
          </View>
        ) : (
          <>
            <Waveform levels={live.levels} live={recording} />
            <Press featureId={recording ? "rant-stop" : "rant-record"} onPress={toggleMic} disabled={live.state === "finishing" || sorting} style={[styles.mic, shadow.pill]}>
              <PillGradientFill />
              <Ionicons name={recording ? "stop" : "mic"} size={32} color="#fff" />
            </Press>
            <T v="caption">{live.state === "finishing" || sorting ? "Sorting…" : recording ? "Tap to stop" : "Tap to talk"}</T>
          </>
        )}
        <View style={{ flexDirection: "row", gap: space.s24 }}>
          <TextButton featureId="rant-type" label={typing ? "Talk instead" : "Type instead"} onPress={() => { live.cancel(); setTyping((t) => !t); }} />
          <TextButton featureId="rant-discard" label="Start over" onPress={startOver} />
        </View>
      </View>
    </View>
  );
}

function Waveform({ levels, live }: { levels: number[]; live: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, height: 32 }}>
      {levels.map((h, i) => (
        <View key={i} style={{ width: 3, height: Math.max(3, (live ? Math.max(0.08, h) : 0.08) * 32), borderRadius: 1.5, backgroundColor: live ? color.violet : color.text3 }} />
      ))}
    </View>
  );
}

function CardIn({ index, children }: { index: number; children: ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const timer = setTimeout(() => Animated.spring(v, { toValue: 1, ...spring.cardIn, useNativeDriver: true }).start(), index * 120);
    return () => clearTimeout(timer);
  }, [index, v]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }}>
      {children}
    </Animated.View>
  );
}

function SelfNoteCard() {
  return (
    <View style={[styles.personCard, { borderRadius: radius.hero, marginBottom: space.s16 }]}>
      <Overline>For you, later</Overline>
      <T v="rowPreview" style={{ marginTop: space.s8 }}>you left yourself a note for a night like this.</T>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { marginHorizontal: inset.card, marginTop: space.s8, height: 224, borderRadius: radius.hero },
  personCard: { backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16 },
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center", gap: space.s12, paddingTop: space.s16, backgroundColor: color.bg },
  mic: { width: 88, height: 88, borderRadius: 44, overflow: "hidden", alignItems: "center", justifyContent: "center" },
});
