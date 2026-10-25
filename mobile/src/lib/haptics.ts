// Light haptics. No-ops on web, where the module has nothing to vibrate.
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function run(fn: () => Promise<unknown>) {
  if (Platform.OS === "web") return;
  fn().catch(() => {});
}

export const haptics = {
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  select: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
