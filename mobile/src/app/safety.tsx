// Safety (DESIGN_SPEC 3.14): calm, no gradient. Shown instead of person cards when a rant is a concern.
import { router, useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavBar, OutlinePill, styles as ui, T } from "../components/ui";
import type { Resource } from "../lib/api";
import { color, inset, radius, space } from "../theme/tokens";

const DEFAULT: Resource[] = [
  { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988", links: [{ label: "Call 988", href: "tel:988" }, { label: "Text 988", href: "sms:988" }] },
  {
    name: "National Domestic Violence Hotline",
    detail: "Call 1-800-799-7233 · Text START to 88788",
    links: [{ label: "Call 1-800-799-7233", href: "tel:18007997233" }, { label: "Text START to 88788", href: "sms:88788&body=START" }],
  },
  { name: "Immediate danger", detail: "Call 911", links: [{ label: "Call 911", href: "tel:911" }] },
];

export default function Safety() {
  const insets = useSafeAreaInsets();
  const { resources } = useLocalSearchParams<{ resources?: string }>();
  let list = DEFAULT;
  try {
    if (resources) list = JSON.parse(resources);
  } catch {}

  return (
    <View style={ui.screen}>
      <NavBar onBack={() => router.dismissTo("/home")} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.s48 }}>
        <T v="display" style={{ marginHorizontal: inset.text, marginTop: space.s8 }}>{"You deserve to feel safe. Here's real help."}</T>
        <View style={{ gap: space.s8, marginTop: space.s24 }}>
          {list.map((r) => (
            <View key={r.name} style={styles.row}>
              <T v="rowName">{r.name}</T>
              <T v="rowPreview">{r.detail}</T>
              <View style={{ gap: space.s8, marginTop: space.s12 }}>
                {r.links.map((l) => (
                  <OutlinePill key={l.href} label={l.label} onPress={() => Linking.openURL(l.href)} />
                ))}
              </View>
            </View>
          ))}
        </View>
        <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s24 }}>{"Un-Said isn't a crisis service. These people are."}</T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: inset.card, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s4 },
});
