// The page Mom (or Sarah) opens from the link: his letter on un-bg, then her way back to him.
// No app, no account; the link is the key. (DESIGN_SPEC 3.10, FOR_MUDITS_CLAUDE.md 3.9)
import { holdToTalk, startPcm, wavBlob } from "/app/audio.js";
import { CHECK_SVG, PAUSE_SVG, PLAY_SVG, QUOTE_SVG, esc, fitHero, toast, wave, waveFeeder } from "/app/ui.js";

const token = location.pathname.split("/").filter(Boolean).pop();
const root = document.getElementById("root");
const replyUrl = `/api/public/cards/${encodeURIComponent(token)}/reply`;

// A few words in her language under the English, when we know it.
const LOCAL = {
  hindi: { hold: "दबाकर रखें और बोलें", sent: "भेज दिया।", call: "कॉल करें" },
};

// A resting waveform, so the listen row reads as a voice before it plays.
const RESTING = [6, 10, 14, 8, 18, 12, 20, 10, 16, 8, 12, 18, 10, 14, 6, 10, 16, 8, 12, 6];

const header = `<header class="header"><span class="t-wordmark">Un-Said</span></header>`;

async function load() {
  const res = await fetch(`/api/public/cards/${encodeURIComponent(token)}`);
  if (!res.ok) {
    const msg = res.status === 410 ? "this link has expired." : "this link isn't open yet.";
    root.innerHTML = `${header}<div class="card pad-card mt-24 plain-fade"><p class="t-name">${msg}</p></div>`;
    return;
  }
  render(await res.json());
}

function render(c) {
  const local = LOCAL[(c.recipient_language || "").toLowerCase()] || null;
  // Spec 3.4: his first sentence is the hero; everything after it follows as body.
  const [firstLine, ...more] = c.lines.map((l) => l.text);
  const split = firstLine ? firstLine.match(/^(.+?[.!?।…]+["'”’)]*)\s+(.+)$/s) : null;
  const first = split ? split[1] : firstLine;
  const rest = split ? [split[2], ...more] : more;
  // The mock server returns a bracketed placeholder instead of a translation; never show that.
  const translation = c.translation && !c.translation.startsWith("[") ? c.translation : "";
  root.innerHTML = `
    ${header}
    ${c.photo_url ? `<img class="photo pad-card mt-8 fade-in" src="${esc(c.photo_url)}" alt="" />` : ""}
    ${c.video_url ? `<video class="photo pad-card mt-8 fade-in" src="${esc(c.video_url)}" style="object-fit: contain" controls playsinline preload="metadata" data-feature-id="card-video"></video>` : ""}
    <article class="letter pad-card mt-16 fade-in d1">
      <span class="quote">${QUOTE_SVG}</span>
      <p class="t-overline">For you</p>
      ${first ? `<p class="hero-line" id="hero">${esc(first)}</p>` : ""}
      ${rest.map((text) => `<p class="body-line">${esc(text)}</p>`).join("")}
      ${c.audio_url ? `
        <div class="listen" data-feature-id="unsend-play">
          <button class="play" id="play" aria-label="listen">${PLAY_SVG}</button>
          <span class="t-name">listen</span>
          ${wave("lw", RESTING.length)}
          <audio id="audio" src="${esc(c.audio_url)}" preload="auto"></audio>
        </div>` : ""}
      <p class="sig">${esc(c.sender_name)}</p>
    </article>
    ${translation ? `
      <section class="pad-text mt-24 fade-in d2">
        <p class="t-overline">${esc(c.recipient_language)}</p>
        <p class="translation mt-8">${esc(translation)}</p>
      </section>` : ""}
    <section class="mt-24 fade-in d2" id="actions"></section>
    <p class="t-caption center mt-32">sent with Un-Said</p>`;
  const hero = document.getElementById("hero");
  fitHero(hero);
  window.addEventListener("resize", () => fitHero(hero));
  if (c.audio_url) wirePlayer();
  showActions(c, local);
}

function wirePlayer() {
  const audio = document.getElementById("audio");
  const btn = document.getElementById("play");
  const w = document.getElementById("lw");
  const bars = [...w.querySelectorAll("i")];
  const rest = () => bars.forEach((b, i) => (b.style.height = `${RESTING[i]}px`));
  let timer = 0;
  const animate = () => {
    bars.forEach((b) => (b.style.height = `${4 + Math.round(Math.random() * 20)}px`));
    timer = setTimeout(animate, 120);
  };
  rest();
  btn.onclick = () => (audio.paused ? audio.play() : audio.pause());
  audio.onplay = () => {
    btn.innerHTML = PAUSE_SVG;
    w.classList.add("on");
    animate();
  };
  audio.onpause = audio.onended = () => {
    btn.innerHTML = PLAY_SVG;
    w.classList.remove("on");
    clearTimeout(timer);
    rest();
  };
}

const callPill = (c, local) =>
  c.call_url
    ? `<div class="pad-card mt-16"><a class="outline-pill" href="${esc(c.call_url)}" data-feature-id="call-start">Call ${esc(c.sender_name)}</a></div>
       ${local ? `<p class="t-caption center mt-8">${local.call}</p>` : ""}`
    : "";

// Letter state: Hold to reply (primary), Write back, Call.
function showActions(c, local) {
  const actions = document.getElementById("actions");
  actions.innerHTML = `
    <div class="pad-card"><button class="pill hold" id="hold" data-feature-id="reply-page-record"><span>Hold to reply</span></button></div>
    ${local ? `<p class="t-caption center mt-8">${local.hold}</p>` : ""}
    <p class="t-caption center mt-8 hidden" id="note"></p>
    <div class="pad-card mt-16"><button class="outline-pill" id="write" data-feature-id="letter-write-back">Write back</button></div>
    ${callPill(c, local)}`;
  wireHold(c, local);
  document.getElementById("write").onclick = () => showWrite(c, local);
}

// Reply-recording state: the pill shows her waveform and "Release to send".
function wireHold(c, local) {
  const btn = document.getElementById("hold");
  const note = document.getElementById("note");
  const say = (text) => {
    note.textContent = text;
    note.classList.toggle("hidden", !text);
  };
  const idle = () => {
    btn.classList.remove("live");
    btn.innerHTML = "<span>Hold to reply</span>";
  };
  let rec = null;
  let starting = null;
  holdToTalk(btn, {
    toggle: false, // a press too short to say anything sends nothing
    onStart() {
      say("");
      rec = null;
      btn.classList.add("live");
      btn.innerHTML = `${wave("rw", 16)}<span>Release to send</span>`;
      const w = document.getElementById("rw");
      w.classList.add("on");
      const feed = waveFeeder(w);
      starting = startPcm({ onLevel: feed }).then((r) => (rec = r)).catch((err) => {
        idle();
        say("the microphone isn't available");
        toast(err.message || "microphone blocked");
      });
    },
    async onCancel() {
      await starting;
      if (rec) await rec.stop();
      rec = null;
      idle();
    },
    async onStop() {
      await starting;
      if (!rec) return;
      const chunks = await rec.stop();
      rec = null;
      btn.classList.remove("live");
      btn.innerHTML = "<span>sending…</span>";
      btn.disabled = true;
      const body = new FormData();
      body.append("file", wavBlob(chunks), "reply.wav");
      const res = await fetch(replyUrl, { method: "POST", body }).catch(() => ({ ok: false }));
      if (res.ok) return showSent(c, local);
      btn.disabled = false;
      idle();
      say("that didn't send. try again?");
    },
  });
}

// Write back: her words, typed, in the same heavy type as his draft.
function showWrite(c, local) {
  const actions = document.getElementById("actions");
  actions.innerHTML = `
    <div class="pad-text plain-fade">
      <textarea class="compose-field" id="field" rows="4" maxlength="2000" aria-label="Write back"></textarea>
    </div>
    <p class="t-caption center mt-8 hidden" id="note"></p>
    <div class="pad-card mt-24"><button class="pill" id="send" disabled>Send</button></div>
    <div class="centered mt-8"><button class="text-btn quiet" id="cancel">Cancel</button></div>
    ${callPill(c, local)}`;
  const field = document.getElementById("field");
  const send = document.getElementById("send");
  const note = document.getElementById("note");
  field.focus();
  field.oninput = () => (send.disabled = !field.value.trim());
  document.getElementById("cancel").onclick = () => showActions(c, local);
  send.onclick = async () => {
    send.disabled = true;
    send.textContent = "sending…";
    const body = new FormData();
    body.append("text", field.value.trim());
    const res = await fetch(replyUrl, { method: "POST", body }).catch(() => ({ ok: false })); // offline: say so, don't stick
    if (res.ok) return showSent(c, local);
    send.disabled = false;
    send.textContent = "Send";
    note.textContent = "that didn't send. try again?";
    note.classList.remove("hidden");
  };
}

// Reply-sent state: quiet, and the call is still one tap away.
function showSent(c, local) {
  document.getElementById("actions").innerHTML = `
    <div class="pad-text flex gap-8 plain-fade">
      <span class="c-violet">${CHECK_SVG}</span>
      <p class="t-button">sent. ${esc(c.sender_name)} will hear it.${local ? ` · ${local.sent}` : ""}</p>
    </div>
    ${callPill(c, local)}`;
}

load();
