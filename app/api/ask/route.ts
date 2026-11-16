import { z } from "zod";
import { aiConfigured, anthropicLlm, ask, MAX_QUESTION_CHARS, type AskResult, type Llm } from "@/lib/ai";
import { clientKey, limit, tooMany } from "@/lib/ratelimit";

export const maxDuration = 90;

const Body = z.object({ question: z.string().trim().min(3).max(MAX_QUESTION_CHARS) });

let llm: Llm | null = null;

export async function POST(req: Request) {
  const ip = clientKey(req);
  const perMinute = limit(`ask:m:${ip}`, Number(process.env.ASK_LIMIT_PER_MINUTE || 6), 60_000);
  if (!perMinute.ok) return tooMany(perMinute);
  const perDay = limit(`ask:d:${ip}`, Number(process.env.ASK_LIMIT_PER_DAY || 60), 86_400_000);
  if (!perDay.ok) return tooMany(perDay);

  const type = req.headers.get("content-type") || "";
  if (!type.includes("application/json")) return Response.json({ error: "unsupported_media_type" }, { status: 415 });
  const length = Number(req.headers.get("content-length") || 0);
  if (length > 4096) return Response.json({ error: "payload_too_large" }, { status: 413 });

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!parsed.success) return Response.json({ error: "invalid_question" }, { status: 400 });

  let notice: AskResult["notice"];
  let useLlm: Llm | null = null;
  if (aiConfigured()) {
    // Site-wide ceiling on paid AI calls per day (per server instance).
    const global = limit("ask:global", Number(process.env.AI_DAILY_LIMIT || 1000), 86_400_000);
    if (global.ok) useLlm = llm ??= anthropicLlm();
    else notice = "daily_limit";
  }

  const result = await ask(parsed.data.question, useLlm, notice);
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
