// Letters (DESIGN_SPEC 3.6). A gradient ring means unread.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Skeleton } from "../../components/motion";
import { Avatar, Press, Row, styles as ui, T } from "../../components/ui";
import { haptics } from "../../lib/haptics";
import { useHome } from "../../lib/useHome";
import { color, inset, radius, space } from "../../theme/tokens";
import { useLayout } from "../../lib/useLayout";

export default function Letters() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { home, error, refresh } = useHome();
  const replies = home?.replies ?? [];
  const senders = [...new Map(replies.map((r) => [r.from_person_id, r])).values()];
  const unread = new Set(replies.filter((r) => !r.heard_at).map((r) => r.from_person_id));
  const loading = !home && !error;

  const openFrom = (personId: string, fallbackId: string) => {
    const unheard = replies.find((r) => r.from_person_id === personId && !r.heard_at);
    haptics.tap();
    router.push({ pathname: "/letter/[id]", params: { id: unheard?.id ?? fallbackId } });
  };

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ ...layout.column(), paddingTop: insets.top + space.s8, paddingBottom: space.s48 }}>
        <T v="display" style={{ marginHorizontal: inset.text }}>
          Un-said
        </T>

        {loading ? (
          <View style={{ marginHorizontal: inset.card, marginTop: space.s24, gap: space.s8 }}>
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

        {home && senders.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyWell}>
              <Ionicons name="mail-open-outline" size={30} color={color.accent} />
            </View>
            <T v="rowPreview" style={{ textAlign: "center", color: color.text2 }}>
              When someone writes back, it lands here.
            </T>
          </View>
        ) : null}

        {/* The strip is a way to pick between senders; with one sender it only repeats the row below. */}
        {senders.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rings}>
            {senders.map((r) => (
              <Pressable key={r.from_person_id} onPress={() => openFrom(r.from_person_id, r.id)} style={{ alignItems: "center", gap: space.s8, width: 72 }}>
                <Avatar name={r.from_name} size={56} ring={unread.has(r.from_person_id)} />
                <T v="meta" lines={1}>
                  {r.from_name}
                </T>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={{ marginHorizontal: inset.card, gap: space.s8, marginTop: space.s16 }}>
          {replies.map((r) => (
            <Row key={r.id} featureId="letter-open" onPress={() => router.push({ pathname: "/letter/[id]", params: { id: r.id } })}>
              <Avatar name={r.from_name} ring={!r.heard_at} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{r.from_name}</T>
                <T v="rowPreview" lines={1}>
                  {r.audio_url ? "voice reply" : r.transcript}
                </T>
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
  empty: { marginHorizontal: inset.card, marginTop: space.s32, paddingVertical: space.s48, paddingHorizontal: space.s24, alignItems: "center", gap: space.s16, borderRadius: radius.hero, borderWidth: 1, borderStyle: "dashed", borderColor: color.hairline },
  emptyWell: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" },
});
