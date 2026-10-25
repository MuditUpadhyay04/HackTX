import { WA } from "@/components/lookalike/metrics";

/** WhatsApp chat wallpaper: the classic beige with our own doodle tile (public/mock/wa-doodle.svg). */
export function DoodleWallpaper() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--wa-wallpaper)",
        backgroundImage: "url(/mock/wa-doodle.svg)",
        backgroundSize: `${WA.doodleTile}px ${WA.doodleTile}px`,
        pointerEvents: "none",
      }}
    />
  );
}
