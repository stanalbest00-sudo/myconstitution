"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AskResult, Citation } from "@/lib/ai";
import { useI18n } from "./I18nProvider";
import { ReadAloud } from "./ReadAloud";

type State =
  | { phase: "loading" }
  | { phase: "done"; result: AskResult }
  | { phase: "error"; kind: "rateLimited" | "failed" | "offline" };

function hl(c: Citation) {
  return c.href;
}

function CitationCard({ c, index }: { c: Citation; index: number }) {
  const { t } = useI18n();
  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-xs font-bold tabular-nums text-muted">{index + 1}</span>
        <Link href={hl(c)} className="link text-base font-semibold">{c.label}</Link>
        {c.heading && <span className="text-sm text-muted">{c.heading}</span>}
      </div>
      {c.relevance && <p className="mt-1.5 text-[0.95rem]">{c.relevance}</p>}
      <blockquote className="mt-2 border-l-2 border-accent pl-3 font-serif text-[0.95rem] leading-relaxed text-muted" lang="en">
        {c.excerpt}
      </blockquote>
      <Link href={hl(c)} className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">
        {t.answer.readFull} →
      </Link>
    </li>
  );
}

export function Answer({ question }: { question: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ phase: "loading" }); // eslint-disable-line react-hooks/set-state-in-effect -- reset when the question changes
    fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (res.status === 429) return setState({ phase: "error", kind: "rateLimited" });
        if (!res.ok) return setState({ phase: "error", kind: "failed" });
        setState({ phase: "done", result: (await res.json()) as AskResult });
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setState({ phase: "error", kind: typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "failed" });
      });
    return () => ctrl.abort();
  }, [question]);

  if (state.phase === "loading") {
    return (
      <div role="status" aria-live="polite" className="card space-y-3 p-5">
        <p className="text-sm font-medium text-muted">{t.ask.searching}</p>
        <div className="skeleton h-4 w-11/12" /><div className="skeleton h-4 w-9/12" /><div className="skeleton h-4 w-10/12" />
      </div>
    );
  }
  if (state.phase === "error") {
    return <div role="alert" className="card border-warn bg-warn-soft p-5 text-warn">{t.answer[state.kind]}</div>;
  }

  const r = state.result;
  const lang = r.language === "crs" || r.language === "fr" ? r.language : "en";

  if (r.mode === "retrieval") {
    return (
      <section aria-live="polite" className="rise space-y-4">
        {r.notice && <p className="card bg-surface-2 p-4 text-sm">{t.answer.notice[r.notice]}</p>}
        {r.citations.length ? (
          <>
            <h2 className="display text-xl font-semibold">{t.answer.retrievalTitle}</h2>
            <ReadAloud
              lang="en"
              text={[`${t.answer.retrievalTitle}.`, ...r.citations.map((c) => `${c.label}${c.heading ? `, ${c.heading}` : ""}. ${c.excerpt}`)].join(" ")}
            />
            <ol className="space-y-3">{r.citations.map((c, i) => <CitationCard key={c.id} c={c} index={i} />)}</ol>
          </>
        ) : (
          <NotFound />
        )}
      </section>
    );
  }

  if (r.status !== "answered") {
    return (
      <section aria-live="polite" className="rise space-y-3">
        {r.shortAnswer && (
          <div className="card p-5" lang={lang}>
            <AiBadge />
            <p className="mt-2 text-lg">{r.shortAnswer}</p>
          </div>
        )}
        <NotFound outOfScope={r.status === "out_of_scope"} />
      </section>
    );
  }

  return (
    <article aria-live="polite" className="rise space-y-6">
      <section className="card border-ai/40 p-5 sm:p-6" lang={lang}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiBadge />
          <ReadAloud
            lang={lang}
            text={[
              t.tts.aiIntro,
              `${t.answer.short}. ${r.shortAnswer}`,
              `${t.answer.means}. ${r.whatThisMeans}`,
              r.limitations.length ? `${t.answer.limits}. ${r.limitations.join(" ")}` : "",
              r.citations.length ? `${t.answer.provisions}: ${r.citations.map((c) => `${c.label}. ${c.relevance}`).join(" ")}` : "",
            ].join(" ")}
          />
        </div>
        <h2 className="eyebrow mt-3">{t.answer.short}</h2>
        <p className="mt-1 text-lg leading-relaxed">{r.shortAnswer}</p>

        <h2 className="eyebrow mt-6">{t.answer.means}</h2>
        {r.whatThisMeans.split(/\n{2,}/).map((p, i) => <p key={i} className="mt-1.5 leading-relaxed">{p}</p>)}

        {r.limitations.length > 0 && (
          <>
            <h2 className="eyebrow mt-6">{t.answer.limits}</h2>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-5">{r.limitations.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </>
        )}
        {r.unverifiedMentions.length > 0 && (
          <p role="note" className="mt-5 rounded-lg bg-warn-soft p-3 text-sm text-warn">
            {t.answer.unverified} {r.unverifiedMentions.map((n) => `${t.reader.article} ${n}`).join(", ")}.
          </p>
        )}
        <p className="mt-5 border-t border-line pt-3 text-sm text-muted">{t.answer.aiNote}</p>
      </section>

      <section>
        <h2 className="display text-xl font-semibold">{t.answer.provisions}</h2>
        <ol className="mt-3 space-y-3">{r.citations.map((c, i) => <CitationCard key={c.id} c={c} index={i} />)}</ol>
      </section>
    </article>
  );
}

function AiBadge() {
  const { t } = useI18n();
  return (
    <span className="badge bg-ai-soft text-ai">
      <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.200 6.800L21 11l-6.800 2.200L12 20l-2.200-6.800L3 11l6.800-2.200z" /></svg>
      {t.answer.aiLabel}
    </span>
  );
}

function NotFound({ outOfScope = false }: { outOfScope?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="card p-5">
      <p className="font-semibold">{outOfScope ? t.answer.outOfScope : t.answer.notFound}</p>
      <p className="mt-1 text-muted">{t.answer.notFoundHelp}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/topics" className="chip">{t.topics.title}</Link>
        <Link href="/constitution" className="chip">{t.home.browseCta}</Link>
      </div>
    </div>
  );
}
