// A letter that came back ("From Mom"). Voice replies are a listen row; text replies are the letter.
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LetterCard, NavBar, OutlinePill, Overline, styles as ui, T, TextButton } from "../../components/ui";
import { api, mediaUrl } from "../../lib/api";
import { haptics } from "../../lib/haptics";
import { toast } from "../../lib/toast";
import { useHome } from "../../lib/useHome";
import { color, inset, space } from "../../theme/tokens";
import { useLayout } from "../../lib/useLayout";

export default function Letter() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { home, refresh } = useHome(30000);
  const [kept, setKept] = useState(false);
  const reply = home?.replies.find((r) => r.id === id);
  const player = useAudioPlayer(reply?.audio_url ? mediaUrl(reply.audio_url) : null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (reply && !reply.heard_at && (status.playing || !reply.audio_url)) api.heard(reply.id).catch(() => {});
  }, [reply, status.playing]);

  if (!reply) return <View style={ui.screen}><NavBar /></View>;

  const listen = (
    <Pressable testID="unsend-play" onPress={() => (status.playing ? player.pause() : player.play())} style={{ flexDirection: "row", alignItems: "center", gap: space.s12, marginTop: space.s24 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.letterInk, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={status.playing ? "pause" : "play"} size={22} color={color.letter} />
      </View>
      <T v="rowName" style={{ color: color.letterInk }}>listen</T>
    </Pressable>
  );

  return (
    <View style={ui.screen}>
      <NavBar title={`From ${reply.from_name}`} />
      <ScrollView contentContainerStyle={{ ...layout.column(), paddingTop: space.s16, paddingBottom: insets.bottom + space.s48, gap: space.s16 }}>
        <LetterCard lines={reply.audio_url ? [] : [reply.transcript]} signature={reply.from_name} footer={reply.audio_url ? listen : null} minHeight={360} />
        <T v="caption" style={{ textAlign: "center" }}>Take your time.</T>
        <OutlinePill
          featureId="letter-write-back"
          label="Write back"
          onPress={() => {
            const person = home?.people.find((p) => p.id === reply.from_person_id);
            // Compose in its reply state: "To Sarah", an empty draft (DESIGN_SPEC 3.5).
            router.push({ pathname: "/compose", params: { person: person?.id ?? reply.from_person_id, reply: "1" } });
          }}
        />
        {reply.kept_at || kept ? (
          <T v="caption" style={{ textAlign: "center", fontWeight: "600" }}>Saved. Only you can see it.</T>
        ) : (
          <View style={{ alignItems: "center" }}>
            <TextButton
              featureId="vault-save"
              label="Keep this moment"
              onPress={async () => {
                try {
                  await api.keepReply(reply.id);
                  haptics.success();
                  setKept(true);
                  toast("Saved. Only you can see it.");
                  refresh();
                } catch (e) {
                  toast((e as Error).message);
                }
              }}
            />
          </View>
        )}
        {reply.translation ? (
          <View style={{ marginHorizontal: inset.text, gap: space.s8 }}>
            <Overline>{home?.people.find((p) => p.id === reply.from_person_id)?.language ?? ""}</Overline>
            <T v="caption">{reply.translation}</T>
          </View>
        ) : null}
        <T v="caption" style={{ textAlign: "center", color: color.text4 }}>{`about this letter · ${reply.day}`}</T>
      </ScrollView>
    </View>
  );
}
