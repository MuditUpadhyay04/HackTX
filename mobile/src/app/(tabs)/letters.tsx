// Letters (DESIGN_SPEC 3.6): what came back. Gradient ring = unread.
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Row, styles as ui, T } from "../../components/ui";
import { useHome } from "../../lib/useHome";
import { inset, space } from "../../theme/tokens";

export default function Letters() {
  const insets = useSafeAreaInsets();
  const { home } = useHome();
  const replies = home?.replies ?? [];
  const senders = [...new Map(replies.map((r) => [r.from_person_id, r])).values()];

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.s8, paddingBottom: space.s48 }}>
        <T v="display" style={{ marginHorizontal: inset.text }}>Letters</T>

        {senders.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rings}>
            {senders.map((r) => (
              <View key={r.from_person_id} style={{ alignItems: "center", gap: space.s4 }}>
                <Avatar name={r.from_name} size={56} ring={!r.heard_at} />
                <T v="meta">{r.from_name}</T>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View style={{ marginHorizontal: inset.card, gap: space.s8, marginTop: space.s16 }}>
          {replies.map((r) => (
            <Row key={r.id} featureId="letter-open" onPress={() => router.push({ pathname: "/letter/[id]", params: { id: r.id } })}>
              <Avatar name={r.from_name} ring={!r.heard_at} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{r.from_name}</T>
                <T v="rowPreview" lines={1}>{r.audio_url ? "voice reply" : r.transcript}</T>
              </View>
              <T v="meta">{r.day}</T>
            </Row>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rings: { gap: space.s16, paddingHorizontal: inset.text, paddingTop: space.s24 },
});
