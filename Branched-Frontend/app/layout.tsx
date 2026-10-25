import type { Metadata } from "next";
import { Roboto, Roboto_Flex } from "next/font/google";
import { Suspense } from "react";
import { PlaceholderToaster } from "@/components/PlaceholderToast";
import { ConceptLabel } from "@/components/ConceptLabel";
import { DevPanel } from "@/components/dev/DevPanel";
import "./globals.css";

export const metadata: Metadata = {
  title: "concept mock · Galaxy Z Fold 8",
};

// One UI's system face is Samsung's own; Roboto (Android's default) stands in on the web, with
// Roboto Flex for the wide display numerals (clock, weather).
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-roboto" });
const robotoFlex = Roboto_Flex({ subsets: ["latin"], variable: "--font-roboto-flex" });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoFlex.variable}`}>
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
