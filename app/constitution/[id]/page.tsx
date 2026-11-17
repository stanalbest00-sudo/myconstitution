import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { askHref } from "@/lib/links";
import { CopyLink } from "@/components/CopyLink";
import { ProvisionBody } from "@/components/ProvisionBody";
import { ReadAloud } from "@/components/ReadAloud";
import { SourceNote } from "@/components/SourceNote";
import {
  chapterOf, chapterTitle, editorialLabel, getProvision, href, neighbours, relatedProvisions, schedules, statusNotes, titleCase,
} from "@/lib/constitution";
import { getI18n } from "@/lib/i18n";
import { stem, tokenize } from "@/lib/search";
import { allTopicRefs, topics } from "@/lib/topics";
import type { Provision } from "@/lib/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ hl?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProvision((await params).id);
  if (!p) return { title: "Not found" };
  const label = editorialLabel(p);
  return {
    title: label ? `${p.label}: ${label}` : p.label,
    description: p.text.slice(0, 155),
    alternates: { canonical: href(p) },
  };
}

function Related({ title, items }: { title: string; items: Provision[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      <ul className="mt-1.5 flex flex-wrap gap-2">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={href(p)} className="chip" title={editorialLabel(p) ?? undefined}>
              <span className="font-semibold text-accent">{p.number}</span>
              <span className="ml-1.5 max-w-[14rem] truncate text-muted">{editorialLabel(p)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ProvisionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const p = getProvision(id);
  if (!p) notFound();
  const { t } = await getI18n();

  const rawHl = (await searchParams).hl;
  const terms = tokenize((Array.isArray(rawHl) ? rawHl[0] : rawHl ?? "").slice(0, 200)).map(stem).slice(0, 12);

  const chapter = chapterOf(p);
  const part = chapter?.parts.find((x) => x.number === p.part);
  const schedule = schedules.find((s) => s.number === p.schedule);
  const { prev, next } = neighbours(p);
  const related = relatedProvisions(p);
  const label = editorialLabel(p);
  const note = statusNotes[p.id];
  const inTopics = topics.filter((topic) => allTopicRefs(topic).includes(p.id));

  return (
    <div className="wrap max-w-3xl py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li><Link href="/constitution" className="link">{t.nav.browse}</Link></li>
          {chapter && (
            <li>› <Link className="link" href={`/constitution#chapter-${chapter.number.toLowerCase()}`}>{t.reader.chapter} {chapter.number}{chapterTitle(chapter) ? `: ${chapterTitle(chapter)}` : ""}</Link></li>
          )}
          {part && <li>› {t.reader.part} {part.number}{part.title ? `: ${titleCase(part.title)}` : ""}</li>}
          {schedule && (
            <li>› <Link className="link" href={`/constitution#schedule-${schedule.number}`}>{t.reader.schedule} {schedule.number}{schedule.title ? `: ${titleCase(schedule.title)}` : ""}</Link></li>
          )}
        </ol>
      </nav>

      <article className="mt-4" aria-labelledby="prov-h">
        <header>
          <h1 id="prov-h" className="display text-3xl font-semibold sm:text-4xl">
            {p.kind === "schedule" && p.sectionHeading ? `${t.reader.schedule} ${p.schedule}: ${p.sectionHeading}` : p.label}
          </h1>
          {label && p.kind === "article" && (
            <p className="mt-1.5 text-lg text-muted">
              {label}{" "}
              <span className="badge ml-1 bg-surface-2 align-middle text-muted" title={t.reader.editorialNote}>{t.reader.editorial}</span>
            </p>
          )}
          {p.repealed && <p className="badge mt-2 bg-warn-soft text-warn">{t.reader.repealed}</p>}
        </header>

        {note && (
          <aside role="note" className="mt-5 rounded-xl border border-warn bg-warn-soft p-4 text-sm">
            <p className="font-semibold text-warn">{t.reader.statusNote}</p>
            <p className="mt-1">{note.text}</p>
            <p className="mt-1.5"><a className="link" href={note.sourceUrl} target="_blank" rel="noopener noreferrer">{note.sourceLabel} ↗</a></p>
          </aside>
        )}

        <div className="mt-5">
          <ReadAloud lang="en" label={`${t.tts.listen}: ${p.label}`} text={`${t.tts.textIntro} ${p.label}. ${p.text}`} />
        </div>

        <section className="card mt-3 p-5 sm:p-7" aria-label={t.reader.officialText}>
          <p className="eyebrow mb-3">{t.reader.officialText}</p>
          <ProvisionBody content={p.content} terms={terms} />
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <CopyLink path={href(p)} title={`${p.label} — Constitution of Seychelles`} />
          {!p.repealed && p.kind === "article" && (
            <Link className="btn btn-ghost text-sm no-print" href={askHref(`What does Article ${p.number} of the Constitution mean?`)}>
              {t.reader.askAbout}
            </Link>
          )}
        </div>
      </article>

      {(related.refersTo.length > 0 || related.referredBy.length > 0 || inTopics.length > 0) && (
        <section className="mt-8 space-y-4" aria-labelledby="rel-h">
          <h2 id="rel-h" className="display text-xl font-semibold">{t.reader.related}</h2>
          <Related title={t.reader.refersTo} items={related.refersTo} />
          <Related title={t.reader.referredBy} items={related.referredBy} />
          {inTopics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted">{t.reader.inTopics}</h3>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {inTopics.map((topic) => <li key={topic.slug}><Link className="chip" href={`/topics/${topic.slug}`}>{topic.title}</Link></li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      <nav aria-label="Previous and next provision" className="no-print mt-8 grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={href(prev)} className="card p-3 hover:border-accent">
            <span className="eyebrow">← {t.reader.prev}</span>
            <span className="block truncate font-semibold">{prev.label}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link href={href(next)} className="card p-3 text-right hover:border-accent">
            <span className="eyebrow">{t.reader.next} →</span>
            <span className="block truncate font-semibold">{next.label}</span>
          </Link>
        )}
      </nav>

      <div className="mt-8"><SourceNote t={t} /></div>
    </div>
  );
}
