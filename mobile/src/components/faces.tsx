// Face groups (DESIGN_SPEC 3.13), demo build: the backend hands over already-grouped imported photos
// (no face recognition anywhere). Nothing is linked to anyone until he confirms.
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { api, type FaceCluster, mediaUrl } from "../lib/api";
import { haptics } from "../lib/haptics";
import { color, pillGradient, radius, space } from "../theme/tokens";
import { PrimaryPill, Sheet, T, TextButton } from "./ui";

/** A group's face: its first photo in a gradient ring. */
export function ClusterAvatar({ cluster, size = 64 }: { cluster: FaceCluster; size?: number }) {
  const uri = mediaUrl(cluster.photos[0]?.url ?? null) ?? undefined;
  return (
    <LinearGradient colors={pillGradient.colors} locations={pillGradient.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 2, borderRadius: size }}>
      <View style={{ padding: 2, borderRadius: size, backgroundColor: color.bg }}>
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.surface }} contentFit="cover" />
      </View>
    </LinearGradient>
  );
}

/** "Mom?" for a suggestion, the name once linked, "Name this person" for an unknown group. */
export function clusterLabel(c: FaceCluster, people: { id: string; name: string }[]) {
  if (c.linked_person_id) return people.find((p) => p.id === c.linked_person_id)?.name ?? "";
  return c.suggested ? `${c.suggested.name}?` : "Name this person";
}

export function FacesSheet({ visible, clusters, onClose, onChanged }: { visible: boolean; clusters: FaceCluster[]; onClose: () => void; onChanged: () => void }) {
  const accept = async (c: FaceCluster) => {
    if (!c.suggested) {
      onClose();
      router.push({ pathname: "/faces/[id]", params: { id: c.id } });
      return;
    }
    await api.linkFaces(c.id, c.suggested.id);
    haptics.success();
    onChanged();
  };
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View testID="face-cluster-popup-event" style={{ gap: space.s4, marginBottom: space.s16 }}>
        <T v="section">{`We found ${clusters.length} ${clusters.length === 1 ? "person" : "people"} in your photos`}</T>
        <T v="caption">grouped on your phone. only you can see this.</T>
      </View>
      <View style={styles.row}>
        {clusters.map((c) => (
          <View key={c.id} style={styles.cell}>
            <Pressable testID="face-cluster-photos" onPress={() => { onClose(); router.push({ pathname: "/faces/[id]", params: { id: c.id } }); }}>
              <ClusterAvatar cluster={c} size={56} />
            </Pressable>
            <T v="meta" style={{ fontVariant: ["tabular-nums"] }}>{String(c.count)}</T>
            <Pressable testID={c.suggested ? "face-cluster-suggestion-accept" : "face-cluster-name"} onPress={() => accept(c)} style={styles.chip}>
              <T v="meta" lines={2} style={{ color: color.accent, fontWeight: "600", textAlign: "center" }}>{c.suggested ? `${c.suggested.name}?` : "Name this person"}</T>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={{ marginTop: space.s24, gap: space.s4 }}>
        <PrimaryPill featureId="face-clusters-list" label="see who" onPress={() => { onClose(); router.push("/faces"); }} />
        <View style={{ alignItems: "center" }}>
          <TextButton
            featureId="face-cluster-dismiss"
            label="not now"
            onPress={() => {
              api.dismissFaces().catch(() => {});
              onClose();
            }}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: space.s8 },
  cell: { flex: 1, alignItems: "center", gap: space.s4 },
  chip: { minHeight: 28, paddingHorizontal: space.s8, paddingVertical: space.s4, borderRadius: radius.pill, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
});
