// Compose (DESIGN_SPEC 3.3): "To Sarah", ONLY A DRAFT, his own typing. No AI tools of any kind.
// Opened from the hero "+" (draft-new), a draft row (draft-open), "Edit as a draft" on the pile
// (pre-filled with the lines that were on) and "Write back" (reply state: an empty draft).
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../components/AppRail";
import { NavBar, Overline, PrimaryPill, Sheet, styles as ui, T, TextButton } from "../components/ui";
import { api, type Channel } from "../lib/api";
import { type App, APP_CHANNEL, APP_LABEL, CHANNEL_APP } from "../lib/handoff";
import { haptics } from "../lib/haptics";
import { type GalleryPhoto, SERVER_LIBRARY, loadPhotos } from "../lib/photos";
import { toast } from "../lib/toast";
import { useHome } from "../lib/useHome";
import { READING_MAX, useLayout } from "../lib/useLayout";
import { color, inset, space, type } from "../theme/tokens";

const SHEET_APPS: App[] = ["whatsapp", "messages", "instagram"];
const LIBRARY_COLUMNS = 4;
const LIBRARY_GAP = 2;

export default function Compose() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { person: personId, pieces: prefill, reply } = useLocalSearchParams<{ person: string; pieces?: string; reply?: string }>();
  const { home, refresh } = useHome(30000);
  const person = home?.people.find((p) => p.id === personId);
  const [text, setText] = useState("");
  const [replaces, setReplaces] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [boxH, setBoxH] = useState(0); // grows with the words (react-native-web's textarea doesn't on its own)
  const [photo, setPhoto] = useState<{ uri: string; assetId: string | null } | null>(null);
  // Demo data: the paperclip picks from the demo's photos on the server, never the phone's library.
  const [library, setLibrary] = useState<GalleryPhoto[] | null>(null);
  const libraryTile = Math.floor((Math.min(layout.usableWidth, 560) - space.s16 * 2 - LIBRARY_GAP * (LIBRARY_COLUMNS - 1)) / LIBRARY_COLUMNS);

  // What's in the box when it opens: the pile lines he had on, or his saved draft, or nothing (reply).
  useEffect(() => {
    let alive = true;
    const ids = (prefill ?? "").split(",").filter(Boolean);
    const load = ids.length
      ? api.pieces(personId).then((all) => {
          const on = all.filter((p) => ids.includes(p.id));
          return { text: on.map((p) => p.text).join("\n\n"), replaces: on.map((p) => p.id) };
        })
      : reply === "1"
        ? Promise.resolve({ text: "", replaces: [] as string[] })
        : api.drafts().then(async (all) => {
            const saved = all.find((d) => d.person_id === personId)?.text;
            if (saved) return { text: saved, replaces: [] as string[] };
            // No saved draft: start from the words already waiting for this person.
            const kept = (await api.pieces(personId)).filter((p) => !p.status || p.status === "kept");
            return { text: kept.map((p) => p.text).join("\n\n"), replaces: kept.map((p) => p.id) };
          });
    load
      .then((v) => {
        if (!alive) return;
        setText(v.text);
        setReplaces(v.replaces);
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [personId, prefill, reply]);

  const channel = person && person.channel !== "self" ? person.channel : "imessage";
  const app = CHANNEL_APP[channel as Exclude<Channel, "self">];
  const prep = channel === "whatsapp" ? "on" : "in";

  const save = async () => {
    try {
      await api.saveDraft(personId, text);
      haptics.success();
      toast("Saved. Only you can see it.");
    } catch (e) {
      Alert.alert("That didn't save", (e as Error).message);
    }
  };

  const pickApp = async (a: App) => {
    setPicking(false);
    const next = APP_CHANNEL[a];
    if (!next || !person) return;
    try {
      await api.patchPerson(person.id, { channel: next });
      haptics.select();
      refresh();
    } catch (e) {
      Alert.alert("That didn't save", (e as Error).message);
    }
  };

  const attach = async () => {
    if (SERVER_LIBRARY) {
      setLibrary([]);
      try {
        setLibrary(await loadPhotos(0, 60));
      } catch (e) {
        setLibrary(null);
        Alert.alert("Couldn't open the library", (e as Error).message);
      }
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.82 });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setPhoto({ uri: a.uri, assetId: a.assetId ?? null });
  };

  const preview = async () => {
    if (!text.trim() || !person) return;
    setBusy(true);
    try {
      const made = await api.writePieces(person.id, text, replaces);
      setReplaces(made.map((p) => p.id)); // coming back to edit replaces these, not the originals again
      router.push({
        pathname: "/preview",
        params: {
          person: person.id,
          pieces: made.map((p) => p.id).join(","),
          app,
          photo: photo?.assetId ?? "",
          photoUri: photo && !photo.assetId ? photo.uri : "",
        },
      });
    } catch (e) {
      Alert.alert("That didn't go through", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <NavBar
        title={person ? `To ${person.name}` : ""}
        trailing={
          <Pressable testID="draft-save" hitSlop={12} onPress={save} disabled={!loaded}>
            <T v="button">Save</T>
          </Pressable>
        }
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[layout.column(READING_MAX), { paddingBottom: space.s24 }]} keyboardShouldPersistTaps="handled">
        <View style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>
          <Overline>Only a draft</Overline>
          <TextInput
            testID="draft-text"
            value={text}
            onChangeText={setText}
            multiline
            placeholder="What have you been meaning to say?"
            placeholderTextColor={color.text4}
            autoFocus={loaded}
            scrollEnabled={false}
            onContentSizeChange={(e) => setBoxH(e.nativeEvent.contentSize.height)}
            selectionColor={color.caret}
            cursorColor={color.caret}
            style={[type.compose, styles.text, Platform.OS === "web" ? { height: webHeight(text, layout.usableWidth) } : boxH ? { height: Math.max(boxH, 160) } : null, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]}
          />
          {photo ? (
            <View style={styles.attached}>
              <Image source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
              <Pressable accessibilityLabel="Remove photo" hitSlop={10} onPress={() => setPhoto(null)} style={styles.remove}>
                <Ionicons name="close" size={16} color={color.onAccent} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.dock, layout.column(READING_MAX), { paddingBottom: insets.bottom + space.s12 }]}>
        <View style={styles.recipient}>
          <T v="rowPreview" lines={1} style={{ flex: 1 }}>{person ? `Goes to ${person.name} ${prep} ${APP_LABEL[app]}` : " "}</T>
          <TextButton featureId="delivery-channel-pick" tone="text" label="Change" onPress={() => setPicking(true)} />
        </View>
        {/* The tool row. No rule above it (no lines under text); the gap does the separating. */}
        <View style={styles.tools}>
          <Pressable
            testID="compose-dictate"
            accessibilityLabel="Say it out loud"
            hitSlop={10}
            onPress={() => {
              haptics.tap();
              router.push({ pathname: "/talk", params: { toName: person?.name ?? "", channel: person?.channel ?? "", person: personId } });
            }}
          >
            <Ionicons name="mic-outline" size={24} color={color.text3} />
          </Pressable>
          <Pressable testID="unsend-attach-photos" accessibilityLabel="Photo" hitSlop={10} onPress={attach}>
            <Ionicons name="attach" size={24} color={color.text3} />
          </Pressable>
        </View>
        <PrimaryPill featureId="letter-preview" label="Preview letter" disabled={!text.trim() || busy || !person} onPress={preview} />
        <T v="caption" style={{ textAlign: "center" }}>You decide when it leaves.</T>
      </View>

      <Sheet visible={library !== null} onClose={() => setLibrary(null)}>
        <T v="section" style={{ marginBottom: space.s8 }}>Library</T>
        <ScrollView contentContainerStyle={styles.libraryGrid}>
          {(library ?? []).map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="imagebutton"
              onPress={() => {
                haptics.select();
                setPhoto({ uri: p.id, assetId: p.id }); // the server photo's URL is its id
                setLibrary(null);
              }}
            >
              <Image source={{ uri: p.id }} style={{ width: libraryTile, height: libraryTile, backgroundColor: color.surface }} contentFit="cover" recyclingKey={p.id} />
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>

      <Sheet visible={picking} onClose={() => setPicking(false)}>
        {SHEET_APPS.map((a) => (
          <Pressable key={a} onPress={() => pickApp(a)} style={styles.sheetRow}>
            <AppGlyph app={a} size={36} />
            <T v="rowName" style={{ flex: 1 }}>{APP_LABEL[a]}</T>
            {a === app ? <Ionicons name="checkmark" size={20} color={color.accent} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </KeyboardAvoidingView>
  );
}

/** react-native-web's textarea doesn't grow with its words: estimate the lines at 34/42 type. */
function webHeight(text: string, width: number) {
  const perLine = Math.max(8, Math.floor((Math.min(width, 720) - 48) / 19));
  const lines = text.split("\n").reduce((n, l) => n + Math.max(1, Math.ceil(l.length / perLine)), 0);
  return Math.max(200, lines * 42 + 42);
}

const styles = StyleSheet.create({
  text: { marginTop: space.s16, minHeight: 200, padding: 0, textAlignVertical: "top" },
  attached: { marginTop: space.s16, width: 96, height: 120 },
  thumb: { width: 96, height: 120, borderRadius: 12, backgroundColor: color.surface },
  remove: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: color.scrim, alignItems: "center", justifyContent: "center" },
  dock: { gap: space.s12, paddingTop: space.s12, backgroundColor: color.bg },
  recipient: { flexDirection: "row", alignItems: "center", gap: space.s8, marginHorizontal: inset.text },
  tools: { flexDirection: "row", gap: space.s24, marginHorizontal: inset.text, paddingVertical: space.s4 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s12 },
  libraryGrid: { flexDirection: "row", flexWrap: "wrap", gap: LIBRARY_GAP, paddingBottom: space.s8 },
});
