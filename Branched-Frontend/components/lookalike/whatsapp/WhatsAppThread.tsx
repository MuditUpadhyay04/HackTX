"use client";

import { motion } from "framer-motion";
import { Fragment, useState, type ReactNode } from "react";
import { STATUS, WA } from "@/components/lookalike/metrics";
import { ThreadFrame } from "@/components/lookalike/shared/ThreadFrame";
import { Keyboard } from "@/components/ios/Keyboard";
import { CaretKeyframes } from "@/components/ios/Caret";
import { useMockClock } from "@/lib/mock/clock";
import { daysAgo, waDatePill, waTime } from "@/lib/mock/format";
import { person } from "@/lib/mock/people";
import { BACK_COUNT, MISSED_CALL_SUB, PRESENCE_LABEL, SEEN_LABEL, type Message } from "@/lib/mock/threads";
import { springSend, usePrefersReducedMotion } from "@/lib/motion";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { Bubble } from "./Bubble";
import { CallActionSheet } from "./CallActionSheet";
import { Composer } from "./Composer";
import { DatePill } from "./DatePill";
import { DoodleWallpaper } from "./DoodleWallpaper";
import { MissedCallRow } from "./MissedCallRow";
import { WhatsAppNav } from "./WhatsAppNav";

export type WhatsAppThreadProps = {
  threadId?: ThreadId;
  /** the story's "Seen" under her last bubble (default on; &seen=off) */
  seen?: boolean;
  initialScroll?: "bottom" | "top";
};

const PHOTOS: Record<string, string> = { dal: "/mock/dal.svg" };

/**
 * The WhatsApp chat look-alike (Phase 2 STATE 1, Mom): doodle wallpaper, date pills, bubbles with
 * tails and ticks, missed-call rows, the composer and the keyboard. A working mock: focus the field,
 * type (drawn keys or the physical keyboard), send; ticks go gray -> double -> blue.
 */
export function WhatsAppThread({ threadId = "mom", seen = true, initialScroll = "bottom" }: WhatsAppThreadProps) {
  const thread = useMessaging((s) => s.threads[threadId]);
  const fresh = useMessaging((s) => s.fresh);
  const { focus, blur, send } = useMessaging.getState();
  const { now } = useMockClock();
  const reduced = usePrefersReducedMotion();
  const [sheet, setSheet] = useState(false);
  const contact = person(thread.contactId);
  const msgs = thread.messages;
  const last = msgs[msgs.length - 1];

  const rows: ReactNode[] = [];
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1];
    const newDay = !prev || daysAgo(prev.at, m.at) !== 0;
    if (m.kind === "encryption") {
      rows.push(
        <DatePill key={m.id} system>
          {m.text}
        </DatePill>,
      );
      return;
    }
    if (newDay || prev?.kind === "encryption") {
      rows.push(<DatePill key={`d-${m.id}`}>{waDatePill(m.at, now)}</DatePill>);
    }
    const runStart = newDay || !prev || prev.from !== m.from || prev.kind === "encryption";
    const gap = runStart ? WA.groupGap - WA.runGap : 0;
    const mine = m.from === "me";
    rows.push(
      <motion.div
        key={m.id}
        initial={fresh[m.id] && !reduced ? { y: WA.composer.height, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={springSend}
        style={{ marginTop: (newDay ? 0 : gap) + WA.runGap }}
      >
        <MessageRow m={m} mine={mine} tail={runStart} onMissed={() => setSheet(true)} />
      </motion.div>,
    );
  });
  if (seen && last && last.from === "them") {
    rows.push(
      <div
        key="seen"
        data-seen=""
        style={{
          paddingInline: WA.bubbleSideInset,
          marginTop: WA.seenGap,
          fontSize: WA.seenSize,
          lineHeight: "var(--type-caption-1-line-height)",
          color: "var(--wa-tick-sent)",
        }}
      >
        {SEEN_LABEL}
      </div>,
    );
  }

  return (
    <>
      <CaretKeyframes />
      <ThreadFrame
        nav={
          <WhatsAppNav
            name={contact.name}
            subtitle={thread.presence === "online" ? PRESENCE_LABEL.whatsapp : ""}
            avatar={contact.avatar}
            backCount={BACK_COUNT[threadId]}
            backHref="/scene/threads/whatsapp-chats"
          />
        }
        navHeight={STATUS.height + WA.navHeight}
        backdrop={<DoodleWallpaper />}
        background="var(--wa-wallpaper)"
        composer={
          <Composer draft={thread.draft} focused={thread.keyboard} onFocus={() => focus(threadId)} onSend={() => send(threadId)} />
        }
        composerHeight={WA.composer.height}
        composerBackground="var(--wa-nav)"
        keyboardOpen={thread.keyboard}
        keyboard={<Keyboard threadId={threadId} platform="whatsapp" />}
        initialScroll={initialScroll}
        stickKey={msgs.length}
        onDismissKeyboard={() => blur(threadId)}
      >
        <div style={{ paddingBottom: "var(--space-8)" }}>
          {rows.map((r, i) => (
            <Fragment key={i}>{r}</Fragment>
          ))}
        </div>
      </ThreadFrame>
      <CallActionSheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}

function MessageRow({ m, mine, tail, onMissed }: { m: Message; mine: boolean; tail: boolean; onMissed: () => void }) {
  if (m.kind === "missed-call") {
    return <MissedCallRow label={m.callLabel ?? ""} sub={MISSED_CALL_SUB} time={waTime(m.at)} tail={tail} onPress={onMissed} />;
  }
  if (m.kind === "photo" && m.imageId) {
    return (
      <Bubble mine={mine} tail={tail} time={waTime(m.at)} receipt={m.receipt} media width={WA.photo.width}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTOS[m.imageId] ?? `/mock/${m.imageId}.svg`}
          alt=""
          width={WA.photo.width - 2 * WA.photo.inset}
          height={WA.photo.height}
          style={{ display: "block", borderRadius: WA.photo.radius, objectFit: "cover" }}
        />
      </Bubble>
    );
  }
  return (
    <Bubble mine={mine} tail={tail} time={waTime(m.at)} receipt={m.receipt}>
      {m.text}
    </Bubble>
  );
}
