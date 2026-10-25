// One responsive rule for every screen, so a phone that folds, unfolds, rotates, or runs in
// Split View re-lays out the same way everywhere. Nothing here knows about a specific device:
// it only reads the current window size (useWindowDimensions updates live) and the safe areas.
import { useWindowDimensions, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Below this width a screen is one phone column; at or above it, it may use two. */
export const EXPANDED_MIN_WIDTH = 600;

/** Widest a single reading column gets (letters, settings, lists). */
export const READING_MAX = 640;
/** Widest a two-column screen gets before it centers. */
export const SPLIT_MAX = 1080;

export type LayoutSize = "compact" | "expanded";

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size: LayoutSize = width >= EXPANDED_MIN_WIDTH ? "expanded" : "compact";
  const expanded = size === "expanded";
  const landscape = width > height;
  // Usable width once left/right safe areas (landscape notch or camera side) are taken out.
  const usableWidth = width - insets.left - insets.right;

  /** A centered column no wider than `max`, clear of the left/right safe areas. */
  const column = (max: number = READING_MAX): ViewStyle => ({
    width: "100%",
    maxWidth: max + insets.left + insets.right,
    alignSelf: "center",
    paddingLeft: insets.left,
    paddingRight: insets.right,
  });

  return {
    width,
    height,
    size,
    expanded,
    compact: !expanded,
    landscape,
    /** Short and wide (a phone on its side): stack less, put things side by side. */
    short: height < 520,
    usableWidth,
    insets,
    column,
  };
}
