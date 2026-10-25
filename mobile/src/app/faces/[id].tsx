// A person's photos (DESIGN_SPEC 3.13): "212 photos · from Photos, Instagram", "add to Mom's memories",
// and "not them" on each photo. An unknown group asks who it is first ("Who is this for?").
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clusterLabel } from "../../components/faces";
import { Avatar, Chip, NavBar, PrimaryPill, Sheet, styles as ui, T, TextButton } from "../../components/ui";
import { api, type FaceCluster, mediaUrl } from "../../lib/api";
import { haptics } from "../../lib/haptics";
import { toast } from "../../lib/toast";
import { useHome } from "../../lib/useHome";
import { READING_MAX, useLayout } from "../../lib/useLayout";
import { color, inset, space } from "../../theme/tokens";

const GAP = space.s4;

export default function FaceClusterScreen() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { home } = useHome(30000);
  const people = home?.people ?? [];
  const [cluster, setCluster] = useState<FaceCluster | null>(null);
  const [picking, setPicking] = useState(false);

  const load = useCallback(() => {
    api.faces().then((f) => setCluster(f.clusters.find((c) => c.id === id) ?? null)).catch(() => {});
  }, [id]);
  useFocusEffect(load);

  const content = Math.min(layout.usableWidth, READING_MAX) - inset.card * 2;
  const tile = Math.floor((content - GAP * 2) / 3);
  const linked = cluster?.linked_person_id ? people.find((p) => p.id === cluster.linked_person_id) : null;
  const target = linked ?? cluster?.suggested ?? null;

  const link = async (personId: string) => {
    if (!cluster) return;
    await api.linkFaces(cluster.id, personId);
    haptics.success();
    toast("Saved. Only you can see it.");
    load();
  };

  return (
    <View style={ui.screen}>
      <NavBar title={cluster ? clusterLabel(cluster, people) : ""} />
      <ScrollView contentContainerStyle={[layout.column(READING_MAX), { paddingTop: space.s16, paddingBottom: insets.bottom + space.s48 }]}>
        {cluster ? (
          <View style={{ marginHorizontal: inset.card, gap: space.s16 }}>
            <View style={{ gap: space.s8, paddingHorizontal: space.s8 }}>
              <View style={{ alignSelf: "flex-start" }}>
                <Chip icon={linked ? "checkmark-circle" : "person-outline"} label={clusterLabel(cluster, people)} />
              </View>
              <T v="rowPreview">{`${cluster.count} photos · from ${cluster.sources.join(", ")}`}</T>
            </View>
            {!linked ? (
              <PrimaryPill
                featureId="face-cluster-link-person"
                label={target ? `add to ${target.name}'s memories` : "Name this person"}
                onPress={() => (target ? link(target.id) : setPicking(true))}
              />
            ) : null}
            <View style={styles.grid}>
              {cluster.photos.map((p) => (
                <View key={p.id} style={{ width: tile, gap: space.s4 }}>
                  <Image source={{ uri: mediaUrl(p.url) ?? undefined }} style={{ width: tile, height: tile * 1.25, borderRadius: 12, backgroundColor: color.surface }} contentFit="cover" />
                  <TextButton
                    featureId="face-cluster-photo-remove"
                    tone="text3"
                    label="not them"
                    onPress={async () => {
                      await api.notThem(p.id);
                      haptics.select();
                      load();
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Sheet visible={picking} onClose={() => setPicking(false)}>
        <T v="section" style={{ marginBottom: space.s12 }}>Who is this for?</T>
        {people.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setPicking(false);
              link(p.id);
            }}
            style={styles.sheetRow}
          >
            <Avatar name={p.name} />
            <T v="rowName" style={{ flex: 1 }}>{p.name}</T>
            <Ionicons name="chevron-forward" size={18} color={color.text4} />
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP, rowGap: space.s8 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s12 },
});
