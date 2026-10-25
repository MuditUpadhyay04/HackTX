// The live rant: mic -> 24 kHz PCM -> the backend's WebSocket relay -> Muse Voice Transcribe.
// Partials stream back while he talks. If the socket fails, the WAV the stream also wrote
// is uploaded to /api/rants/audio instead.
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioStream,
  type AudioStreamBuffer,
} from "expo-audio";
import { useCallback, useRef, useState } from "react";

import { api, wsUrl, type Rant } from "./api";

const TARGET_RATE = 24000;
const BARS = 24; // the waveform's bar count (DESIGN_SPEC 3.7)
const QUIET = Array<number>(BARS).fill(0.08);

export type LiveState = "idle" | "starting" | "recording" | "finishing" | "error";

/** Linear-interpolation resample of int16 mono PCM to 24 kHz. */
function toPcm24k(buffer: AudioStreamBuffer): ArrayBuffer {
  const input = new Int16Array(buffer.data);
  const mono =
    buffer.channels > 1 ? Int16Array.from({ length: input.length / buffer.channels }, (_, i) => input[i * buffer.channels]) : input;
  if (buffer.sampleRate === TARGET_RATE) return mono.buffer.slice(mono.byteOffset, mono.byteOffset + mono.byteLength) as ArrayBuffer;
  const ratio = buffer.sampleRate / TARGET_RATE;
  const out = new Int16Array(Math.floor(mono.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    const j = Math.floor(pos);
    const frac = pos - j;
    out[i] = mono[j] * (1 - frac) + (mono[Math.min(j + 1, mono.length - 1)] ?? 0) * frac;
  }
  return out.buffer as ArrayBuffer;
}

function rms(data: ArrayBuffer) {
  const s = new Int16Array(data);
  let sum = 0;
  for (let i = 0; i < s.length; i += 4) sum += (s[i] / 32768) ** 2;
  return Math.min(1, Math.sqrt(sum / Math.max(1, s.length / 4)) * 4);
}

export function useLiveRant() {
  const [state, setState] = useState<LiveState>("idle");
  const [turns, setTurns] = useState<string[]>([]);
  const [partial, setPartial] = useState("");
  const [levels, setLevels] = useState<number[]>(QUIET);
  const [provider, setProvider] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const ready = useRef(false);
  const queue = useRef<ArrayBuffer[]>([]);
  const fileRecording = useRef(false);
  const asset = useRef<string | null>(null);
  const settle = useRef<{ resolve: (r: Rant) => void; reject: (e: Error) => void } | null>(null);

  const onBuffer = useCallback((buffer: AudioStreamBuffer) => {
    const pcm = toPcm24k(buffer);
    const level = rms(pcm);
    setLevels((prev) => [...prev.slice(1), level]);
    const socket = ws.current;
    if (socket && ready.current && socket.readyState === WebSocket.OPEN) socket.send(pcm);
    else queue.current.push(pcm);
  }, []);

  const { stream } = useAudioStream({ sampleRate: TARGET_RATE, channels: 1, encoding: "int16", onBuffer });

  /** assetId: the gallery photo he's looking at, so the photo remembers what he said. */
  const start = useCallback(async (assetId?: string | null) => {
    asset.current = assetId ?? null;
    setTurns([]);
    setPartial("");
    setState("starting");
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setState("error");
      throw new Error("Microphone access is off for Expo Go. Turn it on in Settings.");
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

    ready.current = false;
    queue.current = [];
    const socket = new WebSocket(wsUrl("/api/rants/live"));
    socket.binaryType = "arraybuffer";
    ws.current = socket;
    socket.onopen = () => socket.send(JSON.stringify({ type: "start", asset_id: asset.current }));
    socket.onmessage = (e) => {
      const ev = JSON.parse(String(e.data));
      if (ev.type === "ready") {
        ready.current = true;
        setProvider(ev.provider);
        queue.current.forEach((b) => socket.send(b));
        queue.current = [];
      } else if (ev.type === "partial") {
        setPartial(ev.text);
      } else if (ev.type === "turn") {
        setTurns((t) => [...t, ev.text]);
        setPartial("");
      } else if (ev.type === "done") {
        settle.current?.resolve(ev.rant);
        settle.current = null;
      } else if (ev.type === "error") {
        settle.current?.reject(new Error(ev.message));
        settle.current = null;
      }
    };
    socket.onerror = socket.onclose = () => {
      ready.current = false;
      settle.current?.reject(new Error("live transcription disconnected"));
      settle.current = null;
    };

    await stream.start();
    try {
      await stream.startFileRecordingAsync({ format: "wav" });
      fileRecording.current = true;
    } catch {
      fileRecording.current = false;
    }
    setState("recording");
  }, [stream]);

  /** Stops, waits for the saved rant. Falls back to uploading the WAV. */
  const stop = useCallback(async (): Promise<Rant> => {
    setState("finishing");
    let wav: { uri: string; sampleRate: number } | null = null;
    if (fileRecording.current) {
      try {
        wav = await stream.stopFileRecordingAsync();
      } catch {}
      fileRecording.current = false;
    }
    stream.stop();
    setLevels(QUIET);

    const socket = ws.current;
    const live = new Promise<Rant>((resolve, reject) => {
      settle.current = { resolve, reject };
      if (!socket || socket.readyState !== WebSocket.OPEN || !ready.current) reject(new Error("not connected"));
      else socket.send(JSON.stringify({ type: "stop" }));
      setTimeout(() => reject(new Error("timed out")), 30000);
    });
    try {
      const rant = await live;
      setState("idle");
      return rant;
    } catch (liveError) {
      socket?.close();
      if (!wav || wav.sampleRate !== TARGET_RATE) {
        setState("error");
        throw liveError;
      }
      const rant = await api.uploadRant(wav.uri, asset.current);
      setState("idle");
      return rant;
    } finally {
      ws.current = null;
    }
  }, [stream]);

  const cancel = useCallback(() => {
    try {
      stream.stop();
    } catch {}
    ws.current?.close();
    ws.current = null;
    setTurns([]);
    setPartial("");
    setLevels(QUIET);
    setState("idle");
  }, [stream]);

  return { state, turns, partial, levels, provider, start, stop, cancel };
}
