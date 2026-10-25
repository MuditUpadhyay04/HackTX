import type { Metadata } from "next";
import { Suspense } from "react";
import { PlaceholderToaster } from "@/components/PlaceholderToast";
import { ConceptLabel } from "@/components/ConceptLabel";
import { DevPanel } from "@/components/dev/DevPanel";
import "./globals.css";

export const metadata: Metadata = {
  title: "Un-Said · Branched-Frontend (concept mock)",
  icons: {
    icon: "/unsaid-theme/brand/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <ConceptLabel />
        </Suspense>
        <Suspense fallback={null}>
          <PlaceholderToaster />
        </Suspense>
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      </body>
    </html>
  );
}
