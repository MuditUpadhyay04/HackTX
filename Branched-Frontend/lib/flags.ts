"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

/**
 * URL flags shared by every page (spec Phase 0, Step 3 rules 3-5 and Step 4).
 *
 *   ?labels=off      hide the concept label (clean shots)
 *   ?badges=off      hide unread badges
 *   ?dev=1 | on      open the dev panel
 *   ?clock=HH:MM     freeze the story clock at that time; ?clock=frozen freezes it at the story time
 *   ?motion=reduced  force the reduced-motion crossfades
 *   ?frame=bare      render a screen without the stage/device frame
 *   ?toasts=off      never show the "concept only" toast
 *   ?caret=static    draw the text cursor without blinking (screenshots)
 */
export type Flags = {
  labels: boolean;
  badges: boolean;
  dev: boolean;
  clock: string | null;
  motion: "full" | "reduced";
  frame: "stage" | "bare";
  toasts: boolean;
  caret: "blink" | "static";
};

/** Anything with a URLSearchParams-like `get` (URLSearchParams, ReadonlyURLSearchParams). */
type ParamsLike = Pick<URLSearchParams, "get">;

const OFF = new Set(["off", "0", "false", "no"]);
const ON = new Set(["on", "1", "true", "yes"]);
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

function isOff(value: string | null): boolean {
  return value !== null && OFF.has(value.toLowerCase());
}

function isOn(value: string | null): boolean {
  return value !== null && ON.has(value.toLowerCase());
}

/** Pure parser, usable on the server (page `searchParams`), in scripts and in tests. */
export function parseFlags(params: ParamsLike | null | undefined): Flags {
  const get = (key: string) => (params ? params.get(key) : null);
  const clock = get("clock");
  return {
    labels: !isOff(get("labels")),
    badges: !isOff(get("badges")),
    dev: isOn(get("dev")),
    clock: clock === "frozen" || (clock !== null && CLOCK.test(clock)) ? clock : null,
    motion: get("motion") === "reduced" ? "reduced" : "full",
    frame: get("frame") === "bare" ? "bare" : "stage",
    toasts: !isOff(get("toasts")),
    caret: get("caret") === "static" ? "static" : "blink",
  };
}

/** Converts a page's `searchParams` object (string | string[] | undefined values) for `parseFlags`. */
export function paramsFromRecord(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") out.set(key, value);
    else if (Array.isArray(value) && value.length > 0) out.set(key, value[0]);
  }
  return out;
}

/**
 * Client hook. Under `cacheComponents` the calling component must sit inside a
 * `<Suspense>` boundary (useSearchParams is URL data).
 */
export function useFlags(): Flags {
  const params = useSearchParams();
  return useMemo(() => parseFlags(params), [params]);
}
