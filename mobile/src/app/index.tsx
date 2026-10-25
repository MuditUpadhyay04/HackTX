// The phone's gallery, as a Photos look-alike (no Apple assets). Un-Said lives on top of it:
// its icon sits in the corner, and on any photo it can open the place to say something.
import { Image } from "expo-image";
import { usePermissions } from "expo-media-library";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon, PrimaryPill } from "../components/ui";
import { type GalleryPhoto, loadPhotos } from "../lib/photos";
import { space } from "../theme/tokens";

const COLUMNS = 3;
const GAP = 2;
const PAGE = 90;
const TILE = (Dimensions.get("window").width - GAP * (COLUMNS - 1)) / COLUMNS;

const dedupe = (list: GalleryPhoto[]) => [...new Map(list.map((p) => [p.id, p])).values()];

export default function Gallery() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = usePermissions();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [done, setDone] = useState(false);
  const loading = useRef(false);

  // One page at a time: onEndReached can fire again before the last page lands,
  // and it fires on the empty list while the first page is still loading.
  const more = useCallback(async () => {
    if (done || loading.current || photos.length === 0) return;
    loading.current = true;
    try {
      const next = await loadPhotos(photos.length, PAGE);
      setPhotos((p) => dedupe([...p, ...next]));
      if (next.length < PAGE) setDone(true);
    } finally {
      loading.current = false;
    }
  }, [photos.length, done]);

  useEffect(() => {
    if (!permission?.granted) return;
    let alive = true;
    loadPhotos(0, PAGE).then((first) => {
      if (!alive) return;
      setPhotos(dedupe(first));
      setDone(first.length < PAGE);
    });
    return () => {
      alive = false;
    };
  }, [permission?.granted]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + space.s8 }]}>
      <View>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.sub}>{photos.length ? `${photos.length}${done ? "" : "+"} photos` : " "}</Text>
      </View>
      <Pressable testID="overlay-open-home" hitSlop={12} onPress={() => router.push("/home")}>
        <AppIcon size={36} />
      </Pressable>
    </View>
  );

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <View style={styles.black}>
        {header}
        <View style={{ flex: 1, justifyContent: "center", gap: space.s24 }}>
          <Text style={[styles.sub, { textAlign: "center", paddingHorizontal: space.s32 }]}>
            Un-Said looks through your photos with you, on this phone.
          </Text>
          <PrimaryPill label="Allow photo access" featureId="camera-roll-scan" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.black}>
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={COLUMNS}
        ListHeaderComponent={header}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP, paddingBottom: insets.bottom + space.s32 }}
        onEndReached={more}
        onEndReachedThreshold={1.5}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/photo/[id]", params: { id: item.id, w: item.width ?? 0, h: item.height ?? 0, t: item.creationTime ?? 0 } })}
          >
            <Image source={{ uri: item.id }} style={{ width: TILE, height: TILE }} contentFit="cover" recyclingKey={item.id} transition={120} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: space.s16, paddingBottom: space.s12 },
  title: { color: "#fff", fontSize: 34, lineHeight: 41, fontWeight: "700", letterSpacing: 0.4 },
  sub: { color: "#9C99AA", fontSize: 15, lineHeight: 20 },
});
