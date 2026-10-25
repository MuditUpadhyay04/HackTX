"use client";

/**
 * Messages look-alike (Google Messages, Material 3, RCS chats) that opens on the phone: the
 * conversation list and Sarah's thread. A working mock on the shared store (lib/store/messaging):
 * type with the keyboard, send, "Delivered" -> "Read · 9:41 PM", then her typing dots
 * (RECEIPT_TIMING). Folded: one column with push/pop. Unfolded: list pane + conversation pane.
 * Copy: lib/mock/threads.ts (SARAH_SEED). Colors: app/theme-messages.css (--gm-*).
 */
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, type CSSProperties, type ReactNode } from "react";
import { SAFE_BOTTOM, STATUS } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { ThreadFrame } from "@/components/lookalike/shared/ThreadFrame";
import { Placeholder } from "@/components/Placeholder";
import { Caret, CaretKeyframes } from "@/components/system/Caret";
import { Keyboard } from "@/components/system/Keyboard";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useMockClock } from "@/lib/mock/clock";
import { minutesBetween, msgStampParts, waListTime } from "@/lib/mock/format";
import { person } from "@/lib/mock/people";
import { COMPOSER_PLACEHOLDER, type Message } from "@/lib/mock/threads";
import { springSend, usePrefersReducedMotion } from "@/lib/motion";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { AppFrame, Avatar, Scroll, Split, StackView, TOP, Tap, ellipsis, useStack } from "../kit";

type Route = { kind: "list" } | { kind: "thread"; id: ThreadId };

/** Conversations in the list (newest first): Sarah, then the unread background chats. */
const CONVERSATIONS: ThreadId[] = ["sarah", "ethan", "lena", "dad", "clinic"];

/** A centered date line appears when more than an hour passes between messages. */
const STAMP_GAP_MIN = 60;

/** Google Messages metrics (dp). */
const GM = {
  navHeight: 64,
  navAvatar: 36,
  rowHeight: 72,
  rowAvatar: 48,
  search: 56,
  bubbleText: 16,
  bubbleLine: 22,
  radius: 20,
  joint: 4,
  padX: 14,
  padY: 9,
  bubbleMax: 0.74,
  inAvatar: 32,
  sideInset: 12,
  runGap: 2,
  groupGap: 10,
  composer: { height: 64, plus: 40, field: 44, action: 44, gap: 8, padX: 8 },
} as const;

/** Material Symbols (outlined) paths, 24-unit grid. */
const ICON = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  video: "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM15 16H5V8h10v8z",
  more: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  search:
    "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  emoji:
    "M15.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm3.49-9C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88a5.5 5.5 0 0 0 10.24 0h-1.67c-.7 1.19-1.97 2-3.45 2z",
  gallery:
    "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86-3 3.87L9 13.14 6 17h12l-3.86-5.14z",
  mic: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z",
  send: "M3.4 20.4 20.85 12.92a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z",
} as const;

function Icon({ d, size = 24, style }: { d: string; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0, ...style }}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** A round 48dp icon button (Material standard icon button touch target). */
const iconButton: CSSProperties = { width: 48, height: 48, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gm-on-variant)", cursor: "pointer" };

/** "Today · 9:41 PM", "Sunday · 12:47 AM", "Sat, Oct 10 · 12:31 PM". */
function chipText(at: Parameters<typeof msgStampParts>[0], now: Parameters<typeof msgStampParts>[1]): string {
  const p = msgStampParts(at, now);
  return `${p.day} · ${p.time.replace(/^at /, "")}`;
}

export function MessagesApp({ display }: AppScreenProps) {
  // shared with the other display's copy, so a fold/unfold keeps the open conversation
  const stack = useStack<Route>("messages", { kind: "list" });
  const thread = stack.routes.find((r): r is Extract<Route, { kind: "thread" }> => r.kind === "thread");
  const selected = thread?.id ?? null;
  // the split view always shows a conversation; record it so folding lands in that chat
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
      <AppFrame display={display} background="var(--gm-bg)">
        <Split
          divider="var(--gm-surface-high)"
          list={<ConversationList onOpen={open} selected={selected} />}
          detail={selected ? <Thread key={selected} id={selected} /> : <div />}
        />
      </AppFrame>
    );
  }
  return (
    <AppFrame display={display} background="var(--gm-bg)">
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
  const me = person("riley");
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--gm-bg)" }}>
      <Scroll top={TOP} bottom={GM.search + SAFE_BOTTOM + 40}>
        <div style={{ padding: "8px 16px 8px" }}>
          <Placeholder id="messages:search" press="darken">
            <div
              style={{
                height: GM.search,
                borderRadius: GM.search / 2,
                background: "var(--gm-surface-high)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingLeft: 16,
                paddingRight: 12,
                color: "var(--gm-on-variant)",
                cursor: "pointer",
              }}
            >
              <Icon d={ICON.search} />
              <span style={{ ...ellipsis, flex: 1, fontSize: 16, letterSpacing: 0.5 }}>Search conversations</span>
              <Avatar src={me.avatar} size={32} />
            </div>
          </Placeholder>
        </div>
        <div style={{ height: 4 }} />
        {CONVERSATIONS.map((id) => (
          <ConversationRow key={id} id={id} onOpen={onOpen} selected={selected === id} />
        ))}
      </Scroll>
      <Placeholder id="messages:start-chat">
        <div
          style={{
            position: "absolute",
            right: 16,
            bottom: SAFE_BOTTOM + 16,
            height: 56,
            borderRadius: 16,
            background: "var(--gm-primary-container)",
            color: "var(--gm-on-primary-container)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingLeft: 16,
            paddingRight: 20,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0.1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.15), 0 4px 8px 3px rgba(0,0,0,0.08)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <Icon d={ICON.chat} />
          Start chat
        </div>
      </Placeholder>
    </div>
  );
}

function ConversationRow({ id, onOpen, selected }: { id: ThreadId; onOpen: (id: ThreadId) => void; selected: boolean }) {
  const t = useMessaging((s) => s.threads[id]);
  const { now } = useMockClock();
  const c = person(t.contactId);
  const last = t.messages[t.messages.length - 1];
  const unread = t.unread > 0;
  const snippet = last ? `${last.from === "me" ? "You: " : ""}${last.text ?? ""}` : "";
  return (
    <div style={{ paddingInline: selected ? 8 : 0 }}>
      <Tap
        onPress={() => onOpen(id)}
        onLongPress={() => useMessaging.getState().toggleUnread(id)}
        highlight="var(--gm-pressed)"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: GM.rowHeight,
          gap: 16,
          paddingLeft: selected ? 8 : 16,
          paddingRight: selected ? 16 : 24,
          borderRadius: selected ? 28 : 0,
          background: selected ? "var(--gm-selected)" : undefined,
          textAlign: "left",
        }}
      >
        <Avatar src={c.avatar} size={GM.rowAvatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ ...ellipsis, flex: 1, fontSize: 16, lineHeight: "24px", fontWeight: unread ? 700 : 400, color: "var(--gm-on-surface)", letterSpacing: 0.15 }}>{c.name}</span>
            <span style={{ fontSize: 12, fontWeight: unread ? 700 : 400, color: unread ? "var(--gm-on-surface)" : "var(--gm-on-variant)", flexShrink: 0 }}>
              {last ? waListTime(last.at, now) : ""}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                ...ellipsis,
                flex: 1,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: 0.25,
                fontWeight: unread ? 700 : 400,
                color: unread ? "var(--gm-on-surface)" : "var(--gm-on-variant)",
              }}
            >
              {snippet}
            </span>
            {unread ? (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  paddingInline: 6,
                  background: "var(--gm-primary)",
                  color: "var(--gm-on-primary)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.unread}
              </span>
            ) : null}
          </div>
        </div>
      </Tap>
    </div>
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
  const bubbleMax = Math.min(pane.width, 560) * GM.bubbleMax;

  const rows: ReactNode[] = [];
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    const stamp = !prev || minutesBetween(prev.at, m.at) > STAMP_GAP_MIN;
    const nextStamp = !next || minutesBetween(m.at, next.at) > STAMP_GAP_MIN;
    const first = stamp || prev?.from !== m.from;
    const last = nextStamp || next?.from !== m.from;
    if (stamp) {
      rows.push(
        <div key={`s-${m.id}`} style={{ display: "flex", justifyContent: "center", marginTop: i === 0 ? 12 : 20, marginBottom: 8 }}>
          <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 500, letterSpacing: 0.4, color: "var(--gm-on-variant)" }}>{chipText(m.at, now)}</span>
        </div>,
      );
    }
    rows.push(
      <motion.div
        key={m.id}
        initial={fresh[m.id] && !reduced ? { y: 40, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={springSend}
        style={{ marginTop: first && !stamp ? GM.groupGap : GM.runGap }}
      >
        <BubbleRow m={m} first={first} last={last} max={bubbleMax} avatar={c.avatar} />
      </motion.div>,
    );
    if (lastMine && m.id === lastMine.id && m.receipt && (m.receipt === "delivered" || m.receipt === "read")) {
      rows.push(
        <div
          key="receipt"
          data-receipt={m.receipt}
          style={{ textAlign: "right", paddingRight: GM.sideInset + 4, marginTop: 4, fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: "var(--gm-on-variant)" }}
        >
          {m.receipt === "read" ? `Read · ${msgStampParts(m.at, now).time.replace(/^at /, "")}` : "Delivered"}
        </div>,
      );
    }
  });

  return (
    <>
      <CaretKeyframes />
      <ThreadFrame
        nav={<ThreadNav name={c.name} avatar={c.avatar} onBack={onBack} />}
        navHeight={STATUS.height + GM.navHeight}
        background="var(--gm-bg)"
        composer={<Composer draft={t.draft} focused={t.keyboard} onFocus={() => focus(id)} onSend={() => send(id)} />}
        composerHeight={GM.composer.height}
        composerBackground="var(--gm-bg)"
        keyboardOpen={t.keyboard}
        keyboard={<Keyboard threadId={id} platform="messages" />}
        stickKey={`${msgs.length}-${t.theirTyping}`}
        onDismissKeyboard={() => blur(id)}
      >
        <div style={{ paddingBottom: 12 }}>
          {rows.map((r, i) => (
            <Fragment key={i}>{r}</Fragment>
          ))}
          <AnimatePresence>{t.theirTyping ? <TypingBubble key="typing" avatar={c.avatar} /> : null}</AnimatePresence>
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
        height: STATUS.height + GM.navHeight,
        paddingTop: STATUS.height,
        background: "var(--gm-bg)",
        display: "flex",
        alignItems: "center",
        paddingLeft: onBack ? 4 : 16,
        paddingRight: 4,
      }}
    >
      {onBack ? (
        <Tap label="Back" onPress={onBack} style={{ ...iconButton, position: "relative", color: "var(--gm-on-surface)" }}>
          <Icon d={ICON.back} />
          {others ? (
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 4,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                paddingInline: 4,
                background: "var(--gm-primary)",
                color: "var(--gm-on-primary)",
                fontSize: 11,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {others}
            </span>
          ) : null}
        </Tap>
      ) : null}
      <Placeholder id="messages:contact-details" press="darken">
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, marginLeft: onBack ? 4 : 0, cursor: "pointer" }}>
          <Avatar src={avatar} size={GM.navAvatar} />
          <span style={{ ...ellipsis, fontSize: 20, lineHeight: "28px", color: "var(--gm-on-surface)" }}>{name}</span>
        </div>
      </Placeholder>
      <Placeholder id="messages:video-call">
        <span role="button" aria-label="Video call" style={iconButton}>
          <Icon d={ICON.video} />
        </span>
      </Placeholder>
      <Placeholder id="messages:more">
        <span role="button" aria-label="More options" style={iconButton}>
          <Icon d={ICON.more} />
        </span>
      </Placeholder>
    </div>
  );
}

/** One bubble: pale blue-gray in, blue out, 20dp corners, tight joints on the sender side within a run. */
function BubbleRow({ m, first, last, max, avatar }: { m: Message; first: boolean; last: boolean; max: number; avatar: string }) {
  const mine = m.from === "me";
  const R = GM.radius;
  const top = first ? R : GM.joint;
  const bottom = last ? R : GM.joint;
  const borderRadius = mine ? `${R}px ${top}px ${bottom}px ${R}px` : `${top}px ${R}px ${R}px ${bottom}px`;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: mine ? "flex-end" : "flex-start", paddingInline: GM.sideInset, gap: 8 }}>
      {mine ? null : <span style={{ width: GM.inAvatar, flexShrink: 0 }}>{last ? <Avatar src={avatar} size={GM.inAvatar} /> : null}</span>}
      <div
        style={{
          maxWidth: max,
          padding: `${GM.padY}px ${GM.padX}px`,
          borderRadius,
          background: mine ? "var(--gm-bubble-out)" : "var(--gm-bubble-in)",
          color: mine ? "var(--gm-on-primary)" : "var(--gm-on-surface)",
          fontSize: GM.bubbleText,
          lineHeight: `${GM.bubbleLine}px`,
          letterSpacing: 0.1,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {m.text}
      </div>
    </div>
  );
}

/** Her typing indicator: three bouncing dots in an incoming bubble. */
function TypingBubble({ avatar }: { avatar: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", alignItems: "flex-end", gap: 8, paddingInline: GM.sideInset, marginTop: GM.groupGap }}
    >
      <Avatar src={avatar} size={GM.inAvatar} />
      <div style={{ height: 40, paddingInline: 16, borderRadius: GM.radius, background: "var(--gm-bubble-in)", display: "flex", alignItems: "center", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={reduced ? { opacity: [0.4, 1, 0.4] } : { y: [0, -5, 0, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut", times: reduced ? undefined : [0, 0.25, 0.5, 1] }}
            style={{ width: 8, height: 8, borderRadius: 4, background: "var(--gm-on-variant)", opacity: 0.7 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/** Composer: "+" circle, the pill field ("RCS message", emoji, gallery), a round mic that becomes send. */
function Composer({ draft, focused, onFocus, onSend }: { draft: string; focused: boolean; onFocus: () => void; onSend: () => void }) {
  const c = GM.composer;
  const has = draft.length > 0;
  return (
    <div style={{ height: c.height, display: "flex", alignItems: "center", gap: c.gap, paddingInline: c.padX, background: "var(--gm-bg)" }}>
      <Placeholder id="messages:attach">
        <span
          role="button"
          aria-label="Attach"
          style={{ width: c.plus, height: c.plus, borderRadius: c.plus / 2, background: "var(--gm-surface-high)", color: "var(--gm-on-variant)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
        >
          <Icon d={ICON.add} />
        </span>
      </Placeholder>
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
          height: c.field,
          borderRadius: c.field / 2,
          background: "var(--gm-surface-high)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 4,
          fontSize: 16,
          letterSpacing: 0.15,
          cursor: "text",
          outline: "none",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, ...ellipsis, color: has ? "var(--gm-on-surface)" : "var(--gm-on-variant)" }}>
          {has ? draft : focused ? null : COMPOSER_PLACEHOLDER.messages}
          {focused ? <Caret tint="var(--gm-primary)" /> : null}
          {!has && focused ? <span style={{ color: "var(--gm-on-variant)" }}>{COMPOSER_PLACEHOLDER.messages}</span> : null}
        </span>
        <Placeholder id="messages:emoji">
          <span role="button" aria-label="Emoji" style={{ ...iconButton, width: 36, height: 36 }}>
            <Icon d={ICON.emoji} />
          </span>
        </Placeholder>
        {has ? null : (
          <Placeholder id="messages:gallery">
            <span role="button" aria-label="Gallery" style={{ ...iconButton, width: 36, height: 36 }}>
              <Icon d={ICON.gallery} />
            </span>
          </Placeholder>
        )}
      </div>
      {has ? (
        <Tap
          label="Send"
          onPress={() => onSend()}
          style={{ width: c.action, height: c.action, borderRadius: c.action / 2, background: "var(--gm-primary)", color: "var(--gm-on-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <Icon d={ICON.send} size={22} style={{ marginLeft: 2 }} />
        </Tap>
      ) : (
        <Placeholder id="messages:voice">
          <span
            role="button"
            aria-label="Voice message"
            style={{ width: c.action, height: c.action, borderRadius: c.action / 2, background: "var(--gm-primary-container)", color: "var(--gm-on-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
          >
            <Icon d={ICON.mic} />
          </span>
        </Placeholder>
      )}
    </div>
  );
}
