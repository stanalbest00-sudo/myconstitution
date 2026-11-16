import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { topics } from "@/lib/topics";

export const metadata: Metadata = { title: "Browse by topic" };

export default async function TopicsPage() {
  const { t } = await getI18n();
  return (
    <div className="wrap py-8">
      <h1 className="display text-3xl font-semibold sm:text-4xl">{t.topics.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t.topics.intro}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/topics/${topic.slug}`} className="card group flex h-full flex-col p-5 hover:border-accent">
              <span className="display text-xl font-semibold group-hover:text-accent">{topic.title}</span>
              <span className="mt-1.5 text-sm text-muted">{topic.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
