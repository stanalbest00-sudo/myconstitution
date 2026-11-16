import { en, type Dict } from "./en";

/**
 * Kreol Seselwa interface strings: PREVIEW ONLY.
 * Drafted without review by a native-speaking editor. Anything not translated
 * here falls back to English. Have Lenstiti Kreol or a qualified translator
 * review this file before marking the locale as reviewed in lib/i18n/index.ts.
 */
export const crs: Dict = {
  ...en,
  tagline: "Konn ou Konstitisyon. Konn ou Drwa.",
  intro: "Eksplore, rode e konpran Konstitisyon Repiblik Sesel.",
  independent: "En proze endepandan ledikasyon sivik. Pa en servis ofisyel gouvernman.",
  nav: { home: "Lakey", ask: "Demande", browse: "Konstitisyon", topics: "Size", about: "Sours ek lenformasyon" },
  language: "Langaz",
  unreviewed: "Sa tradiksyon lenterfas pa ankor ganny verifye par en editer ki koz Kreol Seselwa. Teks Konstitisyon i ganny montre an Angle, langaz sours la.",
  ask: {
    ...en.ask,
    label: "Demann en kestyon lo Konstitisyon",
    placeholder: "egz. Ki mon drwa si mon ganny arete?",
    submit: "Demande",
    searching: "Pe lir Konstitisyon…",
    heading: "Demann Constitution AI",
    newQuestion: "Ou kestyon",
  },
  voice: { ...en.voice, start: "Dir ou kestyon", stop: "Aret ekoute", listening: "Pe ekoute…", lang: "Langaz ki ou pe koze" },
  answer: {
    ...en.answer,
    short: "Larepons kourt",
    provisions: "Provizyon Konstitisyon ki konsernen",
    means: "Ki sa i vedir",
    limits: "Limit enportan",
    sources: "Sours",
    readFull: "Lir teks konplet",
  },
  home: { ...en.home, popular: "Size popiler", browseCta: "Lir Konstitisyon", topicsCta: "Tou size" },
  disclaimer: {
    title: "Lenformasyon legal, pa konsey legal",
    body: en.disclaimer.body,
  },
  reader: { ...en.reader, toc: "Konteni", chapter: "Sapit", article: "Lartik", prev: "Avan", next: "Apre" },
  topics: { ...en.topics, title: "Rode par size" },
};
