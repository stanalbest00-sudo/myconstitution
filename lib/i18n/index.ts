import { cookies } from "next/headers";
import { crs } from "./crs";
import { en, type Dict } from "./en";
import { fr } from "./fr";

export const LOCALES = ["en", "crs", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "mcs_locale";

export const localeMeta: Record<Locale, { name: string; htmlLang: string; reviewed: boolean }> = {
  en: { name: "English", htmlLang: "en", reviewed: true },
  crs: { name: "Kreol Seselwa", htmlLang: "crs", reviewed: false },
  fr: { name: "Français", htmlLang: "fr", reviewed: false },
};

const dicts: Record<Locale, Dict> = { en, fr, crs };

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}

/** Locale chosen by the visitor (cookie), defaulting to English. */
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "en";
}

export async function getI18n(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: getDict(locale) };
}
