// Self note (DESIGN_SPEC 3.11): a short video to himself, "for the next hard day".
// Expo Go: the front camera records through the system camera (expo-image-picker), so the spec's
// in-app ring/timer is the camera's own. Saved notes upload to POST /api/self-notes (private).
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavBar, Overline, PrimaryPill, styles as ui, T, TextButton } from "../components/ui";
import { clock, type PickedVideo, pickVideo } from "../components/video";
import { api } from "../lib/api";
import { haptics } from "../lib/haptics";
import { toast } from "../lib/toast";
import { useHome } from "../lib/useHome";
import { READING_MAX, useLayout } from "../lib/useLayout";
import { color, inset, radius, space } from "../theme/tokens";

function Preview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

export default function SelfNote() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { home, refresh } = useHome(30000);
  const [take, setTake] = useState<PickedVideo | null>(null);
  const [saving, setSaving] = useState(false);
  const notes = home?.self_notes ?? [];
  const frame = Math.min(layout.usableWidth - inset.card * 2, READING_MAX - inset.card * 2);

  const record = async () => {
    const v = await pickVideo("camera", true);
    if (v) setTake(v);
  };

  const save = async () => {
    if (!take) return;
    setSaving(true);
    try {
      await api.uploadSelfNote(take.uri, take.mime, take.duration ? take.duration * 1000 : null);
      haptics.success();
      toast("Saved. Only you can see it.");
      setTake(null);
      refresh();
    } catch (e) {
      Alert.alert("That didn't save", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={ui.screen}>
      <NavBar title="Notes to yourself" />
      <ScrollView contentContainerStyle={[layout.column(READING_MAX), { paddingBottom: insets.bottom + space.s48 }]}>
        <Overline style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>For you, later</Overline>
        <View style={[styles.frame, { width: frame, height: Math.round(frame * 1.1) }]}>
          {take ? (
            <Preview uri={take.uri} />
          ) : (
            <View style={styles.idle}>
              <Ionicons name="person-circle-outline" size={96} color={color.violet} />
              <T v="caption">for the next hard day</T>
            </View>
          )}
          {take?.duration ? (
            <View style={styles.timer}>
              <T v="meta" style={{ color: color.onAccent, fontVariant: ["tabular-nums"] }}>{clock(take.duration)}</T>
            </View>
          ) : null}
        </View>

        {take ? (
          <View style={{ gap: space.s4, marginTop: space.s24 }}>
            <PrimaryPill featureId="self-note-save" label="Save for later" disabled={saving} onPress={save} />
            <View style={{ alignItems: "center" }}>
              <TextButton label="Retake" onPress={record} />
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: space.s24 }}>
            {/* White ring, red dot (DESIGN_SPEC 3.11). */}
            <Pressable testID="self-note-record" accessibilityLabel="Record" onPress={record} style={styles.ring}>
              <View style={styles.dot} />
            </Pressable>
          </View>
        )}

        {notes.length ? (
          <View style={{ marginHorizontal: inset.card, marginTop: space.s32, gap: space.s8 }}>
            <T v="section" style={{ marginHorizontal: space.s8 }}>Notes to yourself</T>
            {notes.map((n) => (
              <Pressable key={n.id} onPress={() => router.push("/notes")} style={styles.row}>
                <View style={styles.play}>
                  <Ionicons name="play" size={16} color={color.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="rowName">{n.label || "For you, later"}</T>
                  <T v="rowPreview">{new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</T>
                </View>
                {n.duration_ms ? <T v="meta" style={{ fontVariant: ["tabular-nums"] }}>{clock(n.duration_ms / 1000)}</T> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: "center", marginTop: space.s12, borderRadius: radius.hero, overflow: "hidden", backgroundColor: color.surface },
  idle: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.s8 },
  timer: { position: "absolute", left: space.s16, bottom: space.s16, paddingHorizontal: space.s8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: color.scrim },
  ring: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: color.text4, alignItems: "center", justifyContent: "center", backgroundColor: color.bg },
  dot: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.danger },
  row: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: space.s12, backgroundColor: color.surface, borderRadius: radius.row, paddingHorizontal: space.s16 },
  play: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
});
