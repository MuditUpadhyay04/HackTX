// Unsaid, the student's side. Plain modules, no build step; served by the backend at /app/.
import { holdToTalk, startPcm, wavBlob } from "/app/audio.js";
import { CHECK_SVG, MARK_SVG, MIC_SVG, PAUSE_SVG, PLAY_SVG, esc, toast, wave } from "/app/ui.js";

// ------------------------------------------------------------------ key + api

const params = new URLSearchParams(location.search);
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
if (params.get("key")) store.set("unsaid_key", params.get("key"));
if (params.has("demo")) store.set("unsaid_demo", "1");
let KEY = store.get("unsaid_key") || params.get("key") || "";
const DEMO = store.get("unsaid_demo") === "1";
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

class Unauthorized extends Error {}

async function api(path, { method = "GET", json, form } = {}) {
  const headers = KEY ? { "X-App-Key": KEY } : {};
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(path, { method, headers, body });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* not json */ }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

function wsUrl(path) {
  const url = new URL(path, location.href);
  url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
  if (KEY) url.searchParams.set("key", KEY);
  return url.toString();
}

// ------------------------------------------------------------------ state + routing

const S = { home: null, view: "home", params: {}, seen: new Set(), sort: null, rec: null, cleanup: null };
const main = document.getElementById("view");
const $ = (sel) => main.querySelector(sel);

function go(view, p = {}) {
  if (S.cleanup) { S.cleanup(); S.cleanup = null; }
  // A nudge never follows you to another screen, and never sits over the safety resources.
  document.getElementById("sheet").classList.remove("show");
  S.view = view;
  S.params = p;
  window.scrollTo(0, 0);
  render();
}

function render() {
  const views = { home: renderHome, memory: renderMemory, sorted: renderSorted, hold: renderHold, stack: renderStack, safety: renderSafety, note: renderNote, demo: renderDemo, key: renderKey };
  (views[S.view] || renderHome)();
}

async function refresh() {
  try {
    S.home = await api("/api/home");
  } catch (err) {
    if (err instanceof Unauthorized) return go("key");
    throw err;
  }
  showNudge();
  if (S.view === "home") renderHome();
}

setInterval(() => {
  if (!document.hidden && !S.rec && S.view !== "key") refresh().catch(() => {});
}, 4000);

main.addEventListener("click", (e) => {
  const target = e.target.closest("[data-go]");
  if (target) go(target.dataset.go, { ...target.dataset });
});

// ------------------------------------------------------------------ helpers

const person = (id) => S.home.people.find((p) => p.id === id) || (S.home.me.id === id ? S.home.me : null);
const SUBJECT = { her: "she", him: "he", them: "they" };
const POSSESSIVE = { her: "her", him: "his", them: "their" };
const moon = (p) => (p.is_asleep ? "🌙 " : "");
const back = (to = "home", label = "back") => `<button class="back" data-go="${to}">‹ ${label}</button>`;
const top = () => `
  <div class="topbar">
    <div class="wordmark"><span class="mark">${MARK_SVG}</span>unsaid</div>
    <div class="row">
      ${S.home && Object.values(S.home.providers).includes("mock") ? `<span class="micro pill-mock" title="no MODEL_API_KEY: transcripts and sorting are mocked">mock ai</span>` : ""}
      ${DEMO ? `<button class="link" data-go="demo">demo</button>` : ""}
    </div>
  </div>`;

function morningLabel(p) {
  const [h, m] = p.morning.split(":").map(Number);
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

function dateLabel(iso) {
  const tz = S.home.me.timezone;
  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz });
  return fmt(iso) === fmt(S.home.clock.now) ? "tonight" : fmt(iso).toLowerCase();
}

function wirePlayer(root, onFirstPlay) {
  const audio = root.querySelector("audio");
  const btn = root.querySelector(".play");
  const waveEl = root.querySelector(".wave");
  if (!audio || !btn) return null;
  let timer = 0;
  let played = false;
  const bars = waveEl ? waveEl.querySelectorAll("i") : [];
  const animate = () => {
    bars.forEach((b) => (b.style.height = `${20 + Math.random() * 80}%`));
    timer = setTimeout(animate, 110);
  };
  btn.onclick = () => (audio.paused ? audio.play() : audio.pause());
  audio.onplay = () => {
    btn.innerHTML = PAUSE_SVG;
    waveEl && waveEl.classList.add("on");
    animate();
    if (!played) { played = true; onFirstPlay && onFirstPlay(); }
  };
  audio.onpause = audio.onended = () => {
    btn.innerHTML = PLAY_SVG;
    waveEl && waveEl.classList.remove("on");
    clearTimeout(timer);
    bars.forEach((b) => (b.style.height = "30%"));
  };
  return audio;
}

async function shareCard(card) {
  const s = card.share || {};
  const link = s.whatsapp || (IS_IOS ? s.sms_ios : s.sms_android) || s.instagram || s.url;
  await api(`/api/cards/${card.id}/shared`, { method: "POST" });
  location.href = link;
}

// ------------------------------------------------------------------ notification sheet

function showNudge() {
  const sheet = document.getElementById("sheet");
  if (!S.home || S.rec || ["note", "key", "safety"].includes(S.view) || sheet.classList.contains("show")) return;
  const n = S.home.nudges.find((x) => !S.seen.has(x.kind + x.id));
  if (!n) return;
  S.seen.add(n.kind + n.id);
  sheet.innerHTML = `<span class="mark">${MARK_SVG}</span><div class="grow"><b>${esc(n.title)}</b><span class="small">${esc(n.body)}</span></div><span class="ripple"></span>`;
  requestAnimationFrame(() => sheet.classList.add("show"));
  const hide = setTimeout(() => sheet.classList.remove("show"), 9000);
  sheet.onclick = () => {
    clearTimeout(hide);
    sheet.classList.remove("show");
    if (n.kind === "reply") {
      const photo = S.home.photos.find((ph) => ph.person_id === n.person_id);
      go("memory", { photo: photo ? photo.id : "", person: n.person_id, autoplay: n.reply.id });
    } else if (n.kind === "ready") {
      shareCard(n.card).catch((e) => toast(e.message));
    }
  };
}

// ------------------------------------------------------------------ home

function renderHome() {
  const h = S.home;
  if (!h) return;
  const order = Object.fromEntries(h.people.map((p, i) => [p.id, i]));
  const photos = [...h.photos].sort((a, b) => (order[a.person_id] ?? 9) - (order[b.person_id] ?? 9));
  const held = h.cards.filter((c) => c.status === "held");
  main.innerHTML = `
    ${top()}
    <p class="title fade-in">hey. who's on your mind?</p>
    <div class="section fade-in d1"><div class="people">
      ${h.people.map((p) => `
        <div class="person"><span class="avatar">${esc(p.name[0])}</span>
          <div><div style="font-weight:600;font-size:14px">${esc(p.name)}</div><div class="when">${moon(p)}${esc(p.local_time)}</div></div>
        </div>`).join("")}
    </div></div>
    ${held.length ? `<div class="section"><h2>waiting for the right moment</h2><div class="stack">
      ${held.map((c) => `
        <div class="strip"><span class="dot"></span>
          <div class="grow"><b>${esc(c.recipient_name)}</b> · waiting · ${esc(c.release_label || "")}</div>
          <button class="link" data-revoke="${c.id}">cancel</button>
        </div>`).join("")}
    </div></div>` : ""}
    ${h.reminders.length ? `<div class="section"><h2>waiting on you</h2><div class="stack">
      ${h.reminders.map((r) => `
        <div class="strip"><span class="avatar">${esc(r.person_name[0] || "?")}</span>
          <div class="grow"><b>${esc(r.text)}</b></div>
          ${r.handoff ? `<button class="btn outline" style="min-height:40px;padding:8px 14px;font-size:14px" data-handoff="${r.id}">open ${esc(r.channel === "imessage" ? "messages" : r.channel)}</button>` : ""}
        </div>`).join("")}
    </div></div>` : ""}
    <div class="section"><h2>your lane</h2><div class="lane">
      ${photos.map((ph, i) => `
        <button class="tile fade-in d${Math.min(i, 3)}" data-go="memory" data-photo="${ph.id}" data-person="${ph.person_id}">
          <img src="${esc(ph.url)}" alt="" loading="lazy" /><span class="cap">${esc(ph.caption)}</span>
        </button>`).join("")}
    </div>
    <details style="margin-top:12px"><summary class="small" style="cursor:pointer">+ add a photo</summary>
      <form id="addPhoto" class="card" style="margin-top:10px">
        <div class="field"><label>who's in it</label><select name="person_id">${h.people.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
        <div class="field"><label>caption</label><input name="caption" placeholder="kitchen, with mom" maxlength="120" /></div>
        <div class="field"><input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /></div>
        <button class="btn dark block" style="margin-top:14px">add to the lane</button>
      </form>
    </details></div>
    <div class="section">
      <button class="strip" data-go="note" style="width:100%;text-align:left;cursor:pointer">
        <span class="avatar" style="background:var(--accent-soft)">◐</span>
        <div class="grow"><b>for the next hard day</b><div class="small">${h.self_notes.length ? `${h.self_notes.length} note${h.self_notes.length > 1 ? "s" : ""} to yourself` : "leave yourself a note"}</div></div>
      </button>
    </div>`;

  main.querySelectorAll("[data-revoke]").forEach((b) => (b.onclick = async () => {
    await api(`/api/cards/${b.dataset.revoke}/revoke`, { method: "POST" });
    refresh();
  }));
  main.querySelectorAll("[data-handoff]").forEach((b) => (b.onclick = async () => {
    const r = h.reminders.find((x) => x.id === b.dataset.handoff);
    await api(`/api/reminders/${r.id}/done`, { method: "POST" });
    location.href = r.handoff;
  }));
  const form = $("#addPhoto");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      await api("/api/photos", { method: "POST", form: data });
      toast("added to your lane");
      refresh();
    } catch (err) {
      toast(err.message);
    }
  };
}

// ------------------------------------------------------------------ memory + the live rant

function renderMemory() {
  const h = S.home;
  const photo = h.photos.find((ph) => ph.id === S.params.photo);
  const p = person(S.params.person || (photo && photo.person_id)) || h.people[0];
  const reply = h.replies.find((r) => r.from_person_id === p.id);
  main.innerHTML = `
    ${back()}
    ${photo ? `<img class="memory-photo fade-in" src="${esc(photo.url)}" alt="" />` : ""}
    <div class="row" style="margin-top:14px"><span class="chip">${moon(p)}${esc(p.time_label)}</span></div>
    ${reply ? `
      <div class="card fade-in d1" id="reply" style="margin-top:14px">
        <div class="small" style="margin-bottom:10px">${esc(reply.from_name)} · ${esc(reply.day)}</div>
        ${reply.audio_url ? `<div class="voice"><button class="play" aria-label="play">${PLAY_SVG}</button>${wave("rw")}<audio src="${esc(reply.audio_url)}" preload="auto"></audio></div>` : ""}
        ${reply.transcript ? `<p class="hand" style="margin:12px 0 0">${esc(reply.transcript)}</p>` : ""}
        ${reply.translation ? `<p class="small" style="margin:4px 0 0">${esc(reply.translation)}</p>` : ""}
      </div>` : ""}
    <div class="card transcript hidden" id="transcript" style="margin-top:14px"></div>
    <div class="mic-wrap mic-dock" id="micWrap">
      <button class="mic" id="mic" aria-label="hold to talk">${MIC_SVG}</button>
      <div class="small" id="micLabel">hold to talk. nobody else hears this.</div>
      <button class="link" id="typeInstead">type instead</button>
    </div>
    <form id="typed" class="hidden" style="margin-top:16px">
      <textarea name="text" rows="5" class="card" style="width:100%;font:inherit;resize:vertical" placeholder="say it here." required></textarea>
      <button class="btn primary block" style="margin-top:10px">done</button>
    </form>`;

  if (reply) {
    const audio = wirePlayer($("#reply"), () => {
      if (!reply.heard_at) api(`/api/replies/${reply.id}/heard`, { method: "POST" }).catch(() => {});
    });
    if (!reply.audio_url && !reply.heard_at) api(`/api/replies/${reply.id}/heard`, { method: "POST" }).catch(() => {});
    if (audio && S.params.autoplay === reply.id) audio.play().catch(() => {});
  }
  wireRant(p, photo);
  $("#typeInstead").onclick = () => {
    $("#typed").classList.remove("hidden");
    $("#micWrap").classList.add("hidden");
    $("#typed textarea").focus();
  };
  $("#typed").onsubmit = async (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("text");
    try {
      afterRant(await api("/api/rants/text", { method: "POST", json: { text } }), photo);
    } catch (err) {
      toast(err.message);
    }
  };
}

function wireRant(p, photo) {
  const mic = $("#mic");
  const label = $("#micLabel");
  const box = $("#transcript");
  let finished = [];
  let live = "";
  const paint = () => {
    box.classList.remove("hidden");
    box.innerHTML = `<span class="hand done">${esc(finished.join(" "))}</span> <span class="hand live">${esc(live)}</span>`;
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  main.classList.add("has-dock");
  S.cleanup = () => main.classList.remove("recording", "has-dock");

  holdToTalk(mic, {
    onStart() {
      main.classList.add("recording");
      mic.classList.add("live");
      label.textContent = "listening… let go when you're done";
      finished = [];
      live = "";
      const rec = (S.rec = { ws: null, ready: false, queue: [], pcm: null, chunks: null, stopped: false, failed: false, finished: false });
      try {
        rec.ws = new WebSocket(wsUrl("/api/rants/live"));
        rec.ws.binaryType = "arraybuffer";
        rec.ws.onopen = () => rec.ws.send(JSON.stringify({ type: "start" }));
        rec.ws.onmessage = (e) => {
          const ev = JSON.parse(e.data);
          if (ev.type === "ready") {
            rec.ready = true;
            rec.queue.forEach((b) => rec.ws.send(b));
            rec.queue = [];
          } else if (ev.type === "partial") {
            live = ev.text;
            paint();
          } else if (ev.type === "turn") {
            finished.push(ev.text);
            live = "";
            paint();
          } else if (ev.type === "done") {
            rec.finished = true;
            S.rec = null;
            afterRant(ev.rant, photo);
          } else if (ev.type === "error") {
            rec.failed = true;
            fallback(rec, photo);
          }
        };
        rec.ws.onclose = () => {
          if (!rec.finished) {
            rec.failed = true;
            fallback(rec, photo);
          }
        };
      } catch {
        rec.failed = true;
      }
      rec.starting = startPcm({
        onChunk: (bytes) => {
          if (rec.ready && rec.ws && rec.ws.readyState === WebSocket.OPEN) rec.ws.send(bytes);
          else rec.queue.push(bytes);
        },
      }).then((r) => (rec.pcm = r)).catch((err) => {
        mic.classList.remove("live");
        label.textContent = "the microphone isn't available here";
        toast(err.message || "microphone blocked");
        rec.finished = true;
        S.rec = null;
        rec.ws && rec.ws.close();
      });
    },
    async onStop() {
      const rec = S.rec;
      mic.classList.remove("live");
      if (!rec) return;
      label.textContent = "sorting it by person…";
      await rec.starting;
      if (!rec.pcm) return;
      rec.chunks = await rec.pcm.stop();
      rec.stopped = true;
      if (!rec.failed && rec.ready && rec.ws.readyState === WebSocket.OPEN) {
        rec.ws.send(JSON.stringify({ type: "stop" }));
        setTimeout(() => {
          if (!rec.finished) { rec.failed = true; fallback(rec, photo); }
        }, 30000);
      } else {
        fallback(rec, photo);
      }
    },
  });
}

// The live socket failed: upload the WAV we kept and transcribe it as a file.
async function fallback(rec, photo) {
  if (!rec.stopped || rec.finished || rec.uploading) return;
  rec.uploading = true;
  rec.finished = true;
  S.rec = null;
  try {
    const form = new FormData();
    form.append("file", wavBlob(rec.chunks), "rant.wav");
    afterRant(await api("/api/rants/audio", { method: "POST", form }), photo);
  } catch (err) {
    toast(`couldn't hear that: ${err.message}`);
    main.classList.remove("recording");
    const label = $("#micLabel");
    if (label) label.textContent = "hold to talk. nobody else hears this.";
  }
}

async function afterRant(rant, photo) {
  S.sort = null;
  S.sortPhoto = photo ? photo.id : null; // the photo he was looking at goes on the card
  go("sorted", { rant: rant.id });
  try {
    S.sort = await api(`/api/rants/${rant.id}/sort`, { method: "POST" });
  } catch (err) {
    toast(err.message);
    return;
  }
  if (S.view === "sorted") go(S.sort.safety === "ok" ? "sorted" : "safety", S.params);
}

// ------------------------------------------------------------------ sorted

function renderSorted() {
  const r = S.sort;
  if (!r) {
    main.innerHTML = `${back()}<div class="stack" style="margin-top:30px"><p class="small">sorting it by person…</p><div class="shimmer"></div><div class="shimmer" style="width:75%"></div><div class="shimmer" style="width:55%"></div></div>`;
    return;
  }
  if (r.safety !== "ok") return renderSafety();
  const by = r.rant.sorted_by === "meta" ? "muse spark" : "mock sorter";
  main.innerHTML = `
    ${back()}
    ${r.self_note ? `
      <div class="card fade-in" style="margin-bottom:16px">
        <div class="small" style="margin-bottom:10px">you left yourself this, for a night like this.</div>
        <video class="note" src="${esc(r.self_note.url)}" playsinline controls></video>
      </div>` : ""}
    <p class="small fade-in" style="display:flex;gap:6px;align-items:center;margin:8px 0 14px">${CHECK_SVG} safe to hold · sorted by ${by}</p>
    ${r.groups.length ? "" : `<p class="reflection">nothing in that was about anyone yet. it's kept, just for you.</p>`}
    <div class="stack">
      ${r.groups.map((g, i) => `
        <button class="card person-card fade-in d${Math.min(i + 1, 3)}" data-person-card="${g.person.id}">
          <header><span class="count">${esc(g.person.name)} · ${g.kept_total}</span><span class="chip">${esc(g.tone)}</span></header>
          <div class="lines">${g.pieces.map((pc) => `<p class="hand" style="margin:0 0 6px">${esc(pc.text)}</p>`).join("")}</div>
          ${g.kept_total > g.pieces.length ? `<div class="small">+ ${g.kept_total - g.pieces.length} from before</div>` : ""}
        </button>`).join("")}
    </div>
    <details style="margin-top:20px"><summary class="small" style="cursor:pointer">what was heard</summary>
      <p class="small">${esc(r.rant.transcript)}</p></details>`;
  main.querySelectorAll("[data-person-card]").forEach((el) => (el.onclick = () => {
    const g = r.groups.find((x) => x.person.id === el.dataset.personCard);
    go(g.person.channel === "whatsapp" ? "hold" : "stack", { person: g.person.id });
  }));
}

// ------------------------------------------------------------------ hold until her morning

function renderHold() {
  const g = S.sort.groups.find((x) => x.person.id === S.params.person);
  const p = person(g.person.id);
  const pos = POSSESSIVE[p.pronoun] || "their";
  const question = p.is_asleep
    ? `hold this until ${pos} ${morningLabel(p)}?`
    : `it's ${p.local_time} for ${p.name}. send it now?`;
  main.innerHTML = `
    ${back("sorted")}
    <div class="card fade-in">${g.pieces.map((pc) => `<p class="hand" style="margin:0 0 8px">${esc(pc.text)}</p>`).join("")}</div>
    <p class="reflection fade-in d1" style="margin:24px 4px">${esc(g.reflection)} ${esc(question)}</p>
    <div id="after"></div>
    <button class="btn primary block fade-in d2" id="send">${p.is_asleep ? `send when it's ${pos} morning` : "send it now"}</button>
    <button class="btn ghost block" data-go="sorted" style="margin-top:6px">keep it for now</button>`;
  $("#send").onclick = async () => {
    $("#send").disabled = true;
    let card;
    try {
      card = await api("/api/cards", {
        method: "POST",
        json: { recipient_id: p.id, piece_ids: g.pieces.map((pc) => pc.id), photo_id: S.sortPhoto || null, when: p.is_asleep ? "her_morning" : "now" },
      });
    } catch (err) {
      $("#send").disabled = false;
      return toast(err.message);
    }
    if (card.status === "held") {
      $("#send").outerHTML = `<div class="strip fade-in" style="position:relative"><span class="dot"></span><div class="grow"><b>${esc(p.name)}</b> · waiting · ${esc(card.release_label)}</div><span class="ripple" style="left:22px;top:24px"></span></div>`;
      setTimeout(() => { if (S.view === "hold") { refresh(); go("home"); } }, 2200);
    } else if (card.status === "released") {
      toast(`sent to ${p.name} on whatsapp`);
      refresh();
      go("home");
    } else {
      shareCard(card).catch((e) => toast(e.message));
    }
  };
}

// ------------------------------------------------------------------ the stack: choose what she hears

async function renderStack() {
  const p = person(S.params.person);
  main.innerHTML = `${back(S.sort ? "sorted" : "home")}<div class="shimmer" style="margin-top:30px"></div>`;
  const pieces = await api(`/api/people/${p.id}/pieces`);
  if (S.view !== "stack") return;
  const obj = p.pronoun || "them";
  const subj = SUBJECT[obj] || "they";
  const via = { imessage: "messages", instagram: "instagram", whatsapp: "whatsapp" }[p.channel] || "";
  main.innerHTML = `
    ${back(S.sort ? "sorted" : "home")}
    <p class="hand-lg fade-in" style="margin:8px 0 16px">${pieces.length} thing${pieces.length === 1 ? "" : "s"} you never told ${esc(obj)}.</p>
    <div class="card fade-in d1">
      ${pieces.map((pc) => `
        <label class="check-row"><input type="checkbox" value="${pc.id}" />
          <div><p class="hand" style="margin:0">${esc(pc.text)}</p><div class="small">${esc(dateLabel(pc.created_at))} · ${esc(pc.tone)}</div></div>
        </label>`).join("")}
    </div>
    <p class="small" style="margin:12px 4px">nothing is picked for you. choose what ${esc(subj)} hears.</p>
    <button class="btn primary block" id="send" disabled>send to ${esc(p.name)}${via ? ` in ${via}` : ""}</button>`;
  const boxes = [...main.querySelectorAll("input[type=checkbox]")];
  boxes.forEach((b) => (b.onchange = () => ($("#send").disabled = !boxes.some((x) => x.checked))));
  $("#send").onclick = async () => {
    const ids = boxes.filter((b) => b.checked).map((b) => b.value);
    try {
      const card = await api("/api/cards", { method: "POST", json: { recipient_id: p.id, piece_ids: ids, when: "now" } });
      if (card.status === "released") { toast(`sent to ${p.name}`); return go("home"); }
      await shareCard(card);
    } catch (err) {
      toast(err.message);
    }
  };
}

// ------------------------------------------------------------------ safety

function renderSafety() {
  const resources = (S.sort && S.sort.resources) || [];
  main.innerHTML = `
    ${back()}
    <div class="safety fade-in" style="margin-top:8px">
      <h3>we're not going to show memories right now.</h3>
      <p style="margin:0 0 10px;opacity:.85">you deserve to feel safe. here's real help.</p>
      ${resources.map((r) => `
        <div class="row" style="display:block">
          <b>${esc(r.name)}</b><div style="opacity:.85;font-size:14px">${esc(r.detail)}</div>
          ${r.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join("")}
        </div>`).join("")}
      <p style="margin:14px 0 0;opacity:.75;font-size:13px">unsaid isn't a crisis service. these people are.</p>
    </div>
    <button class="btn ghost block" data-go="home" style="margin-top:12px">back home</button>`;
}

// ------------------------------------------------------------------ for the next hard day

function renderNote() {
  const notes = S.home.self_notes;
  main.innerHTML = `
    ${back()}
    <p class="hand-lg fade-in" style="margin:8px 0 16px">for the next hard day.</p>
    <video class="note" id="preview" playsinline muted autoplay></video>
    <button class="btn primary block" id="rec" style="margin-top:14px" disabled>record</button>
    <p class="small" style="margin:10px 4px">only you see this. it comes back the next time a night sounds like tonight.</p>
    ${notes.length ? `<div class="section"><h2>to: me</h2><div class="stack">${notes.map((n) => `<video class="note" src="${esc(n.url)}" playsinline controls></video>`).join("")}</div></div>` : ""}`;

  let stream = null;
  let recorder = null;
  let parts = [];
  const btn = $("#rec");
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true }).then((s) => {
    stream = s;
    if (S.view !== "note") return s.getTracks().forEach((t) => t.stop());
    $("#preview").srcObject = s;
    btn.disabled = false;
  }).catch((err) => toast(err.message || "camera blocked"));
  S.cleanup = () => stream && stream.getTracks().forEach((t) => t.stop());

  btn.onclick = () => {
    if (recorder && recorder.state === "recording") return recorder.stop();
    const type = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
    recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    parts = [];
    recorder.ondataavailable = (e) => e.data.size && parts.push(e.data);
    recorder.onstop = async () => {
      btn.textContent = "saving…";
      btn.disabled = true;
      const blob = new Blob(parts, { type: recorder.mimeType || type || "video/webm" });
      const form = new FormData();
      form.append("file", blob, blob.type.includes("mp4") ? "note.mp4" : "note.webm");
      form.append("label", "for the next hard day");
      try {
        await api("/api/self-notes", { method: "POST", form });
        toast("saved. to: me");
        await refresh();
        go("note");
      } catch (err) {
        toast(err.message);
        btn.textContent = "record";
        btn.disabled = false;
      }
    };
    recorder.start();
    btn.textContent = "stop and save";
  };
}

// ------------------------------------------------------------------ demo controls

async function renderDemo() {
  main.innerHTML = `${back()}<div class="shimmer" style="margin-top:30px"></div>`;
  const st = await api("/api/demo/state");
  if (S.view !== "demo") return;
  const latestReply = S.home.replies[0];
  main.innerHTML = `
    ${back()}
    <div class="demo-panel stack">
      <div class="card">
        <b>providers</b>
        <p class="small">spark: ${esc(S.home.providers.spark)} · transcribe: ${esc(S.home.providers.transcribe)} · mom's 8 AM: ${esc(S.home.providers.whatsapp)}</p>
      </div>
      <div class="card">
        <b>clock</b>
        <p class="small">you: ${esc(st.me_local.replace("T", " "))} · offset ${st.offset_minutes} min</p>
        <p class="small">${st.people.filter((p) => p.channel !== "self").map((p) => esc(p.time_label)).join("<br>")}</p>
        <div class="field"><label>set your time (Austin)</label><input type="datetime-local" id="setLocal" value="2026-10-24T18:32" /></div>
        <div class="row wrap" style="margin-top:10px">
          <button class="btn dark" id="setClock">set</button>
          <button class="btn outline" id="plus3">+3 hours</button>
          <button class="btn outline" id="realClock">real time</button>
        </div>
      </div>
      <div class="card">
        <b>mom's voice note</b>
        <p class="small">send this link to Mom. she holds to reply; it lands as "Mom left you a voice note".</p>
        <input readonly value="${esc(st.mom_voice_note_link)}" id="momLink" />
        <div class="row wrap" style="margin-top:10px">
          <button class="btn outline" id="copyLink">copy</button>
          <button class="btn outline" id="mockReply">mock reply</button>
          ${latestReply ? `<button class="btn outline" id="backdate">make latest reply tuesday</button>` : ""}
        </div>
      </div>
      <div class="card">
        <b>people</b>
        ${st.people.map((p) => `
          <form class="person-edit" data-id="${p.id}" style="margin-top:12px">
            <div class="small" style="font-weight:600">${esc(p.name)} · ${esc(p.channel)}</div>
            <div class="row" style="margin-top:6px">
              <input name="handle" placeholder="${p.channel === "instagram" ? "instagram username" : "phone, +country code"}" />
              <input name="timezone" value="${esc(p.timezone)}" />
            </div>
            <button class="btn ghost" style="padding-left:0">save ${esc(p.name)}</button>
          </form>`).join("")}
        <p class="small">phone numbers aren't shown back here; ${st.people.filter((p) => p.has_handle).length} of ${st.people.length} are set.</p>
      </div>
      <div class="card">
        <b>reset</b>
        <p class="small">clears rants, cards, replies, notes. keeps people, photos, and the clock.</p>
        <button class="btn outline" id="reset">reset activity</button>
      </div>
    </div>`;

  const after = async (promise, message) => {
    try {
      const out = await promise;
      if (out && out.released && out.released.length) toast(`released ${out.released.length} card(s)`);
      else if (message) toast(message);
      await refresh();
      if (S.view === "demo") renderDemo();
    } catch (err) {
      toast(err.message);
    }
  };
  $("#setClock").onclick = () => after(api("/api/demo/clock", { method: "POST", json: { set_local: $("#setLocal").value } }), "clock set");
  $("#plus3").onclick = () => after(api("/api/demo/clock", { method: "POST", json: { advance_minutes: 180 } }), "3 hours later");
  $("#realClock").onclick = () => after(api("/api/demo/clock", { method: "POST", json: { reset: true } }), "real time");
  $("#copyLink").onclick = () => navigator.clipboard.writeText($("#momLink").value).then(() => toast("copied"));
  $("#mockReply").onclick = () => after(api("/api/demo/mock-reply", { method: "POST" }), "mock reply added");
  if ($("#backdate")) $("#backdate").onclick = () => after(api(`/api/demo/replies/${latestReply.id}/backdate`, { method: "POST", json: { to_local: "2026-10-20T19:10" } }), "now it says tuesday");
  $("#reset").onclick = () => confirm("reset all activity?") && after(api("/api/demo/reset", { method: "POST" }), "reset");
  main.querySelectorAll(".person-edit").forEach((form) => (form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(form)].filter(([, v]) => v));
    after(api(`/api/people/${form.dataset.id}`, { method: "PATCH", json: data }), "saved");
  }));
}

// ------------------------------------------------------------------ key prompt

function renderKey() {
  main.innerHTML = `
    ${top()}
    <form class="card" id="keyForm" style="margin-top:30px">
      <p class="reflection" style="margin-top:0">this unsaid needs its key.</p>
      <input name="key" type="password" autocomplete="off" class="card" style="width:100%;font:inherit" placeholder="APP_KEY" />
      <button class="btn dark block" style="margin-top:12px">open</button>
    </form>`;
  $("#keyForm").onsubmit = (e) => {
    e.preventDefault();
    KEY = new FormData(e.target).get("key");
    store.set("unsaid_key", KEY);
    S.view = "home";
    refresh().catch((err) => toast(err.message));
  };
}

refresh().catch((err) => toast(err.message));
