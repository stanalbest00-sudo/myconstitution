import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, limit, resetLimits } from "@/lib/ratelimit";

describe("rate limiter", () => {
  beforeEach(() => resetLimits());

  it("allows up to the maximum, then blocks until the window resets", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(limit("k", 3, 60_000, t0 + i).ok).toBe(true);
    const blocked = limit("k", 3, 60_000, t0 + 10);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);
    expect(limit("k", 3, 60_000, t0 + 60_001).ok).toBe(true);
  });

  it("tracks clients separately", () => {
    expect(limit("a", 1, 1000, 0).ok).toBe(true);
    expect(limit("a", 1, 1000, 1).ok).toBe(false);
    expect(limit("b", 1, 1000, 1).ok).toBe(true);
  });

  it("derives the client key from proxy headers", () => {
    expect(clientKey(new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } }))).toBe("203.0.113.7");
    expect(clientKey(new Request("http://x"))).toBe("unknown");
  });
});
