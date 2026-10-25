import { HOME_INDICATOR } from "@/components/home/layout";

/**
 * The iOS home indicator: a 134 x 5 pt capsule, 8 pt above the bottom edge, centered in `width` pt.
 * Shown over apps (light tone over dark content, dark over light); iOS hides it on the home screen.
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
