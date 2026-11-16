import Link from "next/link";
import { AskBox } from "@/components/AskBox";
import { askHref } from "@/lib/links";
import { SourceNote } from "@/components/SourceNote";
import { stats } from "@/lib/constitution";
import { getI18n } from "@/lib/i18n";
import { topics } from "@/lib/topics";

const EXAMPLES = [
  "What are my rights if I am arrested?",
  "Can the police search my house without permission?",
  "Who can vote in Seychelles?",
  "How long can a President serve?",
  "What can I do if my rights are violated?",
];

export default async function Home() {
  const { t } = await getI18n();
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-accent opacity-[0.09]" viewBox="0 0 1200 96" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 60c120-34 240-34 360 0s240 34 360 0 240-34 480 0v36H0z" />
          <path fill="currentColor" opacity=".6" d="M0 40c150-28 300-28 450 0s300 28 450 0 200-20 300-6v62H0z" />
        </svg>
        <div className="wrap relative py-10 sm:py-16">
          <p className="eyebrow">{t.siteName}</p>
          <h1 className="display mt-2 max-w-3xl text-[2.35rem] font-semibold sm:text-6xl">{t.tagline}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t.intro}</p>

          <div className="mt-7 max-w-3xl">
            <AskBox large />
          </div>

          <div className="mt-6 max-w-3xl">
            <p className="eyebrow">{t.home.try}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((q) => (
                <li key={q}><Link href={askHref(q)} className="chip" lang="en">{q}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap py-10" aria-labelledby="topics-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="topics-h" className="display text-2xl font-semibold sm:text-3xl">{t.home.popular}</h2>
          <div className="flex gap-2">
            <Link href="/topics" className="btn btn-ghost">{t.home.topicsCta}</Link>
            <Link href="/constitution" className="btn btn-primary">{t.home.browseCta}</Link>
          </div>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link href={`/topics/${topic.slug}`} className="card group flex h-full flex-col p-4 transition-colors hover:border-accent">
                <span className="display text-lg font-semibold group-hover:text-accent">{topic.title}</span>
                <span className="mt-1 line-clamp-2 text-sm text-muted">{topic.summary}</span>
                <span className="mt-3 text-xs font-semibold tabular-nums text-muted">
                  {topic.keyProvisions.map((id) => id.replace("article-", "").toUpperCase()).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap grid gap-8 pb-4 lg:grid-cols-[3fr_2fr]" aria-labelledby="how-h">
        <div>
          <h2 id="how-h" className="display text-2xl font-semibold">{t.home.how}</h2>
          <ol className="mt-4 space-y-4">
            {[[t.home.how1t, t.home.how1], [t.home.how2t, t.home.how2], [t.home.how3t, t.home.how3]].map(([title, body], i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden className="display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">{i + 1}</span>
                <div><p className="font-semibold">{title}</p><p className="text-muted">{body}</p></div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted">
            {stats.chapters} {t.reader.chapter.toLowerCase()}s · {stats.articles} {t.reader.article.toLowerCase()}s · {stats.schedules} {t.reader.schedule.toLowerCase()}s
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="display text-2xl font-semibold">{t.home.sourcesTitle}</h2>
          <SourceNote t={t} />
          <div className="card p-4 text-sm">
            <p className="font-semibold">{t.disclaimer.title}</p>
            <p className="mt-1 text-muted">{t.disclaimer.body}</p>
          </div>
        </div>
      </section>
    </>
  );
}
