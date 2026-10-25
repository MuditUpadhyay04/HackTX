// Try Un-Said (EXPO_PUBLIC_TRY_MODE=1): the first screen a judge sees on their own phone, and the one
// "Privacy" opens again later. Calm and plain, in the safety screen's shape.
// TRY (needs Gurneal's OK): every string on this screen.
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon, PrimaryPill, TextButton, styles as ui, T } from "../components/ui";
import { accept, accepted, forgetMe } from "../lib/try";
import { useLayout } from "../lib/useLayout";
import { color, inset, radius, space } from "../theme/tokens";

const POINTS: { title: string; body: string }[] = [
  {
    title: "Demo photos, never yours",
    body: "Un-Said shows a demo Memory Lane and a demo cast: Mom, Sarah and Michael. It never opens your photos or your contacts.",
  },
  {
    title: "If you record",
    body: "Your voice and its transcript go to Meta's Muse Voice Transcribe, to Muse Glimmer on Vultr Inference to sort it by person, and to Google Gemini to check the translation.",
  },
  {
    title: "Your own sandbox",
    body: "What you say is kept in a private sandbox for this browser only, and deleted within 24 hours.",
  },
  {
    title: "Nothing is sent",
    body: "This preview doesn't send anything to anyone. In Un-Said, a letter only goes out when you send it.",
  },
];

export default function Privacy() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const [again] = useState(accepted); // opened from "Privacy" after accepting
  const [declined, setDeclined] = useState(false);
  const [forgotten, setForgotten] = useState(false);

  const start = () => {
    accept();
    if (again && router.canGoBack()) router.back();
    else router.replace("/gallery");
  };

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ ...layout.column(), paddingTop: insets.top + space.s32, paddingBottom: insets.bottom + space.s48 }}>
        <View style={{ marginHorizontal: inset.text, gap: space.s16 }}>
          <AppIcon size={56} />
          <T v="display">{"Try Un-Said"}</T>
          <T v="rowPreview">{"A preview of Un-Said for HackTX judges. Before you start, here's what happens to what you say."}</T>
        </View>

        <View style={{ gap: space.s8, marginTop: space.s24 }}>
          {POINTS.map((p) => (
            <View key={p.title} style={styles.row}>
              <T v="rowName">{p.title}</T>
              <T v="rowPreview">{p.body}</T>
            </View>
          ))}
        </View>

        <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>
          {"Un-Said isn't a crisis service. If you need someone now, call or text 988."}
        </T>

        <View style={{ marginTop: space.s32, gap: space.s12 }}>
          <PrimaryPill featureId="try-accept" label="Accept and try it" onPress={start} />
          {declined ? (
            <T v="caption" style={{ textAlign: "center", marginHorizontal: inset.text }}>
              {"No problem. Nothing was recorded. You can close this page."}
            </T>
          ) : (
            <View style={{ alignItems: "center" }}>
              <TextButton label="Not now" onPress={() => setDeclined(true)} />
            </View>
          )}
          {again ? (
            <View style={{ alignItems: "center", gap: space.s8 }}>
              {forgotten ? (
                <T v="caption" style={{ textAlign: "center", marginHorizontal: inset.text }}>
                  {"Done. This browser has a new, empty sandbox."}
                </T>
              ) : (
                <TextButton
                  tone="danger"
                  label="Delete my data"
                  onPress={() => {
                    forgetMe();
                    accept(); // a fresh sandbox, still accepted: they already read this page
                    setForgotten(true);
                  }}
                />
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: inset.card, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s4 },
});
