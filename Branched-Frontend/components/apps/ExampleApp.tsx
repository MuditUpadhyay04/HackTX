"use client";

import { TARGET_NAMES, type AppScreenProps } from "@/lib/apps/registry";

/** A starter app screen: copy this file, build your app, and register it in lib/apps/registry.tsx. */
export function ExampleApp({ target, display, close }: AppScreenProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "#FFFFFF",
        color: "var(--ios-label)",
        fontFamily: "var(--font-system)",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700 }}>{TARGET_NAMES[target]}</div>
      <div style={{ fontSize: 15, opacity: 0.6 }}>
        {display === "cover" ? "Outer" : "Inner"} screen · <code>{target}</code>
        <br />
        Link your app in lib/apps/registry.tsx
      </div>
      <button
        type="button"
        onClick={close}
        style={{ marginTop: 8, padding: "8px 18px", borderRadius: 999, border: 0, background: "#007AFF", color: "#FFFFFF", fontSize: 15, fontWeight: 600 }}
      >
        Close
      </button>
    </div>
  );
}
