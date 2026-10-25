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
import { springSnapback } from "@/lib/motion";
import { sceneUrl, scenesByGroup } from "@/lib/scenes";

/**
 * The device hook Phase 1 registers on window (IPhoneDuo). Optional: the
 * Fold / Unfold buttons do nothing until a device is on screen.
 */
declare global {
  interface Window {
    __unsaidDevice?: { fold: () => void; unfold: () => void };
  }
}

const PANEL_WIDTH = 320;
const SWITCH = { width: 51, height: 31, knob: 27, inset: 2 } as const;
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

/* ---------- styles (tokens only) ----------
 * TOKEN NEEDED (iOS dark sheet, HIG dark mode): --ios-dark-elevated #1C1C1E,
 * --ios-dark-grouped #2C2C2E, --ios-dark-fill #39393D, --ios-dark-separator
 * rgba(84,84,88,0.65), --ios-dark-label #FFFFFF, --ios-dark-label-2
 * rgba(235,235,245,0.6), --ios-dark-label-3 rgba(235,235,245,0.3),
 * --shadow-sheet, --shadow-knob. Until then each falls back to the nearest
 * existing token. Dev-only UI (hidden in recordings).
 */

const panel: CSSProperties = {
  position: "fixed",
  top: "var(--space-16)",
  right: "var(--space-16)",
  width: PANEL_WIDTH,
  maxHeight: "calc(100vh - 2 * var(--space-16))",
  overflowY: "auto",
  zIndex: 3,
  padding: "var(--space-8) var(--space-16) var(--space-16)",
  borderRadius: "var(--radius-16)",
  background: "var(--ios-dark-elevated, var(--wa-call-bg))",
  boxShadow: "var(--shadow-sheet, var(--shadow-banner))",
  color: "var(--ios-dark-label, var(--ios-gray6))",
  font: "var(--type-subheadline)",
  letterSpacing: "var(--type-subheadline-tracking)",
  userSelect: "none",
};

const grabber: CSSProperties = {
  width: 36,
  height: 5,
  margin: "0 auto var(--space-8)",
  borderRadius: "var(--radius-pill)",
  background: "var(--ios-dark-fill, var(--material-pill-dark))",
};

const sectionHeader: CSSProperties = {
  margin: "var(--space-16) var(--space-16) var(--space-8)",
  font: "var(--type-footnote)",
  letterSpacing: "var(--type-footnote-tracking)",
  textTransform: "uppercase",
  color: "var(--ios-dark-label-2, var(--ios-gray))",
};

const group: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  borderRadius: "var(--radius-10)",
  background: "var(--ios-dark-grouped, var(--wa-call-surface))",
  overflow: "hidden",
};

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-12)",
  minHeight: 44,
  padding: "0 var(--space-16)",
  boxShadow:
    "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-dark-separator, var(--material-pill-dark))",
  color: "inherit",
  textDecoration: "none",
};

const lastRow: CSSProperties = { ...row, boxShadow: "none" };

const muted: CSSProperties = {
  ...lastRow,
  color: "var(--ios-dark-label-3, var(--ios-gray))",
};

const textButton: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  padding: 0,
  background: "none",
  color: "var(--ios-blue)",
  font: "inherit",
  cursor: "pointer",
};

const field: CSSProperties = {
  appearance: "none",
  width: 88,
  border: 0,
  padding: "var(--space-4) var(--space-8)",
  borderRadius: "var(--radius-8)",
  background: "var(--ios-dark-fill, var(--material-pill-dark))",
  color: "inherit",
  font: "inherit",
  fontVariantNumeric: "tabular-nums",
  textAlign: "center",
  outline: "none",
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
        width: SWITCH.width,
        height: SWITCH.height,
        flex: "none",
        border: 0,
        padding: 0,
        borderRadius: "var(--radius-pill)",
        background: on ? "var(--ios-green)" : "var(--ios-dark-fill, var(--material-pill-dark))",
        transition: "background-color var(--motion-press) var(--ease-ios)",
        cursor: "pointer",
      }}
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ x: on ? SWITCH.width - SWITCH.knob - 2 * SWITCH.inset : 0 }}
        transition={springSnapback}
        style={{
          position: "absolute",
          top: SWITCH.inset,
          left: SWITCH.inset,
          width: SWITCH.knob,
          height: SWITCH.knob,
          borderRadius: "var(--radius-pill)",
          background: "var(--ios-kb-key)",
          boxShadow: "var(--shadow-knob, var(--shadow-key))",
        }}
      />
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
                  <span style={{ color: "var(--ios-dark-label-3, var(--ios-gray))" }}>{name}</span>
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
            onBlur={(event) => applyClock(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyClock(event.currentTarget.value);
            }}
            style={field}
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
            style={{ ...textButton, color: "var(--ios-red)" }}
          >
            Reset state
          </button>
        </li>
      </Section>
    </aside>
  );
}
