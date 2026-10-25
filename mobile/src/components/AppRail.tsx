// The connected apps down the side of Talk: where his words can leave from.
// Each app shows its real home-screen icon (assets/apps: the official App Store icons for the Meta
// apps, the iOS Messages icon as drawn for the phone demo).
import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type App, APP_LABEL } from "../lib/handoff";
import { color, space } from "../theme/tokens";
import { ALL_ORIENTATIONS, T, TextButton } from "./ui";

const ICON: Record<App, number> = {
  messages: require("../../assets/apps/messages.png"),
  whatsapp: require("../../assets/apps/whatsapp.png"),
  instagram: require("../../assets/apps/instagram.png"),
  facebook: require("../../assets/apps/facebook.png"),
};

export const RAIL_APPS: App[] = ["messages", "whatsapp", "instagram", "facebook"];

export function AppGlyph({ app, size = 44 }: { app: App; size?: number }) {
  return (
    <View style={[styles.glyph, { width: size, height: size, borderRadius: size * 0.2237 }]}>
      <Image source={ICON[app]} style={{ width: size, height: size }} contentFit="cover" accessibilityIgnoresInvertColors />
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
            <AppGlyph app={app} size={row ? 32 : 44} />
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
                <T v="meta" style={{ color: color.accent }}>Connected</T>
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
  glyph: { overflow: "hidden", backgroundColor: color.surface },
  backdrop: { flex: 1, backgroundColor: color.scrim },
  sheet: { backgroundColor: color.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: space.s24, paddingTop: space.s12, width: "100%", maxWidth: 560, alignSelf: "center" },
  grabber: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: color.hairline, marginBottom: space.s16 },
});
