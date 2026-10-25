// The connected apps down the side of Talk: where his words can leave from.
// Generic look-alike glyphs only (no official logos), each marked connected.
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type App, APP_LABEL } from "../lib/handoff";
import { color, space } from "../theme/tokens";
import { ALL_ORIENTATIONS, T, TextButton } from "./ui";

const GLYPH: Record<App, keyof typeof Ionicons.glyphMap> = {
  messages: "chatbubble",
  whatsapp: "call",
  instagram: "camera-outline",
  facebook: "people",
};

export const RAIL_APPS: App[] = ["messages", "whatsapp", "instagram", "facebook"];

export function AppGlyph({ app, size = 44 }: { app: App; size?: number }) {
  return (
    <View style={[styles.glyph, { width: size, height: size, borderRadius: size * 0.2237 }]}>
      <Ionicons name={GLYPH[app]} size={size * 0.5} color={color.text} />
    </View>
  );
}

/**
 * The apps his words can leave through. `row` is the compact tool row Talk uses above its dock
 * hairline (no labels, so it never crowds the transcript); the column keeps its labels.
 */
export function AppRail({ row = false }: { row?: boolean }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<App | null>(null);
  return (
    <>
      <View style={row ? styles.row : styles.rail}>
        {RAIL_APPS.map((app) => (
          <Pressable
            key={app}
            testID={`rail-${app}`}
            accessibilityRole="button"
            accessibilityLabel={`${APP_LABEL[app]}, connected`}
            hitSlop={row ? 6 : 0}
            onPress={() => setOpen(app)}
            style={{ alignItems: "center", gap: space.s4 }}
          >
            <View>
              <AppGlyph app={app} size={row ? 32 : 44} />
              <View style={[styles.dot, row && styles.dotSmall]} />
            </View>
            {row ? null : <T v="tab" style={{ color: color.text3 }}>{APP_LABEL[app]}</T>}
          </Pressable>
        ))}
      </View>

      <Modal transparent visible={open !== null} animationType="slide" supportedOrientations={ALL_ORIENTATIONS} onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.s24 }]}>
          <View style={styles.grabber} />
          {open ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
              <AppGlyph app={open} />
              <View style={{ flex: 1 }}>
                <T v="rowName">{APP_LABEL[open]}</T>
                <T v="meta" style={{ color: color.violet }}>Connected</T>
              </View>
            </View>
          ) : null}
          <T v="rowPreview" style={{ marginTop: space.s16 }}>
            {open ? `When you're ready, Un-Said opens ${APP_LABEL[open]} with your words ready. You tap send. It never reads your chats.` : ""}
          </T>
          <View style={{ alignItems: "flex-start", marginTop: space.s8 }}>
            <TextButton label="Done" onPress={() => setOpen(null)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.s16, alignItems: "center" },
  row: { flexDirection: "row", gap: space.s12, alignItems: "center" },
  dotSmall: { width: 10, height: 10, borderRadius: 5, right: -3, top: -3 },
  glyph: { backgroundColor: color.surfaceRaised, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: -2, top: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: color.violet, borderWidth: 2, borderColor: color.bg },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { backgroundColor: color.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: space.s24, paddingTop: space.s12, width: "100%", maxWidth: 560, alignSelf: "center" },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.text4, marginBottom: space.s16 },
});
