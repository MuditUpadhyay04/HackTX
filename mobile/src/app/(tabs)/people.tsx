// People: everyone he has words for, grouped by who they are to him, with the photos he gave them.
// One tap on a person (or a photo of them) opens their page, which goes straight into Talk, the
// letter, or their pile. Grouping comes from the backend (relation + photos he attached); no faces.
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Skeleton } from "../../components/motion";
import { Avatar, Press, styles as ui, T } from "../../components/ui";
import { mediaUrl, type PersonPhotos } from "../../lib/api";
import { haptics } from "../../lib/haptics";
import { GROUP_LABEL, type PeopleFilter, sameAsName, showable, usePeopleGroups } from "../../lib/people";
import { SPLIT_MAX, useLayout } from "../../lib/useLayout";
import { color, inset, radius, space } from "../../theme/tokens";

const GAP = space.s4;

export default function People() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { data, error, refresh } = usePeopleGroups();
  const [filter, setFilter] = useState<PeopleFilter>("all");
  const loading = !data && !error;

  const chips: PeopleFilter[] = data ? ["all", ...(data.has_family ? (["family"] as const) : []), ...data.groups] : [];
  const active = chips.includes(filter) ? filter : "all";
  const shown = (data?.people ?? []).filter((e) => active === "all" || (active === "family" ? e.family : e.group === active));

  // Phone: one column. Wide (Duo, unfolded, landscape): two columns of people.
  const columns = layout.expanded ? 2 : 1;
  const content = Math.min(layout.usableWidth, SPLIT_MAX) - inset.card * 2;
  const cardWidth = (content - space.s16 * (columns - 1)) / columns;
  const tile = Math.floor((cardWidth - space.s16 * 2 - GAP * 2) / 3);

  const open = (personId: string) => {
    haptics.tap();
    router.push({ pathname: "/person/[id]", params: { id: personId } });
  };

  const label = (f: PeopleFilter) => (f === "all" ? "All" : f === "family" ? "Family" : GROUP_LABEL[f]);

  return (
    <View style={ui.screen}>
      <ScrollView contentContainerStyle={{ ...layout.column(SPLIT_MAX), paddingTop: insets.top + space.s8, paddingBottom: space.s48 }}>
        <T v="display" style={{ marginHorizontal: inset.text }}>
          People
        </T>

        {chips.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {chips.map((f) => {
              const on = f === active;
              return (
                <Pressable
                  key={f}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    haptics.select();
                    setFilter(f);
                  }}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <T v="meta" style={{ color: on ? color.onAccent : color.text2, fontWeight: "600", fontSize: 14, lineHeight: 18 }}>
                    {label(f)}
                  </T>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {loading ? (
          <View style={{ marginHorizontal: inset.card, marginTop: space.s24, gap: space.s16 }}>
            <Skeleton height={180} />
            <Skeleton height={180} />
          </View>
        ) : null}

        {error && !data ? (
          <View style={{ marginTop: space.s24, gap: space.s16 }}>
            <T v="rowPreview" style={{ marginHorizontal: inset.text }}>{`Can't reach Un-Said's server. ${error}`}</T>
            <Press onPress={() => refresh()} style={[ui.pill, { backgroundColor: color.surfaceRaised }]}>
              <T v="button">Try again</T>
            </Press>
          </View>
        ) : null}

        <View style={[styles.grid, { marginTop: space.s16 }]}>
          {shown.map((entry) => (
            <PersonCard key={entry.person.id} entry={entry} width={cardWidth} tile={tile} onOpen={() => open(entry.person.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function PersonCard({ entry, width, tile, onOpen }: { entry: PersonPhotos; width: number; tile: number; onOpen: () => void }) {
  const photos = showable(entry.photos).slice(0, 6);
  return (
    <Press onPress={onOpen} featureId="people-open" style={[styles.card, { width }]}>
      <View style={styles.head}>
        <Avatar name={entry.person.name} size={48} />
        <View style={{ flex: 1 }}>
          <T v="rowName">{entry.person.name}</T>
          {/* "Mom" under "Mom" says nothing; the label only shows when it adds something. */}
          {sameAsName(entry) ? null : <T v="rowPreview">{GROUP_LABEL[entry.group]}</T>}
        </View>
      </View>
      {photos.length ? (
        <View style={styles.photos}>
          {photos.map((p) => (
            <Image key={p.id} source={{ uri: mediaUrl(p.url) ?? undefined }} style={[styles.tile, { width: tile, height: tile }]} contentFit="cover" transition={150} />
          ))}
        </View>
      ) : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  chips: { gap: space.s8, paddingHorizontal: inset.card, paddingTop: space.s16 },
  chip: { paddingHorizontal: space.s16, height: 36, borderRadius: radius.pill, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: color.accent },
  grid: { marginHorizontal: inset.card, flexDirection: "row", flexWrap: "wrap", gap: space.s16 },
  card: { backgroundColor: color.surface, borderRadius: radius.row, padding: space.s16, gap: space.s12 },
  head: { flexDirection: "row", alignItems: "center", gap: space.s12 },
  photos: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  tile: { borderRadius: 10, backgroundColor: color.surfaceRaised },
});
