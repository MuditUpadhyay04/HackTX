// You (DESIGN_SPEC 3.12).
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Skeleton } from "../../components/motion";
import { Avatar, Press, Row, styles as ui, T } from "../../components/ui";
import { useHome } from "../../lib/useHome";
import { color, inset, radius, space } from "../../theme/tokens";

export default function You() {
  const insets = useSafeAreaInsets();
  const { home, error, refresh } = useHome(15000);
  const loading = !home && !error;
  const notes = home?.self_notes.length ?? 0;

  const link = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, featureId?: string, meta?: string, first?: boolean) => (
    <Row featureId={featureId} onPress={onPress} style={[styles.groupRow, !first && styles.rule]}>
      <View style={styles.well}>
        <Ionicons name={icon} size={22} color={color.text} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="rowName">{label}</T>
        {meta ? <T v="rowPreview">{meta}</T> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={color.text3} />
    </Row>
  );

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.s24, paddingBottom: space.s48 }}>
        <View style={{ marginHorizontal: inset.text, flexDirection: "row", alignItems: "center", gap: space.s16 }}>
          <Avatar name={home?.me.name ?? "Riley"} size={72} ring />
          <View style={{ flex: 1 }}>
            <T v="display">{home?.me.name || (loading ? " " : "Riley")}</T>
          </View>
        </View>

        {loading ? (
          <View style={{ marginHorizontal: inset.card, marginTop: space.s24, gap: space.s8 }}>
            <Skeleton height={76} />
            <Skeleton height={76} />
            <Skeleton height={76} />
          </View>
        ) : null}

        {error && !home ? (
          <View style={{ marginTop: space.s24, gap: space.s16 }}>
            <T v="rowPreview" style={{ marginHorizontal: inset.text }}>{`Can't reach Un-Said's server. ${error}`}</T>
            <Press onPress={() => refresh()} style={[ui.pill, { backgroundColor: color.surfaceRaised }]}>
              <T v="button">Try again</T>
            </Press>
          </View>
        ) : null}

        {home ? (
          <>
            <View style={styles.group}>
              {link("albums-outline", "Notes to yourself", () => router.push("/notes"), undefined, notes ? `${notes}` : undefined, true)}
              {link("images-outline", "Connect photos", () => router.push("/connect"), "photo-connectors-open")}
              {link("shield-checkmark-outline", "Safety and support", () => router.push("/safety"))}
              {link("options-outline", "Settings", () => router.push("/settings"))}
            </View>

            <T v="section" style={{ marginHorizontal: inset.text, marginTop: space.s32 }}>
              Your people
            </T>
            <View style={styles.group}>
              {home.people.map((p, i) => (
                <Row key={p.id} style={[styles.groupRow, i > 0 && styles.rule]} onPress={() => router.push({ pathname: "/pile/[person]", params: { person: p.id } })}>
                  <Avatar name={p.name} />
                  <View style={{ flex: 1 }}>
                    <T v="rowName">{p.name}</T>
                    <T v="rowPreview">{p.time_label}</T>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={color.text3} />
                </Row>
              ))}
            </View>
          </>
        ) : null}

        <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s32, color: color.text4 }}>
          powered by Meta AI
        </T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // One grouped un-surface block with hairline dividers (DESIGN_SPEC 3.12).
  group: { marginHorizontal: inset.card, marginTop: space.s16, backgroundColor: color.surface, borderRadius: radius.row, overflow: "hidden" },
  groupRow: { borderRadius: 0, backgroundColor: "transparent", minHeight: 64 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairline },
  well: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" },
});
