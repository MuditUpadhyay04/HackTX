// One photo, full screen. The Un-Said icon waits in the corner; if he lingers, Un-Said knocks.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../../components/ui";
import { useKnock } from "../../lib/attention";
import { photoDate } from "../../lib/photos";
import { color, space, spring, type } from "../../theme/tokens";

export default function PhotoViewer() {
  const insets = useSafeAreaInsets();
  const { id, t } = useLocalSearchParams<{ id: string; t?: string }>();
  const [chrome, setChrome] = useState(true);
  const [knockY] = useState(() => new Animated.Value(-220));
  const [pulse] = useState(() => new Animated.Value(1));
  // Data wiring (mobile/src/lib/attention.ts): the backend's attention budget decides if and
  // what Un-Said knocks. Most photos never knock; at most once a session, twice a day.
  const { knock, onZoom, open, dismiss } = useKnock(id);

  const talk = () => router.push({ pathname: "/talk", params: { photo: id } });

  useEffect(() => {
    // The icon breathes once when the photo opens, so it's noticed without nagging.
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.12, ...spring.press, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, ...spring.press, useNativeDriver: true }),
    ]).start();
  }, [pulse]);

  useEffect(() => {
    if (knock) Animated.spring(knockY, { toValue: 0, ...spring.banner, useNativeDriver: true }).start();
  }, [knock, knockY]);

  const hideKnock = () => Animated.spring(knockY, { toValue: -220, ...spring.banner, useNativeDriver: true }).start();
  const dismissKnock = () => {
    dismiss();
    hideKnock();
  };

  return (
    <View style={styles.black}>
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ flex: 1 }}
        maximumZoomScale={4}
        minimumZoomScale={1}
        scrollEventThrottle={100}
        onScroll={(e) => (e.nativeEvent.zoomScale ?? 1) > 1.05 && onZoom()} // pinching in is lingering
        centerContent
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setChrome((c) => !c)}>
          <Image source={{ uri: id }} style={{ flex: 1 }} contentFit="contain" transition={150} />
        </Pressable>
      </ScrollView>

      {chrome ? (
        <View style={[styles.top, { paddingTop: insets.top + space.s4 }]}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.round}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.date}>{photoDate(Number(t))}</Text>
          <Pressable testID="overlay-open-talk" hitSlop={12} onPress={talk}>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <AppIcon size={40} />
            </Animated.View>
          </Pressable>
        </View>
      ) : null}

      <Animated.View style={[styles.knockWrap, { paddingTop: insets.top + space.s8, transform: [{ translateY: knockY }] }]}>
        <Pressable testID="drift-nudge-open" onPress={() => { open(); hideKnock(); talk(); }} style={styles.knock}>
          <AppIcon size={38} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[type.rowName, { fontSize: 15 }]}>{knock?.title ?? "Un-Said"}</Text>
              <Text style={type.meta}>now</Text>
            </View>
            <Text style={[type.rowPreview, { marginTop: 2 }]}>{knock?.body ?? ""}</Text>
          </View>
        </Pressable>
        <Pressable onPress={dismissKnock} hitSlop={8} style={styles.grabber} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: "#000" },
  top: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.s16 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  date: { color: "#fff", fontSize: 15, fontWeight: "600" },
  knockWrap: { position: "absolute", top: 0, left: space.s8, right: space.s8 },
  knock: { flexDirection: "row", gap: space.s12, alignItems: "center", backgroundColor: color.surface, borderRadius: 24, padding: space.s12 },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.text4, marginTop: space.s8 },
});
