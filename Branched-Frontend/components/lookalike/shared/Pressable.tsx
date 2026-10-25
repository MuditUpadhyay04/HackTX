"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { press as pressSpec } from "@/lib/motion";

export type PressableProps = {
  children: ReactNode;
  onPress?: (e: MouseEvent<HTMLElement>) => void;
  /** navigation target label (data-nav) */
  nav?: string;
  /** a working handler (data-action) */
  action?: string;
  feedback?: "scale" | "darken" | "highlight" | "opacity";
  /** highlight color for list rows (feedback="highlight") */
  highlight?: string;
  style?: CSSProperties;
  label?: string;
  as?: "button" | "div";
};

/**
 * A control with the iOS press state (section 5: 0.97 scale or a 15% darken in under 100 ms;
 * list rows highlight; nav-bar buttons dim). Carries data-nav or data-action (rule 4).
 */
export function Pressable({ children, onPress, nav, action, feedback = "opacity", highlight, style, label, as = "button" }: PressableProps) {
  const [down, setDown] = useState(false);
  const look: CSSProperties =
    feedback === "scale"
      ? { scale: down ? String(pressSpec.scale) : "1", transition: "scale var(--motion-press-in) var(--ease-ios)" }
      : feedback === "darken"
        ? { filter: down ? `brightness(${pressSpec.brightness})` : undefined, transition: "filter var(--motion-press-in) var(--ease-ios)" }
        : feedback === "highlight"
          ? { background: down ? highlight : style?.background, transition: down ? undefined : "background var(--motion-press) var(--ease-ios)" }
          : { opacity: down ? 0.35 : 1, transition: down ? undefined : "opacity var(--motion-press) var(--ease-ios)" };
  const Tag = as;
  return (
    <Tag
      type={as === "button" ? "button" : undefined}
      aria-label={label}
      data-nav={nav}
      data-action={nav ? undefined : action}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onClick={onPress}
      style={{
        appearance: "none",
        border: 0,
        margin: 0,
        padding: 0,
        background: "none",
        font: "inherit",
        color: "inherit",
        textAlign: "inherit",
        cursor: "pointer",
        outline: "none",
        touchAction: "manipulation",
        ...style,
        ...look,
      }}
    >
      {children}
    </Tag>
  );
}
