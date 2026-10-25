"use client";

import { useOpenApp } from "@/lib/apps/useOpenApp";
import { Placeholder } from "@/components/Placeholder";
import { HOME_LAYOUT, SEARCH, type HomeDisplay } from "./layout";

/**
 * The home-screen Search button, bottom-right under the dock (D8; One UI 9): a round
 * frosted glass button with the magnifier. Search is outside this demo: a placeholder.
 */
export function SearchPill({ display }: { display: HomeDisplay }) {
  const L = HOME_LAYOUT[display];
  const onClick = useOpenApp("search");
  return (
    <Placeholder id="oneui:search" press="darken">
      <button
        type="button"
        onClick={onClick}
        aria-label="Search"
        data-home-search={display}
        style={{
          position: "absolute",
          left: L.railX - SEARCH.size / 2,
          top: L.height - SEARCH.bottom - SEARCH.size,
          width: SEARCH.size,
          height: SEARCH.size,
          padding: 0,
          margin: 0,
          border: 0,
          borderRadius: "50%",
          appearance: "none",
          outline: "none",
          display: "grid",
          placeItems: "center",
          color: "var(--label-on-dark)",
          background: "var(--home-glass-sheen), var(--material-glass)",
          boxShadow: "var(--shadow-glass-stroke)",
        }}
      >
        <svg width={SEARCH.glyph} height={SEARCH.glyph} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6.6" cy="6.6" r="5.1" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <line x1="10.5" y1="10.5" x2="14.6" y2="14.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      </button>
    </Placeholder>
  );
}
