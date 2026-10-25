// "Add a video": record one or pick one from the library to go with the letter.
// Works in Expo Go (expo-image-picker + expo-video). The file uploads after the card is made
// (POST /api/cards/{id}/video), so the link he sends opens a page that plays it.
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";

import { color, radius, space } from "../theme/tokens";
import { Sheet, T, TextButton } from "./ui";

export type PickedVideo = { uri: string; mime: string; duration: number | null };

/** About a minute: long enough to say something, small enough to upload on a phone. */
export const MAX_VIDEO_SECONDS = 60;

function mimeOf(asset: ImagePicker.ImagePickerAsset) {
  if (asset.mimeType?.startsWith("video/")) return asset.mimeType;
  const name = (asset.fileName ?? asset.uri).toLowerCase();
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

export async function pickVideo(source: "camera" | "library"): Promise<PickedVideo | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["videos"],
    videoMaxDuration: MAX_VIDEO_SECONDS,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    allowsEditing: Platform.OS === "ios" && source === "library", // lets him trim a long clip to a minute
  };
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera is off", "Turn on camera access for Un-Said in Settings to record a video.");
      return null;
    }
  }
  const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  // Native reports milliseconds; web reads <video>.duration, which is seconds (0 when unknown).
  const seconds = asset.duration ? (Platform.OS === "web" ? asset.duration : asset.duration / 1000) : null;
  if (seconds != null && seconds > MAX_VIDEO_SECONDS + 1) {
    Alert.alert("That one's long", "Pick a video that's a minute or shorter.");
    return null;
  }
  return { uri: asset.uri, mime: mimeOf(asset), duration: seconds };
}

function clock(seconds: number | null) {
  if (seconds == null) return "";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Thumb({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.muted = true;
    p.loop = false;
  });
  return (
    <View style={styles.thumb}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <View style={styles.thumbBadge}>
        <Ionicons name="play" size={14} color={color.onAccent} />
      </View>
    </View>
  );
}

export function VideoAttach({ video, onChange, disabled }: { video: PickedVideo | null; onChange: (v: PickedVideo | null) => void; disabled?: boolean }) {
  const [asking, setAsking] = useState(false);
  const choose = async (source: "camera" | "library") => {
    setAsking(false);
    try {
      const picked = await pickVideo(source);
      if (picked) onChange(picked);
    } catch (e) {
      Alert.alert("Couldn't add that video", (e as Error).message);
    }
  };

  if (video) {
    return (
      <View style={styles.row} testID="letter-video-attached">
        <Thumb uri={video.uri} />
        <View style={{ flex: 1 }}>
          <T v="rowName">Video attached</T>
          <T v="rowPreview">{video.duration != null ? `${clock(video.duration)} · plays with your letter` : "Plays with your letter"}</T>
        </View>
        {disabled ? null : <TextButton featureId="letter-video-remove" tone="danger" label="Remove" onPress={() => onChange(null)} />}
      </View>
    );
  }

  return (
    <>
      <Pressable testID="letter-video-add" disabled={disabled} onPress={() => setAsking(true)} style={styles.row}>
        <View style={styles.well}>
          <Ionicons name="videocam" size={20} color={color.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="rowName">Add a video</T>
          <T v="rowPreview">Up to a minute. They see it with your letter.</T>
        </View>
        <Ionicons name="add" size={22} color={color.accent} />
      </Pressable>
      <Sheet visible={asking} onClose={() => setAsking(false)}>
        <T v="section" style={{ marginBottom: space.s8 }}>Add a video</T>
        <Pressable testID="letter-video-record" onPress={() => choose("camera")} style={styles.sheetRow}>
          <View style={styles.well}>
            <Ionicons name="videocam" size={20} color={color.accent} />
          </View>
          <T v="rowName" style={{ flex: 1 }}>Record a video</T>
        </Pressable>
        <Pressable testID="letter-video-library" onPress={() => choose("library")} style={styles.sheetRow}>
          <View style={styles.well}>
            <Ionicons name="film-outline" size={20} color={color.accent} />
          </View>
          <T v="rowName" style={{ flex: 1 }}>Choose from library</T>
        </Pressable>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 16,
    marginTop: space.s16,
    flexDirection: "row",
    alignItems: "center",
    gap: space.s12,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.hairline,
    borderRadius: radius.row,
    padding: space.s12,
    minHeight: 64,
  },
  well: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.tint, alignItems: "center", justifyContent: "center" },
  thumb: { width: 56, height: 56, borderRadius: 12, overflow: "hidden", backgroundColor: color.surfaceRaised },
  thumbBadge: { position: "absolute", right: 4, bottom: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(29,23,66,0.55)", alignItems: "center", justifyContent: "center" },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s12 },
});
