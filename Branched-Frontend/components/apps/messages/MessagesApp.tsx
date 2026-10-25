"use client";

/**
 * Messages (iMessage, iOS 18) look-alike that opens on the phone: the conversation list and Sarah's
 * thread. A working mock on the shared store (lib/store/messaging): type with the iOS keyboard, send,
 * "Delivered" -> "Read 9:41 PM", then her typing dots (RECEIPT_TIMING). Folded: one column with
 * push/pop. Unfolded: the iPad-style split. Copy: lib/mock/threads.ts (SARAH_SEED).
 */
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, type ReactNode } from "react";
import { IMSG, STATUS } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { ThreadFrame } from "@/components/lookalike/shared/ThreadFrame";
import { Caret, CaretKeyframes } from "@/components/ios/Caret";
import { Keyboard } from "@/components/ios/Keyboard";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useMockClock } from "@/lib/mock/clock";
import { imsgStampParts, minutesBetween, waListTime } from "@/lib/mock/format";
import { person } from "@/lib/mock/people";
import { COMPOSER_PLACEHOLDER, type Message } from "@/lib/mock/threads";
import { springSend, usePrefersReducedMotion } from "@/lib/motion";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { AppFrame, Avatar, Scroll, Split, StackView, TOP, Tap, ellipsis, useStack } from "../kit";

type Route = { kind: "list" } | { kind: "thread"; id: ThreadId };

/** Conversations in the list (newest first): Sarah, then the unread background chats. */
const CONVERSATIONS: ThreadId[] = ["sarah", "ethan", "lena", "dad", "clinic"];

/** iMessage shows a centered time stamp when more than an hour passes between messages. */
const STAMP_GAP_MIN = 60;

export function MessagesApp({ display }: AppScreenProps) {
  // shared with the other display's copy, so a fold/unfold keeps the open conversation
  const stack = useStack<Route>("messages", { kind: "list" });
  const thread = stack.routes.find((r): r is Extract<Route, { kind: "thread" }> => r.kind === "thread");
  const selected = thread?.id ?? null;
  // the split view always shows a conversation; record it so folding lands in that chat (iOS shows
  // the selected detail when a split view collapses)
  const { reset } = stack;
  useEffect(() => {
    if (display === "inner" && !selected) reset([{ kind: "list" }, { kind: "thread", id: CONVERSATIONS[0] }]);
  }, [display, selected, reset]);
  useEffect(() => {
    if (selected) useMessaging.getState().markRead(selected);
  }, [selected]);

  const open = (id: ThreadId) => {
    useMessaging.getState().markRead(id);
    if (display === "inner") stack.reset([{ kind: "list" }, { kind: "thread", id }]);
    else stack.push({ kind: "thread", id });
  };

  if (display === "inner") {
    return (
      <AppFrame display={display} background="var(--ios-bg)">
        <Split list={<ConversationList onOpen={open} selected={selected} />} detail={selected ? <Thread key={selected} id={selected} /> : <div />} />
      </AppFrame>
    );
  }
  return (
    <AppFrame display={display} background="var(--ios-bg)">
      <StackView
        stack={stack}
        keyOf={(r, i) => `${r.kind}-${i}`}
        render={(r) => (r.kind === "list" ? <ConversationList onOpen={open} selected={null} /> : <Thread id={r.id} onBack={stack.pop} />)}
      />
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Conversation list
// ---------------------------------------------------------------------------

function ConversationList({ onOpen, selected }: { onOpen: (id: ThreadId) => void; selected: ThreadId | null }) {
  return (
    <Scroll top={TOP} bottom={30} style={{ background: "var(--ios-bg)" }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 16, color: "var(--imsg-blue)" }}>
        <Tap style={{ fontSize: 17 }}>Edit</Tap>
        <Tap label="Compose" style={{ display: "flex" }}>
          <ComposeGlyph />
        </Tap>
      </div>
      <div style={{ paddingInline: 16, fontSize: 34, fontWeight: 700, letterSpacing: 0.37, lineHeight: "41px" }}>Messages</div>
      <div style={{ paddingInline: 16, marginTop: 8, marginBottom: 8 }}>
        <div style={{ height: 36, borderRadius: 10, background: "var(--ios-fill-tertiary)", display: "flex", alignItems: "center", gap: 6, paddingInline: 8, color: "var(--ios-gray)", fontSize: 17 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span style={{ flex: 1 }}>Search</span>
          <svg width={14} height={18} viewBox="0 0 14 20" aria-hidden="true">
            <rect x="3.5" y="0.8" width="7" height="12" rx="3.5" fill="currentColor" />
            <path d="M1 9.5a6 6 0 0 0 12 0M7 15.5v3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {CONVERSATIONS.map((id) => (
        <ConversationRow key={id} id={id} onOpen={onOpen} selected={selected === id} />
      ))}
    </Scroll>
  );
}

function ConversationRow({ id, onOpen, selected }: { id: ThreadId; onOpen: (id: ThreadId) => void; selected: boolean }) {
  const t = useMessaging((s) => s.threads[id]);
  const { now } = useMockClock();
  const c = person(t.contactId);
  const last = t.messages[t.messages.length - 1];
  const unread = t.unread > 0;
  return (
    <Tap
      onPress={() => onOpen(id)} onLongPress={() => useMessaging.getState().toggleUnread(id)}
      highlight="var(--ios-gray5)"
      style={{ display: "flex", alignItems: "flex-start", width: "100%", height: 76, paddingTop: 10, background: selected ? "var(--imsg-blue)" : undefined, color: selected ? "var(--on-accent)" : undefined }}
    >
      <span style={{ width: 22, display: "flex", justifyContent: "center", paddingTop: 18, flexShrink: 0 }}>
        {unread ? <span style={{ width: 10, height: 10, borderRadius: 5, background: selected ? "var(--on-accent)" : "var(--imsg-blue)" }} /> : null}
      </span>
      <Avatar src={c.avatar} size={44} style={{ marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0, height: 66, marginLeft: 12, paddingRight: 16, boxShadow: selected ? undefined : "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ ...ellipsis, flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: -0.4 }}>{c.name}</span>
          <span style={{ fontSize: 15, color: selected ? "var(--on-accent-2)" : "var(--imsg-meta)" }}>{last ? waListTime(last.at, now) : ""}</span>
          <svg width={8} height={13} viewBox="0 0 8 14" aria-hidden="true" style={{ alignSelf: "center" }}>
            <path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke={selected ? "var(--on-accent-2)" : "var(--ios-gray4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 15,
            lineHeight: "20px",
            color: selected ? "var(--on-accent-2)" : "var(--imsg-meta)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginTop: 1,
          }}
        >
          {last?.text}
        </div>
      </div>
    </Tap>
  );
}

function ComposeGlyph() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.6 3.4a1.7 1.7 0 0 1 2.4 2.4L12.4 14.4 9 15l.6-3.4 9-8.2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Thread
// ---------------------------------------------------------------------------

/** Sarah's thread on its own (the /scene/threads/sarah frames). */
export function MessagesThread(props: { id: ThreadId; onBack?: () => void }) {
  return <Thread {...props} />;
}

function Thread({ id, onBack }: { id: ThreadId; onBack?: () => void }) {
  const t = useMessaging((s) => s.threads[id]);
  const fresh = useMessaging((s) => s.fresh);
  const { focus, blur, send } = useMessaging.getState();
  const { now } = useMockClock();
  const reduced = usePrefersReducedMotion();
  const pane = usePane();
  const c = person(t.contactId);
  const msgs = t.messages;
  const lastMine = [...msgs].reverse().find((m) => m.from === "me");
  const bubbleMax = Math.min(pane.width, 560) * IMSG.bubbleMax;

  const rows: ReactNode[] = [];
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    const stamp = !prev || minutesBetween(prev.at, m.at) > STAMP_GAP_MIN;
    const nextStamp = !next || minutesBetween(m.at, next.at) > STAMP_GAP_MIN;
    const runStart = stamp || prev?.from !== m.from;
    const tail = nextStamp || next?.from !== m.from;
    if (stamp) {
      const p = imsgStampParts(m.at, now);
      rows.push(
        <div key={`s-${m.id}`} style={{ textAlign: "center", fontSize: IMSG.stampSize, color: "var(--imsg-meta)", marginTop: i === 0 ? 8 : IMSG.stampGap, marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>{p.day}</span> {p.time}
        </div>,
      );
    }
    rows.push(
      <motion.div
        key={m.id}
        initial={fresh[m.id] && !reduced ? { y: 40, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={springSend}
        style={{ marginTop: runStart && !stamp ? IMSG.groupGap : IMSG.runGap }}
      >
        <BubbleRow m={m} tail={tail} max={bubbleMax} />
      </motion.div>,
    );
    if (lastMine && m.id === lastMine.id && m.receipt && (m.receipt === "delivered" || m.receipt === "read")) {
      rows.push(
        <div key="receipt" data-receipt={m.receipt} style={{ textAlign: "right", paddingRight: IMSG.sideInset + 4, marginTop: 3, fontSize: IMSG.receiptSize, color: "var(--imsg-meta)" }}>
          {m.receipt === "read" ? (
            <>
              <span style={{ fontWeight: 600 }}>Read</span> {imsgStampParts(m.at, now).time}
            </>
          ) : (
            <span style={{ fontWeight: 600 }}>Delivered</span>
          )}
        </div>,
      );
    }
  });

  return (
    <>
      <CaretKeyframes />
      <ThreadFrame
        nav={<ThreadNav name={c.name} avatar={c.avatar} onBack={onBack} />}
        navHeight={STATUS.height + IMSG.navHeight}
        background="var(--ios-bg)"
        composer={<IMessageComposer draft={t.draft} focused={t.keyboard} onFocus={() => focus(id)} onSend={() => send(id)} />}
        composerHeight={IMSG.composer.height}
        composerBackground="var(--ios-bg)"
        keyboardOpen={t.keyboard}
        keyboard={<Keyboard threadId={id} platform="messages" />}
        stickKey={`${msgs.length}-${t.theirTyping}`}
        onDismissKeyboard={() => blur(id)}
      >
        <div style={{ paddingBottom: 10 }}>
          {rows.map((r, i) => (
            <Fragment key={i}>{r}</Fragment>
          ))}
          <AnimatePresence>{t.theirTyping ? <TypingBubble key="typing" /> : null}</AnimatePresence>
        </div>
      </ThreadFrame>
    </>
  );
}

function ThreadNav({ name, avatar, onBack }: { name: string; avatar: string; onBack?: () => void }) {
  const others = useMessaging((s) => Object.values(s.threads).filter((t) => t.app === "messages" && t.unread > 0).length);
  return (
    <div
      style={{
        position: "relative",
        height: STATUS.height + IMSG.navHeight,
        paddingTop: STATUS.height,
        background: "var(--imsg-nav-material)",
        backdropFilter: "var(--material-light-filter)",
        WebkitBackdropFilter: "var(--material-light-filter)",
        boxShadow: "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)",
      }}
    >
      {onBack ? (
        <Tap label="Back" onPress={onBack} style={{ position: "absolute", left: 8, top: STATUS.height + 14, display: "flex", alignItems: "center", gap: 4, color: "var(--imsg-blue)" }}>
          <svg width={12} height={21} viewBox="0 0 12 21" aria-hidden="true">
            <path d="M10 2 2 10.5 10 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {others ? (
            <span style={{ minWidth: IMSG.pill.minWidth, height: IMSG.pill.height, borderRadius: IMSG.pill.height / 2, background: "var(--imsg-blue)", color: "var(--on-accent)", fontSize: IMSG.pill.size, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 6 }}>
              {others}
            </span>
          ) : null}
        </Tap>
      ) : null}
      <Tap style={{ position: "absolute", left: "50%", top: STATUS.height + 6, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Avatar src={avatar} size={IMSG.avatar} />
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: IMSG.nameSize, color: "var(--ios-label)" }}>
          {name}
          <svg width={6} height={10} viewBox="0 0 8 14" aria-hidden="true">
            <path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="var(--imsg-meta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Tap>
      <Tap label="FaceTime" style={{ position: "absolute", right: 16, top: STATUS.height + 18, color: "var(--imsg-blue)", display: "flex" }}>
        <svg width={IMSG.facetime.width} height={IMSG.facetime.height} viewBox="0 0 30 22" aria-hidden="true">
          <rect x="1.5" y="3" width="19" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M21 9.2 27.4 5c.5-.3 1.1 0 1.1.6v10.8c0 .6-.6.9-1.1.6L21 12.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </Tap>
    </div>
  );
}

/** One bubble: gray in, blue out, radius 18, the curled tail on the last bubble of a run. */
function BubbleRow({ m, tail, max }: { m: Message; tail: boolean; max: number }) {
  const mine = m.from === "me";
  const bg = mine ? "var(--imsg-blue)" : "var(--imsg-gray)";
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", paddingInline: IMSG.sideInset }}>
      <div
        style={{
          position: "relative",
          maxWidth: max,
          padding: `${IMSG.bubblePadY}px ${IMSG.bubblePadX}px`,
          borderRadius: IMSG.bubbleRadius,
          background: bg,
          color: mine ? "var(--on-accent)" : "var(--ios-label)",
          fontSize: IMSG.bubbleText,
          lineHeight: `${IMSG.bubbleLine}px`,
          letterSpacing: -0.43,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {m.text}
        {tail ? <Tail mine={mine} color={bg} /> : null}
      </div>
    </div>
  );
}

/** The iMessage tail: a curl at the bottom corner on the sender's side. */
function Tail({ mine, color }: { mine: boolean; color: string }) {
  return (
    <svg
      width={IMSG.tail.width}
      height={IMSG.tail.height}
      viewBox="0 0 17 21"
      aria-hidden="true"
      style={{ position: "absolute", bottom: 0, [mine ? "right" : "left"]: -5, transform: mine ? undefined : "scaleX(-1)" }}
    >
      <path d="M0 0v12c0 4.8 3.4 8 8.4 8.6 3 .4 6.2-.2 8.6-1.6-3.4-.4-6-2.4-7-5.6C9.2 10.2 9 6 9 0H0Z" fill={color} />
    </svg>
  );
}

function TypingBubble() {
  const d = IMSG.typing;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", paddingInline: IMSG.sideInset, marginTop: IMSG.groupGap, transformOrigin: "left bottom" }}
    >
      <div style={{ position: "relative", width: d.width, height: d.height, borderRadius: d.height / 2, background: "var(--imsg-gray)", display: "flex", alignItems: "center", justifyContent: "center", gap: d.gap }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            style={{ width: d.dot, height: d.dot, borderRadius: d.dot / 2, background: "var(--imsg-meta)" }}
          />
        ))}
        <span style={{ position: "absolute", left: -2, bottom: -2, width: 11, height: 11, borderRadius: 6, background: "var(--imsg-gray)" }} />
        <span style={{ position: "absolute", left: -7, bottom: -7, width: 5, height: 5, borderRadius: 3, background: "var(--imsg-gray)" }} />
      </div>
    </motion.div>
  );
}

/** iOS 18 composer: gray "+" circle, the pill field ("iMessage" + mic), a blue up-arrow once there's text. */
function IMessageComposer({ draft, focused, onFocus, onSend }: { draft: string; focused: boolean; onFocus: () => void; onSend: () => void }) {
  const c = IMSG.composer;
  const has = draft.length > 0;
  return (
    <div style={{ height: c.height, display: "flex", alignItems: "center", gap: c.gap, paddingInline: c.padX, background: "var(--ios-bg)" }}>
      <Tap label="Apps" style={{ width: c.plus, height: c.plus, borderRadius: c.plus / 2, background: "var(--ios-gray6)", color: "var(--imsg-meta)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Tap>
      <div
        role="textbox"
        tabIndex={-1}
        data-action="focus-composer"
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: c.field,
          borderRadius: c.field / 2,
          boxShadow: "inset 0 0 0 1px var(--imsg-field-stroke)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          paddingRight: 4,
          fontSize: 17,
          cursor: "text",
          outline: "none",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, ...ellipsis, color: has ? "var(--ios-label)" : "var(--imsg-meta)" }}>
          {has ? draft : focused ? null : COMPOSER_PLACEHOLDER.messages}
          {focused ? <Caret tint="var(--imsg-blue)" /> : null}
          {!has && focused ? <span style={{ color: "var(--imsg-meta)" }}>{COMPOSER_PLACEHOLDER.messages}</span> : null}
        </span>
        {has ? (
          <Tap
            label="Send"
            onPress={() => onSend()}
            style={{ width: c.send, height: c.send, borderRadius: c.send / 2, background: "var(--imsg-blue)", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <svg width={14} height={16} viewBox="0 0 14 16" aria-hidden="true">
              <path d="M7 14V2M2 7l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Tap>
        ) : (
          <span style={{ color: "var(--imsg-meta)", display: "flex", paddingRight: 8 }}>
            <svg width={14} height={20} viewBox="0 0 14 20" aria-hidden="true">
              <rect x="3.5" y="0.8" width="7" height="12" rx="3.5" fill="currentColor" />
              <path d="M1 9.5a6 6 0 0 0 12 0M7 15.5v3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
