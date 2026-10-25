// "For Mom": his own lines for one person (DESIGN_SPEC 3.8). Nothing is pre-picked.
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../../components/AppRail";
import { Skeleton } from "../../components/motion";
import { Avatar, Chip, NavBar, Overline, PrimaryPill, Sheet, styles as ui, T, TextButton } from "../../components/ui";
import { api, type Piece } from "../../lib/api";
import { haptics } from "../../lib/haptics";
import { type App, APP_LABEL, CHANNEL_APP } from "../../lib/handoff";
import { useHome } from "../../lib/useHome";
import { color, inset, pillGradient, radius, space } from "../../theme/tokens";

const SHEET_APPS: App[] = ["whatsapp", "messages", "instagram"];

export default function Pile() {
  const insets = useSafeAreaInsets();
  const { person: personId, photo } = useLocalSearchParams<{ person: string; photo?: string }>();
  const { home, refresh } = useHome(15000);
  const person = home?.people.find((p) => p.id === personId);
  const [pieces, setPieces] = useState<Piece[] | null>(null);
  const [on, setOn] = useState<Set<string>>(new Set());
  const [app, setApp] = useState<App | null>(null);
  const [picking, setPicking] = useState(false);
  const [zones, setZones] = useState(false);
  const [seenPerson, setSeenPerson] = useState(personId);
  if (personId !== seenPerson) {
    setSeenPerson(personId);
    setPieces(null);
    setOn(new Set());
  }

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      api.pieces(personId)
        .then((list) => {
          if (alive) setPieces(list);
        })
        .catch(() => {
          if (alive) setPieces([]);
        });
      return () => {
        alive = false;
      };
    }, [personId]),
  );

  const channelApp = app ?? (person && person.channel !== "self" ? CHANNEL_APP[person.channel] : "messages");
  const toggle = (id: string) =>
    setOn((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ZONES = [
    { id: "America/Chicago", label: "Central" },
    { id: "America/New_York", label: "Eastern" },
    { id: "America/Los_Angeles", label: "Pacific" },
    { id: "Asia/Kolkata", label: "India" },
    { id: "Europe/London", label: "UK" },
  ];

  const pickZone = async (timezone: string) => {
    if (!person) return;
    try {
      await api.patchPerson(person.id, { timezone });
      haptics.success();
      setZones(false);
      refresh();
    } catch (e) {
      Alert.alert("That didn't save", (e as Error).message);
    }
  };

  const preview = () =>
    router.push({
      pathname: "/preview",
      params: { person: personId, pieces: (pieces ?? []).filter((p) => on.has(p.id)).map((p) => p.id).join(","), app: channelApp, photo: photo ?? "" },
    });

  return (
    <View style={ui.screen}>
      <NavBar title={person ? `For ${person.name}` : ""} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.s24 }}>
        {person ? (
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
              <Avatar name={person.name} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{person.name}</T>
                <T v="rowPreview" lines={1}>{`Goes to ${person.name} on ${APP_LABEL[channelApp]}`}</T>
              </View>
              <TextButton featureId="delivery-channel-pick" tone="text" label="Change" onPress={() => setPicking(true)} />
            </View>
            <View style={styles.headerRule} />
            <Pressable testID="recipient-timezone-set" onPress={() => setZones(true)} hitSlop={8} style={{ alignSelf: "flex-start" }}>
              <Chip icon={person.is_asleep ? "moon" : "time-outline"} label={`${person.local_time} for ${person.name}`} />
            </Pressable>
          </View>
        ) : (
          <Skeleton height={112} style={{ marginHorizontal: inset.card, marginTop: space.s8 }} />
        )}

        <Overline style={{ marginHorizontal: inset.text, marginTop: space.s32, marginBottom: space.s8 }}>In your words</Overline>
        {pieces === null ? (
          <View style={{ marginHorizontal: inset.card, gap: space.s8 }}>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </View>
        ) : null}
        {pieces?.length === 0 ? (
          <View style={styles.empty}>
            <T v="rowPreview">Nothing in your words for them yet.</T>
            <TextButton tone="text" label="Say it out loud" onPress={() => router.push({ pathname: "/talk", params: { toName: person?.name ?? "", channel: person?.channel ?? "" } })} />
          </View>
        ) : null}
        {pieces?.map((p, i) => {
          const active = on.has(p.id);
          return (
            <Pressable
              key={p.id}
              testID="pile-line-toggle"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              onPress={() => { haptics.select(); toggle(p.id); }}
              style={[styles.line, i > 0 && styles.lineRule]}
            >
              <View style={{ flex: 1 }}>
                <T v="words" style={{ color: active ? color.text : color.text4 }}>{p.text}</T>
                <T v="meta" style={{ marginTop: space.s8 }}>{`${new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${p.tone}`}</T>
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

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.s12 }]}>
        <PrimaryPill featureId="letter-preview" label="Preview letter" disabled={!pieces || on.size === 0} onPress={preview} />
        <T v="caption" style={{ textAlign: "center" }}>
          You decide when it leaves.
        </T>
      </View>

      <Sheet visible={picking} onClose={() => setPicking(false)}>
        {SHEET_APPS.map((a) => (
          <Pressable key={a} onPress={() => { setApp(a); setPicking(false); }} style={styles.sheetRow}>
            <AppGlyph app={a} size={36} />
            <T v="rowName" style={{ flex: 1 }}>{APP_LABEL[a]}</T>
            {a === channelApp ? <Ionicons name="checkmark" size={20} color={color.violet} /> : null}
          </Pressable>
        ))}
      </Sheet>

      <Sheet visible={zones} onClose={() => setZones(false)}>
        <T v="section" style={{ marginBottom: space.s8 }}>Their time zone</T>
        {(person && !ZONES.some((z) => z.id === person.timezone) ? [{ id: person.timezone, label: person.timezone }, ...ZONES] : ZONES).map((z) => (
          <Pressable key={z.id} onPress={() => pickZone(z.id)} style={styles.sheetRow}>
            <T v="rowName" style={{ flex: 1 }}>{z.label}</T>
            {person?.timezone === z.id ? <Ionicons name="checkmark" size={20} color={color.violet} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginHorizontal: inset.card, marginTop: space.s8, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s12 },
  headerRule: { height: StyleSheet.hairlineWidth, backgroundColor: color.hairline },
  empty: { marginHorizontal: inset.card, backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s4, alignItems: "flex-start" },
  line: { flexDirection: "row", alignItems: "center", gap: space.s16, marginHorizontal: inset.text, paddingVertical: space.s16 },
  lineRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairline },
  toggle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dock: { gap: space.s12, paddingTop: space.s16, backgroundColor: color.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairline },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s12 },
});
