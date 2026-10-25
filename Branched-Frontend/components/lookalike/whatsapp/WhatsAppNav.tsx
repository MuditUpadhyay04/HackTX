"use client";

import { useRouter } from "next/navigation";
import { STATUS, WA } from "@/components/lookalike/metrics";
import { Pressable } from "@/components/lookalike/shared/Pressable";
import { Placeholder } from "@/components/Placeholder";
import { ChevronBack, PhoneGlyph, VideoGlyph } from "./glyphs";

export type WhatsAppNavProps = {
  name: string;
  subtitle: string;
  avatar: string;
  backCount?: number;
  backHref: string;
  onVideo?: () => void;
  onVoice?: () => void;
};

/** WhatsApp chat header (Phase 2 CHROME SPECS): white 96% with a hairline; back chevron + count in
 * iOS blue; 36 pt avatar; name 17 semibold; subtitle 12; video + phone glyphs. */
export function WhatsAppNav({ name, subtitle, avatar, backCount, backHref }: WhatsAppNavProps) {
  const router = useRouter();
  return (
    <div
      style={{
        height: STATUS.height + WA.navHeight,
        paddingTop: STATUS.height,
        background: "var(--wa-nav-material)",
        backdropFilter: "var(--material-light-filter)",
        WebkitBackdropFilter: "var(--material-light-filter)",
        boxShadow: "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: WA.navHeight, paddingInline: "var(--space-8)" }}>
        <Pressable
          nav={backHref}
          onPress={() => router.push(backHref)}
          label="Back"
          style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", color: "var(--ios-blue)", height: WA.navHeight, paddingRight: "var(--space-8)" }}
        >
          <ChevronBack width={WA.backChevron.width} height={WA.backChevron.height} />
          {backCount ? <span style={{ fontSize: WA.nameSize, letterSpacing: "var(--type-body-tracking)" }}>{backCount}</span> : null}
        </Pressable>
        <Placeholder id="whatsapp:contact-info" press="darken">
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt="" width={WA.avatar} height={WA.avatar} style={{ borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: WA.nameSize,
                  fontWeight: 600,
                  letterSpacing: "var(--type-headline-tracking)",
                  lineHeight: "var(--type-headline-line-height)",
                  color: "var(--ios-label)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: WA.subtitleSize, lineHeight: "var(--type-caption-1-line-height)", color: "var(--wa-meta)" }}>{subtitle}</div>
            </div>
          </div>
        </Placeholder>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-20)", color: "var(--ios-blue)", paddingRight: "var(--space-8)" }}>
          <Placeholder id="whatsapp:call-start">
            <button type="button" aria-label="Video call" style={iconButton}>
              <VideoGlyph size={WA.composer.glyph} />
            </button>
          </Placeholder>
          <Placeholder id="whatsapp:call-start">
            <button type="button" aria-label="Voice call" style={iconButton}>
              <PhoneGlyph size={WA.composer.glyph - 2} />
            </button>
          </Placeholder>
        </div>
      </div>
    </div>
  );
}

const iconButton = {
  appearance: "none",
  border: 0,
  padding: 0,
  margin: 0,
  background: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
