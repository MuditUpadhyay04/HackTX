/**
 * WhatsApp look-alike glyphs, drawn in-house on a 24-unit grid (never WhatsApp's files).
 * Every glyph strokes / fills with currentColor so the caller sets the color token.
 */
import type { CSSProperties } from "react";

type P = { size: number; style?: CSSProperties };
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function ChevronBack({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 12 21" aria-hidden="true">
      <path d="M10.2 1.6 1.8 10.5l8.4 8.9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VideoGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <rect x="2.2" y="6.2" width="13.6" height="11.6" rx="3" {...stroke} />
      <path d="m15.8 10.4 4.6-2.9c.6-.4 1.4.1 1.4.8v7.4c0 .7-.8 1.2-1.4.8l-4.6-2.9" {...stroke} />
    </svg>
  );
}

export function PhoneGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path
        d="M6.6 3.2c.5-.2 1.1 0 1.4.4l2 3.1c.3.5.3 1.1-.1 1.5l-1.3 1.4c.9 2 2.6 3.7 4.6 4.6l1.4-1.3c.4-.4 1-.4 1.5-.1l3.1 2c.5.3.6.9.4 1.4l-.7 1.8c-.4 1-1.4 1.6-2.5 1.5C9.9 19.2 4.8 14.1 4.2 7.6c-.1-1.1.5-2.1 1.5-2.5l.9-1.9Z"
        {...stroke}
      />
    </svg>
  );
}

export function PlusGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d="M12 4.5v15M4.5 12h15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function StickerGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d="M20 12.6V8.4C20 5.4 18.6 4 15.6 4H8.4C5.4 4 4 5.4 4 8.4v7.2C4 18.6 5.4 20 8.4 20h4.2l7.4-7.4Z" {...stroke} />
      <path d="M12.6 20v-3.6c0-2.4 1.4-3.8 3.8-3.8H20" {...stroke} />
      <circle cx="9.2" cy="10" r="1" fill="currentColor" />
      <circle cx="14.4" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function CameraGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d="M3 8.6c0-1.3 1-2.3 2.3-2.3h1.9l1.4-2h6.8l1.4 2h1.9c1.3 0 2.3 1 2.3 2.3v8.9c0 1.3-1 2.3-2.3 2.3H5.3c-1.3 0-2.3-1-2.3-2.3V8.6Z" {...stroke} />
      <circle cx="12" cy="12.6" r="3.6" {...stroke} />
    </svg>
  );
}

export function MicGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <rect x="8.6" y="2.8" width="6.8" height="11.6" rx="3.4" {...stroke} />
      <path d="M5.4 11.2c0 3.6 3 6.6 6.6 6.6s6.6-3 6.6-6.6M12 17.8v3.4" {...stroke} />
    </svg>
  );
}

/** White send arrow (inside the green send circle). */
export function SendArrow({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d="M4.2 11.3 19 4.6c.5-.2 1 .3.8.8L13.1 20c-.2.5-1 .5-1.1-.1l-1.4-6.5-6.5-1.4c-.5-.1-.6-.9-.1-1.1Z" fill="currentColor" />
    </svg>
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
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path
        d="M3.4 15.6c4.9-4.3 12.3-4.3 17.2 0 .6.5.7 1.4.2 2l-1.4 1.6c-.4.5-1.2.6-1.8.3l-2.2-1.3c-.5-.3-.7-.8-.6-1.3l.3-1.6c-2-.7-4.2-.7-6.2 0l.3 1.6c.1.5-.1 1-.6 1.3l-2.2 1.3c-.6.3-1.3.2-1.8-.3l-1.4-1.6c-.5-.6-.4-1.5.2-2Z"
        fill="currentColor"
      />
      <path d="M8.2 4.2 12 8l3.6-3.6M15.6 4.4v2.8M15.6 4.4h-2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small arrow for the Calls list (missed = down-left, outgoing = up-right). */
export function CallArrow({ size, missed }: { size: number; missed: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" style={{ transform: missed ? undefined : "rotate(180deg)" }}>
      <path d="M12 4 4.6 11.4M4.6 5.6v5.8h5.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <rect x="5.5" y="10.5" width="13" height="10" rx="2.2" fill="currentColor" />
      <path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PhotoGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d="M3.5 8.8c0-1.2 1-2.2 2.2-2.2h1.8l1.3-1.9h6.4l1.3 1.9h1.8c1.2 0 2.2 1 2.2 2.2v8.3c0 1.2-1 2.2-2.2 2.2H5.7c-1.2 0-2.2-1-2.2-2.2V8.8Z" fill="currentColor" />
      <circle cx="12" cy="12.8" r="3.3" fill="var(--wa-nav-material)" />
    </svg>
  );
}

export function VoiceNoteGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <rect x="8.8" y="3" width="6.4" height="11" rx="3.2" fill="currentColor" />
      <path d="M5.8 11.4c0 3.4 2.8 6.2 6.2 6.2s6.2-2.8 6.2-6.2M12 17.6v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function InfoGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <circle cx="12" cy="12" r="9.2" {...stroke} />
      <path d="M12 10.8v5.6" {...stroke} />
      <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function SearchGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <circle cx="10.6" cy="10.6" r="6.4" {...stroke} strokeWidth={2} />
      <path d="m15.4 15.4 4.6 4.6" {...stroke} strokeWidth={2} />
    </svg>
  );
}

export function MoreGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <circle cx="6" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="18" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function NewChatGlyph({ size, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d="M12 6.2v11.6M6.2 12h11.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ---- tab bar ----

export function UpdatesTabGlyph({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="10.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeDasharray="12.4 2.6" />
      <circle cx="14" cy="14" r="6.4" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function CallsTabGlyph({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.6 3.2c.5-.2 1.1 0 1.4.4l2 3.1c.3.5.3 1.1-.1 1.5l-1.3 1.4c.9 2 2.6 3.7 4.6 4.6l1.4-1.3c.4-.4 1-.4 1.5-.1l3.1 2c.5.3.6.9.4 1.4l-.7 1.8c-.4 1-1.4 1.6-2.5 1.5C9.9 19.2 4.8 14.1 4.2 7.6c-.1-1.1.5-2.1 1.5-2.5l.9-1.9Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommunitiesTabGlyph({ size, active }: { size: number; active?: boolean }) {
  const f = active ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="9.4" r="3.6" fill={f} stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6.8" cy="11.6" r="2.6" fill={f} stroke="currentColor" strokeWidth="1.6" />
      <circle cx="21.2" cy="11.6" r="2.6" fill={f} stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 21.6c.4-3.4 2.9-5.6 5.8-5.6s5.4 2.2 5.8 5.6H8.2Z" fill={f} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 20.4c.3-2.3 1.9-3.8 3.8-3.8 1 0 1.8.3 2.5.9M25 20.4c-.3-2.3-1.9-3.8-3.8-3.8-1 0-1.8.3-2.5.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ChatsTabGlyph({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <path
        d="M14 4.2c-5.6 0-10 4-10 9.2 0 2.3.9 4.4 2.4 6l-1 3.6c-.1.4.3.8.7.6l3.7-1.6c1.3.5 2.7.8 4.2.8 5.6 0 10-4.1 10-9.2S19.6 4.2 14 4.2Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {active ? (
        <>
          <circle cx="9.6" cy="13.4" r="1.2" fill="var(--wa-nav)" />
          <circle cx="14" cy="13.4" r="1.2" fill="var(--wa-nav)" />
          <circle cx="18.4" cy="13.4" r="1.2" fill="var(--wa-nav)" />
        </>
      ) : null}
    </svg>
  );
}

export function SettingsTabGlyph({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <path
        d="M12.3 3.8h3.4l.6 2.7c.8.3 1.5.7 2.2 1.3l2.6-.9 1.7 2.9-2 1.8c.1.8.1 1.6 0 2.4l2 1.8-1.7 2.9-2.6-.9c-.7.6-1.4 1-2.2 1.3l-.6 2.7h-3.4l-.6-2.7c-.8-.3-1.5-.7-2.2-1.3l-2.6.9-1.7-2.9 2-1.8c-.1-.8-.1-1.6 0-2.4l-2-1.8 1.7-2.9 2.6.9c.7-.6 1.4-1 2.2-1.3l.6-2.7Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="14" r="3.2" fill={active ? "var(--wa-nav)" : "none"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
