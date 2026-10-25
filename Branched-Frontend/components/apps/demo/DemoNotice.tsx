"use client";

/**
 * What every app except Un-Said opens on /judge (lib/apps/judge.ts): the look-alikes are props for the
 * film, so a judge is pointed to the one real app, with a few things to try in it.
 * TRY (needs Gurneal's OK): every string below.
 */
import { APP_NAMES, type HomeAppId } from "@/components/home/layout";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useAppStore } from "@/lib/apps/store";
import { AppFrame } from "../kit";

const INK = "#1D1742";
const INK_2 = "#3B3570";
const VIOLET = "#504FF3";
const SOFT = "#F4F2FB";

const STEPS = [
  "Open Un-Said and accept the privacy note.",
  "In Memory Lane, stay on a photo for 5 seconds.",
  "Tap the note that comes up and say what you haven't said. Try: “Mom, I miss your cooking. Sarah, I'm sorry I've been distant.”",
  "Watch it sort into letters, in your own words.",
];

export function DemoNotice({ target, display }: AppScreenProps) {
  const openApp = useAppStore((s) => s.openApp);
  const name = APP_NAMES[target as HomeAppId] ?? "This";
  return (
    <AppFrame display={display} background="#FFFFFF">
      <div
        data-demo-notice
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          padding: "64px 22px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          color: INK,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <img src="/phone-icon-192.png" alt="" width={64} height={64} style={{ borderRadius: 16 }} />
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: "34px", fontWeight: 800, letterSpacing: "-0.02em" }}>This phone is a demo.</h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: "24px", color: INK_2 }}>
          {name} is a look-alike from our film. Only Un-Said works here.
        </p>
        <button
          type="button"
          onClick={() => openApp("unsaid", display)}
          style={{
            height: 54,
            border: 0,
            borderRadius: 999,
            color: "#FFFFFF",
            fontSize: 17,
            fontWeight: 700,
            background: "linear-gradient(90deg, #4F62F4 0%, #4046EE 45%, #9885F4 100%)",
            boxShadow: "0 10px 24px rgba(64, 70, 238, 0.28)",
            cursor: "pointer",
          }}
        >
          Open Un-Said
        </button>
        <div style={{ background: SOFT, borderRadius: 18, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: VIOLET }}>THINGS TO TRY</p>
          {STEPS.map((step, i) => (
            <div key={step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  flex: "none",
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: VIOLET,
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 16, lineHeight: "22px" }}>{step}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: INK_2 }}>
          Nothing is sent from this demo. What you say stays in a private sandbox for this browser and is deleted
          within 24 hours.
        </p>
      </div>
    </AppFrame>
  );
}
