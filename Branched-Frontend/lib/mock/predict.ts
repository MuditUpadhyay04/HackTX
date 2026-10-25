/**
 * lib/mock/predict.ts: the predictive bar's three words (Phase 2 INTERACTIVE MESSAGING:
 * "a small local word list, seeded with the storyboard words").
 */
import { SCRIPT_PREDICTIONS, TYPED_SCRIPT } from "./threads";

type ScriptThread = keyof typeof TYPED_SCRIPT;

/** Every word from the three scripts and their predictive bars, plus his usual words from the seeds. */
const WORDS = Array.from(
  new Set(
    [
      ...Object.values(TYPED_SCRIPT).flatMap((s) => s.split(" ")),
      ...Object.values(SCRIPT_PREDICTIONS).flat(),
      "k",
      "yeah",
      "good",
      "lol",
      "lmao",
      "literally",
      "last",
      "night",
      "everything's",
    ].map((w) => w.toLowerCase()),
  ),
);

function isScriptThread(id: string): id is ScriptThread {
  return id in TYPED_SCRIPT;
}

/** The partial word at the end of the draft ("love you t" -> "t"). */
export function partialWord(draft: string): string {
  const m = /(\S*)$/.exec(draft);
  return m ? m[1] : "";
}

/**
 * Three words for the bar. While the draft is a prefix of the thread's script (or empty) the bar
 * shows that script's words exactly; otherwise words from the list that start with the partial word.
 */
export function predictions(threadId: string, draft: string): string[] {
  if (isScriptThread(threadId)) {
    const script = TYPED_SCRIPT[threadId];
    if (draft.length === 0 || script.startsWith(draft)) return [...SCRIPT_PREDICTIONS[threadId]];
  }
  const part = partialWord(draft).toLowerCase();
  const pool = part ? WORDS.filter((w) => w.startsWith(part) && w !== part) : WORDS;
  const out = pool.slice(0, 3);
  for (const w of WORDS) {
    if (out.length >= 3) break;
    if (!out.includes(w)) out.push(w);
  }
  return out;
}
