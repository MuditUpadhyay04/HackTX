// Mic capture as 24 kHz PCM frames, plus WAV packing. Shared by the app and the card page.

export async function startPcm({ onChunk, onLevel } = {}) {
  // Create the context inside the tap, before any await, so iOS lets it run.
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const resumed = ctx.resume();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  await resumed;
  await ctx.audioWorklet.addModule(new URL("./pcm-worklet.js", import.meta.url));
  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "pcm-24k");
  const mute = ctx.createGain();
  mute.gain.value = 0;
  const chunks = [];
  node.port.onmessage = (e) => {
    const bytes = new Uint8Array(e.data.pcm);
    chunks.push(bytes);
    onChunk && onChunk(bytes);
    onLevel && onLevel(e.data.level);
  };
  source.connect(node);
  node.connect(mute).connect(ctx.destination); // keeps the worklet pulled; outputs silence

  return {
    async stop() {
      node.port.postMessage("flush");
      await new Promise((r) => setTimeout(r, 60));
      source.disconnect();
      node.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      await ctx.close();
      return chunks;
    },
  };
}

export function wavBlob(chunks, rate = 24000) {
  const length = chunks.reduce((n, c) => n + c.byteLength, 0);
  const header = new DataView(new ArrayBuffer(44));
  const text = (offset, s) => [...s].forEach((ch, i) => header.setUint8(offset + i, ch.charCodeAt(0)));
  text(0, "RIFF");
  header.setUint32(4, 36 + length, true);
  text(8, "WAVE");
  text(12, "fmt ");
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true); // PCM
  header.setUint16(22, 1, true); // mono
  header.setUint32(24, rate, true);
  header.setUint32(28, rate * 2, true);
  header.setUint16(32, 2, true);
  header.setUint16(34, 16, true);
  text(36, "data");
  header.setUint32(40, length, true);
  return new Blob([header.buffer, ...chunks], { type: "audio/wav" });
}

// Press and hold to talk; a quick tap toggles instead (easier on a desk).
export function holdToTalk(button, { onStart, onStop }) {
  let active = false;
  let pressedAt = 0;
  let toggled = false;
  button.addEventListener("pointerdown", async (e) => {
    e.preventDefault();
    try { button.setPointerCapture(e.pointerId); } catch { /* not supported */ }
    if (active && toggled) {
      active = toggled = false;
      onStop();
      return;
    }
    if (active) return;
    active = true;
    pressedAt = performance.now();
    onStart();
  });
  const release = () => {
    if (!active || toggled) return;
    if (performance.now() - pressedAt < 450) {
      toggled = true; // short tap: keep listening until the next tap
      return;
    }
    active = false;
    onStop();
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("contextmenu", (e) => e.preventDefault());
  return {
    get toggled() {
      return toggled;
    },
  };
}
