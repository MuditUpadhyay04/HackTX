"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Placeholder } from "@/components/Placeholder";
import { durations, easeSoft, ms, usePrefersReducedMotion } from "@/lib/motion";

export type SheetAction = {
  label: string;
  /** leading icon (24 dp, currentColor) */
  icon?: ReactNode;
  /** a working handler */
  onPress?: () => void;
  /** or a placeholder id (`<app>:<control>`) */
  placeholder?: string;
  destructive?: boolean;
};

export type SystemSheetProps = {
  open: boolean;
  onClose: () => void;
  actions: SheetAction[];
  /** the text button at the bottom right ("Cancel") */
  cancelLabel: string;
  /** accent for the dismiss button and the icons */
  tint?: string;
  title?: ReactNode;
};

/**
 * The Android (Material 3) dialog: a dimmed scrim, a centered surface with 28 dp corners, an
 * optional headline, a list of choices (icon + label, full-width ripple rows) and a text button
 * to dismiss. Fades and scales in; tapping the scrim dismisses it.
 */
export function SystemSheet({ open, onClose, actions, cancelLabel, tint = "var(--wa-android-brand)", title }: SystemSheetProps) {
  const reduced = usePrefersReducedMotion();
  const fade = { duration: ms(durations.reducedShell), ease: easeSoft };
  const row = {
    appearance: "none",
    border: 0,
    margin: 0,
    width: "100%",
    minHeight: 56,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "none",
    font: "inherit",
    fontSize: 16,
    textAlign: "left",
    color: "var(--wa-android-on-surface)",
    cursor: "pointer",
  } as const;
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          style={{ position: "absolute", inset: 0, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            data-action="close-sheet"
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "var(--wa-android-scrim)" }}
          />
          <motion.div
            role="dialog"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            style={{
              position: "relative",
              width: "min(312px, calc(100% - 48px))",
              borderRadius: 28,
              background: "var(--wa-android-dialog)",
              boxShadow: "var(--wa-android-dialog-shadow)",
              paddingTop: title ? 24 : 12,
              paddingBottom: 8,
              fontFamily: "var(--font-system)",
              overflow: "hidden",
            }}
          >
            {title ? (
              <div style={{ padding: "0 24px 12px", fontSize: 22, lineHeight: "28px", color: "var(--wa-android-on-surface)" }}>{title}</div>
            ) : null}
            {actions.map((a) => {
              const button = (
                <button
                  key={a.label}
                  type="button"
                  data-action={a.placeholder ? undefined : "sheet-action"}
                  onClick={a.placeholder ? undefined : () => a.onPress?.()}
                  style={{ ...row, color: a.destructive ? "var(--wa-android-missed)" : row.color }}
                >
                  {a.icon ? <span style={{ display: "flex", color: a.destructive ? "inherit" : tint }}>{a.icon}</span> : null}
                  {a.label}
                </button>
              );
              return a.placeholder ? (
                <Placeholder key={a.label} id={a.placeholder} press="darken">
                  {button}
                </Placeholder>
              ) : (
                button
              );
            })}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px 8px" }}>
              <button
                type="button"
                data-action="close-sheet"
                onClick={onClose}
                style={{
                  appearance: "none",
                  border: 0,
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 20,
                  background: "none",
                  font: "inherit",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: 0.1,
                  color: tint,
                  cursor: "pointer",
                }}
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
