/**
 * WhatsApp look-alike glyphs (Android / Material style), drawn in-house on a 24-unit grid (never
 * WhatsApp's files). Every glyph strokes / fills with currentColor so the caller sets the color.
 */
import type { CSSProperties, ReactNode } from "react";

type P = { size: number; style?: CSSProperties };
type T = { size: number; active?: boolean };
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const HANDSET =
  "M6.6 3.2c.5-.2 1.1 0 1.4.4l2 3.1c.3.5.3 1.1-.1 1.5l-1.3 1.4c.9 2 2.6 3.7 4.6 4.6l1.4-1.3c.4-.4 1-.4 1.5-.1l3.1 2c.5.3.6.9.4 1.4l-.7 1.8c-.4 1-1.4 1.6-2.5 1.5C9.9 19.2 4.8 14.1 4.2 7.6c-.1-1.1.5-2.1 1.5-2.5l.9-1.9Z";

function Svg({ size, style, children, box = 24 }: P & { children: ReactNode; box?: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} aria-hidden="true" style={style}>
      {children}
    </svg>
  );
}

/** Material back arrow. */
export function ArrowBack({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M20 12H4.8M11 5.4 4.4 12l6.6 6.6" {...stroke} strokeWidth={2} />
    </Svg>
  );
}

/** Vertical overflow (three dots). */
export function MoreVert({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="12" cy="5.5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="18.5" r="1.8" fill="currentColor" />
    </Svg>
  );
}

export function ChevronDown({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="m6 9.2 6 6 6-6" {...stroke} strokeWidth={2} />
    </Svg>
  );
}

export function VideoGlyph({ size, style, filled }: P & { filled?: boolean }) {
  const f = filled ? "currentColor" : "none";
  return (
    <Svg size={size} style={style}>
      <rect x="2.6" y="6" width="13" height="12" rx="2.6" {...stroke} fill={f} />
      <path d="m15.6 10.2 4.5-2.8c.6-.4 1.3.1 1.3.8v7.6c0 .7-.7 1.2-1.3.8l-4.5-2.8Z" {...stroke} fill={f} />
    </Svg>
  );
}

export function PhoneGlyph({ size, style, filled }: P & { filled?: boolean }) {
  return (
    <Svg size={size} style={style}>
      <path d={HANDSET} {...stroke} fill={filled ? "currentColor" : "none"} />
    </Svg>
  );
}

/** Handset with a plus (new call FAB). */
export function AddCallGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d={HANDSET} {...stroke} />
      <path d="M17.2 3v6M14.2 6h6" {...stroke} />
    </Svg>
  );
}

export function LinkGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3.1-3.1a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3.1 3.1a4 4 0 0 0 5.7 5.7l1.2-1.2" {...stroke} strokeWidth={2} />
    </Svg>
  );
}

/** Smiley in the composer pill. */
export function EmojiGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M8.2 14.2c.9 1.5 2.3 2.3 3.8 2.3s2.9-.8 3.8-2.3" {...stroke} />
    </Svg>
  );
}

/** Paperclip (attach), tilted like the Android composer's. */
export function AttachGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={{ transform: "rotate(-45deg)", ...style }}>
      <path d="M16.5 7v9.5a4.5 4.5 0 0 1-9 0V6a3 3 0 0 1 6 0v10a1.5 1.5 0 0 1-3 0V7.5" {...stroke} />
    </Svg>
  );
}

export function CameraGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M3 8.6c0-1.3 1-2.3 2.3-2.3h1.9l1.4-2h6.8l1.4 2h1.9c1.3 0 2.3 1 2.3 2.3v8.9c0 1.3-1 2.3-2.3 2.3H5.3c-1.3 0-2.3-1-2.3-2.3V8.6Z" {...stroke} />
      <circle cx="12" cy="12.6" r="3.6" {...stroke} />
    </Svg>
  );
}

/** Filled mic (inside the green round button). */
export function MicGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <rect x="8.8" y="2.8" width="6.4" height="11.6" rx="3.2" fill="currentColor" />
      <path d="M5.6 11.2c0 3.5 2.9 6.4 6.4 6.4s6.4-2.9 6.4-6.4M12 17.6v3.4" {...stroke} strokeWidth={2} />
    </Svg>
  );
}

/** White send arrow (Material "send", pointing right). */
export function SendArrow({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M3.4 20.2 21.4 12 3.4 3.8l.02 6.4L15 12 3.42 13.8z" fill="currentColor" />
    </Svg>
  );
}

/** Chat bubble with a plus: the new-chat FAB. */
export function NewChatGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M4 5.6C4 4.7 4.7 4 5.6 4h12.8c.9 0 1.6.7 1.6 1.6v9.8c0 .9-.7 1.6-1.6 1.6H8.4L4 20.6V5.6Z" fill="currentColor" />
      <path d="M12 7.2v6.6M8.7 10.5h6.6" stroke="var(--wa-android-brand)" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function PencilGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M4 20h3.6L18.4 9.2a2.5 2.5 0 0 0-3.6-3.6L4 16.4V20ZM13.4 7l3.6 3.6" {...stroke} />
    </Svg>
  );
}

/** One tick (sent) or the double tick (delivered / read). */
export function Ticks({ double, width, height }: { double: boolean; width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 11" aria-hidden="true">
      {double ? (
        <>
          <path d="M1.2 6.2 4.3 9.2 10.9 1.8" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.6 8.6l.6.6 6.6-7.4" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <path d="M3.6 6.2 6.7 9.2 13.3 1.8" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Missed call: a handset with the down-left missed arrow. */
export function MissedCallGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path
        d="M3.4 15.6c4.9-4.3 12.3-4.3 17.2 0 .6.5.7 1.4.2 2l-1.4 1.6c-.4.5-1.2.6-1.8.3l-2.2-1.3c-.5-.3-.7-.8-.6-1.3l.3-1.6c-2-.7-4.2-.7-6.2 0l.3 1.6c.1.5-.1 1-.6 1.3l-2.2 1.3c-.6.3-1.3.2-1.8-.3l-1.4-1.6c-.5-.6-.4-1.5.2-2Z"
        fill="currentColor"
      />
      <path d="M8.2 4.2 12 8l3.6-3.6M15.6 4.4v2.8M15.6 4.4h-2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Small arrow for the Calls list (missed / incoming = down-left, outgoing = up-right). */
export function CallArrow({ size, outgoing }: { size: number; outgoing: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" style={{ transform: outgoing ? "rotate(180deg)" : undefined }}>
      <path d="M12 4 4.6 11.4M4.6 5.6v5.8h5.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <rect x="5.5" y="10.5" width="13" height="10" rx="2.2" fill="currentColor" />
      <path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </Svg>
  );
}

export function PhotoGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" fill="currentColor" />
      <path d="m6.5 16.5 3.6-4.4 2.6 3 1.8-2.1 3 3.5Z" fill="var(--wa-android-surface)" />
      <circle cx="15.5" cy="8.8" r="1.5" fill="var(--wa-android-surface)" />
    </Svg>
  );
}

export function VoiceNoteGlyph({ size, style }: P) {
  return <MicGlyph size={size} style={style} />;
}

export function SearchGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="10.6" cy="10.6" r="6.4" {...stroke} strokeWidth={2} />
      <path d="m15.4 15.4 4.6 4.6" {...stroke} strokeWidth={2} />
    </Svg>
  );
}

export function ArchiveGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M4 8h16v10.4c0 .9-.7 1.6-1.6 1.6H5.6c-.9 0-1.6-.7-1.6-1.6V8ZM3 4.4h18V8H3zM9.5 12h5" {...stroke} />
    </Svg>
  );
}

export function SpeakerGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M4 9.5h3.4L12 5.6v12.8L7.4 14.5H4z" fill="currentColor" />
      <path d="M15.4 9a4.2 4.2 0 0 1 0 6M17.8 6.6a7.6 7.6 0 0 1 0 10.8" {...stroke} />
    </Svg>
  );
}

export function MuteGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <rect x="9" y="3.5" width="6" height="10.5" rx="3" fill="currentColor" />
      <path d="M6.2 11.5a5.8 5.8 0 0 0 11.6 0M12 17.3v3M4.5 4.5l15 15" {...stroke} />
    </Svg>
  );
}

/** The handset turned down (end call). */
export function EndCallGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={{ transform: "rotate(135deg)", ...style }}>
      <path d={HANDSET} fill="currentColor" />
    </Svg>
  );
}

export function PersonAddGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="10" cy="8" r="3.6" {...stroke} />
      <path d="M3.4 19.6c.6-3.4 3.3-5.6 6.6-5.6 1.6 0 3 .5 4.1 1.4M18.5 13v6M15.5 16h6" {...stroke} />
    </Svg>
  );
}

// ---- bottom navigation (outlined when idle, filled when active) ----

export function ChatsNavGlyph({ size, active }: T) {
  return (
    <Svg size={size}>
      <path
        d="M12 3.4c-5 0-8.8 3.6-8.8 8.2 0 1.8.6 3.5 1.7 4.9l-1.1 3.7 3.9-1.3c1.3.6 2.8.9 4.3.9 5 0 8.8-3.6 8.8-8.2S17 3.4 12 3.4Z"
        {...stroke}
        fill={active ? "currentColor" : "none"}
      />
      <g fill={active ? "var(--wa-android-indicator)" : "currentColor"}>
        <circle cx="8.2" cy="11.6" r="1.1" />
        <circle cx="12" cy="11.6" r="1.1" />
        <circle cx="15.8" cy="11.6" r="1.1" />
      </g>
    </Svg>
  );
}

export function UpdatesNavGlyph({ size, active }: T) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" {...stroke} strokeDasharray="11.6 2.6" strokeLinecap="butt" />
      <circle cx="12" cy="12" r="4.6" {...stroke} fill={active ? "currentColor" : "none"} />
    </Svg>
  );
}

export function CommunitiesNavGlyph({ size, active }: T) {
  const f = active ? "currentColor" : "none";
  return (
    <Svg size={size}>
      <circle cx="12" cy="7.6" r="3" {...stroke} fill={f} />
      <circle cx="5.4" cy="10" r="2.2" {...stroke} fill={f} />
      <circle cx="18.6" cy="10" r="2.2" {...stroke} fill={f} />
      <path d="M7 19.4c.3-3 2.4-5 5-5s4.7 2 5 5H7Z" {...stroke} fill={f} />
      <path d="M2.4 18.2c.3-2 1.6-3.3 3.2-3.3.6 0 1.2.2 1.7.5M21.6 18.2c-.3-2-1.6-3.3-3.2-3.3-.6 0-1.2.2-1.7.5" {...stroke} />
    </Svg>
  );
}

export function CallsNavGlyph({ size, active }: T) {
  return (
    <Svg size={size}>
      <path d={HANDSET} {...stroke} fill={active ? "currentColor" : "none"} />
    </Svg>
  );
}

// ---- settings list (outline icons) ----

export function KeyGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="8" cy="12" r="4" {...stroke} />
      <path d="M12 12h9M17.5 12v3.4M20.5 12v2.4" {...stroke} />
    </Svg>
  );
}

export function PrivacyGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" {...stroke} />
      <path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5" {...stroke} />
    </Svg>
  );
}

export function AvatarFaceGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <circle cx="12" cy="10" r="3" {...stroke} />
      <path d="M6.4 18.6c1.2-2 3.2-3.2 5.6-3.2s4.4 1.2 5.6 3.2" {...stroke} />
    </Svg>
  );
}

export function ChatOutlineGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M4 5.6C4 4.7 4.7 4 5.6 4h12.8c.9 0 1.6.7 1.6 1.6v9.8c0 .9-.7 1.6-1.6 1.6H8.4L4 20.6V5.6Z" {...stroke} />
    </Svg>
  );
}

export function BellGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 1.8H4.4L6 16.5ZM10 20.4a2.2 2.2 0 0 0 4 0" {...stroke} />
    </Svg>
  );
}

export function StorageGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M19.4 9.4A8 8 0 0 0 5 7.6M4.6 14.6A8 8 0 0 0 19 16.4M5 3.8v3.8h3.8M19 20.2v-3.8h-3.8" {...stroke} />
    </Svg>
  );
}

export function GlobeGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.2-6.5 3.6-9Z" {...stroke} />
    </Svg>
  );
}

export function HelpGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.7" {...stroke} />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </Svg>
  );
}

export function PeopleGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <circle cx="9" cy="8.4" r="3.4" {...stroke} />
      <path d="M2.8 19.6c.5-3.3 3-5.4 6.2-5.4s5.7 2.1 6.2 5.4M15.6 5.2a3.4 3.4 0 0 1 0 6.4M17.6 14.6c2 .7 3.3 2.5 3.6 5" {...stroke} />
    </Svg>
  );
}

export function QrGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <rect x="4" y="4" width="6" height="6" rx="1" {...stroke} />
      <rect x="14" y="4" width="6" height="6" rx="1" {...stroke} />
      <rect x="4" y="14" width="6" height="6" rx="1" {...stroke} />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1M20 14v1" {...stroke} />
    </Svg>
  );
}

export function PlusGlyph({ size, style }: P) {
  return (
    <Svg size={size} style={style}>
      <path d="M12 5v14M5 12h14" {...stroke} strokeWidth={2.2} />
    </Svg>
  );
}
