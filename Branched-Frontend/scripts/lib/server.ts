/**
 * Shared server helper for scripts/shoot.ts and scripts/check-placeholders.ts.
 *
 * Resolution order:
 *   1. BASE_URL env var (used as is, e.g. BASE_URL=http://localhost:3000).
 *   2. http://localhost:3000 if it already responds (a running dev/start server).
 *   3. `next start -p 3123` from this folder. Needs a prior `npm run build`
 *      (.next/BUILD_ID). The server is killed when the script exits.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** The Branched-Frontend folder: nearest ancestor of cwd whose package.json is this app. */
function findRoot(): string {
  let dir = process.cwd();
  for (;;) {
    const pkg = path.join(dir, "package.json");
    if (existsSync(pkg)) {
      try {
        if (JSON.parse(readFileSync(pkg, "utf8")).name === "unsaid-branched-frontend") return dir;
      } catch {
        /* keep walking */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

export const ROOT = findRoot();

const DEFAULT_URL = "http://localhost:3000";
const OWN_PORT = 3123;
const READY_TIMEOUT_MS = 60_000;

async function responds(url: string, timeoutMs = 1500): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "manual" });
    // Any HTTP answer means a server is listening.
    return res.status > 0;
  } catch {
    return false;
  }
}

function killTree(child: ChildProcess): void {
  if (child.exitCode !== null || child.pid === undefined) return;
  try {
    // Negative pid kills the whole process group (detached: true below).
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

async function startOwnServer(): Promise<{ url: string; stop: () => void }> {
  if (!existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    console.error("run npm run build first");
    process.exit(1);
  }
  const url = `http://localhost:${OWN_PORT}`;
  if (await responds(url)) {
    console.error(`port ${OWN_PORT} is already in use; stop that process or set BASE_URL`);
    process.exit(1);
  }

  const nextBin = path.join(ROOT, "node_modules", ".bin", "next");
  const child = spawn(nextBin, ["start", "-p", String(OWN_PORT)], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let log = "";
  child.stdout?.on("data", (d) => (log += d));
  child.stderr?.on("data", (d) => (log += d));

  const stop = () => killTree(child);
  const onSignal = (signal: NodeJS.Signals) => {
    stop();
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.once("exit", stop);
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      console.error(`next start exited with code ${child.exitCode}\n${log}`);
      process.exit(1);
    }
    if (await responds(url)) {
      console.log(`started next start on ${url}`);
      return { url, stop };
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  stop();
  console.error(`next start did not answer on ${url} within ${READY_TIMEOUT_MS / 1000}s\n${log}`);
  process.exit(1);
}

/** Runs `fn` with a base URL (no trailing slash) and stops any server it started. */
export async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const fromEnv = process.env.BASE_URL?.trim();
  if (fromEnv) {
    const url = fromEnv.replace(/\/+$/, "");
    console.log(`using BASE_URL ${url}`);
    return fn(url);
  }
  if (await responds(DEFAULT_URL)) {
    console.log(`using running server ${DEFAULT_URL}`);
    return fn(DEFAULT_URL);
  }
  const own = await startOwnServer();
  try {
    return await fn(own.url);
  } finally {
    own.stop();
  }
}
