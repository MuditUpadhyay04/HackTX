"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { SAFE_BOTTOM, SHEET } from "@/components/lookalike/metrics";
import { Placeholder } from "@/components/Placeholder";
import { durations, easeSoft, ms, springSnapback, usePrefersReducedMotion } from "@/lib/motion";

export type SheetAction = {
  label: string;
  /** a working handler */
  onPress?: () => void;
  /** or a placeholder id (`<app>:<control>`) */
  placeholder?: string;
  destructive?: boolean;
};

export type IOSSheetProps = {
  open: boolean;
  onClose: () => void;
  actions: SheetAction[];
  cancelLabel: string;
  tint?: string;
  title?: ReactNode;
};

/**
 * The iOS action sheet: a dimmed scrim, a grouped block of actions in the light material with
 * hairline separators, and a separate bold Cancel button. Slides up on the snapback spring.
 */
export function IOSSheet({ open, onClose, actions, cancelLabel, tint = "var(--ios-blue)", title }: IOSSheetProps) {
  const reduced = usePrefersReducedMotion();
  const fade = { duration: ms(durations.reducedShell), ease: easeSoft };
  const row = {
    appearance: "none",
    border: 0,
    margin: 0,
    width: "100%",
    height: SHEET.rowHeight,
    background: "none",
    font: "inherit",
    fontSize: SHEET.titleSize,
    letterSpacing: "var(--type-title-3-tracking)",
    color: tint,
    cursor: "pointer",
  } as const;
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          style={{ position: "absolute", inset: 0, zIndex: 45 }}
        >
          <div
            data-action="close-sheet"
            onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "var(--ios-scrim)" }}
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={reduced ? fade : springSnapback}
            style={{
              position: "absolute",
              left: SHEET.side,
              right: SHEET.side,
              bottom: SAFE_BOTTOM,
              display: "flex",
              flexDirection: "column",
              gap: SHEET.gap,
            }}
          >
            <div
              style={{
                borderRadius: SHEET.radius,
                overflow: "hidden",
                background: "var(--material-light)",
                backdropFilter: "var(--material-light-filter)",
                WebkitBackdropFilter: "var(--material-light-filter)",
              }}
            >
              {title ? (
                <div
                  style={{
                    padding: "var(--space-14) var(--space-16)",
                    textAlign: "center",
                    font: "var(--type-footnote-semibold)",
                    color: "var(--ios-label-secondary)",
                    boxShadow: "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)",
                  }}
                >
                  {title}
                </div>
              ) : null}
              {actions.map((a, i) => {
                const button = (
                  <button
                    key={a.label}
                    type="button"
                    data-action={a.placeholder ? undefined : "sheet-action"}
                    onClick={a.placeholder ? undefined : () => a.onPress?.()}
                    style={{
                      ...row,
                      color: a.destructive ? "var(--ios-red)" : tint,
                      boxShadow: i > 0 ? "inset 0 var(--hairline) 0 var(--ios-separator)" : undefined,
                    }}
                  >
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
            </div>
            <button
              type="button"
              data-action="close-sheet"
              onClick={onClose}
              style={{ ...row, fontWeight: 600, borderRadius: SHEET.radius, background: "var(--ios-bg)" }}
            >
              {cancelLabel}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
