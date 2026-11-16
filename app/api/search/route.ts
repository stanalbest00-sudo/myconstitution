import { editorialLabel, href } from "@/lib/constitution";
import { clientKey, limit, tooMany } from "@/lib/ratelimit";
import { search, snippet } from "@/lib/search";

export async function GET(req: Request) {
  const rl = limit(`search:${clientKey(req)}`, Number(process.env.SEARCH_LIMIT_PER_MINUTE || 60), 60_000);
  if (!rl.ok) return tooMany(rl);

  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (q.length < 2 || q.length > 500) return Response.json({ error: "invalid_query" }, { status: 400 });

  const results = search(q, 12).map((h) => ({
    id: h.provision.id,
    label: h.provision.label,
    heading: editorialLabel(h.provision),
    href: href(h.provision),
    excerpt: snippet(h.provision, h.terms),
    terms: h.terms,
  }));
  return Response.json({ query: q, results }, { headers: { "Cache-Control": "no-store" } });
}
