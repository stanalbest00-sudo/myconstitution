"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";

export interface TocItem { id: string; label: string; heading: string | null; repealed?: boolean; keywords: string }
export interface TocGroup { anchor: string; eyebrow: string; title: string; sub: { title: string | null; items: TocItem[] }[] }

export function Toc({ groups }: { groups: TocGroup[] }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return groups;
    return groups
      .map((g) => ({
        ...g,
        sub: g.sub
          .map((s) => ({ ...s, items: s.items.filter((i) => `${i.label} ${i.heading ?? ""} ${i.keywords}`.toLowerCase().includes(needle)) }))
          .filter((s) => s.items.length),
      }))
      .filter((g) => g.sub.length);
  }, [groups, needle]);

  return (
    <div>
      <label className="block">
        <span className="eyebrow">{t.reader.filter}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.reader.filterPlaceholder}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-surface px-4 text-base sm:max-w-sm"
        />
      </label>
      <p className="mt-2 text-sm text-muted">{t.reader.editorialNote}</p>
      <p className="sr-only" role="status">{filtered.reduce((n, g) => n + g.sub.reduce((m, s) => m + s.items.length, 0), 0)} {t.search.count}</p>

      {!filtered.length && <p className="card mt-6 p-5">{t.reader.noMatch}</p>}

      <div className="mt-6 space-y-8">
        {filtered.map((g) => (
          <section key={g.anchor} id={g.anchor} aria-labelledby={`${g.anchor}-h`}>
            <p className="eyebrow">{g.eyebrow}</p>
            <h2 id={`${g.anchor}-h`} className="display text-2xl font-semibold">{g.title}</h2>
            {g.sub.map((s, si) => (
              <div key={si} className="mt-3">
                {s.title && <h3 className="mb-1 text-sm font-semibold text-muted">{s.title}</h3>}
                <ul className="card divide-y divide-line overflow-hidden">
                  {s.items.map((i) => (
                    <li key={i.id}>
                      <Link href={`/constitution/${i.id}`} className="flex min-h-12 items-baseline gap-3 px-4 py-2.5 hover:bg-accent-soft">
                        <span className="w-24 shrink-0 text-sm font-semibold tabular-nums text-accent">{i.label}</span>
                        <span className={i.repealed ? "text-muted line-through" : ""}>{i.heading ?? ""}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
