/**
 * components/apps/phone/glyphs.tsx: One UI line icons for the Phone app (24-unit grid, 1.7 strokes).
 */
import type { ReactNode } from "react";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Svg({ size = 24, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      {children}
    </svg>
  );
}

const HANDSET =
  "M6.6 3.6h2.5c.5 0 .9.3 1 .8l.8 3.4c.1.4-.1.9-.4 1.1l-1.7 1.2c1 2.2 2.8 4 5 5l1.2-1.7c.3-.4.7-.5 1.1-.4l3.4.8c.5.1.8.5.8 1v2.5c0 1-.8 1.8-1.8 1.8C10.4 21.1 2.9 13.6 2.9 5.4c0-1 .8-1.8 1.8-1.8Z";

export const PhoneGlyph = ({ size, filled }: { size?: number; filled?: boolean }) => (
  <Svg size={size}>
    <path d={HANDSET} {...line} fill={filled ? "currentColor" : "none"} />
  </Svg>
);

/** The end-call handset, rotated down. */
export const EndCallGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path
      d="M3.2 14.6 2.4 12.4c-.2-.5 0-1 .4-1.3C5.4 9.3 8.6 8.4 12 8.4s6.6.9 9.2 2.7c.4.3.6.8.4 1.3l-.8 2.2c-.2.5-.7.7-1.2.6l-3.1-.7c-.4-.1-.7-.5-.7-1v-2c-1.2-.4-2.5-.6-3.8-.6s-2.6.2-3.8.6v2c0 .5-.3.9-.7 1l-3.1.7c-.5.1-1-.1-1.2-.6Z"
      fill="currentColor"
    />
  </Svg>
);

export const KeypadGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    {[3.8, 9.2, 14.6].flatMap((y) => [6, 12, 18].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.7} fill="currentColor" />))}
    <circle cx="12" cy="20" r="1.7" fill="currentColor" />
  </Svg>
);

export const RecentsGlyph = ({ size, filled }: { size?: number; filled?: boolean }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.6" {...line} fill={filled ? "currentColor" : "none"} />
    <path d="M12 7.4V12l3 2" {...line} stroke={filled ? "var(--ph-tab-active-ink)" : "currentColor"} />
  </Svg>
);

export const ContactsGlyph = ({ size, filled }: { size?: number; filled?: boolean }) => (
  <Svg size={size}>
    <circle cx="12" cy="8.2" r="3.8" {...line} fill={filled ? "currentColor" : "none"} />
    <path d="M4.6 20c.6-3.6 3.6-6 7.4-6s6.8 2.4 7.4 6" {...line} fill={filled ? "currentColor" : "none"} />
  </Svg>
);

export const SearchGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="10.6" cy="10.6" r="6.4" {...line} />
    <path d="m15.4 15.4 4.6 4.6" {...line} />
  </Svg>
);

export const MoreGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="18.5" r="1.6" fill="currentColor" />
  </Svg>
);

export const BackspaceGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M8.4 5.5h11.2c.9 0 1.6.7 1.6 1.6v9.8c0 .9-.7 1.6-1.6 1.6H8.4L2.8 12l5.6-6.5Z" {...line} />
    <path d="m11.6 9.4 5.2 5.2m0-5.2-5.2 5.2" {...line} />
  </Svg>
);

export const VoicemailGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="6.5" cy="12" r="3.5" {...line} />
    <circle cx="17.5" cy="12" r="3.5" {...line} />
    <path d="M6.5 15.5h11" {...line} />
  </Svg>
);

export const MessageGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M4 5.8C4 4.8 4.8 4 5.8 4h12.4c1 0 1.8.8 1.8 1.8v9c0 1-.8 1.8-1.8 1.8H9l-5 3.6V5.8Z" {...line} />
  </Svg>
);

export const VideoGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <rect x="2.8" y="6.2" width="12.6" height="11.6" rx="2.4" {...line} />
    <path d="m15.4 10.4 5.4-3.2v9.6l-5.4-3.2" {...line} />
  </Svg>
);

export const SpeakerGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M4 9.2h3.4L12 5v14l-4.6-4.2H4V9.2Z" {...line} />
    <path d="M15.4 9c.9.8 1.4 1.9 1.4 3s-.5 2.2-1.4 3M18 6.4c1.6 1.4 2.6 3.4 2.6 5.6s-1 4.2-2.6 5.6" {...line} />
  </Svg>
);

export const MuteGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <rect x="9" y="3.2" width="6" height="11" rx="3" {...line} />
    <path d="M5.8 11.2c0 3.4 2.8 6.2 6.2 6.2s6.2-2.8 6.2-6.2M12 17.4v3.4M4 4l16 16" {...line} />
  </Svg>
);

export const BluetoothGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="m7 7.5 10 9-5 4.4V3.1l5 4.4-10 9" {...line} />
  </Svg>
);

export const AddCallGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d={HANDSET} {...line} transform="translate(-1 1) scale(.92)" />
    <path d="M17.5 3v6M14.5 6h6" {...line} />
  </Svg>
);

export const HoldGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M9 6v12M15 6v12" {...line} strokeWidth={2.4} />
  </Svg>
);

export const RecordGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.6" {...line} />
    <circle cx="12" cy="12" r="3.4" fill="currentColor" />
  </Svg>
);

export const InfoGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.6" {...line} />
    <path d="M12 11v5.4" {...line} />
    <circle cx="12" cy="7.8" r="1.1" fill="currentColor" />
  </Svg>
);

export const PlusGlyph = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M12 5v14M5 12h14" {...line} />
  </Svg>
);

/** The small call-direction arrow in Recents: missed (red, bent), incoming, outgoing. */
export function DirectionGlyph({ direction, size = 14 }: { direction: "missed" | "incoming" | "outgoing"; size?: number }) {
  const color = direction === "missed" ? "var(--ph-missed)" : direction === "incoming" ? "var(--ph-incoming)" : "var(--ph-outgoing)";
  const d =
    direction === "missed"
      ? "M4 7l6 6 4-4 6 6M20 10.5V15h-4.5"
      : direction === "incoming"
        ? "M18 6 6 18M6 9.5V18h8.5"
        : "M6 18 18 6M9.5 6H18v8.5";
  return (
    <span style={{ color, display: "inline-flex" }}>
      <Svg size={size}>
        <path d={d} {...line} strokeWidth={2.2} />
      </Svg>
    </span>
  );
}

/** The avatar for a number that is not a contact: a gray circle with a person silhouette. */
export function LetterAvatar({ size }: { size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--ph-avatar-bg)",
        color: "var(--ph-avatar-ink)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 24 24" style={{ display: "block" }}>
        <circle cx="12" cy="9" r="4.6" fill="currentColor" />
        <path d="M2.5 24c.8-5.4 4.6-8.6 9.5-8.6s8.7 3.2 9.5 8.6Z" fill="currentColor" />
      </svg>
    </span>
  );
}
