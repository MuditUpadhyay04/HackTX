"use client";

import type { CSSProperties, ReactNode } from "react";
import { Placeholder } from "@/components/Placeholder";
import { squircleClipPath } from "@/lib/squircle";
import { emphasizedWeight, radius, type as typeScale } from "@/lib/tokens";
import type { WidgetTarget } from "@/lib/apps/registry";
import { useOpenApp } from "@/lib/apps/useOpenApp";
import { ICON, WIDGET, type Rect } from "./layout";

/**
 * The One UI home-screen widgets (static, deterministic: Saturday, Oct 24): Samsung Weather, Samsung
 * Calendar, a Gallery story, the media card (Now playing) and Samsung Reminder. Same story copy:
 * Austin 78° sunny (84° / 66°), "HackTX demo · 11 AM" and "call Mom?".
 */

const t = typeScale;

const text = (style: (typeof t)[keyof typeof t], weight: number = style.weight): CSSProperties => ({
  fontSize: style.size,
  lineHeight: `${style.lineHeight}px`,
  letterSpacing: style.tracking,
  fontWeight: weight,
  whiteSpace: "nowrap",
});

function WidgetFrame({
  id,
  name,
  rect,
  background,
  color,
  children,
}: {
  id: string;
  name: string;
  rect: Rect;
  background: string;
  color: string;
  children: ReactNode;
}) {
  const onClick = useOpenApp(`widget-${id}` as WidgetTarget);
  return (
    <Placeholder id={`oneui:widget-${id}`} press="darken">
      <button
        type="button"
        onClick={onClick}
        aria-label={name}
        data-widget={id}
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          padding: 0,
          margin: 0,
          border: 0,
          background: "none",
          appearance: "none",
          outline: "none",
          font: "inherit",
          textAlign: "left",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: WIDGET.padding,
            clipPath: squircleClipPath(rect.w, rect.h, WIDGET.radius),
            background,
            color,
          }}
        >
          {children}
        </span>
      </button>
    </Placeholder>
  );
}

/** The Android location pin (filled). */
function LocationPin() {
  return (
    <svg width={ICON.labelHeight - 4} height={ICON.labelHeight - 4} viewBox="0 0 10 12" aria-hidden="true">
      <path d="M5 0a4 4 0 0 0-4 4c0 3 4 7.6 4 7.6S9 7 9 4a4 4 0 0 0-4-4Zm0 5.6A1.6 1.6 0 1 1 5 2.4a1.6 1.6 0 0 1 0 3.2Z" fill="currentColor" />
    </svg>
  );
}

/** The weather sun. */
function Sun({ size = t.subheadline.size - 1 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <g stroke="var(--widget-weather-sun)" strokeWidth="1.4" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="7" y1="1" x2="7" y2="2.6" transform={`rotate(${i * 45} 7 7)`} />
        ))}
      </g>
      <circle cx="7" cy="7" r="3.1" fill="var(--widget-weather-sun)" />
    </svg>
  );
}

export function WeatherWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame id="weather" name="Weather" rect={rect} background="var(--widget-weather-fill)" color="var(--label-on-dark)">
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 40, lineHeight: "44px", fontWeight: 300, letterSpacing: "-0.02em" }}>78°</span>
        <span style={{ marginTop: 4 }}>
          <Sun size={30} />
        </span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 3, ...text(t.footnote, 500) }}>
        <LocationPin />
        Austin
      </span>
      <span style={{ flex: 1 }} />
      <span style={text(t.caption1, 500)}>Sunny</span>
      <span style={{ ...text(t.caption1, 400), opacity: 0.85 }}>84° / 66°</span>
    </WidgetFrame>
  );
}

function Event({ title, time, bar }: { title: string; time?: string; bar: string }) {
  return (
    <span style={{ display: "flex", gap: t.caption2.size / 2 }}>
      <span style={{ width: WIDGET.eventBar, borderRadius: radius[2], background: bar, flexShrink: 0 }} />
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ ...text(t.caption1, emphasizedWeight), overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        {time ? <span style={{ ...text(t.caption2), color: "var(--ui-label-secondary)" }}>{time}</span> : null}
      </span>
    </span>
  );
}

export function CalendarWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame id="calendar" name="Calendar" rect={rect} background="var(--widget-calendar-bg)" color="var(--ui-label)">
      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 34, lineHeight: "38px", fontWeight: 400 }}>24</span>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ ...text(t.caption1, 600), color: "var(--widget-calendar-accent)" }}>Sat</span>
          <span style={{ ...text(t.caption2, 400), color: "var(--ui-label-secondary)" }}>October</span>
        </span>
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ display: "flex", flexDirection: "column", gap: t.caption2.size / 2 }}>
        <Event title="HackTX demo" time="11 AM" bar="var(--widget-event-blue)" />
        <Event title="call Mom?" bar="var(--widget-event-purple)" />
      </span>
    </WidgetFrame>
  );
}

/**
 * The Gallery story widget (unfolded home only): one full-bleed photo of Riley and
 * Sarah (public/mock/photos/widget-sarah-sunset.jpg, from the demo photo set), a soft scrim at the
 * bottom and the white two-line caption bottom-left. Static: no slideshow, no motion.
 */
export function PhotosWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame
      id="photos"
      name="Gallery"
      rect={rect}
      background="center / cover no-repeat url(/mock/photos/widget-sarah-sunset.jpg)"
      color="var(--label-on-dark)"
    >
      <span
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: rect.h / 2, background: "linear-gradient(180deg, transparent 0%, var(--ui-scrim) 100%)" }}
      />
      <span style={{ flex: 1 }} />
      <span style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <span style={text(t.footnote, emphasizedWeight)}>With Sarah</span>
        <span style={{ ...text(t.caption2, 500), opacity: 0.85 }}>Sep 14, 2026</span>
      </span>
    </WidgetFrame>
  );
}

/** Android media controls: previous, pause (playing), next. */
function MediaControls() {
  const g = 22;
  return (
    <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={g} height={g} viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 6v12z" fill="currentColor" /></svg>
      <span style={{ width: 40, height: 40, borderRadius: 14, background: "var(--label-on-dark)", color: "var(--widget-music-ink)", display: "grid", placeItems: "center" }}>
        <svg width={g} height={g} viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>
      </span>
      <svg width={g} height={g} viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" fill="currentColor" /></svg>
    </span>
  );
}

/**
 * The media card (Now playing, unfolded home only): the album art blurred behind as the card's color,
 * the art, track, artist, a squiggle-free progress line and the Android media controls.
 */
export function MusicWidget({ rect }: { rect: Rect }) {
  const art = rect.h - 2 * WIDGET.padding;
  return (
    <WidgetFrame id="music" name="Now playing" rect={rect} background="var(--widget-music-fill)" color="var(--label-on-dark)">
      <span style={{ display: "flex", gap: WIDGET.padding, height: "100%" }}>
        <span
          aria-hidden="true"
          style={{ width: art, height: art, flexShrink: 0, borderRadius: 16, background: "var(--widget-music-art)" }}
        />
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <span style={{ ...text(t.footnote, 600), overflow: "hidden", textOverflow: "ellipsis" }}>Mockingbird</span>
          <span style={{ ...text(t.caption1), opacity: 0.75 }}>Eminem</span>
          <span style={{ flex: 1 }} />
          <MediaControls />
          <span style={{ marginTop: 10, height: 4, borderRadius: 2, background: "var(--widget-music-track)" }}>
            <span style={{ display: "block", width: "38%", height: "100%", borderRadius: 2, background: "var(--label-on-dark)" }} />
          </span>
        </span>
      </span>
    </WidgetFrame>
  );
}

function Reminder({ title, done }: { title: string; done?: boolean }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: t.caption2.size / 2 }}>
      <span
        aria-hidden="true"
        style={{
          width: t.caption1.size,
          height: t.caption1.size,
          borderRadius: "50%",
          flexShrink: 0,
          border: "1.5px solid var(--widget-reminders-accent)",
          background: done ? "var(--widget-reminders-accent)" : "none",
        }}
      />
      <span style={{ ...text(t.caption1, 500), opacity: done ? 0.45 : 1 }}>{title}</span>
    </span>
  );
}

/** Samsung Reminder (unfolded home only): today's list. */
export function RemindersWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame id="reminders" name="Reminder" rect={rect} background="var(--widget-calendar-bg)" color="var(--ui-label)">
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...text(t.footnote, 600), color: "var(--widget-reminders-accent)" }}>Reminder</span>
        <span style={{ ...text(t.footnote, 600), color: "var(--widget-reminders-accent)" }}>3</span>
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ display: "flex", flexDirection: "column", gap: t.caption2.size / 2.5 }}>
        <Reminder title="Practice demo pitch" />
        <Reminder title="Charge the Fold" />
        <Reminder title="Text Sarah back" />
      </span>
    </WidgetFrame>
  );
}
