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
import { usePhotoMemory } from "../../lib/memory";
import { TRY_GUIDE, TRY_MODE } from "../../lib/try";
import { photoDate } from "../../lib/photos";
import { color, shadow, space, spring, type } from "../../theme/tokens";

export default function PhotoViewer() {
  const insets = useSafeAreaInsets();
  const { id, t, person, toName, channel } = useLocalSearchParams<{ id: string; t?: string; person?: string; toName?: string; channel?: string }>();
  const [chrome, setChrome] = useState(true);
  // While the knock banner is down, the top bar steps aside so the two never overlap.
  const [knockGone, setKnockGone] = useState(false);
  const [knockY] = useState(() => new Animated.Value(-220));
  const [pulse] = useState(() => new Animated.Value(1));
  // Data wiring (mobile/src/lib/attention.ts): the backend's attention budget decides if and
  // what Un-Said knocks. Most photos never knock; at most once a session, twice a day.
  const { knock, onZoom, open, dismiss } = useKnock(id);
  const knockShown = Boolean(knock) && !knockGone;
  // "Take that step." (PLAN.md §5): shown while his latest rant chose someone this photo is about.
  const { memory } = usePhotoMemory(id);

  // From a person's gallery the words are for them; otherwise the knock's person, if it named one.
  const forPerson = person || (knock && "person_id" in knock ? knock.person_id ?? "" : "");
  const forName = person ? toName : knock && "person_name" in knock ? knock.person_name ?? "" : "";
  // Demo mode: the knock carries the line Talk opens with ("Send the words you're keeping to yourself...").
  const prompt = knock && "prompt" in knock ? knock.prompt ?? "" : "";
  const talk = (fromKnock = false) =>
    router.push({
      pathname: "/talk",
      params: { photo: id, person: forPerson ?? "", toName: forName ?? "", channel: person ? channel ?? "" : "", prompt: fromKnock ? prompt : "" },
    });

  useEffect(() => {
    // The icon breathes once when the photo opens, so it's noticed without nagging.
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.12, ...spring.press, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, ...spring.press, useNativeDriver: true }),
    ]).start();
  }, [pulse]);

  // Try mode's guide to the icon: a slow bob so the eye finds it (lib/try.ts TRY_GUIDE).
  const [bob] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!TRY_MODE) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -5, duration: 700, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

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
          <Pressable testID="overlay-open-talk" accessibilityLabel="Say it out loud" hitSlop={12} onPress={() => talk()}>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <AppIcon size={40} />
            </Animated.View>
          </Pressable>
        </View>
      ) : null}

      {TRY_MODE && chrome && !knockShown ? (
        <Animated.View style={[styles.hint, { top: insets.top + space.s4 + 40 + space.s8, right: space.s8 + insets.right, transform: [{ translateY: bob }] }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={TRY_GUIDE.photo} onPress={() => talk()} style={[styles.hintBubble, shadow.letter]}>
            <View style={styles.hintCaret} />
            <Text style={styles.hintText}>{TRY_GUIDE.photo}</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      {memory?.step && chrome && !knockShown ? (
        <View pointerEvents="none" style={[styles.step, shadow.letter, { bottom: insets.bottom + space.s24 }]}>
          <Text style={type.rowPreview}>{memory.step.line}</Text>
        </View>
      ) : null}

      <Animated.View
        style={[styles.knockWrap, { paddingTop: insets.top + space.s8, left: space.s8 + insets.left, right: space.s8 + insets.right, transform: [{ translateY: knockY }] }]}
      >
        <Pressable testID="drift-nudge-open" onPress={() => { open(); hideKnock(); talk(true); }} style={[styles.knock, shadow.letter]}>
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
  step: { position: "absolute", left: space.s16, right: space.s16, maxWidth: 480, alignSelf: "center", backgroundColor: color.bg, borderRadius: 24, padding: space.s16 },
  knockWrap: { position: "absolute", top: 0, left: space.s8, right: space.s8 },
  // Notification-width on a big or sideways screen, centered, like an iOS banner.
  knock: { width: "100%", maxWidth: 480, alignSelf: "center", flexDirection: "row", gap: space.s12, alignItems: "center", backgroundColor: color.bg, borderRadius: 24, padding: space.s12, borderWidth: StyleSheet.hairlineWidth, borderColor: color.hairline },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.hairline, marginTop: space.s8 },
  // Try mode: a speech bubble under the top-right icon, its caret pointing up at it.
  hint: { position: "absolute", alignItems: "flex-end", maxWidth: 240 },
  hintBubble: { backgroundColor: color.accent, borderRadius: 16, paddingVertical: space.s12, paddingHorizontal: space.s16 },
  hintCaret: { position: "absolute", top: -7, right: 15, width: 14, height: 14, backgroundColor: color.accent, transform: [{ rotate: "45deg" }], borderRadius: 2 },
  hintText: { color: "#FFFFFF", fontSize: 16, lineHeight: 22, fontWeight: "700" },
});
