// Springs from the design tokens. Reduced motion falls back to a short fade.
import { type ReactNode, useEffect, useState } from "react";
import { AccessibilityInfo, Animated, View, type StyleProp, type ViewStyle } from "react-native";

import { color, radius } from "../theme/tokens";

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

export function Rise({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reduce) {
        Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        return;
      }
      Animated.spring(v, { toValue: 1, stiffness: 260, damping: 28, mass: 1, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, reduce, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: reduce ? undefined : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Skeleton({ height, r = radius.row, style }: { height: number; r?: number; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(0.45));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={[{ height, borderRadius: r, backgroundColor: color.surface, opacity: v }, style]} />;
}

export function LoadingBlock() {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 24, gap: 8 }}>
      <Skeleton height={288} r={radius.hero} />
      <Skeleton height={76} />
      <Skeleton height={76} />
      <Skeleton height={76} />
    </View>
  );
}
