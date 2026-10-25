// The phone's gallery, as a Photos look-alike (no Apple assets). Un-Said lives on top of it.
import { Image } from "expo-image";
import { usePermissions } from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AppIcon, PrimaryPill } from "../components/ui";
import { haptics } from "../lib/haptics";
import { type GalleryPhoto, loadPhotos } from "../lib/photos";
import { useLayout } from "../lib/useLayout";
import { color, space } from "../theme/tokens";

// Like Photos: three across on a phone in portrait, more as the window widens (unfolded, landscape).
const MIN_COLUMNS = 3;
const TARGET_TILE = 128;
const GAP = 2;
const PAGE = 90;

const dedupe = (list: GalleryPhoto[]) => [...new Map(list.map((p) => [p.id, p])).values()];

export default function Gallery() {
  // Opened from a person's page ("Photo or video"): Talk on a photo is for them.
  const { person, toName, channel } = useLocalSearchParams<{ person?: string; toName?: string; channel?: string }>();
  const { insets, usableWidth } = useLayout();
  const columns = Math.max(MIN_COLUMNS, Math.floor(usableWidth / TARGET_TILE));
  const tile = Math.floor((usableWidth - GAP * (columns - 1)) / columns);
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
    <View style={[styles.header, { paddingTop: insets.top + space.s4, paddingLeft: space.s16 + insets.left, paddingRight: space.s16 + insets.right }]}>
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
        <Ionicons name="chevron-back" size={24} color={color.text} />
      </Pressable>
      <Text style={[styles.title, { flex: 1 }]}>Library</Text>
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
      <Text style={[styles.sub, styles.count]}>{photos.length ? `${photos.length}${done ? "" : "+"} photos` : " "}</Text>
    </View>
  );

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <View style={styles.black}>
        {header}
        <View style={styles.ask}>
          <View style={styles.askWell}>
            <Ionicons name="images" size={34} color={color.accent} />
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
        // numColumns can't change on a mounted list; remount when the window changes the column count.
        key={`cols-${columns}`}
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={columns}
        ListHeaderComponent={header}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP, paddingBottom: insets.bottom + space.s32, paddingLeft: insets.left, paddingRight: insets.right }}
        onEndReached={more}
        onEndReachedThreshold={1.5}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="imagebutton"
            onPress={() => router.push({ pathname: "/photo/[id]", params: { id: item.id, w: item.width ?? 0, h: item.height ?? 0, t: item.creationTime ?? 0, person: person ?? "", toName: toName ?? "", channel: channel ?? "" } })}
          >
            <Image source={{ uri: item.id }} style={{ width: tile, height: tile, backgroundColor: color.surface }} contentFit="cover" recyclingKey={item.id} transition={120} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: color.bg },
  // The back arrow, "Library" and the icon share one row; the count sits under the title.
  header: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.s8, paddingHorizontal: space.s16, paddingBottom: space.s12 },
  count: { width: "100%", paddingLeft: 36 - space.s8 + space.s8 },
  back: { width: 36, height: 41, justifyContent: "center", marginLeft: -space.s8 },
  ask: { flex: 1, width: "100%", maxWidth: 440, alignSelf: "center", justifyContent: "center", alignItems: "center", gap: space.s16, paddingBottom: space.s64 },
  askWell: { width: 80, height: 80, borderRadius: 24, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
  title: { color: color.text, fontSize: 34, lineHeight: 41, fontWeight: "700", letterSpacing: 0.4 },
  sub: { color: color.text3, fontSize: 15, lineHeight: 20 },
});
