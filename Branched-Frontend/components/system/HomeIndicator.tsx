import { HOME_INDICATOR } from "@/components/home/layout";

/**
 * The One UI gesture handle: a thin pill near the bottom edge, centered in `width` pt.
 * Shown over apps (light tone over dark content, dark over light); One UI keeps it on the home screen too.
 */
export function HomeIndicator({ width, tone = "dark" }: { width: number; tone?: "light" | "dark" }) {
  return (
    <div
      aria-hidden="true"
      data-home-indicator=""
      style={{
        position: "absolute",
        left: (width - HOME_INDICATOR.width) / 2,
        bottom: HOME_INDICATOR.bottom,
        width: HOME_INDICATOR.width,
        height: HOME_INDICATOR.height,
        borderRadius: HOME_INDICATOR.radius,
        background: tone === "dark" ? "var(--ui-label)" : "var(--label-on-dark)",
        pointerEvents: "none",
      }}
    />
  );
}

export default HomeIndicator;
