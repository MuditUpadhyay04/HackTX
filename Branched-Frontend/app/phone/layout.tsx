import type { Metadata, Viewport } from "next";
import { color } from "@/lib/tokens";

/**
 * /phone: the mock full screen on a real phone (components/device/PhoneView.tsx). The web app
 * manifest (public/phone.webmanifest) makes Chrome's "Add to Home screen" open it full screen, with
 * no browser bars, so the mock's own Android status bar is the only one showing.
 */
export const metadata: Metadata = {
  title: "Un-Said demo",
  applicationName: "Un-Said demo",
  manifest: "/phone.webmanifest",
  appleWebApp: { capable: true, title: "Un-Said demo", statusBarStyle: "black-translucent" },
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

/** The page never scrolls, bounces, pulls to refresh or zooms; the apps scroll inside themselves. Like
 *  /device?rec=1, the concept label, dev panel and dev badge are hidden (the phone is filmed in hand). */
const PAGE_CSS = `html,body{height:100%;margin:0;overflow:hidden;overscroll-behavior:none;background:var(--stage-black);-webkit-text-size-adjust:100%;text-size-adjust:100%}
[data-phone],[data-phone] *{overscroll-behavior:none;-webkit-tap-highlight-color:transparent;scrollbar-width:none}
[data-phone] ::-webkit-scrollbar{display:none}
[data-concept-label],[data-dev-panel],nextjs-portal{display:none !important}`;

export default function PhoneLayout({ children }: LayoutProps<"/phone">) {
  return (
    <>
      <style>{PAGE_CSS}</style>
      {children}
    </>
  );
}
