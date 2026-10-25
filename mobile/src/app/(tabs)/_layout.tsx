// Tab bar (DESIGN_SPEC 3.2): Home · Letters · You. Active un-violet + filled icon.
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { color } from "../../theme/tokens";

const ICONS = {
  home: ["home", "home-outline"],
  letters: ["document-text", "document-text-outline"],
  you: ["person", "person-outline"],
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: color.bg },
        tabBarStyle: { backgroundColor: color.bg, borderTopColor: color.hairline, borderTopWidth: 0.5 },
        tabBarActiveTintColor: color.violet,
        tabBarInactiveTintColor: color.text3,
        tabBarLabelStyle: { fontSize: 11, lineHeight: 13, fontWeight: "600" },
        tabBarIcon: ({ focused }) => {
          const [filled, outline] = ICONS[route.name as keyof typeof ICONS] ?? ICONS.home;
          return <Ionicons name={focused ? filled : outline} size={24} color={focused ? color.violet : color.text3} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="letters" options={{ title: "Letters" }} />
      <Tabs.Screen name="you" options={{ title: "You" }} />
    </Tabs>
  );
}
