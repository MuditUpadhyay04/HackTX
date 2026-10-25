"use client";

/**
 * Un-Said on the phone: the real app (HackTX repo `main`, `mobile/`), not a re-implementation.
 * scripts/build-unsaid.sh exports its web build into public/unsaid, so it runs same-origin at
 * /unsaid/ inside the display and talks to its own FastAPI backend (`backend/`; the API address is
 * baked into the build, UNSAID_API in the script). Because it is same-origin the phone can:
 *   - dress its window like a native app: no web scrollbars, no browser focus rings;
 *   - remember which Un-Said screen you are on (shared app stack), so a fold/unfold keeps it;
 *   - launch it like iOS: Un-Said's splash rides the icon zoom, the app appears once it is up and
 *     the zoom has landed, and on close the splash comes back before the window shrinks, so the
 *     animation never drags a live web page through the clip.
 */
import { useEffect, useRef, useState } from "react";
import { STATUS } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useAppStore } from "@/lib/apps/store";
import { AppFrame, useStack } from "../kit";

/** Where the Un-Said web build is served (same-origin by default). */
const BASE = process.env.NEXT_PUBLIC_UNSAID_URL ?? "/unsaid";

/** The home indicator's strip under the app (iOS bottom safe area). */
const SAFE_BOTTOM = 20;

/** Keep the splash up at least this long (ms): the launch zoom lands at about 0.5 s. */
const SPLASH_MIN = 480;

/** Native-app dressing injected into Un-Said's document (same-origin only). */
const DRESSING = `
  *, *::before, *::after { scrollbar-width: none !important; -webkit-tap-highlight-color: transparent; }
  *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  *:focus, *:focus-visible { outline: none !important; box-shadow: none; }
  /* Tab bar labels: on web React Navigation's compact bar clips them to 10 px (their line height is
     13), cutting off the bottoms of the letters on the folded screen. Let them show in full. */
  [role="tablist"] a[role="tab"] > div:last-child { overflow: visible !important; height: auto !important; }
`;

export function UnsaidApp({ display }: AppScreenProps) {
  return (
    <AppFrame display={display} background="#FFFFFF">
      <UnsaidWindow />
    </AppFrame>
  );
}

function UnsaidWindow() {
  const { width, height } = usePane();
  // the Un-Said route you are on, shared by both displays' copies (lib/apps/store routes)
  const stack = useStack<{ path: string }>("unsaid", { path: "" });
  const path = stack.top.path;
  const reset = stack.reset;
  // the first route is fixed at mount: changing `src` later would reload the app
  const [src] = useState(() => `${BASE}${path || "/"}`);
  const closing = useAppStore((s) => s.open?.target !== "unsaid");
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), SPLASH_MIN);
    return () => clearTimeout(t);
  }, []);

  // follow Un-Said's own navigation so a fold/unfold reopens the same screen
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      try {
        const loc = frame.current?.contentWindow?.location;
        if (!loc) return;
        const p = loc.pathname.replace(/^\/unsaid/, "") + loc.search;
        if (p && p !== path) reset([{ path: p }]);
      } catch {
        // cross-origin (NEXT_PUBLIC_UNSAID_URL elsewhere): the route can't be read; nothing to keep
      }
    }, 300);
    return () => clearInterval(id);
  }, [loaded, path, reset]);

  const onLoad = () => {
    try {
      const doc = frame.current?.contentDocument;
      if (doc && !doc.getElementById("phone-dressing")) {
        const style = doc.createElement("style");
        style.id = "phone-dressing";
        style.textContent = DRESSING;
        doc.head.appendChild(style);
      }
    } catch {
      // cross-origin: leave its styling alone
    }
    setLoaded(true);
  };

  const live = loaded && settled && !closing;
  return (
    <>
      <iframe
        ref={frame}
        title="Un-Said"
        src={src}
        onLoad={onLoad}
        allow="microphone; camera; clipboard-write; autoplay"
        style={{
          position: "absolute",
          left: 0,
          top: STATUS.height,
          width,
          height: height - STATUS.height - SAFE_BOTTOM,
          border: 0,
          background: "#FFFFFF",
          // hidden (not just transparent) while the splash shows, so the launch/close zoom never
          // repaints a live web page through the moving clip
          visibility: live ? "visible" : "hidden",
          opacity: live ? 1 : 0,
          transition: live ? "opacity 0.2s ease-out" : "none",
        }}
      />
      {live ? null : <Splash />}
    </>
  );
}

/** Un-Said's launch screen: its app icon on white, like its Expo splash. */
function Splash() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/unsaid-app-icon.png" alt="" width={96} height={96} style={{ borderRadius: 22 }} />
    </div>
  );
}
