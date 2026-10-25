// Home (DESIGN_SPEC 3.1): hero, his words, what's held, who's waiting.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppGlyph } from "../../components/AppRail";
import { LoadingBlock, Rise } from "../../components/motion";
import { Avatar, CardGradient, OutlinePill, PillGradientFill, Press, Row, Sheet, styles as ui, T, TextButton } from "../../components/ui";
import { api, mediaUrl, type Card } from "../../lib/api";
import { CHANNEL_APP, handOff } from "../../lib/handoff";
import { haptics } from "../../lib/haptics";
import { toast } from "../../lib/toast";
import { useHome } from "../../lib/useHome";
import { SPLIT_MAX, useLayout } from "../../lib/useLayout";
import { color, inset, radius, shadow, space } from "../../theme/tokens";

const OPEN_LABEL = { instagram: "Open Instagram", whatsapp: "Open WhatsApp", imessage: "Open Messages", self: "" } as const;

/** "Delivered" shows for a short beat after a letter goes out, then the row goes away (DESIGN_SPEC 3.9). */
const DELIVERED_BEAT_MS = 3 * 60 * 1000;
function justDelivered(card: Card, now?: string) {
  if (card.status !== "released" || !card.released_at || !now) return false;
  const age = Date.parse(now) - Date.parse(card.released_at);
  return Number.isFinite(age) && age >= 0 && age < DELIVERED_BEAT_MS;
}

function holdProgress(card: Card, now?: string) {
  if (!card.created_at || !card.release_at || !now) return 0.35;
  const start = Date.parse(card.created_at);
  const end = Date.parse(card.release_at);
  const at = Date.parse(now);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0.35;
  return Math.max(0.08, Math.min(0.96, (at - start) / (end - start)));
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  // Wide (unfolded, landscape): hero on the left, the lists on the right.
  const split = layout.expanded;
  const paneWidth = split ? Math.min(layout.usableWidth, SPLIT_MAX) / 2 : layout.usableWidth;
  // Spec: 370×288 at 402 pt. Keep that ratio on narrower phones without letting the title crowd the "+";
  // on a short window (a phone on its side) let it shrink so the hero isn't the whole screen.
  const heroHeight = Math.round(Math.max(layout.short ? 200 : 248, Math.min(layout.short ? 240 : 288, (paneWidth - inset.card * 2) * 0.78)));
  const { home, error, refresh } = useHome();
  // One row per person: their saved Compose draft if there is one (opens Compose), else their latest kept line (opens the pile).
  const [drafts, setDrafts] = useState<{ personId: string; text: string; draft: boolean }[] | null>(null);
  const [pulling, setPulling] = useState(false);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!home) return;
    let alive = true;
    Promise.all([api.drafts().catch(() => []), ...home.people.map((p) => api.pieces(p.id).then((list) => ({ personId: p.id, latest: list[list.length - 1] })))])
      .then(([saved, ...rows]) => {
        if (!alive) return;
        const byPerson = new Map((saved as { person_id: string; text: string }[]).map((d) => [d.person_id, d.text]));
        const pieceRows = rows as { personId: string; latest?: { text: string } }[];
        setDrafts(
          pieceRows
            .map((r) => (byPerson.has(r.personId) ? { personId: r.personId, text: byPerson.get(r.personId)!, draft: true } : r.latest ? { personId: r.personId, text: r.latest.text, draft: false } : null))
            .filter((r): r is { personId: string; text: string; draft: boolean } => r !== null),
        );
      })
      .catch(() => {
        if (alive) setDrafts([]);
      });
    return () => {
      alive = false;
    };
  }, [home]);

  const name = (id: string) => home?.people.find((p) => p.id === id)?.name ?? "";
  const held = home?.cards.filter((c) => c.status === "held") ?? [];
  const ready = home?.cards.filter((c) => c.status === "ready") ?? [];
  const delivered = home?.cards.filter((c) => justDelivered(c, home.clock.now)) ?? [];
  const arrived = (home?.nudges ?? []).filter((n) => n.kind === "reply");
  // Newest first, ten at most: his photos and the cast's demo photos (the old SVG placeholders stay out).
  const lane = (home?.photos ?? [])
    .filter((p) => !/\.svg($|\?)/i.test(p.url ?? ""))
    .sort((a, b) => (b.taken_at ?? "").localeCompare(a.taken_at ?? ""))
    .slice(0, 10);
  const loading = !home && !error;

  const cancel = async (card: Card) => {
    try {
      await api.revoke(card.id);
      haptics.success();
      toast("Kept as a draft.");
      refresh();
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const sendReady = async (card: Card) => {
    const person = home?.people.find((p) => p.id === card.recipient_id);
    if (!person || person.channel === "self") return;
    await api.markShared(card.id);
    await handOff(CHANNEL_APP[person.channel], card);
    haptics.success();
    refresh();
  };

  const openNew = () => {
    if (!home?.people.length) router.push("/talk");
    else setPicking(true);
  };

  return (
    <View style={ui.screen}>
      <ScrollView
        contentContainerStyle={[layout.column(SPLIT_MAX), { paddingTop: insets.top, paddingBottom: space.s48 }]}
        refreshControl={
          <RefreshControl
            refreshing={pulling}
            tintColor={color.accent}
            onRefresh={() => {
              setPulling(true);
              refresh().finally(() => setPulling(false));
            }}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Un-Said</Text>
          <Pressable
            onPress={() => {
              haptics.tap();
              router.push("/you");
            }}
            hitSlop={8}
          >
            <Avatar name={home?.me.name ?? "Riley"} />
          </Pressable>
        </View>

        <View style={split ? styles.split : null}>
          <View style={split ? styles.pane : null}>
            <Rise>
              <T v="display" style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>
                Some words take a little longer.
              </T>
            </Rise>

            <Rise delay={80}>
              <Press featureId="draft-new" onPress={openNew} style={[styles.hero, shadow.hero, { height: heroHeight }]}>
                <CardGradient />
                <Text style={styles.quote}>{"“"}</Text>
                <T v="cardTitle" style={{ marginTop: space.s8, marginRight: space.s64, color: color.onAccent }}>
                  What have you been meaning to say?
                </T>
                <View style={styles.plus}>
                  <Ionicons name="add" size={26} color={color.onAccent} />
                </View>
              </Press>
            </Rise>

            {loading ? <LoadingBlock /> : null}

            {error && !home ? (
              <View style={{ marginTop: space.s24, gap: space.s16 }}>
                <T v="rowPreview" style={{ marginHorizontal: inset.text }}>{`Can't reach Un-Said's server. ${error}`}</T>
                <Press onPress={() => refresh()} style={[ui.pill, { backgroundColor: color.surfaceRaised }]}>
                  <T v="button">Try again</T>
                </Press>
              </View>
            ) : null}

            {error && home ? (
              <T v="caption" style={{ marginHorizontal: inset.text, marginTop: space.s16 }}>{`Can't reach Un-Said's server. ${error}`}</T>
            ) : null}
          </View>

          <View style={split ? styles.pane : null}>
            {home ? (
              <>
                <T v="section" style={styles.section}>
                  Your words
                </T>
                <View style={styles.list}>
                  {drafts === null ? (
                    <>
                      <View style={[ui.row, { height: 76 }]} />
                      <View style={[ui.row, { height: 76 }]} />
                    </>
                  ) : null}
                  {drafts?.length === 0 ? (
                    <T v="caption" style={{ marginHorizontal: space.s8 }}>
                      The lines you keep show up here.
                    </T>
                  ) : null}
                  {drafts?.map(({ personId, text, draft }) => (
                    <Row
                      key={personId}
                      featureId="draft-open"
                      onPress={() => router.push(draft ? { pathname: "/compose", params: { person: personId } } : { pathname: "/pile/[person]", params: { person: personId } })}
                    >
                      <Avatar name={name(personId)} />
                      <View style={{ flex: 1 }}>
                        <T v="rowName">{name(personId)}</T>
                        <T v="rowPreview" lines={1}>
                          {text}
                        </T>
                      </View>
                      <T v="meta">Draft ›</T>
                    </Row>
                  ))}

                  <Row onPress={() => router.push("/talk")}>
                    <View style={styles.micDot}>
                      <PillGradientFill />
                      <Ionicons name="mic" size={22} color={color.onAccent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="rowName">Say it out loud</T>
                      <T v="rowPreview">Only you can hear this.</T>
                    </View>
                  </Row>

                  <Row onPress={() => router.push("/gallery")}>
                    <View style={[styles.micDot, { backgroundColor: color.tint }]}>
                      <Ionicons name="images" size={22} color={color.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="rowName">Your photos</T>
                      <T v="rowPreview">Find the people you miss.</T>
                    </View>
                  </Row>

                  <Row featureId="self-note-open" onPress={() => router.push("/note")}>
                    <View style={[styles.micDot, { backgroundColor: color.tint }]}>
                      <Ionicons name="videocam" size={22} color={color.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="rowName">For you, later</T>
                      <T v="rowPreview">for the next hard day</T>
                    </View>
                  </Row>
                </View>

                {lane.length ? (
                  <>
                    <T v="section" style={styles.section}>
                      Your lane
                    </T>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lane}>
                      {lane.map((photo) => (
                        <Pressable
                          key={photo.id}
                          onPress={() => {
                            haptics.tap();
                            router.push({ pathname: "/pile/[person]", params: { person: photo.person_id } });
                          }}
                          style={{ width: 148 }}
                        >
                          <Image source={{ uri: mediaUrl(photo.url) ?? undefined }} style={styles.tile} contentFit="cover" />
                          {photo.caption ? (
                            <T v="caption" lines={2} style={{ marginTop: space.s8 }}>
                              {photo.caption}
                            </T>
                          ) : null}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </>
                ) : null}

                {held.length || ready.length || delivered.length ? (
                  <View style={[styles.list, { marginTop: space.s24 }]}>
                    {held.map((c) => (
                      <View key={c.id} style={styles.strip}>
                        {/* How far along the hold is: a soft fill behind the whole row, not a line under the text. */}
                        <View pointerEvents="none" style={[styles.fill, { width: `${holdProgress(c, home.clock.now) * 100}%` }]} />
                        <Avatar name={c.recipient_name} size={32} />
                        <View style={{ flex: 1 }}>
                          <T v="rowName">{c.recipient_name}</T>
                          <T v="meta" style={{ color: color.accent }}>{`arrives ${c.release_label ?? ""}`}</T>
                        </View>
                        <TextButton featureId="pending-unsend-cancel" tone="text3" label="Cancel" onPress={() => cancel(c)} />
                      </View>
                    ))}
                    {delivered.map((c) => (
                      <View key={c.id} testID="letter-delivered" style={styles.strip}>
                        <Avatar name={c.recipient_name} size={32} />
                        <View style={{ flex: 1 }}>
                          <T v="rowName">{c.recipient_name}</T>
                          <T v="meta" style={{ color: color.accent }}>Delivered</T>
                        </View>
                        <Ionicons name="checkmark-circle" size={22} color={color.accent} />
                      </View>
                    ))}
                    {ready.map((c) => (
                      <View key={c.id} style={styles.strip}>
                        <Avatar name={c.recipient_name} size={32} />
                        <View style={{ flex: 1 }}>
                          <T v="rowName">{c.recipient_name}</T>
                          <T v="meta" style={{ color: color.accent }}>{`it's ${home.people.find((p) => p.id === c.recipient_id)?.local_time ?? ""} for ${c.recipient_name}`}</T>
                        </View>
                        <TextButton featureId="handoff-whatsapp" tone="text" label="Send now" onPress={() => sendReady(c)} />
                      </View>
                    ))}
                  </View>
                ) : null}

                {arrived.length ? (
                  <View style={[styles.list, { marginTop: space.s24 }]}>
                    {arrived.map((n) => (
                      <Row key={n.id} featureId="letter-open" onPress={() => router.push({ pathname: "/letter/[id]", params: { id: n.id } })}>
                        <Avatar name={name(n.person_id)} ring />
                        <View style={{ flex: 1 }}>
                          <T v="rowName" lines={2}>
                            {n.title}
                          </T>
                          <T v="rowPreview" lines={1}>
                            {n.body}
                          </T>
                        </View>
                      </Row>
                    ))}
                  </View>
                ) : null}

                {home.reminders.length ? (
                  <View style={[styles.list, { marginTop: space.s24 }]}>
                    {home.reminders.map((r) => (
                      <View key={r.id} style={[ui.card, { gap: space.s12 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: space.s12 }}>
                          <Avatar name={r.person_name} />
                          <View style={{ flex: 1 }}>
                            <T v="rowName">{`${r.person_name} · waiting on you`}</T>
                            <T v="rowPreview">{r.text}</T>
                          </View>
                        </View>
                        {r.handoff ? (
                          <OutlinePill
                            featureId={`handoff-${r.channel}`}
                            label={OPEN_LABEL[r.channel]}
                            icon={r.channel !== "self" ? <AppGlyph app={CHANNEL_APP[r.channel]} size={24} /> : null}
                            onPress={async () => {
                              await api.reminderDone(r.id);
                              haptics.success();
                              Linking.openURL(r.handoff!);
                              refresh();
                            }}
                          />
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <Sheet visible={picking} onClose={() => setPicking(false)}>
        <T v="section" style={{ marginBottom: space.s12 }}>
          Who is this for?
        </T>
        <Pressable
          onPress={() => {
            setPicking(false);
            router.push("/talk");
          }}
          style={styles.sheetRow}
        >
          <View style={styles.micDot}>
            <PillGradientFill />
            <Ionicons name="mic" size={20} color={color.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <T v="rowName">Say it out loud</T>
            <T v="rowPreview">Only you can hear this.</T>
          </View>
        </Pressable>
        {home?.people.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setPicking(false);
              router.push({ pathname: "/compose", params: { person: p.id } }); // draft-new opens Compose (DESIGN_SPEC 3.3)
            }}
            style={styles.sheetRow}
          >
            <Avatar name={p.name} />
            <View style={{ flex: 1 }}>
              <T v="rowName">{p.name}</T>
              <T v="rowPreview">{p.time_label}</T>
            </View>
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 44, marginHorizontal: inset.text, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.s8 },
  wordmark: { color: color.text, fontSize: 24, lineHeight: 28, fontWeight: "800", letterSpacing: -0.24 },
  hero: { marginHorizontal: inset.card, marginTop: space.s24, height: 288, borderRadius: radius.hero, overflow: "hidden", padding: space.s24 },
  quote: { color: color.onAccent, fontSize: 40, lineHeight: 40, fontWeight: "800" },
  plus: { position: "absolute", right: space.s16, bottom: space.s16, width: 56, height: 56, borderRadius: radius.square, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  split: { flexDirection: "row", alignItems: "flex-start" },
  pane: { flex: 1, flexBasis: 0, minWidth: 0 },
  section: { marginHorizontal: inset.text, marginTop: space.s24, marginBottom: space.s8 },
  list: { marginHorizontal: inset.card, gap: space.s8, marginTop: space.s8 },
  micDot: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  strip: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: space.s12, backgroundColor: color.surface, borderRadius: radius.row, paddingHorizontal: space.s16, paddingVertical: space.s8, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: color.tint },
  lane: { gap: space.s12, paddingHorizontal: inset.card, paddingTop: space.s8 },
  tile: { width: 148, height: 148, borderRadius: radius.row, backgroundColor: color.surface },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: space.s12, paddingVertical: space.s12 },
});
