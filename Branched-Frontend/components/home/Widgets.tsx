"use client";

import type { CSSProperties, ReactNode } from "react";
import { Placeholder } from "@/components/Placeholder";
import { squircleClipPath } from "@/lib/squircle";
import { emphasizedWeight, radius, type as typeScale } from "@/lib/tokens";
import type { WidgetTarget } from "@/lib/apps/registry";
import { useOpenApp } from "@/lib/apps/useOpenApp";
import { ICON, WIDGET, type Rect } from "./layout";

/**
 * The two home-screen widgets (static, deterministic: Saturday, Oct 24). Copy is word for word from
 * CLAUDE_PROMPT.md Phase 3 LAYOUT: Weather "Austin", "78°", "Sunny", "H:84° L:66°"; Calendar
 * "SATURDAY", "24", "HackTX demo · 11 AM" (shown as the event and its time) and "call Mom?".
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
    <Placeholder id={`ios:widget-${id}`}>
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
            clipPath: squircleClipPath(rect.w, rect.h, radius[22]),
            background,
            color,
          }}
        >
          {children}
        </span>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: rect.h + WIDGET.labelGap,
            textAlign: "center",
            color: "var(--label-on-dark)",
            textShadow: "var(--shadow-icon-label)",
            ...text(t.caption2, 500),
          }}
        >
          {name}
        </span>
      </button>
    </Placeholder>
  );
}

/** The iOS location arrow (filled), 9 pt. */
function LocationArrow() {
  return (
    <svg width={ICON.labelHeight - 4} height={ICON.labelHeight - 4} viewBox="0 0 10 10" aria-hidden="true">
      <path d="M9.6.4.9 4.3c-.5.2-.4.9.1 1L4.4 6l.7 3.4c.1.5.8.6 1 .1L9.6.4Z" fill="currentColor" />
    </svg>
  );
}

/** The weather sun, 14 pt. */
function Sun() {
  return (
    <svg width={t.subheadline.size - 1} height={t.subheadline.size - 1} viewBox="0 0 14 14" aria-hidden="true">
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
      <span style={{ display: "flex", alignItems: "center", gap: t.caption2.size / 3, ...text(t.footnote, emphasizedWeight) }}>
        Austin
        <LocationArrow />
      </span>
      <span style={{ ...text(t.largeTitle, 300), marginTop: -t.caption2.size / 4 }}>78°</span>
      <span style={{ flex: 1 }} />
      <Sun />
      <span style={{ ...text(t.caption1, emphasizedWeight), marginTop: t.caption2.size / 4 }}>Sunny</span>
      <span style={text(t.caption1, emphasizedWeight)}>H:84° L:66°</span>
    </WidgetFrame>
  );
}

function Event({ title, time, bar }: { title: string; time?: string; bar: string }) {
  return (
    <span style={{ display: "flex", gap: t.caption2.size / 2 }}>
      <span style={{ width: WIDGET.eventBar, borderRadius: radius[2], background: bar, flexShrink: 0 }} />
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ ...text(t.caption1, emphasizedWeight), overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        {time ? <span style={{ ...text(t.caption2), color: "var(--ios-label-secondary)" }}>{time}</span> : null}
      </span>
    </span>
  );
}

export function CalendarWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame id="calendar" name="Calendar" rect={rect} background="var(--widget-calendar-bg)" color="var(--ios-label)">
      <span style={{ ...text(t.caption2, emphasizedWeight), color: "var(--ios-red)", letterSpacing: t.caption2.size / 20 }}>SATURDAY</span>
      <span style={{ ...text(t.largeTitle, 400), marginTop: -t.caption2.size / 4 }}>24</span>
      <span style={{ flex: 1 }} />
      <span style={{ display: "flex", flexDirection: "column", gap: t.caption2.size / 2 }}>
        <Event title="HackTX demo" time="11 AM" bar="var(--widget-event-blue)" />
        <Event title="call Mom?" bar="var(--widget-event-purple)" />
      </span>
    </WidgetFrame>
  );
}

/**
 * The iOS Photos "Featured Photo" widget (unfolded home only): one full-bleed photo of Riley and
 * Sarah (public/mock/photos/widget-sarah-sunset.jpg, from the demo photo set), a soft scrim at the
 * bottom and the white two-line caption bottom-left. Static: no slideshow, no motion.
 */
export function PhotosWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame
      id="photos"
      name="Photos"
      rect={rect}
      background="center / cover no-repeat url(/mock/photos/widget-sarah-sunset.jpg)"
      color="var(--label-on-dark)"
    >
      <span
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: rect.h / 2, background: "linear-gradient(180deg, transparent 0%, var(--ios-scrim) 100%)" }}
      />
      <span style={{ flex: 1 }} />
      <span style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <span style={text(t.footnote, emphasizedWeight)}>With Sarah</span>
        <span style={{ ...text(t.caption2, 500), opacity: 0.85 }}>Sep 14, 2026</span>
      </span>
    </WidgetFrame>
  );
}

/** iOS Music "Now Playing" (medium, unfolded home only): album art, track, artist and a progress bar. */
export function MusicWidget({ rect }: { rect: Rect }) {
  const art = rect.h - 2 * WIDGET.padding;
  return (
    <WidgetFrame id="music" name="Music" rect={rect} background="var(--widget-music-fill)" color="var(--label-on-dark)">
      <span style={{ display: "flex", gap: WIDGET.padding, height: "100%" }}>
        <span
          aria-hidden="true"
          style={{ width: art, height: art, flexShrink: 0, borderRadius: radius[10], background: "var(--widget-music-art)" }}
        />
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <span style={{ ...text(t.caption2, emphasizedWeight), color: "var(--widget-music-accent)" }}>NOW PLAYING</span>
          <span style={{ flex: 1 }} />
          <span style={{ ...text(t.footnote, emphasizedWeight), overflow: "hidden", textOverflow: "ellipsis" }}>Late Night Drive</span>
          <span style={{ ...text(t.caption1), opacity: 0.7 }}>Austin Lights</span>
          <span style={{ marginTop: t.caption2.size / 2, height: 3, borderRadius: radius[2], background: "var(--widget-music-track)" }}>
            <span style={{ display: "block", width: "38%", height: "100%", borderRadius: radius[2], background: "var(--label-on-dark)" }} />
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

/** iOS Reminders (medium, unfolded home only): today's list. */
export function RemindersWidget({ rect }: { rect: Rect }) {
  return (
    <WidgetFrame id="reminders" name="Reminders" rect={rect} background="var(--widget-calendar-bg)" color="var(--ios-label)">
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...text(t.footnote, emphasizedWeight), color: "var(--widget-reminders-accent)" }}>Today</span>
        <span style={{ ...text(t.title2, 600), color: "var(--widget-reminders-accent)" }}>3</span>
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
