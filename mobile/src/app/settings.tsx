// Settings: the attention budget (GET/PATCH /api/settings). The server decides; this only records the choice.
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavBar, Press, Row, styles as ui, T } from "../components/ui";
import { API_URL, api, type Settings } from "../lib/api";
import { haptics } from "../lib/haptics";
import { toast } from "../lib/toast";
import { useHome } from "../lib/useHome";
import { color, inset, space } from "../theme/tokens";

const MODES: { id: Settings["knock_mode"]; title: string; body: string }[] = [
  { id: "gentle", title: "Gentle", body: "A quiet knock, rarely." },
  { id: "off", title: "Off", body: "No knocks." },
  { id: "demo", title: "Demo", body: "Knocks a little sooner, for showing the app." },
];

const QUIET: { start: string; end: string; label: string }[] = [
  { start: "22:30", end: "08:00", label: "10:30 PM – 8:00 AM" },
  { start: "23:00", end: "07:00", label: "11:00 PM – 7:00 AM" },
  { start: "21:00", end: "09:00", label: "9:00 PM – 9:00 AM" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { home } = useHome(30000);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api.settings().then(setSettings).catch((e) => setError((e as Error).message));
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (changes: Partial<Omit<Settings, "permission_asked">>) => {
    try {
      const next = await api.patchSettings(changes);
      setSettings(next);
      haptics.success();
      toast("Saved.");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  return (
    <View style={ui.screen}>
      <NavBar title="Settings" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.s48 }}>
        {error && !settings ? (
          <View style={{ marginTop: space.s24, gap: space.s16 }}>
            <T v="rowPreview" style={{ marginHorizontal: inset.text }}>{`Can't reach Un-Said's server. ${error}`}</T>
            <Press onPress={load} style={[ui.pill, { backgroundColor: color.surfaceRaised }]}>
              <T v="button">Try again</T>
            </Press>
          </View>
        ) : null}

        {settings ? (
          <>
            <T v="section" style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>
              Knocks
            </T>
            <View style={{ marginHorizontal: inset.card, marginTop: space.s8, gap: space.s8 }}>
              {MODES.map((mode) => {
                const on = settings.knock_mode === mode.id;
                return (
                  <Row key={mode.id} onPress={() => patch({ knock_mode: mode.id })}>
                    <View style={{ flex: 1 }}>
                      <T v="rowName">{mode.title}</T>
                      <T v="rowPreview">{mode.body}</T>
                    </View>
                    {on ? <Ionicons name="checkmark" size={22} color={color.violet} /> : null}
                  </Row>
                );
              })}
            </View>

            <T v="section" style={{ marginHorizontal: inset.text, marginTop: space.s24 }}>
              Quiet hours
            </T>
            <View style={{ marginHorizontal: inset.card, marginTop: space.s8, gap: space.s8 }}>
              {QUIET.map((q) => {
                const on = settings.quiet_start === q.start && settings.quiet_end === q.end;
                return (
                  <Row key={q.label} onPress={() => patch({ quiet_start: q.start, quiet_end: q.end })}>
                    <T v="rowName" style={{ flex: 1 }}>
                      {q.label}
                    </T>
                    {on ? <Ionicons name="checkmark" size={22} color={color.violet} /> : null}
                  </Row>
                );
              })}
            </View>

            <T v="section" style={{ marginHorizontal: inset.text, marginTop: space.s24 }}>
              Heads-up
            </T>
            <View style={[ui.row, { marginHorizontal: inset.card, marginTop: space.s8 }]}>
              <View style={{ flex: 1 }}>
                <T v="rowName">When a letter is ready</T>
                <T v="rowPreview">Un-Said asks once, after you hold one.</T>
              </View>
              <Switch
                value={settings.push_enabled}
                onValueChange={(push_enabled) => {
                  haptics.select();
                  patch({ push_enabled });
                }}
                trackColor={{ false: color.hairline, true: color.violet }}
                thumbColor={color.text}
              />
            </View>
          </>
        ) : null}

        <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s32 }}>
          {`Server ${API_URL}`}
        </T>
        <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s4 }}>
          {home ? `Transcription: ${home.providers.transcribe} · Sorting: ${home.providers.spark} · Delivery: ${home.providers.whatsapp}` : "Not connected"}
        </T>
      </ScrollView>
    </View>
  );
}
