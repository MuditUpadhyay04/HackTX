// Turns the mic into what Muse Voice Transcribe wants: 16-bit mono PCM at 24 kHz,
// posted in 80 ms frames. Resamples from whatever rate the device runs at.
const TARGET_RATE = 24000;
const FRAME = 1920; // 80 ms at 24 kHz

class Pcm24k extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / TARGET_RATE;
    this.input = [];
    this.pos = 0;
    this.out = new Int16Array(FRAME);
    this.fill = 0;
    this.sumSquares = 0;
    this.port.onmessage = (e) => {
      if (e.data === "flush" && this.fill > 0) this.post(this.fill);
    };
  }

  post(length) {
    const frame = this.out.slice(0, length);
    const level = Math.sqrt(this.sumSquares / Math.max(length, 1));
    this.port.postMessage({ pcm: frame.buffer, level }, [frame.buffer]);
    this.fill = 0;
    this.sumSquares = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) this.input.push(channel[i]);
    while (this.pos + 1 < this.input.length) {
      const i = Math.floor(this.pos);
      const frac = this.pos - i;
      const s = this.input[i] * (1 - frac) + this.input[i + 1] * frac;
      const clamped = Math.max(-1, Math.min(1, s));
      this.out[this.fill++] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      this.sumSquares += clamped * clamped;
      if (this.fill === FRAME) this.post(FRAME);
      this.pos += this.ratio;
    }
    const used = Math.floor(this.pos);
    this.input = this.input.slice(used);
    this.pos -= used;
    return true;
  }
}

registerProcessor("pcm-24k", Pcm24k);
