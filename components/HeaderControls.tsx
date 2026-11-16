"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

const LOCALES: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "crs", name: "Kreol Seselwa" },
  { code: "fr", name: "Français" },
];

export function LanguageSelect() {
  const { locale, t } = useI18n();
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span className="sr-only">{t.language}</span>
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.500 5.600 12 3z" />
      </svg>
      <select
        value={locale}
        onChange={(e) => {
          document.cookie = `mcs_locale=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
        className="h-10 rounded-full border border-line bg-surface px-2.5 text-sm font-medium"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>
    </label>
  );
}

export function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const current = el.dataset.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setDark(current === "dark"); // eslint-disable-line react-hooks/set-state-in-effect -- sync with DOM once on mount
  }, []);
  return (
    <button
      type="button"
      aria-label={t.theme.toggle}
      aria-pressed={dark ?? false}
      title={t.theme.toggle}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.dataset.theme = next ? "dark" : "light";
        try { localStorage.setItem("mcs_theme", next ? "dark" : "light"); } catch {}
      }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:border-accent"
    >
      {dark ? (
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" /></svg>
      ) : (
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z" /></svg>
      )}
    </button>
  );
}
