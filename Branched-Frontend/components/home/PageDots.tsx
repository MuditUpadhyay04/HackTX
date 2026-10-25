import { DOTS, HOME_LAYOUT, type HomeDisplay } from "./layout";

/** One UI page indicator, centered just above the dock: 2 dots, active white, inactive faint. */
export function PageDots({ display, pages = 2, active = 0 }: { display: HomeDisplay; pages?: number; active?: number }) {
  const L = HOME_LAYOUT[display];
  const width = pages * DOTS.size + (pages - 1) * DOTS.gap;
  return (
    <div
      aria-hidden="true"
      data-page-dots={display}
      style={{
        position: "absolute",
        left: L.dotsX - width / 2,
        top: L.dockY - DOTS.aboveDock - DOTS.size,
        display: "flex",
        gap: DOTS.gap,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: pages }, (_, i) => (
        <span
          key={i}
          style={{
            width: DOTS.size,
            height: DOTS.size,
            borderRadius: "50%",
            background: i === active ? "var(--label-on-dark)" : "var(--home-dot-inactive)",
          }}
        />
      ))}
    </div>
  );
}
