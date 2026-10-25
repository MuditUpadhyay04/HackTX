// The phone's own gallery (expo-media-library's SDK 58 Query API), read on the device.
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Asset, AssetField, MediaType, Query, type AssetMetadata } from "expo-media-library";
import { Platform } from "react-native";

import { API_URL, APP_KEY, api, mediaUrl } from "./api";

export type GalleryPhoto = Pick<AssetMetadata, "id" | "width" | "height" | "creationTime">;

/**
 * The web build (the phone demo) has no camera roll to read, so the Library shows the demo's own
 * photos from the server instead: the cast's real photos, newest first. Their ids are the image
 * URLs, so the photo page, Talk and Preview use them just like a camera-roll asset.
 */
export const WEB_LIBRARY = Platform.OS === "web";
const webIds = new Map<string, string>(); // image URL -> server photo id

async function loadWebPhotos(offset: number, limit: number): Promise<GalleryPhoto[]> {
  const res = await fetch(`${API_URL}/api/photos`, { headers: APP_KEY ? { "X-App-Key": APP_KEY } : {} });
  const rows = (await res.json()) as { id: string; url: string; taken_at: string | null }[];
  const real = rows
    .filter((r) => /\.(jpe?g|png|webp)$/i.test(r.url))
    .sort((a, b) => (b.taken_at ?? "").localeCompare(a.taken_at ?? ""));
  return real.slice(offset, offset + limit).map((r) => {
    const id = mediaUrl(r.url) ?? r.url;
    webIds.set(id, r.id);
    return { id, width: 1200, height: 1500, creationTime: r.taken_at ? Date.parse(r.taken_at) : 0 };
  });
}

export async function loadPhotos(offset: number, limit: number): Promise<GalleryPhoto[]> {
  if (WEB_LIBRARY) return loadWebPhotos(offset, limit);
  const rows = await new Query()
    .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
    .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
    .offset(offset)
    .limit(limit)
    .exeForMetadata();
  return rows.map(({ id, width, height, creationTime }) => ({ id, width, height, creationTime }));
}

/** "Saturday, Oct 24" from a creation time that may be seconds or milliseconds. */
export function photoDate(creationTime: number | null | undefined) {
  if (!creationTime) return "";
  const ms = creationTime > 1e12 ? creationTime : creationTime * 1000;
  return new Date(ms).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

/** Converts a gallery photo (often HEIC) to a 1200 px JPEG and uploads it for the letter page. */
export async function uploadGalleryPhoto(assetId: string, personId: string): Promise<string> {
  // web: the photo already lives on the server
  const known = webIds.get(assetId);
  if (known) return known;
  const uri = await new Asset(assetId).getUri();
  const image = await ImageManipulator.manipulate(uri).resize({ width: 1200 }).renderAsync();
  const jpeg = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  // The asset id links this gallery photo to them, so a later look at it can be about them.
  const { id } = await api.uploadPhoto(jpeg.uri, personId, "", assetId);
  return id;
}
