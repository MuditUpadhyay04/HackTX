"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { useFlags } from "@/lib/flags";
import { durations, easeSoft, ms, springSnapback, usePrefersReducedMotion } from "@/lib/motion";
import { size } from "@/lib/tokens";
import { sceneUrl, scenesByGroup } from "@/lib/scenes";
import type { UnsaidDeviceApi } from "@/lib/device/fold";

/**
 * The device hook Phase 1 registers on window (GalaxyFold). Optional: the
 * Fold / Unfold buttons do nothing until a device is on screen.
 */
declare global {
  interface Window {
    __unsaidDevice?: UnsaidDeviceApi;
  }
}

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

/* ---------- styles (tokens only; dark sheet, dark mode). Dev-only UI (hidden in recordings). ---------- */

const panel: CSSProperties = {
  position: "fixed",
  top: "var(--space-16)",
  right: "var(--space-16)",
  width: "var(--size-dev-panel-width)",
  maxHeight: "calc(100vh - 2 * var(--space-16))",
  overflowY: "auto",
  zIndex: 3,
  padding: "var(--space-8) var(--space-16) var(--space-16)",
  borderRadius: "var(--radius-16)",
  background: "var(--ui-dark-elevated)",
  boxShadow: "var(--shadow-sheet)",
  color: "var(--ui-dark-label)",
  font: "var(--type-subheadline)",
  letterSpacing: "var(--type-subheadline-tracking)",
  userSelect: "none",
};

const grabber: CSSProperties = {
  width: "var(--size-grabber-width)",
  height: "var(--size-grabber-height)",
  margin: "0 auto var(--space-8)",
  borderRadius: "var(--radius-pill)",
  background: "var(--ui-dark-fill)",
};

const sectionHeader: CSSProperties = {
  margin: "var(--space-16) var(--space-16) var(--space-8)",
  font: "var(--type-footnote)",
  letterSpacing: "var(--type-footnote-tracking)",
  textTransform: "uppercase",
  color: "var(--ui-dark-label-2)",
};

const group: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  borderRadius: "var(--radius-10)",
  background: "var(--ui-dark-grouped)",
  overflow: "hidden",
};

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-12)",
  minHeight: "var(--size-tap-target)",
  padding: "0 var(--space-16)",
  boxShadow:
    "inset 0 calc(-1 * var(--hairline)) 0 var(--ui-dark-separator)",
  color: "inherit",
  textDecoration: "none",
};

const lastRow: CSSProperties = { ...row, boxShadow: "none" };

const muted: CSSProperties = {
  ...lastRow,
  color: "var(--ui-dark-label-3)",
};

const textButton: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  padding: 0,
  background: "none",
  color: "var(--ui-blue)",
  font: "inherit",
  cursor: "pointer",
};

const field: CSSProperties = {
  appearance: "none",
  width: "var(--size-dev-clock-field)",
  border: 0,
  padding: "var(--space-4) var(--space-8)",
  borderRadius: "var(--radius-8)",
  background: "var(--ui-dark-fill)",
  color: "inherit",
  font: "inherit",
  fontVariantNumeric: "tabular-nums",
  textAlign: "center",
  // The native ring is replaced, not removed: fieldFocused draws a blue ring (focus is keyboard
  // or tap; a text field always shows focus, so :focus-visible and :focus coincide here).
  outline: "none",
  transition: "box-shadow var(--motion-press) var(--ease-std)",
};

const fieldFocused: CSSProperties = {
  ...field,
  boxShadow: "0 0 0 var(--size-focus-ring) var(--ui-blue)",
};

/* ---------- pieces ---------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={sectionHeader}>{title}</h2>
      <ul style={group}>{children}</ul>
    </section>
  );
}

function Switch({
  on,
  action,
  label,
  onToggle,
}: {
  on: boolean;
  action: string;
  label: string;
  onToggle: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const travel = size.switchWidth - size.switchKnob - 2 * size.switchInset;
  const knob: CSSProperties = {
    position: "absolute",
    top: "var(--size-switch-inset)",
    width: "var(--size-switch-knob)",
    height: "var(--size-switch-knob)",
    borderRadius: "var(--radius-pill)",
    background: "var(--ui-kb-key)",
    boxShadow: "var(--shadow-knob)",
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-action={action}
      onClick={onToggle}
      style={{
        appearance: "none",
        position: "relative",
        width: "var(--size-switch-width)",
        height: "var(--size-switch-height)",
        flex: "none",
        border: 0,
        padding: 0,
        borderRadius: "var(--radius-pill)",
        background: on ? "var(--ui-green)" : "var(--ui-dark-fill)",
        transition: "background-color var(--motion-press) var(--ease-std)",
        cursor: "pointer",
      }}
    >
      {reduced ? (
        // Reduced motion: no slide. A knob at each end crossfades (--motion-reduced-shell).
        <>
          {[false, true].map((end) => (
            <motion.span
              key={String(end)}
              aria-hidden="true"
              initial={false}
              animate={{ opacity: on === end ? 1 : 0 }}
              transition={{ duration: ms(durations.reducedShell), ease: easeSoft }}
              style={{ ...knob, left: size.switchInset + (end ? travel : 0) }}
            />
          ))}
        </>
      ) : (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ x: on ? travel : 0 }}
          transition={springSnapback}
          style={{ ...knob, left: "var(--size-switch-inset)" }}
        />
      )}
    </button>
  );
}

/* ---------- panel ---------- */

/**
 * Dev panel (spec Phase 0 Step 4, Phase 2). Toggle with the ` key or open with
 * ?dev=1. Floats at the window's right edge, outside the artboard. Needs a
 * <Suspense> boundary above it (it reads the URL).
 */
export function DevPanel() {
  const flags = useFlags();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? flags.dev;

  const [clockDraft, setClockDraft] = useState<string | null>(null);
  const [clockFocused, setClockFocused] = useState(false);
  // The Device section only shows where a device is mounted (it installs window.__unsaidDevice).
  const [hasDevice, setHasDevice] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHasDevice(Boolean(window.__unsaidDevice)));
    return () => cancelAnimationFrame(id);
  }, []);
  const clockValue = clockDraft ?? (flags.clock && CLOCK.test(flags.clock) ? flags.clock : "");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "`" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      event.preventDefault();
      setToggled((prev) => !(prev ?? flags.dev));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flags.dev]);

  /** Rewrites the current URL's query in place (no scroll, no new history entry). */
  const setParams = useCallback(
    (edit: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      edit(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  if (!open) return null;

  const frozen = flags.clock !== null;
  const keepDev = flags.dev ? { dev: "1" } : undefined;

  const applyClock = (value: string) => {
    if (!CLOCK.test(value)) return;
    setClockDraft(null);
    setParams((next) => next.set("clock", value));
  };

  return (
    <aside data-dev-panel="" aria-label="Dev panel" style={panel}>
      <div aria-hidden="true" style={grabber} />

      <Section title="Scenes">
        {scenesByGroup().map(({ group: name, scenes }, gi, all) =>
          scenes.map((scene, si) => {
            const isLast = gi === all.length - 1 && si === scenes.length - 1;
            const current = scene.route === pathname;
            return (
              <li key={scene.id}>
                <Link
                  href={sceneUrl(scene, keepDev)}
                  data-nav={scene.id}
                  aria-current={current ? "page" : undefined}
                  style={isLast ? lastRow : row}
                >
                  <span>{scene.label}</span>
                  <span style={{ color: "var(--ui-dark-label-3)" }}>{name}</span>
                </Link>
              </li>
            );
          }),
        )}
      </Section>

      <Section title="Clock">
        <li style={row}>
          <label htmlFor="dev-clock">HH:MM</label>
          <input
            id="dev-clock"
            data-action="clock-set"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            maxLength={5}
            value={clockValue}
            onChange={(event) => setClockDraft(event.target.value)}
            onFocus={() => setClockFocused(true)}
            onBlur={(event) => {
              setClockFocused(false);
              applyClock(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyClock(event.currentTarget.value);
            }}
            style={clockFocused ? fieldFocused : field}
          />
        </li>
        <li style={lastRow}>
          <span>Freeze</span>
          <Switch
            on={frozen}
            action="clock-freeze"
            label="Freeze"
            onToggle={() =>
              setParams((next) => {
                if (frozen) next.delete("clock");
                else next.set("clock", CLOCK.test(clockValue) ? clockValue : "frozen");
              })
            }
          />
        </li>
      </Section>

      <Section title="Notifications">
        <li style={muted}>no banners registered</li>
      </Section>

      <Section title="Replies">
        <li style={muted}>no replies registered</li>
      </Section>

      {hasDevice && (
      <Section title="Device">
        <li style={row}>
          <button
            type="button"
            data-action="device-fold"
            onClick={() => window.__unsaidDevice?.fold()}
            style={textButton}
          >
            Fold
          </button>
        </li>
        <li style={lastRow}>
          <button
            type="button"
            data-action="device-unfold"
            onClick={() => window.__unsaidDevice?.unfold()}
            style={textButton}
          >
            Unfold
          </button>
        </li>
      </Section>
      )}

      <Section title="Toggles">
        <li style={row}>
          <span>Labels</span>
          <Switch
            on={flags.labels}
            action="toggle-labels"
            label="Labels"
            onToggle={() =>
              setParams((next) => (flags.labels ? next.set("labels", "off") : next.delete("labels")))
            }
          />
        </li>
        <li style={lastRow}>
          <span>Badges</span>
          <Switch
            on={flags.badges}
            action="toggle-badges"
            label="Badges"
            onToggle={() =>
              setParams((next) => (flags.badges ? next.set("badges", "off") : next.delete("badges")))
            }
          />
        </li>
      </Section>

      <Section title="Reset">
        <li style={lastRow}>
          <button
            type="button"
            data-action="reset"
            onClick={() => {
              // A full reload on purpose: every store re-seeds from lib/mock on ?reset=1.
              const url = new URL(window.location.href);
              url.searchParams.set("reset", "1");
              window.location.assign(url.href);
            }}
            style={{ ...textButton, color: "var(--ui-red)" }}
          >
            Reset state
          </button>
        </li>
      </Section>
    </aside>
  );
}
