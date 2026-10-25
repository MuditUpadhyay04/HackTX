import { router, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { usePushSetup } from "../lib/push";
import { ToastHost } from "../lib/toast";
import { accepted, TRY_MODE, tryAllows } from "../lib/try";
import { color } from "../theme/tokens";

export default function RootLayout() {
  usePushSetup(); // notification taps and foreground rules; never asks for permission (lib/push.ts)
  const pathname = usePathname();
  useEffect(() => {
    // Try mode (judges' phones): only the privacy page, Memory Lane and the talk -> preview path.
    // Anything else (Home, Letters, sending, Connect, settings) lands back on Memory Lane.
    if (!TRY_MODE) return;
    if (!accepted() && pathname !== "/" && pathname !== "/privacy") router.replace("/privacy");
    else if (!tryAllows(pathname)) router.replace("/gallery");
  }, [pathname]);
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: color.bg }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: color.bg },
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="index" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="gallery" options={{ animation: "slide_from_bottom", contentStyle: { backgroundColor: color.bg } }} />
          <Stack.Screen name="photo/[id]" options={{ animation: "fade", contentStyle: { backgroundColor: color.bg } }} />
          <Stack.Screen name="safety" options={{ animation: "fade" }} />
          <Stack.Screen name="privacy" options={{ animation: "fade" }} />
        </Stack>
        <ToastHost />
      </View>
    </SafeAreaProvider>
  );
}
