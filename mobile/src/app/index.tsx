// Launch (DESIGN_SPEC 3.0). The icon settles, then Home.
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "../components/ui";
import { accepted, TRY_MODE } from "../lib/try";
import { color } from "../theme/tokens";

export default function Launch() {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.92));
  const [word] = useState(() => new Animated.Value(8));

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = (delay: number) => {
      timer = setTimeout(() => {
        if (!cancelled) router.replace(TRY_MODE ? (accepted() ? "/gallery" : "/privacy") : "/home");
      }, delay);
    };
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
          go(280);
          return;
        }
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, stiffness: 180, damping: 26, mass: 1, useNativeDriver: true }),
          Animated.spring(word, { toValue: 0, stiffness: 180, damping: 26, mass: 1, useNativeDriver: true }),
        ]).start();
        go(680);
      });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [opacity, scale, word]);

  return (
    <View style={styles.screen}>
      <Animated.View style={{ alignItems: "center", opacity, transform: [{ scale }] }}>
        <AppIcon size={120} />
        <Animated.View style={{ transform: [{ translateY: word }] }}>
          <Text style={styles.word}>Un-Said</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg, alignItems: "center", justifyContent: "center" },
  word: { color: color.text, fontSize: 24, lineHeight: 28, fontWeight: "800", letterSpacing: -0.24, marginTop: 20 },
});
