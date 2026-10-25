// You (DESIGN_SPEC 3.12).
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RAIL_APPS, AppGlyph } from "../../components/AppRail";
import { Avatar, Row, styles as ui, T } from "../../components/ui";
import { API_URL } from "../../lib/api";
import { useHome } from "../../lib/useHome";
import { color, inset, radius, space } from "../../theme/tokens";

export default function You() {
  const insets = useSafeAreaInsets();
  const { home } = useHome(15000);

  const link = (label: string, onPress: () => void, featureId?: string) => (
    <Row featureId={featureId} onPress={onPress} style={{ minHeight: 56 }}>
      <T v="rowName" style={{ flex: 1 }}>{label}</T>
      <Ionicons name="chevron-forward" size={16} color={color.text3} />
    </Row>
  );

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.s24, paddingBottom: space.s48 }}>
        <View style={{ marginHorizontal: inset.text, gap: space.s12 }}>
          <Avatar name={home?.me.name ?? "R"} size={72} />
          <T v="display">{home?.me.name ?? ""}</T>
        </View>

        <View style={styles.group}>
          {link("Connect photos", () => router.push("/connect"), "photo-connectors-open")}
          {link("Safety and support", () => router.push("/safety"))}
        </View>

        <T v="section" style={{ marginHorizontal: inset.text, marginTop: space.s24 }}>Your people</T>
        <View style={styles.group}>
          {home?.people.map((p) => (
            <Row key={p.id} onPress={() => router.push({ pathname: "/pile/[person]", params: { person: p.id } })}>
              <Avatar name={p.name} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{p.name}</T>
                <T v="rowPreview">{`${p.is_asleep ? "asleep · " : ""}${p.local_time} for ${p.name}`}</T>
              </View>
              <Ionicons name="chevron-forward" size={16} color={color.text3} />
            </Row>
          ))}
        </View>

        <T v="section" style={{ marginHorizontal: inset.text, marginTop: space.s24 }}>Settings</T>
        <View style={[styles.group, ui.card, { gap: space.s12 }]}>
          <View style={{ flexDirection: "row", gap: space.s12 }}>
            {RAIL_APPS.map((a) => <AppGlyph key={a} app={a} size={36} />)}
          </View>
          <T v="rowPreview">{`Server ${API_URL}`}</T>
          <T v="rowPreview">{home ? `Transcription: ${home.providers.transcribe} · Sorting: ${home.providers.spark} · Delivery: ${home.providers.whatsapp}` : "Not connected"}</T>
        </View>

        <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s32, color: color.text4 }}>powered by Meta AI</T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginHorizontal: inset.card, gap: space.s8, marginTop: space.s16, borderRadius: radius.row },
});
