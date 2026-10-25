// The live rant: mic -> 24 kHz PCM -> the backend's WebSocket relay -> Muse Voice Transcribe.
// Partials stream back while he talks. If the socket fails, the WAV the stream also wrote
// is uploaded to /api/rants/audio instead.
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioStream,
  type AudioStreamBuffer,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { api, wsUrl, type Rant } from "./api";
import { openWebMic, type WebMic } from "./webMic";

const TARGET_RATE = 24000;
const BARS = 24; // the waveform's bar count (DESIGN_SPEC 3.7)
const QUIET = Array<number>(BARS).fill(0.08);

export type LiveState = "idle" | "starting" | "recording" | "finishing" | "error";

/** Out of record mode, so playback is full volume and works with the silent switch on. */
export const playbackMode = () => setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});

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

  const mic = useRef<WebMic | null>(null); // the web build's microphone (lib/webMic.ts)

  const sendPcm = useCallback((pcm: ArrayBuffer) => {
    const level = rms(pcm);
    setLevels((prev) => [...prev.slice(1), level]);
    const socket = ws.current;
    if (socket && ready.current && socket.readyState === WebSocket.OPEN) socket.send(pcm);
    else queue.current.push(pcm);
  }, []);

  const onBuffer = useCallback((buffer: AudioStreamBuffer) => sendPcm(toPcm24k(buffer)), [sendPcm]);

  // Web: if the page is hidden or closed mid-recording, let go of the mic (iOS keeps the red dot otherwise).
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const release = () => {
      if (!mic.current || (document.visibilityState === "visible" && !document.hidden)) return;
      mic.current.stop().catch(() => {});
      mic.current = null;
      ws.current?.close();
      ws.current = null;
      setLevels(QUIET);
      setState("idle");
    };
    const onHide = () => {
      if (mic.current) {
        mic.current.stop().catch(() => {});
        mic.current = null;
      }
    };
    document.addEventListener("visibilitychange", release);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", release);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  const { stream } = useAudioStream({ sampleRate: TARGET_RATE, channels: 1, encoding: "int16", onBuffer });

  /** assetId: the gallery photo he's looking at, so the photo remembers what he said. */
  const start = useCallback(async (assetId?: string | null) => {
    // Web: open the mic before any await, inside the tap, or iOS Safari keeps audio suspended.
    const webMic = Platform.OS === "web" ? openWebMic(sendPcm) : null;
    webMic?.catch(() => {}); // awaited below; this only stops an unhandled-rejection warning
    asset.current = assetId ?? null;
    setTurns([]);
    setPartial("");
    setState("starting");
    if (!webMic) {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setState("error");
        throw new Error("Microphone access is off for Expo Go. Turn it on in Settings.");
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    }

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

    if (webMic) {
      try {
        mic.current = await webMic;
      } catch (e) {
        socket.close();
        ws.current = null;
        setState("error");
        throw e;
      }
      setState("recording");
      return;
    }
    await stream.start();
    try {
      await stream.startFileRecordingAsync({ format: "wav" });
      fileRecording.current = true;
    } catch {
      fileRecording.current = false;
    }
    setState("recording");
  }, [stream, sendPcm]);

  /** Stops, waits for the saved rant. Falls back to uploading the WAV. */
  const stop = useCallback(async (): Promise<Rant> => {
    setState("finishing");
    let wav: { uri: string; sampleRate: number } | null = null;
    let webWav: Blob | null = null;
    if (mic.current) {
      try {
        webWav = await mic.current.stop();
      } catch {}
      mic.current = null;
    } else {
      if (fileRecording.current) {
        try {
          wav = await stream.stopFileRecordingAsync();
        } catch {}
        fileRecording.current = false;
      }
      stream.stop();
    }
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
      const upload = webWav && webWav.size > 44 ? webWav : wav && wav.sampleRate === TARGET_RATE ? wav.uri : null;
      if (!upload) {
        setState("error");
        throw liveError;
      }
      let rant: Rant;
      try {
        rant = await api.uploadRant(upload, asset.current);
      } catch (uploadError) {
        setState("error"); // never leave the mic stuck on "sorting"
        throw uploadError;
      }
      setState("idle");
      return rant;
    } finally {
      ws.current = null;
      playbackMode(); // her voice note must play, even on silent
    }
  }, [stream]);

  const cancel = useCallback(() => {
    if (mic.current) {
      mic.current.stop().catch(() => {});
      mic.current = null;
    } else {
      try {
        stream.stop();
      } catch {}
    }
    ws.current?.close();
    ws.current = null;
    setTurns([]);
    setPartial("");
    setLevels(QUIET);
    setState("idle");
    playbackMode();
  }, [stream]);

  return { state, turns, partial, levels, provider, start, stop, cancel };
}
