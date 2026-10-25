// The Library: the demo's photos from the server (demo data, and always on web), or the phone's own
// gallery (expo-media-library's SDK 58 Query API) when demo data is off on a real phone.
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Asset, AssetField, MediaType, Query, type AssetMetadata } from "expo-media-library";
import { Platform } from "react-native";

import { API_URL, APP_KEY, api, mediaUrl } from "./api";
import { DEMO_DATA } from "./demo";

export type GalleryPhoto = Pick<AssetMetadata, "id" | "width" | "height" | "creationTime">;

/**
 * The web build (the phone demo) has no camera roll to read, and a borrowed phone's camera roll is
 * not ours to read, so with demo data on the Library shows the demo's own photos from the server
 * instead: the cast's real photos, newest first. Their ids are the image URLs, so the photo page,
 * Talk, memory, knocks and Preview use them just like a camera-roll asset. With SERVER_LIBRARY on,
 * nothing in expo-media-library or expo-image-manipulator is ever called.
 */
export const SERVER_LIBRARY = Platform.OS === "web" || DEMO_DATA;
const serverIds = new Map<string, string>(); // image URL -> server photo id

type ServerPhoto = { id: string; url: string; taken_at: string | null };

async function serverPhotos(): Promise<ServerPhoto[]> {
  const res = await fetch(`${API_URL}/api/photos`, { headers: APP_KEY ? { "X-App-Key": APP_KEY } : {} });
  if (!res.ok) throw new Error(`photos: ${res.status}`);
  const rows = (await res.json()) as ServerPhoto[];
  return rows
    .filter((r) => /\.(jpe?g|png|webp)$/i.test(r.url))
    .sort((a, b) => (b.taken_at ?? "").localeCompare(a.taken_at ?? ""));
}

async function loadServerPhotos(offset: number, limit: number): Promise<GalleryPhoto[]> {
  const real = await serverPhotos();
  return real.slice(offset, offset + limit).map((r) => {
    const id = mediaUrl(r.url) ?? r.url;
    serverIds.set(id, r.id);
    return { id, width: 1200, height: 1500, creationTime: r.taken_at ? Date.parse(r.taken_at) : 0 };
  });
}

export async function loadPhotos(offset: number, limit: number): Promise<GalleryPhoto[]> {
  if (SERVER_LIBRARY) return loadServerPhotos(offset, limit);
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

/**
 * The server photo id for a Library photo, for the letter page. Demo data: the photo already lives
 * on the server, so nothing is uploaded. Otherwise a gallery photo (often HEIC) is converted to a
 * 1200 px JPEG and uploaded.
 */
export async function uploadGalleryPhoto(assetId: string, personId: string): Promise<string> {
  const known = serverIds.get(assetId);
  if (known) return known;
  if (SERVER_LIBRARY) {
    // opened straight from a link or after a reload: find it again by its URL
    const row = (await serverPhotos()).find((r) => (mediaUrl(r.url) ?? r.url) === assetId);
    if (!row) throw new Error("that photo isn't in the demo library");
    serverIds.set(assetId, row.id);
    return row.id;
  }
  const uri = await new Asset(assetId).getUri();
  const image = await ImageManipulator.manipulate(uri).resize({ width: 1200 }).renderAsync();
  const jpeg = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  // The asset id links this gallery photo to them, so a later look at it can be about them.
  const { id } = await api.uploadPhoto(jpeg.uri, personId, "", assetId);
  return id;
}
