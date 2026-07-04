import { logger } from "./logger";

interface WindowEntry {
  timestamps: number[];
}

const windows = new Map<string, WindowEntry>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function prune() {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, entry] of windows) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) windows.delete(key);
  }
}

let pruneTimer: ReturnType<typeof setInterval> | null = null;
function ensurePruneTimer() {
  if (!pruneTimer) {
    pruneTimer = setInterval(prune, 30_000).unref?.() ?? setInterval(prune, 30_000);
  }
}

export function checkRateLimit(identifier: string): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  ensurePruneTimer();

  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let entry = windows.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    windows.set(identifier, entry);
  }

  entry.timestamps = entry.timestamps.filter(t => t > cutoff);

  const count = entry.timestamps.length;
  const success = count < MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - count - (success ? 1 : 0));
  const reset = entry.timestamps.length > 0
    ? Math.ceil((entry.timestamps[0] + WINDOW_MS) / 1000)
    : Math.ceil((now + WINDOW_MS) / 1000);

  if (success) {
    entry.timestamps.push(now);
  } else {
    logger.warn({ identifier, remaining, reset }, "Rate limit exceeded");
  }

  return { success, limit: MAX_REQUESTS, remaining, reset };
}
