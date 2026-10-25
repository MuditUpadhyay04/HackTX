// Talk: "Say it out loud" (DESIGN_SPEC 3.7). Live transcript, then the split into people.
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, type StyleProp, StyleSheet, TextInput, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppRail } from "../components/AppRail";
import { Skeleton } from "../components/motion";
import { Avatar, Chip, NavBar, Overline, PillGradientFill, Press, PrimaryPill, styles as ui, T, TextButton } from "../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { api, type Channel, mediaUrl, type SortResult } from "../lib/api";
import { APP_LABEL, CHANNEL_APP } from "../lib/handoff";
import { usePhotoMemory, useVoiceBack } from "../lib/memory";
import { toast } from "../lib/toast";
import { TRY_GUIDE, TRY_MODE } from "../lib/try";
import { useLiveRant } from "../lib/useLiveRant";
import { READING_MAX, useLayout } from "../lib/useLayout";
import { color, inset, radius, shadow, space, spring, type } from "../theme/tokens";

export default function Talk() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  // Wide (unfolded, landscape): transcript on the left, the mic and tools in a side panel.
  const wide = layout.expanded;
  // typing=1: opened as "Write" from a person page; starts in the typed mode (same flow).
  // person: opened from that person's page (Talk, Write, a photo of theirs); what names nobody is filed under them.
  // seenPhoto: a photo of them from the People tab (a server URL), shown above the words.
  // prompt: Demo mode's knock line for Talk ("Send the words you're keeping to yourself..."), from the server.
  const { photo, toName, channel, typing: startTyping, person, seenPhoto, prompt } = useLocalSearchParams<{ photo?: string; toName?: string; channel?: string; typing?: string; person?: string; seenPhoto?: string; prompt?: string }>();
  const title = toName ? `To ${toName}` : "Say it out loud";
  const channelLine = (() => {
    if (!toName || !channel || channel === "self") return null;
    const app = CHANNEL_APP[channel as Exclude<Channel, "self">];
    if (!app) return null;
    const prep = channel === "whatsapp" ? "on" : "in";
    return `Goes to ${toName} ${prep} ${APP_LABEL[app]}`;
  })();
  const live = useLiveRant();
  // Data wiring (mobile/src/lib/memory.ts): what he said on this photo before, and his voice back.
  const { memory } = usePhotoMemory(photo);
  const voiceBack = useVoiceBack();
  const [typing, setTyping] = useState(startTyping === "1");
  const [typed, setTyped] = useState("");
  const [sorting, setSorting] = useState(false);
  const [result, setResult] = useState<SortResult | null>(null);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  // Web has no Alert (react-native-web's does nothing), so problems show inline, with a way forward.
  const [problem, setProblem] = useState<{ text: string; retry?: () => void; label?: string } | null>(null);
  const busy = useRef(false); // one Done / one sort at a time, however fast the taps
  const [elapsed, setElapsed] = useState(0); // seconds of sorting, shown in try mode (Vultr Inference can take 5-20 s)
  useEffect(() => {
    if (!TRY_MODE || !sorting) return;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => {
      clearInterval(t);
      setElapsed(0);
    };
  }, [sorting]);
  const say = (title: string, e: unknown, retry?: () => void, label = "Try again") => {
    const text = (e as Error)?.message || String(e);
    if (Platform.OS === "web") setProblem({ text, retry, label });
    else Alert.alert(title, text);
  };

  const recording = live.state === "recording" || live.state === "starting";

  // Try mode: the server takes up to 60 s of audio, so stop at 55 s and sort what was said.
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!TRY_MODE || live.state !== "recording") return;
    const t = setTimeout(() => stopRef.current(), 55_000);
    return () => clearTimeout(t);
  }, [live.state]);
  const spoken = [...live.turns, live.partial].filter(Boolean).join(" ");

  const sort = async (rantId: string) => {
    setSorting(true);
    setProblem(null);
    try {
      const res = await api.sortRant(rantId, person || null);
      setTranscript(res.rant.transcript);
      if (res.safety !== "ok") {
        router.replace({ pathname: "/safety", params: { resources: JSON.stringify(res.resources) } });
        return;
      }
      await new Promise((r) => setTimeout(r, 600)); // the 600 ms hold before Un-Said speaks
      setResult(res);
    } catch (e) {
      say("That didn't go through", e, () => sort(rantId));
    } finally {
      setSorting(false);
    }
  };

  const toggleMic = async () => {
    setProblem(null);
    try {
      if (live.state === "idle" || live.state === "error") {
        setResult(null);
        await live.start(photo ?? null); // the photo remembers what he says here
      } else if (live.state === "recording") {
        const rant = await live.stop();
        await sort(rant.id);
      }
    } catch (e) {
      // TRY (needs Gurneal's OK): the "Type it instead" way out when the mic or the connection fails.
      say("Couldn't hear that", e, () => {
        live.cancel();
        setTyping(true);
      }, "Type it instead");
    }
  };

  useEffect(() => {
    stopRef.current = () => {
      if (live.state === "recording") void toggleMic();
    };
  });

  const submitTyped = async () => {
    if (busy.current) return;
    busy.current = true;
    setProblem(null);
    try {
      const rant = await api.typedRant(typed.trim(), photo ?? null);
      setTranscript(typed.trim());
      await sort(rant.id);
    } catch (e) {
      say("That didn't go through", e, submitTyped);
    } finally {
      busy.current = false;
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
    } else if (Platform.OS === "web") {
      // react-native-web's Alert does nothing, so the browser's own confirm asks instead.
      if (typeof window !== "undefined" && window.confirm("Delete recording?")) reset();
    } else {
      // Android: an empty title and message draws a blank dialog, so the question is the title.
      Alert.alert("Delete recording?", undefined, [{ text: "Cancel", style: "cancel" }, { text: "Delete recording", style: "destructive", onPress: reset }]);
    }
  };

  // ------------------------------------------------------------------ split

  if (result) {
    return (
      <View style={ui.screen}>
        <NavBar title={title} />
        <ScrollView contentContainerStyle={[layout.column(wide ? 960 : READING_MAX), { paddingTop: inset.card, paddingBottom: insets.bottom + space.s48 }]}>
          <View style={{ paddingHorizontal: inset.card, gap: space.s8 }}>
            {result.self_note ? <SelfNoteCard /> : null}
            <T v="section" style={{ marginHorizontal: space.s8, marginBottom: space.s16 }}>{"Here's who that was for."}</T>
            {result.groups.length === 0 ? (
              <T v="rowPreview" style={{ marginHorizontal: space.s8 }}>{"nothing in that was about anyone yet. it's kept, just for you."}</T>
            ) : null}
            {/* Two across on a wide screen, one on a phone. */}
            <View style={wide ? styles.grid : { gap: space.s8 }}>
              {result.groups.map((g, i) => (
                <CardIn key={g.person.id} index={i} style={wide ? styles.gridCell : undefined}>
                  <Press
                    featureId="pile-open"
                    onPress={() => router.push({ pathname: "/pile/[person]", params: { person: g.person.id, photo: photo ?? "", rant: result.rant.id } })}
                    style={styles.personCard}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
                      <Avatar name={g.person.name} ring />
                      <T v="rowName" style={{ flex: 1 }}>{g.person.name}</T>
                      <Chip label={g.tone} />
                      <Ionicons name="chevron-forward" size={18} color={color.text3} />
                    </View>
                    {/* Tapping the card opens their pile. No app-written line here: only his own words. */}
                    <View style={{ marginTop: space.s12, gap: space.s8 }}>
                      {g.pieces.slice(0, 3).map((p) => (
                        <T key={p.id} v="words" style={{ color: color.text2 }}>{`“${p.text}”`}</T>
                      ))}
                  </View>
                  {/* "+N more" counts this run's lines only, not everything kept for them before. */}
                  {g.pieces.length > 3 ? (
                    <T v="meta" style={{ marginTop: space.s8 }}>{`+${g.pieces.length - 3} more`}</T>
                  ) : null}
                </Press>
              </CardIn>
            ))}
            </View>
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
            {transcript ? (
              <View style={{ marginHorizontal: space.s8, marginTop: space.s16, alignItems: "flex-start" }}>
                <TextButton
                  featureId="rant-transcript-toggle"
                  tone="text3"
                  label={showTranscript ? "Hide transcript" : "Show transcript"}
                  onPress={() => setShowTranscript((v) => !v)}
                />
                {showTranscript ? <T v="caption" style={{ color: color.text4 }}>{transcript}</T> : null}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------ recording / typing

  const photoUri = photo || (seenPhoto ? mediaUrl(seenPhoto) : null);
  const showPhoto = Boolean(photoUri) && !recording && !spoken && !typing;

  // the folded cover is short: a smaller mic, the waveform only while recording, and "Start over"
  // only once there is something to start over, so his words keep most of the screen
  const tight = layout.short && !wide;
  const dock = (
    <>
      <View style={styles.tools}>
        <AppRail row />
        <View style={{ flex: 1 }} />
        <TextButton featureId="rant-type" label={typing ? "Talk instead" : "Type instead"} onPress={() => { live.cancel(); setTyping((t) => !t); }} />
      </View>
      {typing ? (
        <View style={{ alignSelf: "stretch", gap: space.s4 }}>
          <PrimaryPill label="Done" disabled={!typed.trim() || sorting} onPress={submitTyped} />
          <View style={{ alignItems: "center" }}>
            <TextButton featureId="rant-discard" label="Start over" onPress={startOver} />
          </View>
        </View>
      ) : (
        <View style={[styles.micColumn, tight && { gap: space.s4 }]}>
          {!tight || recording ? <Waveform levels={live.levels} live={recording} /> : null}
          <View style={[styles.micRing, tight && styles.micRingTight, recording && styles.micRingOn]}>
            <Press featureId={recording ? "rant-stop" : "rant-record"} onPress={toggleMic} disabled={live.state === "finishing" || sorting} style={[styles.mic, tight && styles.micTight, shadow.pill]}>
              <PillGradientFill />
              <Ionicons name={recording ? "stop" : "mic"} size={tight ? 26 : 32} color={color.onAccent} />
            </Press>
          </View>
          <T v="caption">
            {live.state === "finishing" || sorting
              ? `sorting it by person…${TRY_MODE && elapsed > 0 ? ` ${elapsed} s` : ""}`
              : recording ? "Tap to stop" : "Tap to talk"}
          </T>
          {!tight || spoken ? <TextButton featureId="rant-discard" label="Start over" tone="text3" onPress={startOver} /> : null}
        </View>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === "web" ? undefined : "padding"}>
      <NavBar title={title} />
      <View style={wide ? [styles.wideRow, layout.column(1080)] : { flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[wide ? null : layout.column(), { paddingBottom: space.s24 }]} keyboardShouldPersistTaps="handled">
          {showPhoto ? (
            <Image
              source={{ uri: photoUri ?? undefined }}
              // side by side there is room for a taller photo; anchor the crop high so faces stay in frame
              style={[styles.photo, { height: wide ? Math.min(300, Math.round(layout.height * 0.5)) : Math.min(224, Math.round(layout.height * (layout.short ? 0.22 : 0.36))) }]}
              contentFit="cover"
              contentPosition="top"
              transition={150}
            />
          ) : null}
          {/* Full-width column: the app rail lives in the dock's tool row, so nothing sits on the transcript. */}
          <View style={styles.column}>
            {/* Data wiring: his own words from earlier visits to this photo, before he starts. */}
            {memory && memory.previous.length > 0 && !recording && !spoken && !typing ? (
              <View style={styles.memory}>
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
            {(prompt || (TRY_MODE && TRY_GUIDE.talk)) && !spoken ? (
              <T v="section" style={{ marginBottom: space.s16 }}>{prompt || TRY_GUIDE.talk}</T>
            ) : null}
            <Overline>Only you can hear this</Overline>
            {channelLine ? <T v="rowPreview" style={{ marginTop: space.s8 }}>{channelLine}</T> : null}
            {typing ? (
              <TextInput
                testID="rant-type"
                value={typed}
                onChangeText={setTyped}
                multiline
                autoFocus
                selectionColor={color.caret}
                cursorColor={color.caret}
                scrollEnabled={false}
                // Reuses Home's hero question as the placeholder (no new copy).
                placeholder="What have you been meaning to say?"
                placeholderTextColor={color.text4}
                style={[type.compose, styles.typeBox, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]}
              />
            ) : (
              <T v="compose" style={styles.compose}>
                {spoken}
                {recording || !spoken ? <T v="compose" style={{ color: color.caret, fontWeight: "400" }}>|</T> : null}
                {/* before he says anything, the hero question shows where his words will appear (no new copy) */}
                {!spoken && !recording ? <T v="compose" style={{ color: color.text4 }}>What have you been meaning to say?</T> : null}
              </T>
            )}
            {sorting ? (
              <View style={{ marginTop: space.s24, gap: space.s8 }}>
                <Skeleton height={112} />
                <Skeleton height={112} />
              </View>
            ) : null}
            {problem ? (
              <View accessibilityRole="alert" style={styles.problem}>
                <T v="rowPreview">{problem.text}</T>
                {problem.retry ? (
                  <TextButton
                    tone="text"
                    label={problem.label ?? "Try again"}
                    onPress={() => {
                      const retry = problem.retry;
                      setProblem(null);
                      retry?.();
                    }}
                  />
                ) : null}
              </View>
            ) : null}
            <T v="caption" style={{ marginTop: space.s16 }}>Nothing leaves without you.</T>
            {live.provider === "mock" ? <T v="meta" style={{ marginTop: space.s8, color: color.text4 }}>mock transcription (no Muse key on the server)</T> : null}
          </View>
        </ScrollView>

        {/* The dock is in the column flow (not absolute), so the transcript can never run under it
            and the keyboard lifts it on iOS. On a wide screen it becomes a side panel. */}
        {wide ? (
          <ScrollView
            style={styles.panel}
            contentContainerStyle={[styles.dock, styles.panelInner, { paddingBottom: insets.bottom + space.s12 }]}
            keyboardShouldPersistTaps="handled"
          >
            {dock}
          </ScrollView>
        ) : (
          <View style={[styles.dock, { paddingBottom: insets.bottom + space.s12, paddingLeft: insets.left, paddingRight: insets.right }]}>{dock}</View>
        )}
      </View>
    </KeyboardAvoidingView>
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

function CardIn({ index, children, style }: { index: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const timer = setTimeout(() => Animated.spring(v, { toValue: 1, ...spring.cardIn, useNativeDriver: true }).start(), index * 120);
    return () => clearTimeout(timer);
  }, [index, v]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }]}>
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
  problem: { marginTop: space.s16, padding: space.s12, borderRadius: radius.row, backgroundColor: color.surface, gap: space.s4, alignItems: "flex-start" },
  // Typed mode: a visible box (tinted surface, rounded, a soft accent edge), not bare text on the page.
  typeBox: {
    marginTop: space.s16,
    minHeight: 168,
    fontSize: 24,
    lineHeight: 32,
    padding: space.s16,
    borderRadius: radius.row,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.violet,
    textAlignVertical: "top",
  },
  photo: { marginHorizontal: inset.card, marginTop: space.s8, height: 224, borderRadius: radius.hero, backgroundColor: color.surface },
  column: { paddingHorizontal: inset.text, marginTop: space.s24 },
  memory: { marginBottom: space.s24, gap: space.s12, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16 },
  compose: { marginTop: space.s16, minHeight: 168 },
  tools: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", paddingHorizontal: inset.text, paddingBottom: space.s4 },
  micColumn: { alignItems: "center", gap: space.s8 },
  personCard: { backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16 },
  wideRow: { flex: 1, flexDirection: "row" },
  panel: { width: 340, flexGrow: 0 },
  // The mic sits in the middle of its side, with the apps above it: no empty half under it.
  panelInner: { flexGrow: 1, justifyContent: "center", paddingTop: space.s24, gap: space.s32 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.s8 },
  gridCell: { flexBasis: "48%", flexGrow: 1 },
  dock: { alignItems: "center", gap: space.s12, paddingTop: space.s12, backgroundColor: color.bg },
  micRing: { width: 104, height: 104, borderRadius: 52, alignItems: "center", justifyContent: "center" },
  micRingTight: { width: 76, height: 76, borderRadius: 38 },
  micTight: { width: 64, height: 64, borderRadius: 32 },
  micRingOn: { borderWidth: 2, borderColor: "rgba(168,144,246,0.4)" },
  mic: { width: 88, height: 88, borderRadius: 44, overflow: "hidden", alignItems: "center", justifyContent: "center" },
});
