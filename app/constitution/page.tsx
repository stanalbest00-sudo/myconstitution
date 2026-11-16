import type { Metadata } from "next";
import Link from "next/link";
import { ProvisionBody } from "@/components/ProvisionBody";
import { SourceNote } from "@/components/SourceNote";
import { Toc, type TocGroup, type TocItem } from "@/components/Toc";
import { chapters, chapterTitle, editorialLabel, provisions, schedules, titleCase } from "@/lib/constitution";
import { getI18n } from "@/lib/i18n";
import { search, snippet } from "@/lib/search";
import type { Provision } from "@/lib/types";

export const metadata: Metadata = { title: "Browse the Constitution" };

const item = (p: Provision): TocItem => ({
  id: p.id,
  label: p.kind === "schedule" ? (p.sectionHeading ?? p.label) : p.label,
  heading: p.kind === "schedule" ? null : editorialLabel(p),
  repealed: p.repealed,
  keywords: "",
});

export default async function ConstitutionIndex({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { t } = await getI18n();
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 200);
  const hits = q.length >= 2 ? search(q, 20) : [];

  const groups: TocGroup[] = [
    { anchor: "preamble", eyebrow: "", title: t.reader.preamble, sub: [{ title: null, items: [{ id: "preamble", label: t.reader.preamble, heading: null, keywords: "" }] }] },
    ...chapters.map((c) => ({
      anchor: `chapter-${c.number.toLowerCase()}`,
      eyebrow: `${t.reader.chapter} ${c.number}`,
      title: chapterTitle(c) ?? `${t.reader.chapter} ${c.number}`,
      sub: c.parts.length
        ? c.parts.map((part) => ({
            title: `${t.reader.part} ${part.number}: ${part.title ? titleCase(part.title) : ""}`,
            items: provisions.filter((p) => p.chapter === c.number && p.part === part.number).map(item),
          }))
        : [{ title: null, items: provisions.filter((p) => p.chapter === c.number).map(item) }],
    })),
    ...schedules.map((s) => ({
      anchor: `schedule-${s.number}`,
      eyebrow: `${t.reader.schedule} ${s.number}`,
      title: s.title ? titleCase(s.title) : `${t.reader.schedule} ${s.number}`,
      sub: [{ title: null, items: provisions.filter((p) => p.schedule === s.number).map(item) }],
    })),
  ];

  return (
    <div className="wrap py-8">
      <h1 className="display text-3xl font-semibold sm:text-4xl">Constitution of the Republic of Seychelles</h1>
      <div className="mt-4 max-w-3xl"><SourceNote t={t} /></div>

      <form action="/constitution" method="get" role="search" className="mt-6 flex max-w-2xl gap-2">
        <label className="flex-1">
          <span className="sr-only">Search the text of the Constitution</span>
          <input name="q" type="search" defaultValue={q} minLength={2} maxLength={200} placeholder="Search the text, e.g. freedom of expression"
            className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-base" />
        </label>
        <button className="btn btn-primary">Search</button>
      </form>

      {q && (
        <section className="mt-6 max-w-3xl" aria-labelledby="results-h">
          <h2 id="results-h" className="display text-xl font-semibold">
            {t.search.title}: <span className="text-accent">{q}</span>
          </h2>
          <p className="text-sm text-muted" role="status">{hits.length} {t.search.count}</p>
          {hits.length === 0 ? (
            <p className="card mt-3 p-4">{t.search.none}</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {hits.map((h) => {
                const hl = h.terms.length ? `?hl=${encodeURIComponent(h.terms.join(","))}` : "";
                return (
                  <li key={h.provision.id} className="card p-4">
                    <Link href={`/constitution/${h.provision.id}${hl}`} className="link font-semibold">{h.provision.label}</Link>{" "}
                    <span className="text-sm text-muted">{editorialLabel(h.provision)}</span>
                    <div className="mt-1 text-[0.95rem] text-muted [&_.legal]:text-[0.95rem] [&_.legal]:leading-relaxed">
                      <ProvisionBody content={[{ t: "p", text: snippet(h.provision, h.terms) }]} terms={h.terms} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-3"><Link href="/constitution" className="link">Clear search</Link></p>
        </section>
      )}

      <nav aria-label={t.reader.toc} className="no-print mt-8 flex gap-2 overflow-x-auto pb-2">
        {chapters.map((c) => (
          <a key={c.number} href={`#chapter-${c.number.toLowerCase()}`} className="chip shrink-0" title={chapterTitle(c) ?? undefined}>{c.number}</a>
        ))}
        {schedules.map((s) => (
          <a key={s.number} href={`#schedule-${s.number}`} className="chip shrink-0">Sch. {s.number}</a>
        ))}
      </nav>

      <div className="mt-6"><Toc groups={groups} /></div>
    </div>
  );
}
