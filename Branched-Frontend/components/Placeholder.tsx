"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  use,
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import {
  PLACEHOLDER_PLATFORMS,
  toastConceptOnly,
  type PlaceholderPlatform,
} from "@/components/PlaceholderToast";

/** Spec 8.1: `<app>:<control>`, app from the fixed list, control in kebab-case. */
export const PLACEHOLDER_ID = new RegExp(
  `^(${PLACEHOLDER_PLATFORMS.join("|")}):[a-z0-9-]+$`,
);

/** The iOS press state (spec 5): a 0.97 scale, or a 15% darken for list rows. */
export type PressStyle = "scale" | "darken";

const PRESS_SCALE = 0.97;
const PRESS_BRIGHTNESS = 0.85;

/**
 * A child element rendered by a Server Component can reach this client
 * component as a lazy reference (React 19 Flight). Unwrap it before cloning.
 */
function useResolvedChild(node: ReactNode): ReactNode {
  const lazy = node as { $$typeof?: symbol; _payload?: unknown } | null;
  if (
    lazy &&
    typeof lazy === "object" &&
    lazy.$$typeof === Symbol.for("react.lazy") &&
    lazy._payload &&
    typeof (lazy._payload as PromiseLike<unknown>).then === "function"
  ) {
    return use(lazy._payload as PromiseLike<ReactNode>);
  }
  return node;
}

export function platformFromId(id: string): PlaceholderPlatform {
  const prefix = id.split(":")[0];
  return (PLACEHOLDER_PLATFORMS as readonly string[]).includes(prefix)
    ? (prefix as PlaceholderPlatform)
    : "ios";
}

type ChildProps = {
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLElement>) => void;
  children?: ReactNode;
  [key: string]: unknown;
};

export type PlaceholderProps = {
  /** `<app>:<control>`, e.g. "whatsapp:call-start". */
  id: string;
  /** Defaults to the id's app part. */
  platform?: PlaceholderPlatform;
  /**
   * true (default): the one child element IS the control; it gets the
   * attributes and handlers. false: the child is wrapped in a reset <button>.
   */
  asChild?: boolean;
  /** "scale" (buttons, glyphs) or "darken" (list rows, row actions). */
  press?: PressStyle;
  /** Render the pressed look statically (screenshots: ?state=pressed). */
  pressed?: boolean;
  children: ReactElement<ChildProps>;
};

function pressStyle(
  press: PressStyle,
  active: boolean,
  reduced: boolean,
): CSSProperties {
  // Section 4.4: press is 120 ms on ease-std (--motion-press, --ease-std).
  const transition = "var(--motion-press) var(--ease-std)";
  // Reduced motion: no scale; the press reads as the darken instead.
  if (press === "darken" || reduced) {
    return {
      filter: active ? `brightness(${PRESS_BRIGHTNESS})` : undefined,
      transition: `filter ${transition}`,
    };
  }
  return {
    // The individual `scale` property composes with any transform the child already has.
    scale: active ? String(PRESS_SCALE) : "1",
    transition: `scale ${transition}`,
  };
}

/**
 * Wraps exactly one control that would do something real outside this demo.
 * It keeps the control pressable (the platform press state on pointer-down)
 * and shows the shared "concept only" toast on tap. Spec 8.1, rule 4.
 */
export function Placeholder({
  id,
  platform,
  asChild = true,
  press = "scale",
  pressed = false,
  children,
}: PlaceholderProps) {
  const [down, setDown] = useState(false);
  const reduced = usePrefersReducedMotion();
  const resolved = platform ?? platformFromId(id);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !PLACEHOLDER_ID.test(id)) {
      console.warn(
        `[Placeholder] "${id}" is not <app>:<control> (app: ${PLACEHOLDER_PLATFORMS.join(", ")}).`,
      );
    }
  }, [id]);

  const child = Children.only(useResolvedChild(children));
  if (!isValidElement<ChildProps>(child)) return null;
  const own = child.props;
  const active = pressed || down;

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      own.onPointerDown?.(event);
      if (event.button === 0) setDown(true);
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      own.onPointerUp?.(event);
      setDown(false);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      own.onPointerLeave?.(event);
      setDown(false);
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      own.onPointerCancel?.(event);
      setDown(false);
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      own.onClick?.(event);
      if (!event.defaultPrevented) toastConceptOnly(resolved);
    },
  };

  const look = pressStyle(press, active, reduced);
  const marker = {
    "data-placeholder": id,
    "data-pressed": active ? "true" : undefined,
  };

  if (!asChild) {
    return (
      <button
        type="button"
        {...marker}
        {...handlers}
        style={{
          appearance: "none",
          background: "none",
          border: 0,
          padding: 0,
          margin: 0,
          color: "inherit",
          font: "inherit",
          cursor: "pointer",
          touchAction: "manipulation",
          ...look,
        }}
      >
        {child}
      </button>
    );
  }

  return cloneElement(child, {
    ...marker,
    ...handlers,
    style: {
      cursor: "pointer",
      touchAction: "manipulation",
      ...own.style,
      ...look,
    },
  });
}

export type PlaceholderButtonProps = {
  id: string;
  /** Visible text, word for word from the spec or COPY_AND_NAMES.md. */
  label: string;
  platform?: PlaceholderPlatform;
  press?: PressStyle;
  pressed?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** A plain text button that is a placeholder (convenience for simple controls). */
export function PlaceholderButton({
  id,
  label,
  platform,
  press,
  pressed,
  className,
  style,
}: PlaceholderButtonProps) {
  return (
    <Placeholder id={id} platform={platform} press={press} pressed={pressed}>
      <button
        type="button"
        className={className}
        style={{
          appearance: "none",
          border: 0,
          margin: 0,
          background: "none",
          color: "inherit",
          font: "inherit",
          ...style,
        }}
      >
        {label}
      </button>
    </Placeholder>
  );
}
