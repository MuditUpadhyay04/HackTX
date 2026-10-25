import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { color } from "@/lib/tokens";

/**
 * /judge: the same full-screen phone as /phone, opened from the QR code on judges' own phones. Un-Said
 * runs its try-mode build; the other apps explain the demo (lib/apps/judge.ts).
 */
export const metadata: Metadata = {
  title: "Try Un-Said",
  applicationName: "Try Un-Said",
  description: "A preview of Un-Said for HackTX judges.",
  appleWebApp: { capable: true, title: "Try Un-Said", statusBarStyle: "black-translucent" },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: color["stage-black"],
};

const PAGE_CSS = `html,body{height:100%;margin:0;overflow:hidden;overscroll-behavior:none;background:var(--stage-black);-webkit-text-size-adjust:100%;text-size-adjust:100%}
[data-phone],[data-phone] *{overscroll-behavior:none;-webkit-tap-highlight-color:transparent;scrollbar-width:none}
[data-phone] ::-webkit-scrollbar{display:none}
[data-concept-label],[data-dev-panel],nextjs-portal{display:none !important}`;

export default function JudgeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{PAGE_CSS}</style>
      {children}
    </>
  );
}
