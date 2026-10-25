"use client";

/**
 * Un-Said on the phone: the real app (HackTX repo `main`, `mobile/`, Expo web build) running live
 * inside the display, talking to its own FastAPI backend (`backend/`). Nothing is re-implemented
 * here; this is a window onto that app, sized to the display (cover 402 x 573, inner 822.5 x 573),
 * with the phone's status bar above it and the home indicator's safe area below it.
 *
 * Where it runs: NEXT_PUBLIC_UNSAID_URL (default http://localhost:8081, `npx expo start --web
 * --port 8081` in mobile/). See APPS_PROGRESS.md "Un-Said" for the full run steps.
 */
import { useState } from "react";
import { STATUS } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import type { AppScreenProps } from "@/lib/apps/registry";
import { AppFrame } from "../kit";

export const UNSAID_URL = process.env.NEXT_PUBLIC_UNSAID_URL ?? "http://localhost:8081";

/** The home indicator's strip under the app (iOS bottom safe area). */
const SAFE_BOTTOM = 20;

export function UnsaidApp({ display }: AppScreenProps) {
  return (
    <AppFrame display={display} background="#FFFFFF">
      <UnsaidWindow />
    </AppFrame>
  );
}

function UnsaidWindow() {
  const { width, height } = usePane();
  const [state, setState] = useState<"loading" | "ready">("loading");
  return (
    <>
      <iframe
        title="Un-Said"
        src={UNSAID_URL}
        onLoad={() => setState("ready")}
        allow="microphone; camera; clipboard-write; autoplay"
        style={{
          position: "absolute",
          left: 0,
          top: STATUS.height,
          width,
          height: height - STATUS.height - SAFE_BOTTOM,
          border: 0,
          background: "#FFFFFF",
          opacity: state === "ready" ? 1 : 0,
          transition: "opacity 0.25s ease-out",
        }}
      />
      {state === "loading" ? <Splash /> : null}
    </>
  );
}

/** Un-Said's launch splash (its app icon on white, like the Expo splash) while the app loads. */
function Splash() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/unsaid-app-icon.png" alt="" width={96} height={96} style={{ borderRadius: 22 }} />
    </div>
  );
}
