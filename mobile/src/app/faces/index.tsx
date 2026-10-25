// "see who" (face-clusters-list): every photo group from Connect photos, each opening its page.
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ClusterAvatar, clusterLabel } from "../../components/faces";
import { NavBar, Row, styles as ui, T } from "../../components/ui";
import { api, type Faces } from "../../lib/api";
import { useHome } from "../../lib/useHome";
import { READING_MAX, useLayout } from "../../lib/useLayout";
import { inset, space } from "../../theme/tokens";

export default function FaceGroups() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { home } = useHome(30000);
  const [faces, setFaces] = useState<Faces | null>(null);
  useFocusEffect(
    useCallback(() => {
      api.faces().then(setFaces).catch(() => setFaces({ clusters: [], pending: [], dismissed: false }));
    }, []),
  );
  return (
    <View style={ui.screen}>
      <NavBar title="Connect photos" />
      <ScrollView contentContainerStyle={[layout.column(READING_MAX), { paddingTop: space.s16, paddingBottom: insets.bottom + space.s48 }]}>
        <T v="caption" style={{ marginHorizontal: inset.text, marginBottom: space.s16 }}>grouped on your phone. only you can see this.</T>
        <View style={{ marginHorizontal: inset.card, gap: space.s8 }}>
          {faces?.clusters.map((c) => (
            <Row key={c.id} onPress={() => router.push({ pathname: "/faces/[id]", params: { id: c.id } })}>
              <ClusterAvatar cluster={c} size={44} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{clusterLabel(c, home?.people ?? [])}</T>
                <T v="rowPreview" lines={1}>{`${c.count} photos · from ${c.sources.join(", ")}`}</T>
              </View>
            </Row>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
