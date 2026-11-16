"use client";
import { createContext, useContext } from "react";
import type { Dict } from "@/lib/i18n/en";

const Ctx = createContext<{ locale: string; t: Dict } | null>(null);

export function I18nProvider({ locale, t, children }: { locale: string; t: Dict; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside I18nProvider");
  return v;
}
