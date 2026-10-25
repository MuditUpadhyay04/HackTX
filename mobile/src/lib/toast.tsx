// Toast (DESIGN_SPEC 2.7): un-surface-raised, radius 16, caption text, auto-dismiss after 2.4 s.
import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { color, radius, space, type } from "../theme/tokens";

type Listener = (message: string) => void;
const listeners = new Set<Listener>();

export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show: Listener = (m) => {
      setMessage(m);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      clearTimeout(timer);
      timer = setTimeout(() => Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(), 2400);
    };
    listeners.add(show);
    return () => {
      listeners.delete(show);
      clearTimeout(timer);
    };
  }, [opacity]);

  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { bottom: insets.bottom + 49 + space.s16, opacity }]}>
      <Text style={[type.caption, { color: color.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: color.surfaceRaised,
    borderRadius: radius.row,
    paddingHorizontal: space.s16,
    paddingVertical: space.s12,
  },
});
