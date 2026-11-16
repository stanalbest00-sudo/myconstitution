import { beforeEach, describe, expect, it } from "vitest";
import { POST as askRoute } from "@/app/api/ask/route";
import { GET as searchRoute } from "@/app/api/search/route";
import { resetLimits } from "@/lib/ratelimit";

let n = 0;
const post = (body: unknown, headers: Record<string, string> = {}) =>
  askRoute(new Request("http://localhost/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${n++ % 250}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));

describe("POST /api/ask", () => {
  beforeEach(() => { resetLimits(); delete process.env.ANTHROPIC_API_KEY; });

  it("works without an API key by returning matching provisions", async () => {
    const res = await post({ question: "Can the police search my house?" });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const json = await res.json();
    expect(json).toMatchObject({ mode: "retrieval", notice: "ai_not_configured" });
    expect(json.citations.map((c: { id: string }) => c.id)).toContain("article-20");
  });

  it("rejects malformed, empty, over-long and wrongly typed input", async () => {
    expect((await post("{not json")).status).toBe(400);
    expect((await post({ question: "" })).status).toBe(400);
    expect((await post({ question: "ab" })).status).toBe(400);
    expect((await post({ question: 42 })).status).toBe(400);
    expect((await post({ question: "x".repeat(501) })).status).toBe(400);
    expect((await post({ question: "ok question" }, { "content-type": "text/plain" })).status).toBe(415);
    expect((await post({ question: "ok question" }, { "content-length": "999999" })).status).toBe(413);
  });

  it("rate limits repeated questions from one client", async () => {
    const codes: number[] = [];
    for (let i = 0; i < 8; i++) codes.push((await post({ question: "freedom of expression" }, { "x-forwarded-for": "198.51.100.9" })).status);
    expect(codes.slice(0, 6)).toEqual([200, 200, 200, 200, 200, 200]);
    expect(codes[6]).toBe(429);
    const other = await post({ question: "freedom of expression" }, { "x-forwarded-for": "198.51.100.10" });
    expect(other.status).toBe(200);
  });
});

describe("GET /api/search", () => {
  beforeEach(() => resetLimits());
  const get = (q: string) => searchRoute(new Request(`http://localhost/api/search?q=${encodeURIComponent(q)}`));

  it("returns provisions with excerpts taken from the text", async () => {
    const json = await (await get("freedom of expression")).json();
    expect(json.results[0]).toMatchObject({ id: "article-22", label: "Article 22", href: "/constitution/article-22" });
  });

  it("validates the query", async () => {
    expect((await get("")).status).toBe(400);
    expect((await get("x".repeat(600))).status).toBe(400);
  });
});
