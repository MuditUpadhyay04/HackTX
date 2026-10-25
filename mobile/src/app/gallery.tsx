// The phone's gallery, as a Photos look-alike (no Apple assets). Un-Said lives on top of it.
import { Image } from "expo-image";
import { usePermissions } from "expo-media-library";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { AppIcon, PrimaryPill } from "../components/ui";
import { haptics } from "../lib/haptics";
import { type GalleryPhoto, loadPhotos } from "../lib/photos";
import { color, space } from "../theme/tokens";

const COLUMNS = 3;
const GAP = 2;
const PAGE = 90;

const dedupe = (list: GalleryPhoto[]) => [...new Map(list.map((p) => [p.id, p])).values()];

export default function Gallery() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tile = Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS);
  const [permission, requestPermission] = usePermissions();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [done, setDone] = useState(false);
  const loading = useRef(false);

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
    <View style={[styles.header, { paddingTop: insets.top + space.s4 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => {
          haptics.tap();
          if (router.canGoBack()) router.back();
          else router.replace("/home");
        }}
        style={styles.back}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.sub}>{photos.length ? `${photos.length}${done ? "" : "+"} photos` : " "}</Text>
      </View>
      <Pressable
        testID="overlay-open-home"
        accessibilityLabel="Open Un-Said"
        hitSlop={12}
        onPress={() => {
          haptics.tap();
          router.push("/home");
        }}
      >
        <AppIcon size={36} />
      </Pressable>
    </View>
  );

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <View style={styles.black}>
        {header}
        <View style={styles.ask}>
          <View style={styles.askWell}>
            <Ionicons name="images" size={34} color={color.violet} />
          </View>
          <Text style={[styles.sub, { textAlign: "center", paddingHorizontal: space.s32, color: color.text2 }]}>
            Un-Said looks through your photos with you, on this phone.
          </Text>
          <View style={{ alignSelf: "stretch", marginTop: space.s8 }}>
            <PrimaryPill label="Allow photo access" featureId="camera-roll-scan" onPress={requestPermission} />
          </View>
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
            accessibilityRole="imagebutton"
            onPress={() => router.push({ pathname: "/photo/[id]", params: { id: item.id, w: item.width ?? 0, h: item.height ?? 0, t: item.creationTime ?? 0 } })}
          >
            <Image source={{ uri: item.id }} style={{ width: tile, height: tile, backgroundColor: color.surface }} contentFit="cover" recyclingKey={item.id} transition={120} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "flex-end", gap: space.s8, paddingHorizontal: space.s16, paddingBottom: space.s12 },
  back: { width: 36, height: 41, justifyContent: "center", marginLeft: -space.s8 },
  ask: { flex: 1, justifyContent: "center", alignItems: "center", gap: space.s16, paddingBottom: space.s64 },
  askWell: { width: 80, height: 80, borderRadius: 24, backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 34, lineHeight: 41, fontWeight: "700", letterSpacing: 0.4 },
  sub: { color: color.text3, fontSize: 15, lineHeight: 20 },
});
