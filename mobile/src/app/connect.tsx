// Connect photos (DESIGN_SPEC 3.13).
// Photos is a real permission. Instagram and Facebook import aren't built in the backend yet,
// so those two rows are demo toggles held in memory: they connect nothing.
import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "expo-media-library";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../components/AppRail";
import { NavBar, PillGradientFill, Press, styles as ui, T } from "../components/ui";
import { color, inset, radius, space } from "../theme/tokens";
import { useLayout } from "../lib/useLayout";

export default function Connect() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const [permission, requestPermission] = usePermissions();
  const [demo, setDemo] = useState({ instagram: false, facebook: false });

  const rows = [
    { key: "photos", title: "Photos", sub: "on this iPhone", on: !!permission?.granted, connect: requestPermission, id: "camera-roll-scan", glyph: null },
    { key: "instagram", title: "Instagram photos", sub: "your posts and tagged photos", on: demo.instagram, connect: () => setDemo((d) => ({ ...d, instagram: true })), id: "graph-api-photo-import", glyph: "instagram" as const },
    { key: "facebook", title: "Facebook photos", sub: "albums and tagged photos", on: demo.facebook, connect: () => setDemo((d) => ({ ...d, facebook: true })), id: "graph-api-photo-import", glyph: "facebook" as const },
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
              {r.on ? (
                <Ionicons name="checkmark-circle" size={28} color={color.accent} />
              ) : (
                <Press featureId={r.id} onPress={r.connect} style={styles.connect}>
                  <PillGradientFill />
                  <T v="meta" style={{ color: color.onAccent, fontWeight: "600" }}>Connect</T>
                </Press>
              )}
            </View>
          ))}
        </View>
        <View style={{ marginHorizontal: inset.text, marginTop: space.s24, gap: space.s8 }}>
          <T v="caption">grouped on your phone. only you can see this.</T>
          <T v="caption">faces never leave your phone</T>
          <T v="caption">you name people, not us</T>
          <T v="caption">delete face data anytime</T>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: space.s12, backgroundColor: color.surface, borderRadius: radius.row, paddingHorizontal: space.s16 },
  photosGlyph: { width: 44, height: 44, borderRadius: 10, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
  connect: { height: 32, paddingHorizontal: space.s16, borderRadius: radius.pill, overflow: "hidden", alignItems: "center", justifyContent: "center" },
});
