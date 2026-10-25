// Home (DESIGN_SPEC 3.1): the hero card, his words waiting per person, what's held, who's waiting on him.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../../components/AppRail";
import { Avatar, CardGradient, OutlinePill, PillGradientFill, Press, Row, styles as ui, T, TextButton } from "../../components/ui";
import { api, type Card, type Piece } from "../../lib/api";
import { CHANNEL_APP, handOff } from "../../lib/handoff";
import { toast } from "../../lib/toast";
import { useHome } from "../../lib/useHome";
import { useEffect, useState } from "react";
import { color, inset, radius, shadow, space } from "../../theme/tokens";

const OPEN_LABEL = { instagram: "Open Instagram", whatsapp: "Open WhatsApp", imessage: "Open Messages", self: "" } as const;

export default function Home() {
  const insets = useSafeAreaInsets();
  const { home, error, refresh } = useHome();
  const [drafts, setDrafts] = useState<{ personId: string; latest: Piece }[]>([]);

  // "Your words": the newest line he kept for each person.
  useEffect(() => {
    if (!home) return;
    Promise.all(home.people.map((p) => api.pieces(p.id).then((list) => ({ personId: p.id, latest: list[list.length - 1] }))))
      .then((rows) => setDrafts(rows.filter((r) => r.latest)))
      .catch(() => {});
  }, [home?.clock.now]); // eslint-disable-line react-hooks/exhaustive-deps

  const name = (id: string) => home?.people.find((p) => p.id === id)?.name ?? "";
  const held = home?.cards.filter((c) => c.status === "held") ?? [];
  const ready = home?.cards.filter((c) => c.status === "ready") ?? [];

  const cancel = async (card: Card) => {
    await api.revoke(card.id);
    toast("Kept as a draft.");
    refresh();
  };

  const sendReady = async (card: Card) => {
    const person = home?.people.find((p) => p.id === card.recipient_id);
    if (!person || person.channel === "self") return;
    await api.markShared(card.id);
    await handOff(CHANNEL_APP[person.channel], card);
    refresh();
  };

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: space.s48 }}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Un-Said</Text>
          <Pressable onPress={() => router.push("/you")}>
            <Avatar name={home?.me.name ?? "R"} />
          </Pressable>
        </View>

        <T v="display" style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>Some words take a little longer.</T>

        <Press featureId="draft-new" onPress={() => router.push("/talk")} style={[styles.hero, shadow.hero]}>
          <CardGradient />
          <Text style={styles.quote}>{"“"}</Text>
          <T v="cardTitle" style={{ marginTop: space.s8, marginRight: space.s48 }}>What have you been meaning to say?</T>
          <View style={styles.plus}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
        </Press>

        {error && !home ? <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>{`Can't reach Un-Said's server. ${error}`}</T> : null}

        {drafts.length ? <T v="section" style={styles.section}>Your words</T> : null}
        <View style={styles.list}>
          {drafts.map(({ personId, latest }) => (
            <Row key={personId} featureId="draft-open" onPress={() => router.push({ pathname: "/pile/[person]", params: { person: personId } })}>
              <Avatar name={name(personId)} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{name(personId)}</T>
                <T v="rowPreview" lines={1}>{latest.text}</T>
              </View>
              <T v="meta">Draft</T>
              <Ionicons name="chevron-forward" size={16} color={color.text3} />
            </Row>
          ))}

          <Row onPress={() => router.push("/talk")}>
            <View style={styles.micDot}>
              <PillGradientFill />
              <Ionicons name="mic" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <T v="rowName">Say it out loud</T>
              <T v="rowPreview">Only you can hear this.</T>
            </View>
          </Row>

          <Row onPress={() => router.navigate("/")}>
            <View style={[styles.micDot, { backgroundColor: color.surfaceRaised }]}>
              <Ionicons name="images" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <T v="rowName">Your photos</T>
              <T v="rowPreview">Find the people you miss.</T>
            </View>
          </Row>
        </View>

        {held.length || ready.length ? (
          <View style={[styles.list, { marginTop: space.s24 }]}>
            {held.map((c) => (
              <View key={c.id} style={styles.strip}>
                <Avatar name={c.recipient_name} size={32} />
                <View style={{ flex: 1 }}>
                  <T v="rowName">{c.recipient_name}</T>
                  <T v="meta" style={{ color: color.violet }}>{`arrives ${c.release_label ?? ""}`}</T>
                </View>
                <TextButton featureId="pending-unsend-cancel" tone="text3" label="Cancel" onPress={() => cancel(c)} />
              </View>
            ))}
            {ready.map((c) => (
              <View key={c.id} style={styles.strip}>
                <Avatar name={c.recipient_name} size={32} />
                <View style={{ flex: 1 }}>
                  <T v="rowName">{c.recipient_name}</T>
                  <T v="meta" style={{ color: color.violet }}>{`it's ${home?.people.find((p) => p.id === c.recipient_id)?.local_time ?? ""} for ${c.recipient_name}`}</T>
                </View>
                <TextButton featureId="handoff-whatsapp" tone="text" label="Send now" onPress={() => sendReady(c)} />
              </View>
            ))}
          </View>
        ) : null}

        {home?.reminders.length ? (
          <View style={[styles.list, { marginTop: space.s24 }]}>
            {home.reminders.map((r) => (
              <View key={r.id} style={[ui.card, { gap: space.s12 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
                  <Avatar name={r.person_name} />
                  <View style={{ flex: 1 }}>
                    <T v="rowName">{`${r.person_name} · waiting on you`}</T>
                    <T v="rowPreview">{r.text}</T>
                  </View>
                </View>
                {r.handoff ? (
                  <OutlinePill
                    featureId={`handoff-${r.channel}`}
                    label={OPEN_LABEL[r.channel]}
                    icon={r.channel !== "self" ? <AppGlyph app={CHANNEL_APP[r.channel]} size={24} /> : null}
                    onPress={async () => {
                      await api.reminderDone(r.id);
                      Linking.openURL(r.handoff!);
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 44, marginHorizontal: inset.text, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.s8 },
  wordmark: { color: color.text, fontSize: 24, lineHeight: 28, fontWeight: "800", letterSpacing: -0.24 },
  hero: { marginHorizontal: inset.card, marginTop: space.s24, height: 288, borderRadius: radius.hero, overflow: "hidden", padding: space.s24 },
  quote: { color: "#fff", fontSize: 40, lineHeight: 40, fontWeight: "800" },
  plus: { position: "absolute", right: space.s16, bottom: space.s16, width: 56, height: 56, borderRadius: radius.square, backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" },
  section: { marginHorizontal: inset.text, marginTop: space.s24, marginBottom: space.s8 },
  list: { marginHorizontal: inset.card, gap: space.s8, marginTop: space.s8 },
  micDot: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  strip: { height: 56, flexDirection: "row", alignItems: "center", gap: space.s12, backgroundColor: color.surface, borderRadius: radius.row, paddingHorizontal: space.s16 },
});
