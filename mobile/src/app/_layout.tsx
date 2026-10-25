import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { usePushSetup } from "../lib/push";
import { ToastHost } from "../lib/toast";
import { color } from "../theme/tokens";

export default function RootLayout() {
  usePushSetup(); // notification taps and foreground rules; never asks for permission (lib/push.ts)
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: color.bg }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
          <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: "#000" } }} />
          <Stack.Screen name="photo/[id]" options={{ animation: "fade", contentStyle: { backgroundColor: "#000" } }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        </Stack>
        <ToastHost />
      </View>
    </SafeAreaProvider>
  );
}
