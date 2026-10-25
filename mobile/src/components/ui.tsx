// Un-Said components (DESIGN_SPEC.md 2.7), built only from tokens.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { type ReactNode, useState } from "react";
import { Animated, Modal, Pressable, type StyleProp, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop } from "react-native-svg";

import { haptics } from "../lib/haptics";
import { color, inset, pillGradient, radius, shadow, space, spring, type } from "../theme/tokens";
import { Portrait } from "./portrait";

export const ICON = require("../../assets/brand/unsaid-app-icon.png");

// ------------------------------------------------------------------ press feedback

export function Press({ onPress, style, children, disabled, featureId }: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  disabled?: boolean;
  featureId?: string;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (v: number) => Animated.spring(scale, { toValue: v, ...spring.press, useNativeDriver: true }).start();
  return (
    <Pressable
      testID={featureId}
      disabled={disabled}
      onPress={() => {
        if (!disabled) haptics.tap();
        onPress?.();
      }}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.4 }]}>{children}</Animated.View>
    </Pressable>
  );
}

// ------------------------------------------------------------------ type

export function T({ v = "rowPreview", style, children, lines }: {
  v?: keyof typeof type;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  lines?: number;
}) {
  return (
    <Text style={[type[v], style]} numberOfLines={lines}>
      {children}
    </Text>
  );
}

// ------------------------------------------------------------------ buttons

export function PrimaryPill({ label, onPress, disabled, featureId }: { label: string; onPress?: () => void; disabled?: boolean; featureId?: string }) {
  return (
    <Press onPress={onPress} disabled={disabled} featureId={featureId} style={[styles.pill, shadow.pill]}>
      <LinearGradient colors={pillGradient.colors} locations={pillGradient.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      <T v="button" style={{ color: color.onAccent }}>{label}</T>
    </Press>
  );
}

export function OutlinePill({ label, onPress, icon, featureId }: { label: string; onPress?: () => void; icon?: ReactNode; featureId?: string }) {
  return (
    <Press onPress={onPress} featureId={featureId} style={styles.outline}>
      {icon}
      <T v="button">{label}</T>
    </Press>
  );
}

export function TextButton({ label, onPress, tone = "text2", featureId }: { label: string; onPress?: () => void; tone?: "text2" | "text3" | "text" | "danger"; featureId?: string }) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress?.();
      }}
      testID={featureId}
      hitSlop={12}
      style={{ paddingVertical: space.s8 }}
    >
      <T v="caption" style={{ fontWeight: "600", color: color[tone] }}>{label}</T>
    </Pressable>
  );
}

// ------------------------------------------------------------------ surfaces

export function Row({ children, onPress, style, featureId }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; featureId?: string }) {
  return (
    <Press onPress={onPress} featureId={featureId} style={[styles.row, style]}>
      {children}
    </Press>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, icon }: { label: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.chip}>
      {icon ? <Ionicons name={icon} size={14} color={color.accent} /> : null}
      <T v="meta" style={{ color: color.accent, fontWeight: "600" }}>{label}</T>
    </View>
  );
}

export function Overline({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <T v="overline" style={style}>{children}</T>;
}

// ------------------------------------------------------------------ avatar

export function Avatar({ name, size = 44, ring }: { name: string; size?: number; ring?: boolean }) {
  const inner = (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
      <Portrait name={name} size={size} />
    </View>
  );
  if (!ring) return inner;
  return (
    <LinearGradient colors={pillGradient.colors} locations={pillGradient.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 2, borderRadius: size }}>
      <View style={{ padding: 2, borderRadius: size, backgroundColor: color.bg }}>{inner}</View>
    </LinearGradient>
  );
}

export function AppIcon({ size = 32 }: { size?: number }) {
  return <Image source={ICON} style={{ width: size, height: size, borderRadius: size * 0.2237 }} contentFit="cover" />;
}

// ------------------------------------------------------------------ gradients

/** un-card-gradient: two radial glows over the 135° indigo base. */
export function CardGradient() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
      <Defs>
        <SvgLinear id="base" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3949EA" />
          <Stop offset="0.45" stopColor="#4755F0" />
          <Stop offset="1" stopColor="#6E6CF2" />
        </SvgLinear>
        <RadialGradient id="lilac" cx="100" cy="0" rx="60" ry="70" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#B9ABF6" stopOpacity="1" />
          <Stop offset="1" stopColor="#B9ABF6" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="peri" cx="0" cy="100" rx="60" ry="60" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#728CF4" stopOpacity="1" />
          <Stop offset="1" stopColor="#728CF4" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#base)" />
      <Rect x="0" y="0" width="100" height="100" fill="url(#peri)" />
      <Rect x="0" y="0" width="100" height="100" fill="url(#lilac)" />
    </Svg>
  );
}

export function PillGradientFill({ style }: { style?: StyleProp<ViewStyle> }) {
  return <LinearGradient colors={pillGradient.colors} locations={pillGradient.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFill, style]} />;
}

// ------------------------------------------------------------------ nav bar (pushed screens)

export function NavBar({ title, trailing, onBack, backLabel }: { title?: string; trailing?: ReactNode; onBack?: () => void; backLabel?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingTop: insets.top, paddingLeft: space.s16 + insets.left, paddingRight: space.s16 + insets.right }]}>
      <Pressable
        hitSlop={12}
        onPress={() => {
          haptics.tap();
          if (onBack) onBack();
          else if (router.canGoBack()) router.back();
          else router.replace("/home");
        }}
        style={styles.navSide}
      >
        <Ionicons name="chevron-back" size={26} color={color.text} />
        {backLabel ? <T v="button">{backLabel}</T> : null}
      </Pressable>
      <T v="navTitle" lines={1} style={{ flex: 1, textAlign: "center" }}>{title ?? ""}</T>
      <View style={[styles.navSide, { justifyContent: "flex-end" }]}>{trailing}</View>
    </View>
  );
}

// ------------------------------------------------------------------ letter card

/** The lavender letter card: reserved for letters only. */
export function LetterCard({ lines, signature, footer, minHeight, compact = false }: { lines: string[]; signature: string; footer?: ReactNode; minHeight?: number; compact?: boolean }) {
  const [first, ...rest] = lines;
  const n = first?.length ?? 0;
  // Smaller steps for long first lines; `compact` (Preview) caps the card so the Hold/Send choice stays on screen.
  const heroSize = compact
    ? n > 140 ? 24 : n > 90 ? 28 : n > 50 ? 32 : n > 28 ? 40 : 52
    : n > 140 ? 28 : n > 60 ? 36 : n > 28 ? 48 : 64;
  const bodySize = compact ? 18 : 22;
  minHeight = minHeight ?? (compact ? 240 : 420);
  return (
    // Phone width on a phone; on a big or unfolded screen the card keeps letter proportions, centered.
    <View style={styles.letterWrap}>
      <View style={[styles.letter, shadow.letter, { minHeight }]}>
        <Text style={{ fontSize: 40, lineHeight: 40, fontWeight: "800", color: color.letterAccent }}>{"“"}</Text>
        <T v="overline" style={{ color: color.letterLabel, marginTop: space.s12 }}>For you</T>
        {first ? (
          <View style={{ marginTop: space.s16, alignSelf: "stretch" }}>
            <Text style={[type.letterHero, { color: color.letterInk, fontSize: heroSize, lineHeight: heroSize * 1.125 }]}>{first}</Text>
            {/* Under the last line, from its start, as in the reference ("you too."). */}
            <View style={{ alignSelf: "flex-start", marginTop: -2, marginLeft: space.s4 }}>
              <Svg width={arcWidth(first)} height={14}>
                <Path
                  d={`M2 10 Q ${arcWidth(first) / 2} 1 ${arcWidth(first) - 2} 8`}
                  stroke={color.letterAccent}
                  strokeWidth={4}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </View>
          </View>
        ) : null}
        {rest.map((line, i) => (
          <Text key={i} style={[type.letterBody, { color: color.letterInk, marginTop: compact ? space.s12 : space.s16, fontSize: bodySize, lineHeight: Math.round(bodySize * 1.27) }]}>{line}</Text>
        ))}
        {footer}
        <View style={{ flex: 1, minHeight: space.s24 }} />
        <Text style={[type.signature, { color: color.letterInk }]}>{signature}</Text>
      </View>
    </View>
  );
}

function arcWidth(line: string) {
  return Math.max(88, Math.min(200, Math.round(line.length * 7)));
}

export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent visible={visible} animationType="slide" supportedOrientations={ALL_ORIENTATIONS} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: color.scrim }} onPress={onClose} />
      {/* On a wide screen the sheet stays phone-width and centered instead of spanning the window. */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.s16, paddingLeft: space.s16 + insets.left, paddingRight: space.s16 + insets.right }]}>
        <View style={styles.grabber} />
        {children}
      </View>
    </Modal>
  );
}

/** iOS Modals default to portrait only; let sheets follow the phone in every pose. */
export const ALL_ORIENTATIONS = ["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"] as ("portrait" | "portrait-upside-down" | "landscape" | "landscape-left" | "landscape-right")[];

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  pill: { height: 56, borderRadius: radius.pill, overflow: "hidden", alignItems: "center", justifyContent: "center", marginHorizontal: 18 },
  outline: { height: 52, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.indigo, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: space.s8, marginHorizontal: 27 },
  row: { minHeight: 76, borderRadius: radius.row, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.hairline, paddingHorizontal: space.s16, paddingVertical: space.s12, flexDirection: "row", alignItems: "center", gap: space.s12 },
  card: { borderRadius: radius.row, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.hairline, padding: space.s16 },
  chip: { flexDirection: "row", alignItems: "center", gap: space.s4, backgroundColor: color.tint, borderRadius: radius.pill, paddingHorizontal: space.s8, paddingVertical: space.s4, alignSelf: "flex-start" },
  nav: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.s16, height: undefined, minHeight: 44, backgroundColor: color.bg },
  navSide: { width: 88, height: 44, flexDirection: "row", alignItems: "center" },
  letterWrap: { paddingHorizontal: inset.card, alignItems: "center" },
  letter: { width: "100%", maxWidth: 480, borderRadius: radius.hero, backgroundColor: color.letter, borderWidth: 1, borderColor: "rgba(168,144,246,0.35)", padding: space.s24 },
  sheet: { backgroundColor: color.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: space.s16, paddingTop: space.s12, width: "100%", maxWidth: 560, alignSelf: "center", maxHeight: "85%" },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.hairline, marginBottom: space.s16 },
});
