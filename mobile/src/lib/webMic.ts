// The microphone in a phone browser (the web build; expo-audio's AudioStream is native only).
// Same output as the native path: 16-bit mono PCM at 24 kHz in ~80 ms frames, for the live
// WebSocket, plus the whole take as a WAV for the upload fallback. Ported from backend/web/audio.js.

const TARGET_RATE = 24000;

// The AudioWorklet that resamples to 24 kHz (backend/web/pcm-worklet.js), loaded from a Blob URL.
const WORKLET = `
const TARGET_RATE = ${TARGET_RATE};
const FRAME = 1920;
class Pcm24k extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / TARGET_RATE; this.input = []; this.pos = 0;
    this.out = new Int16Array(FRAME); this.fill = 0;
    this.port.onmessage = (e) => { if (e.data === "flush" && this.fill > 0) this.post(this.fill); };
  }
  post(length) { const f = this.out.slice(0, length); this.port.postMessage(f.buffer, [f.buffer]); this.fill = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) this.input.push(ch[i]);
    while (this.pos + 1 < this.input.length) {
      const i = Math.floor(this.pos), frac = this.pos - i;
      const s = Math.max(-1, Math.min(1, this.input[i] * (1 - frac) + this.input[i + 1] * frac));
      this.out[this.fill++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.fill === FRAME) this.post(FRAME);
      this.pos += this.ratio;
    }
    const used = Math.floor(this.pos); this.input = this.input.slice(used); this.pos -= used;
    return true;
  }
}
registerProcessor("pcm-24k", Pcm24k);
`;

export type WebMic = { stop: () => Promise<Blob> };

type Ctx = typeof AudioContext;

/** Must be called straight from the tap (before any await), or iOS Safari keeps the audio context suspended. */
export function openWebMic(onFrame: (pcm: ArrayBuffer) => void): Promise<WebMic> {
  // TRY (needs Gurneal's OK): the three microphone messages below.
  if (typeof window === "undefined" || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(new Error("This page can't use the microphone here. Open it over https, or type it instead."));
  }
  const AC: Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: Ctx }).webkitAudioContext;
  const ctx = new AC();
  const resumed = ctx.resume();
  return (async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      await ctx.close().catch(() => {});
      const name = (e as { name?: string }).name;
      throw new Error(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Allow the microphone in your browser settings, or type it instead."
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "There's no microphone on this device. Type it instead."
            : "This browser can't use the microphone. Type it instead.",
      );
    }
    await resumed.catch(() => {});
    const chunks: ArrayBuffer[] = [];
    const take = (pcm: ArrayBuffer) => {
      chunks.push(pcm);
      onFrame(pcm);
    };
    const source = ctx.createMediaStreamSource(stream);
    const mute = ctx.createGain();
    mute.gain.value = 0; // keeps the graph pulled; plays nothing
    let flush: () => void = () => {};
    let disconnect: () => void;

    if (ctx.audioWorklet) {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(ctx, "pcm-24k");
      node.port.onmessage = (e) => take(e.data as ArrayBuffer);
      source.connect(node);
      node.connect(mute).connect(ctx.destination);
      flush = () => node.port.postMessage("flush");
      disconnect = () => {
        source.disconnect();
        node.disconnect();
      };
    } else {
      // Older browsers: ScriptProcessor, resampled on the main thread.
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      const ratio = ctx.sampleRate / TARGET_RATE;
      proc.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const out = new Int16Array(Math.floor(input.length / ratio));
        for (let i = 0; i < out.length; i++) {
          const s = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]));
          out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        take(out.buffer);
      };
      source.connect(proc);
      proc.connect(mute).connect(ctx.destination);
      disconnect = () => {
        source.disconnect();
        proc.disconnect();
      };
    }

    return {
      async stop() {
        flush();
        await new Promise((r) => setTimeout(r, 60));
        disconnect();
        stream.getTracks().forEach((t) => t.stop());
        await ctx.close().catch(() => {});
        return wavBlob(chunks);
      },
    };
  })();
}

function wavBlob(chunks: ArrayBuffer[], rate = TARGET_RATE): Blob {
  const length = chunks.reduce((n, c) => n + c.byteLength, 0);
  const header = new DataView(new ArrayBuffer(44));
  const text = (offset: number, s: string) => [...s].forEach((ch, i) => header.setUint8(offset + i, ch.charCodeAt(0)));
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
