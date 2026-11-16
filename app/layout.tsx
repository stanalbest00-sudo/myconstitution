import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HeaderControls } from "@/components/Header";
import { I18nProvider } from "@/components/I18nProvider";
import { Logo } from "@/components/Logo";
import { textSource } from "@/lib/constitution";
import { getI18n, localeMeta } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "My Constitution Seychelles", template: "%s · My Constitution Seychelles" },
  description:
    "Explore, search and understand the Constitution of the Republic of Seychelles. An independent civic education project.",
  openGraph: { title: "My Constitution Seychelles", description: "Know Your Constitution. Know Your Rights.", type: "website" },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0c161b" },
  ],
};

const themeScript = `try{var t=localStorage.getItem("mcs_theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n();
  const meta = localeMeta[locale];
  const nav = [
    { href: "/ask", label: t.nav.ask },
    { href: "/constitution", label: t.nav.browse },
    { href: "/topics", label: t.nav.topics },
    { href: "/about", label: t.nav.about },
  ];
  return (
    <html lang={meta.htmlLang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <I18nProvider locale={locale} t={t}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow">
            {t.skip}
          </a>
          <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
            <div className="wrap flex h-16 items-center justify-between gap-3">
              <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${t.siteName} — ${t.nav.home}`}>
                <Logo />
                <span className="display truncate text-[1.05rem] font-semibold leading-tight sm:text-lg">
                  My Constitution <span className="text-accent">Seychelles</span>
                </span>
              </Link>
              <HeaderControls />
            </div>
            <nav aria-label="Main" className="wrap -mt-1 flex gap-1 overflow-x-auto pb-2 text-sm font-medium">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </nav>
          </header>

          {!meta.reviewed && (
            <div role="note" className="border-b border-line bg-warn-soft text-sm">
              <p className="wrap py-2 text-warn">{t.unreviewed}</p>
            </div>
          )}

          <main id="main" className="flex-1">{children}</main>

          <footer className="mt-16 border-t border-line bg-surface-2 text-sm">
            <div className="wrap grid gap-6 py-8 sm:grid-cols-2">
              <div>
                <p className="font-semibold">{t.disclaimer.title}</p>
                <p className="mt-1 text-muted">{t.disclaimer.body}</p>
              </div>
              <div className="text-muted">
                <p><span className="font-semibold text-ink">{t.footer.version}:</span> {textSource.consolidatedThrough}</p>
                <p className="mt-1">
                  {t.answer.sourceLine}: {textSource.publisher} ({t.reader.unofficial.toLowerCase()}).{" "}
                  <Link className="link" href="/about">{t.nav.about}</Link>
                </p>
                <p className="mt-3">{t.independent}</p>
              </div>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
