type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const PRUNE_EVERY = 50;

function prune(now: number) {
  if (store.size < PRUNE_EVERY * 4) return;
  for (const [k, b] of store) {
    if (now >= b.resetAt) store.delete(k);
  }
}

/**
 * Best-effort fixed window limiter (per Node instance). For multi-instance
 * production, use Redis (e.g. Upstash) instead.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  let b = store.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }
  if (b.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
  b.count += 1;
  return { allowed: true };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}
