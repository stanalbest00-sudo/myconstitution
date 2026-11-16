/**
 * Fixed-window in-memory rate limiter.
 *
 * Good enough for a single server process. On serverless hosting each warm
 * instance keeps its own counters, so treat these as a floor of protection and
 * add a shared store (e.g. Upstash / Vercel KV) or a platform WAF rule before
 * heavy public traffic. See docs/SECURITY.md.
 */
interface Window { count: number; resetAt: number }
const buckets = new Map<string, Window>();
const MAX_KEYS = 20_000;

export interface LimitResult { ok: boolean; remaining: number; retryAfterSeconds: number }

export function limit(key: string, max: number, windowMs: number, now = Date.now()): LimitResult {
  let w = buckets.get(key);
  if (!w || w.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    w = { count: 0, resetAt: now + windowMs };
    buckets.set(key, w);
  }
  w.count++;
  const ok = w.count <= max;
  return { ok, remaining: Math.max(0, max - w.count), retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
}

export function resetLimits(): void {
  buckets.clear();
}

/** Best-effort client identifier. The IP is used only as a counter key and is never logged or stored. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
}

export function tooMany(r: LimitResult): Response {
  return Response.json(
    { error: "rate_limited", retryAfterSeconds: r.retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(r.retryAfterSeconds) } },
  );
}
