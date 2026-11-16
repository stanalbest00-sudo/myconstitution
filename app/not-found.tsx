import Link from "next/link";
import { getI18n } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="wrap max-w-xl py-16 text-center">
      <h1 className="display text-3xl font-semibold">{t.notFoundPage.title}</h1>
      <p className="mt-2 text-muted">{t.notFoundPage.body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">{t.notFoundPage.back}</Link>
        <Link href="/constitution" className="btn btn-ghost">{t.home.browseCta}</Link>
      </div>
    </div>
  );
}
