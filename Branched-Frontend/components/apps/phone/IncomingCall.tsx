"use client";

/**
 * components/apps/phone/IncomingCall.tsx: the One UI incoming-call screen (full screen while the
 * phone is in use): caller name, "Incoming call", their photo, and the green answer / red decline
 * buttons. Answering hands over to CallScreen (PhoneApp acceptIncoming).
 */
import { motion } from "framer-motion";
import { SAFE_BOTTOM } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { people, type PersonId } from "@/lib/mock/people";
import { Avatar, TOP, resetButton } from "../kit";
import { EndCallGlyph } from "./glyphs";

export type IncomingRoute = {
  kind: "incoming";
  who: PersonId;
  number: string;
  /** seconds already on the timer when answered (the film's 35:40) */
  elapsed?: number;
};

const PhoneUp = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
    <path
      fill="currentColor"
      d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"
    />
  </svg>
);

export function IncomingCall({ call, onAccept, onDecline }: { call: IncomingRoute; onAccept: () => void; onDecline: () => void }) {
  const { width, display } = usePane();
  const p = people[call.who];
  const button = (color: string) => ({
    ...resetButton,
    width: 72,
    height: 72,
    borderRadius: 36,
    background: color,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  return (
    <motion.div
      data-incoming-call=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "linear-gradient(180deg, #1d2a3a 0%, #0e141c 100%)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: TOP + 64, left: 0, width, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}>Incoming call</div>
        <div style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.2 }}>{p.name}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}>Mobile {call.number}</div>
        <div style={{ marginTop: 40 }}>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
            <Avatar src={p.avatar} size={display === "inner" ? 150 : 120} />
          </motion.div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: SAFE_BOTTOM + 56,
          left: 0,
          width,
          display: "flex",
          justifyContent: "center",
          gap: display === "inner" ? 220 : 120,
        }}
      >
        <button type="button" aria-label="Decline" data-action="call-decline" onClick={onDecline} style={button("#e5483d")}>
          <EndCallGlyph size={30} />
        </button>
        <motion.button
          type="button"
          aria-label="Answer"
          data-action="call-answer"
          onClick={onAccept}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={button("#2fb456")}
        >
          <PhoneUp />
        </motion.button>
      </div>
    </motion.div>
  );
}
