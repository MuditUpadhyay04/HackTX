// Notes to yourself. The list comes from /api/home; recording a new one is the Self note screen (/note).
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavBar, Press, Row, styles as ui, T } from "../components/ui";
import { mediaUrl } from "../lib/api";
import { clock } from "../components/video";
import { useHome } from "../lib/useHome";
import { color, inset, space } from "../theme/tokens";
import { useLayout } from "../lib/useLayout";

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notes() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { home, error, refresh } = useHome(30000);
  const notes = home?.self_notes ?? [];

  return (
    <View style={ui.screen}>
      <NavBar title="Notes to yourself" />
      <ScrollView contentContainerStyle={{ ...layout.column(), paddingBottom: insets.bottom + space.s48, paddingTop: space.s8 }}>
        <T v="overline" style={{ marginHorizontal: inset.text, marginBottom: space.s16 }}>
          For you, later
        </T>

        {error && !home ? (
          <T v="rowPreview" style={{ marginHorizontal: inset.text }}>{`Can't reach Un-Said's server. ${error}`}</T>
        ) : null}

        {home && notes.length === 0 ? (
          <T v="rowPreview" style={{ marginHorizontal: inset.text }}>
            Notes to yourself show up here.
          </T>
        ) : null}

        <View style={{ marginHorizontal: inset.card, gap: space.s8 }}>
          <Row featureId="self-note-record" onPress={() => router.push("/note")}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="videocam" size={20} color={color.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="rowName">For you, later</T>
              <T v="rowPreview">for the next hard day</T>
            </View>
          </Row>
          {notes.map((note) => {
            const url = mediaUrl(note.url);
            return (
              <Row
                key={note.id}
                onPress={() => {
                  if (url) Linking.openURL(url);
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="play" size={18} color={color.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="rowName">{note.label || "For you, later"}</T>
                  <T v="rowPreview">{when(note.created_at)}</T>
                </View>
                <T v="meta">{note.duration_ms ? clock(note.duration_ms / 1000) : "Watch"}</T>
              </Row>
            );
          })}
        </View>

        {error && !home ? (
          <Press onPress={() => refresh()} style={[ui.pill, { backgroundColor: color.surfaceRaised, marginTop: space.s16 }]}>
            <T v="button">Try again</T>
          </Press>
        ) : null}
      </ScrollView>
    </View>
  );
}
