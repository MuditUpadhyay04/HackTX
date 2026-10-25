// One person, from the People tab: their photos and one-tap ways into the existing flows
// (Talk, typing in Talk, the gallery for a photo or video, and their pile of lines).
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Skeleton } from "../../components/motion";
import { Avatar, NavBar, Press, styles as ui, T } from "../../components/ui";
import { mediaUrl } from "../../lib/api";
import { haptics } from "../../lib/haptics";
import { GROUP_LABEL, sameAsName, showable, usePeopleGroups } from "../../lib/people";
import { SPLIT_MAX, useLayout } from "../../lib/useLayout";
import { color, inset, radius, space } from "../../theme/tokens";

const GAP = space.s4;

export default function PersonPage() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const split = layout.expanded;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = usePeopleGroups();
  const entry = data?.people.find((e) => e.person.id === id);
  const person = entry?.person;
  const photos = entry ? showable(entry.photos) : [];

  const go = (fn: () => void) => () => {
    haptics.tap();
    fn();
  };
  const talkParams = { toName: person?.name ?? "", channel: person?.channel ?? "", person: id };
  const actions: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; featureId: string }[] = [
    { icon: "mic", label: "Talk", featureId: "person-talk", onPress: go(() => router.push({ pathname: "/talk", params: talkParams })) },
    // Write opens Compose for them (DESIGN_SPEC 3.3); their draft, if any, is waiting there.
    { icon: "create", label: "Write", featureId: "person-write", onPress: go(() => router.push({ pathname: "/compose", params: { person: id } })) },
    { icon: "images", label: "Photo or video", featureId: "person-media", onPress: go(() => router.push({ pathname: "/gallery", params: talkParams })) },
    { icon: "albums", label: "Your words", featureId: "person-pile", onPress: go(() => router.push({ pathname: "/pile/[person]", params: { person: id } })) },
  ];

  // Wide: the person and their actions on the left, the photos on the right.
  const content = Math.min(layout.usableWidth, SPLIT_MAX) - inset.card * 2;
  const photoWidth = split ? (content - space.s24) * 0.58 : content;
  const tile = Math.floor((photoWidth - GAP * 2) / 3);
  const headWidth = split ? content - photoWidth - space.s24 : content;
  const actionWidth = Math.floor((headWidth - space.s8) / 2);

  const head = (
    <View style={{ gap: space.s24 }}>
      <View style={styles.head}>
        <Avatar name={person?.name ?? " "} size={72} ring />
        <View style={{ flex: 1 }}>
          <T v="cardTitle" lines={1}>{person?.name ?? " "}</T>
          {entry ? <T v="rowPreview">{sameAsName(entry) ? person?.time_label : `${GROUP_LABEL[entry.group]} · ${person?.time_label ?? ""}`}</T> : null}
        </View>
      </View>
      <View style={styles.actions}>
        {actions.map((a) => (
          <Press key={a.label} featureId={a.featureId} onPress={a.onPress} style={[styles.action, { width: actionWidth }]}>
            <View style={styles.well}>
              <Ionicons name={a.icon} size={22} color={color.accent} />
            </View>
            <T v="rowName" lines={2}>{a.label}</T>
          </Press>
        ))}
      </View>
    </View>
  );

  const grid = photos.length ? (
    <View style={[styles.photos, split ? { width: photoWidth } : null]}>
      {photos.map((p) => (
        <Press key={p.id} featureId="person-photo-talk" onPress={() => router.push({ pathname: "/talk", params: { ...talkParams, seenPhoto: p.url } })} style={{ width: tile }}>
          <Image source={{ uri: mediaUrl(p.url) ?? undefined }} style={[styles.tile, { width: tile, height: tile * 1.25 }]} contentFit="cover" transition={150} />
          {p.caption ? <T v="caption" lines={1} style={{ marginTop: space.s4 }}>{p.caption}</T> : null}
        </Press>
      ))}
    </View>
  ) : null;

  return (
    <View style={ui.screen}>
      <NavBar title={person?.name ?? ""} />
      <ScrollView contentContainerStyle={{ ...layout.column(SPLIT_MAX), paddingTop: space.s16, paddingBottom: insets.bottom + space.s48 }}>
        {!data ? (
          <View style={{ marginHorizontal: inset.card, gap: space.s16 }}>
            <Skeleton height={96} />
            <Skeleton height={220} />
          </View>
        ) : split ? (
          <View style={{ flexDirection: "row", gap: space.s24, marginHorizontal: inset.card, alignItems: "flex-start" }}>
            <View style={{ width: headWidth }}>{head}</View>
            {grid}
          </View>
        ) : (
          <View style={{ marginHorizontal: inset.card, gap: space.s24 }}>
            {head}
            {grid}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: space.s16, paddingHorizontal: space.s8 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.s8 },
  action: { minHeight: 96, justifyContent: "space-between", gap: space.s12, padding: space.s16, borderRadius: radius.row, backgroundColor: color.surface },
  well: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
  photos: { flexDirection: "row", flexWrap: "wrap", gap: GAP, rowGap: space.s12 },
  tile: { borderRadius: 12, backgroundColor: color.surfaceRaised },
});
