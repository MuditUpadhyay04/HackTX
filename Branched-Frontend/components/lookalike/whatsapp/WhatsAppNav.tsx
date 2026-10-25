"use client";

import { useRouter } from "next/navigation";
import { STATUS } from "@/components/lookalike/metrics";
import { Pressable } from "@/components/lookalike/shared/Pressable";
import { Placeholder } from "@/components/Placeholder";
import { WAA } from "./android";
import { ArrowBack, MoreVert, PhoneGlyph, VideoGlyph } from "./glyphs";

export type WhatsAppNavProps = {
  name: string;
  subtitle: string;
  avatar: string;
  /** unread chats elsewhere, shown beside the back arrow */
  backCount?: number;
  backHref: string;
  /** in-phone navigation (the app's stack); falls back to the scene route */
  onBack?: () => void;
  hideBack?: boolean;
  onVideo?: () => void;
  onVoice?: () => void;
};

/** WhatsApp for Android chat top app bar: white surface; back arrow (+ unread count); 38 dp
 * avatar; name 18 medium and "online" 13; video call, voice call and the overflow menu. */
export function WhatsAppNav({ name, subtitle, avatar, backCount, backHref, onBack, hideBack, onVideo, onVoice }: WhatsAppNavProps) {
  const router = useRouter();
  const t = WAA.thread;
  return (
    <div
      style={{
        height: STATUS.height + WAA.threadBar,
        paddingTop: STATUS.height,
        background: "var(--wa-android-surface)",
        color: "var(--wa-android-icon)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: WAA.threadBar, paddingInline: 4 }}>
        {hideBack ? (
          <span style={{ width: 12 }} />
        ) : (
          <Pressable
            nav={backHref}
            onPress={() => (onBack ? onBack() : router.push(backHref))}
            label="Back"
            style={{ display: "flex", alignItems: "center", gap: 2, height: WAA.iconButton, minWidth: WAA.iconButton, paddingInline: 8, borderRadius: 20 }}
          >
            <ArrowBack size={WAA.icon} />
            {backCount ? <span style={{ fontSize: 15, fontWeight: 500, color: "var(--wa-android-on-surface)" }}>{backCount}</span> : null}
          </Pressable>
        )}
        <Placeholder id="whatsapp:contact-info" press="darken">
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt="" width={t.avatar} height={t.avatar} style={{ borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: t.nameSize,
                  fontWeight: 500,
                  lineHeight: "23px",
                  color: "var(--wa-android-on-surface)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </div>
              {subtitle ? <div style={{ fontSize: t.subtitleSize, lineHeight: "17px", color: "var(--wa-android-on-surface-variant)" }}>{subtitle}</div> : null}
            </div>
          </div>
        </Placeholder>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Placeholder id="whatsapp:call-start">
            <button type="button" aria-label="Video call" style={iconButton} onClick={onVideo ? (e) => (e.preventDefault(), onVideo()) : undefined}>
              <VideoGlyph size={WAA.icon} />
            </button>
          </Placeholder>
          <Placeholder id="whatsapp:call-start">
            <button type="button" aria-label="Voice call" style={iconButton} onClick={onVoice ? (e) => (e.preventDefault(), onVoice()) : undefined}>
              <PhoneGlyph size={WAA.icon - 1} />
            </button>
          </Placeholder>
          <Placeholder id="whatsapp:menu">
            <button type="button" aria-label="More options" style={iconButton}>
              <MoreVert size={WAA.icon} />
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
  width: WAA.iconButton + 4,
  height: WAA.iconButton + 4,
  borderRadius: "50%",
  background: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
