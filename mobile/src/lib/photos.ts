// The phone's own gallery (expo-media-library's SDK 58 Query API), read on the device.
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Asset, AssetField, MediaType, Query, type AssetMetadata } from "expo-media-library";

import { api } from "./api";

export type GalleryPhoto = Pick<AssetMetadata, "id" | "width" | "height" | "creationTime">;

export async function loadPhotos(offset: number, limit: number): Promise<GalleryPhoto[]> {
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
  const uri = await new Asset(assetId).getUri();
  const image = await ImageManipulator.manipulate(uri).resize({ width: 1200 }).renderAsync();
  const jpeg = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  // The asset id links this gallery photo to them, so a later look at it can be about them.
  const { id } = await api.uploadPhoto(jpeg.uri, personId, "", assetId);
  return id;
}
