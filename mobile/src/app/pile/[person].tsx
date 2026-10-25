// "For Mom": his own lines for one person (DESIGN_SPEC 3.8). Nothing is pre-picked.
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../../components/AppRail";
import { Avatar, Chip, NavBar, Overline, PrimaryPill, styles as ui, T, TextButton } from "../../components/ui";
import { api, type Piece } from "../../lib/api";
import { type App, APP_LABEL, CHANNEL_APP } from "../../lib/handoff";
import { useHome } from "../../lib/useHome";
import { color, inset, pillGradient, radius, space } from "../../theme/tokens";

const SHEET_APPS: App[] = ["whatsapp", "messages", "instagram"];

export default function Pile() {
  const insets = useSafeAreaInsets();
  const { person: personId, photo } = useLocalSearchParams<{ person: string; photo?: string }>();
  const { home } = useHome(15000);
  const person = home?.people.find((p) => p.id === personId);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [on, setOn] = useState<Set<string>>(new Set());
  const [app, setApp] = useState<App | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    api.pieces(personId).then(setPieces).catch(() => {});
  }, [personId]);

  const channelApp = app ?? (person && person.channel !== "self" ? CHANNEL_APP[person.channel] : "messages");
  const toggle = (id: string) =>
    setOn((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const preview = () =>
    router.push({
      pathname: "/preview",
      params: { person: personId, pieces: pieces.filter((p) => on.has(p.id)).map((p) => p.id).join(","), app: channelApp, photo: photo ?? "" },
    });

  return (
    <View style={ui.screen}>
      <NavBar title={person ? `For ${person.name}` : ""} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
        {person ? (
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
              <Avatar name={person.name} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{person.name}</T>
                <View style={{ flexDirection: "row", gap: space.s4 }}>
                  <T v="rowPreview">{`Goes to ${person.name} on ${APP_LABEL[channelApp]}`}</T>
                  <TextButton featureId="delivery-channel-pick" label="Change" onPress={() => setPicking(true)} />
                </View>
              </View>
            </View>
            {person.is_asleep ? (
              <View style={{ marginTop: space.s12 }}>
                <Chip icon="moon" label={`${person.local_time} for ${person.name}`} />
              </View>
            ) : null}
          </View>
        ) : null}

        <Overline style={{ marginHorizontal: inset.text, marginTop: space.s24, marginBottom: space.s8 }}>In your words</Overline>
        {pieces.map((p) => {
          const active = on.has(p.id);
          return (
            <Pressable key={p.id} testID="pile-line-toggle" onPress={() => toggle(p.id)} style={styles.line}>
              <View style={{ flex: 1 }}>
                <T v="words" style={{ color: active ? color.text : color.text4 }}>{p.text}</T>
                <T v="meta" style={{ marginTop: space.s4 }}>{`${new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${p.tone}`}</T>
              </View>
              {active ? (
                <LinearGradient colors={pillGradient.colors} locations={pillGradient.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toggle}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={[styles.toggle, { borderWidth: 1.5, borderColor: color.text4 }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.s16 }]}>
        <PrimaryPill featureId="letter-preview" label="Preview letter" disabled={on.size === 0} onPress={preview} />
      </View>

      <Modal transparent visible={picking} animationType="slide" onRequestClose={() => setPicking(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={() => setPicking(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.s16 }]}>
          <View style={styles.grabber} />
          {SHEET_APPS.map((a) => (
            <Pressable key={a} onPress={() => { setApp(a); setPicking(false); }} style={styles.sheetRow}>
              <AppGlyph app={a} size={36} />
              <T v="rowName" style={{ flex: 1 }}>{APP_LABEL[a]}</T>
              {a === channelApp ? <Ionicons name="checkmark" size={20} color={color.violet} /> : null}
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginHorizontal: inset.card, marginTop: space.s8, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16 },
  line: { flexDirection: "row", alignItems: "center", gap: space.s16, paddingHorizontal: inset.text, paddingVertical: space.s12 },
  toggle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: space.s16, backgroundColor: color.bg },
  sheet: { backgroundColor: color.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: space.s16, paddingTop: space.s12 },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.text4, marginBottom: space.s16 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s12 },
});
