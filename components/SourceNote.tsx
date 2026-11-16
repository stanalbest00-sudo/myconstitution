import Link from "next/link";
import { textSource } from "@/lib/constitution";
import type { Dict } from "@/lib/i18n/en";

/** Compact statement of where the constitutional text comes from and how far it has been verified. */
export function SourceNote({ t }: { t: Dict }) {
  return (
    <aside className="card bg-surface-2 p-4 text-sm" aria-label={t.reader.source}>
      <p className="flex flex-wrap items-center gap-2">
        <span className="badge bg-warn-soft text-warn">{t.reader.unofficial}</span>
        <span className="font-semibold">{t.reader.source}</span>
      </p>
      <p className="mt-2 text-muted">
        {textSource.title} — {textSource.publisher}. {t.footer.version}: {textSource.consolidatedThrough}.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <a className="link" href={textSource.pdfUrl} rel="noopener noreferrer" target="_blank">{t.reader.sourcePdf} ↗</a>
        <a className="link" href={textSource.url} rel="noopener noreferrer" target="_blank">{t.reader.sourcePage} ↗</a>
        <Link className="link" href="/about">{t.nav.about}</Link>
      </p>
    </aside>
  );
}
