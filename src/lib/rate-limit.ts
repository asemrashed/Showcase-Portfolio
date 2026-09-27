import { rateLimited } from "@/lib/errors";

type Bucket = { count: number; resetAt: number };
const g = globalThis as unknown as { __rl?: Map<string, Bucket> };
const store: Map<string, Bucket> = (g.__rl ??= new Map());
const MAX_KEYS = 5000;

/**
 * In-memory fixed-window limiter with LRU eviction.
 * Per server instance only — swap for Redis/Upstash if you scale horizontally.
 */
export function rateLimit(key: string, opts: { limit: number; windowMs: number }) {
  const now = Date.now();
  let b = store.get(key);
  if (!b || b.resetAt <= now) b = { count: 0, resetAt: now + opts.windowMs };
  b.count++;
  store.delete(key);
  store.set(key, b); // move to most-recent position
  if (store.size > MAX_KEYS) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  return {
    ok: b.count <= opts.limit,
    remaining: Math.max(0, opts.limit - b.count),
    retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
  };
}

export function assertRate(key: string, opts: { limit: number; windowMs: number }) {
  const r = rateLimit(key, opts);
  if (!r.ok) throw rateLimited(r.retryAfter);
}

export function clientIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
