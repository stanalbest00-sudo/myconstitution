import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { askHref } from "@/lib/links";
import { editorialLabel, getProvision, href } from "@/lib/constitution";
import { getI18n } from "@/lib/i18n";
import { getTopic, type TopicPoint } from "@/lib/topics";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = getTopic((await params).slug);
  return topic ? { title: topic.title, description: topic.summary } : { title: "Not found" };
}

function Refs({ ids }: { ids: string[] }) {
  return (
    <span className="ml-1 inline-flex flex-wrap gap-x-2 text-sm">
      {ids.map((id) => {
        const p = getProvision(id);
        return p ? <Link key={id} href={href(p)} className="link whitespace-nowrap font-semibold">{p.label}</Link> : null;
      })}
    </span>
  );
}

function Points({ items }: { items: TopicPoint[] }) {
  return (
    <ul className="mt-2 space-y-2.5">
      {items.map((pt, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{pt.text}<Refs ids={pt.refs} /></span>
        </li>
      ))}
    </ul>
  );
}

function ProvisionList({ ids }: { ids: string[] }) {
  return (
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
      {ids.map((id) => {
        const p = getProvision(id);
        if (!p) return null;
        return (
          <li key={id}>
            <Link href={href(p)} className="card flex h-full items-baseline gap-3 px-4 py-3 hover:border-accent">
              <span className="shrink-0 text-sm font-semibold text-accent">{p.label}</span>
              <span className="text-sm text-muted">{editorialLabel(p)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function TopicPage({ params }: Props) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();
  const { t } = await getI18n();
  return (
    <div className="wrap max-w-3xl py-8" lang="en">
      <nav aria-label="Breadcrumb" className="text-sm"><Link href="/topics" className="link">{t.topics.title}</Link></nav>
      <h1 className="display mt-2 text-3xl font-semibold sm:text-4xl">{topic.title}</h1>
      <p className="mt-3 text-lg">{topic.summary}</p>
      <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-muted">{t.topics.editorialNote}</p>

      <section className="mt-7">
        <h2 className="display text-xl font-semibold">{t.topics.start}</h2>
        <ProvisionList ids={topic.keyProvisions} />
      </section>

      <section className="mt-7">
        <h2 className="display text-xl font-semibold">{t.topics.key}</h2>
        <Points items={topic.points} />
      </section>

      <section className="mt-7">
        <h2 className="display text-xl font-semibold">{t.topics.limits}</h2>
        <Points items={topic.limits} />
      </section>

      <section className="card mt-7 p-5">
        <p className="eyebrow">{t.topics.scenario}</p>
        <h2 className="display mt-1 text-xl font-semibold">{topic.scenario.title}</h2>
        <p className="mt-2">{topic.scenario.situation}</p>
        <h3 className="mt-4 font-semibold">{t.topics.says}</h3>
        <Points items={topic.scenario.whatTheTextSays} />
        <h3 className="mt-4 font-semibold">{t.topics.notSettled}</h3>
        <p className="mt-1 text-muted">{topic.scenario.notSettledHere}</p>
      </section>

      <section className="mt-7">
        <h2 className="display text-xl font-semibold">{t.topics.questions}</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {topic.questions.map((q) => <li key={q}><Link className="chip" href={askHref(q)}>{q}</Link></li>)}
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="display text-xl font-semibold">{t.topics.also}</h2>
        <ProvisionList ids={topic.alsoSee} />
      </section>
    </div>
  );
}
