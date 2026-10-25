// One photo, full screen, on white like Photos in light mode. The Un-Said icon waits in the corner; if he lingers, Un-Said knocks.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import { AppIcon } from "../../components/ui";
import { useKnock } from "../../lib/attention";
import { haptics } from "../../lib/haptics";
import { photoDate } from "../../lib/photos";
import { color, shadow, space, spring, type } from "../../theme/tokens";

export default function PhotoViewer() {
  const insets = useSafeAreaInsets();
  const { id, t } = useLocalSearchParams<{ id: string; t?: string }>();
  const [chrome, setChrome] = useState(true);
  // While the knock banner is down, the top bar steps aside so the two never overlap.
  const [knockGone, setKnockGone] = useState(false);
  const [knockY] = useState(() => new Animated.Value(-220));
  const [pulse] = useState(() => new Animated.Value(1));
  // Data wiring (mobile/src/lib/attention.ts): the backend's attention budget decides if and
  // what Un-Said knocks. Most photos never knock; at most once a session, twice a day.
  const { knock, onZoom, open, dismiss } = useKnock(id);
  const knockShown = Boolean(knock) && !knockGone;

  const talk = () => router.push({ pathname: "/talk", params: { photo: id } });

  useEffect(() => {
    // The icon breathes once when the photo opens, so it's noticed without nagging.
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.12, ...spring.press, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, ...spring.press, useNativeDriver: true }),
    ]).start();
  }, [pulse]);

  useEffect(() => {
    if (knock) {
      haptics.tap();
      Animated.spring(knockY, { toValue: 0, ...spring.banner, useNativeDriver: true }).start();
    }
  }, [knock, knockY]);

  const hideKnock = () => {
    setKnockGone(true);
    Animated.spring(knockY, { toValue: -220, ...spring.banner, useNativeDriver: true }).start();
  };
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

      {chrome && !knockShown ? (
        <View style={[styles.top, { paddingTop: insets.top + space.s4, paddingLeft: space.s16 + insets.left, paddingRight: space.s16 + insets.right }]}>
          <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0.94)", "rgba(255,255,255,0)"]} style={StyleSheet.absoluteFill} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/gallery"))}
            style={styles.round}
          >
            <Ionicons name="chevron-back" size={24} color={color.text} />
          </Pressable>
          <Text style={styles.date} numberOfLines={1}>{photoDate(Number(t))}</Text>
          <Pressable testID="overlay-open-talk" accessibilityLabel="Say it out loud" hitSlop={12} onPress={talk}>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <AppIcon size={40} />
            </Animated.View>
          </Pressable>
        </View>
      ) : null}

      <Animated.View
        style={[styles.knockWrap, { paddingTop: insets.top + space.s8, left: space.s8 + insets.left, right: space.s8 + insets.right, transform: [{ translateY: knockY }] }]}
      >
        <Pressable testID="drift-nudge-open" onPress={() => { open(); hideKnock(); talk(); }} style={[styles.knock, shadow.letter]}>
          <AppIcon size={40} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={type.rowName}>{knock?.title ?? "Un-Said"}</Text>
              <Text style={type.meta}>now</Text>
            </View>
            <Text style={[type.rowPreview, { marginTop: 2 }]} numberOfLines={3}>{knock?.body ?? ""}</Text>
          </View>
        </Pressable>
        <Pressable onPress={dismissKnock} hitSlop={8} style={styles.grabber} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: color.bg },
  top: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.s12, paddingHorizontal: space.s16, paddingBottom: space.s24 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.bg, borderWidth: StyleSheet.hairlineWidth, borderColor: color.hairline, alignItems: "center", justifyContent: "center" },
  date: { ...type.navTitle, flex: 1, textAlign: "center", fontSize: 15 },
  knockWrap: { position: "absolute", top: 0, left: space.s8, right: space.s8 },
  // Notification-width on a big or sideways screen, centered, like an iOS banner.
  knock: { width: "100%", maxWidth: 480, alignSelf: "center", flexDirection: "row", gap: space.s12, alignItems: "center", backgroundColor: color.bg, borderRadius: 24, padding: space.s12, borderWidth: StyleSheet.hairlineWidth, borderColor: color.hairline },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.hairline, marginTop: space.s8 },
});
