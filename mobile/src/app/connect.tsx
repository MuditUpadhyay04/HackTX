// Connect photos (DESIGN_SPEC 3.13).
// Photos asks the real permission first. Demo build: each Connect imports a small set of demo photos
// on the backend (POST /api/connect/{source}), already grouped, no Meta Graph API and no face
// recognition. Then the faces popup asks who they are; nothing is linked until he confirms.
import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "expo-media-library";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../components/AppRail";
import { FacesSheet } from "../components/faces";
import { NavBar, PillGradientFill, Press, styles as ui, T, TextButton } from "../components/ui";
import { api, type FaceCluster, type PhotoSource } from "../lib/api";
import { DEMO_DATA } from "../lib/demo";
import { haptics } from "../lib/haptics";
import { color, inset, radius, space } from "../theme/tokens";
import { useLayout } from "../lib/useLayout";

export default function Connect() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  // Demo data: Connect imports the demo photos on the server only, so the phone's photo permission
  // is never checked (get: false) or asked for.
  const [permission, requestPermission] = usePermissions({ get: !DEMO_DATA });
  const [connected, setConnected] = useState<Record<PhotoSource, boolean>>({ photos: false, instagram: false, facebook: false });
  const [pending, setPending] = useState<FaceCluster[]>([]);
  const [total, setTotal] = useState(0);
  const [sheet, setSheet] = useState(false);

  const reload = useCallback(async (open = false) => {
    const [state, faces] = await Promise.all([api.connectState(), api.faces()]);
    setConnected(state.connected);
    const waiting = faces.clusters.filter((c) => faces.pending.includes(c.id));
    setPending(waiting);
    setTotal(faces.clusters.length);
    if (open && waiting.length) setSheet(true);
    if (!waiting.length) setSheet(false);
  }, []);
  useFocusEffect(
    useCallback(() => {
      reload().catch(() => {});
    }, [reload]),
  );

  const connect = async (source: PhotoSource) => {
    try {
      if (source === "photos" && Platform.OS !== "web" && !DEMO_DATA && !permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) return;
      }
      await api.connect(source);
      haptics.success();
      await reload(true);
    } catch (e) {
      Alert.alert("That didn't connect", (e as Error).message);
    }
  };

  const rows = [
    { key: "photos" as const, title: "Photos", sub: "on this phone", id: "camera-roll-scan", glyph: null },
    { key: "instagram" as const, title: "Instagram photos", sub: "your posts and tagged photos", id: "graph-api-photo-import", glyph: "instagram" as const },
    { key: "facebook" as const, title: "Facebook photos", sub: "albums and tagged photos", id: "graph-api-photo-import", glyph: "facebook" as const },
  ];

  return (
    <View style={ui.screen}>
      <NavBar title="Connect photos" />
      <ScrollView contentContainerStyle={{ ...layout.column(), paddingBottom: insets.bottom + space.s48 }}>
        <View style={{ marginHorizontal: inset.card, gap: space.s8, marginTop: space.s16 }}>
          {rows.map((r) => (
            <View key={r.key} style={styles.row}>
              {r.glyph ? (
                <AppGlyph app={r.glyph} />
              ) : (
                <View style={[styles.photosGlyph]}>
                  <Ionicons name="images" size={22} color={color.accent} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <T v="rowName">{r.title}</T>
                <T v="rowPreview">{r.sub}</T>
              </View>
              {connected[r.key] ? (
                <Ionicons name="checkmark-circle" size={28} color={color.accent} />
              ) : (
                <Press featureId={r.id} onPress={() => connect(r.key)} style={styles.connect}>
                  <PillGradientFill />
                  <T v="meta" style={{ color: color.onAccent, fontWeight: "600" }}>Connect</T>
                </Press>
              )}
            </View>
          ))}
        </View>
        {total ? (
          <View style={{ marginHorizontal: inset.text, marginTop: space.s16, alignItems: "flex-start" }}>
            <TextButton featureId="face-clusters-list" tone="text" label="see who" onPress={() => (pending.length ? setSheet(true) : router.push("/faces"))} />
          </View>
        ) : null}
        <View style={{ marginHorizontal: inset.text, marginTop: space.s24, gap: space.s8 }}>
          <T v="caption">grouped on your phone. only you can see this.</T>
          <T v="caption">faces never leave your phone</T>
          <T v="caption">you name people, not us</T>
          <T v="caption">delete face data anytime</T>
        </View>
      </ScrollView>
      <FacesSheet visible={sheet} clusters={pending} onClose={() => setSheet(false)} onChanged={() => reload().catch(() => {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: space.s12, backgroundColor: color.surface, borderRadius: radius.row, paddingHorizontal: space.s16 },
  photosGlyph: { width: 44, height: 44, borderRadius: 10, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
  connect: { height: 32, paddingHorizontal: space.s16, borderRadius: radius.pill, overflow: "hidden", alignItems: "center", justifyContent: "center" },
});
