import dataset from "@/data/constitution.en.json";
import labels from "@/data/labels.en.json";
import manifest from "@/data/sources/manifest.json";
import type { Chapter, Dataset, Provision } from "./types";

const data = dataset as unknown as Dataset;
const editorialLabels = labels as Record<string, string>;

export const provisions: Provision[] = data.provisions;
export const chapters: Chapter[] = data.chapters;
export const schedules = data.schedules;
export const stats = data.stats as {
  chapters: number; articles: number; schedules: number; provisions: number;
};

const byId = new Map(provisions.map((p) => [p.id, p]));

export function getProvision(id: string): Provision | undefined {
  return byId.get(id);
}

export function articleId(number: string): string {
  return `article-${number.toLowerCase()}`;
}

export function getArticle(number: string): Provision | undefined {
  return byId.get(articleId(number));
}

/**
 * Short descriptive label written by this project (not part of the
 * Constitution). Falls back to a heading found in the source text.
 */
export function editorialLabel(p: Provision): string | null {
  if (p.kind === "article" && p.number) {
    return editorialLabels[p.number] ?? p.sourceHeading ?? null;
  }
  if (p.kind === "schedule") {
    const s = schedules.find((x) => x.number === p.schedule);
    return s?.title ? titleCase(s.title) : null;
  }
  return null;
}

export function titleCase(s: string): string {
  const small = new Set(["of", "and", "the", "in", "for", "under", "to", "its"]);
  return s
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function chapterOf(p: Provision): Chapter | undefined {
  return p.chapter ? chapters.find((c) => c.number === p.chapter) : undefined;
}

/** Chapter title as it appears in the text. Chapter III has none: its Parts carry the headings. */
export function chapterTitle(c: Chapter): string | null {
  return c.title ? titleCase(c.title) : null;
}

export function provisionsInChapter(chapter: string, part?: string | null): Provision[] {
  return provisions.filter(
    (p) => p.chapter === chapter && (part === undefined || (p.part ?? null) === part),
  );
}

export function neighbours(p: Provision): { prev?: Provision; next?: Provision } {
  return { prev: provisions[p.order - 1], next: provisions[p.order + 1] };
}

export function href(p: Provision | string): string {
  return `/constitution/${typeof p === "string" ? p : p.id}`;
}

// "article 46", "article 114(1)" -> one number. "articles 15, 16, 17, 18 (3) 19 (2) to (6) and (11), 21 and 27" -> a list.
const SINGLE_REF = /\barticle\s+(\d+[A-Z]?)/g;
const LIST_REF = /\barticles\s+((?:\d+[A-Z]?|\(\w+\)|,|\s|\band\b|\bor\b|\bto\b)+)/g;

/** Article numbers that a provision's own text refers to. */
export function referencedArticles(p: Provision): string[] {
  const found = new Set<string>();
  const add = (num: string) => {
    if (num !== p.number && getArticle(num)) found.add(num);
  };
  for (const m of p.text.matchAll(SINGLE_REF)) add(m[1]);
  for (const m of p.text.matchAll(LIST_REF)) {
    // Drop clause references such as "(3)" so only article numbers remain.
    for (const n of m[1].replace(/\(\w+\)/g, " ").matchAll(/\d+[A-Z]?/g)) add(n[0]);
  }
  return [...found];
}

/** Provisions referred to by this one, and provisions that refer to it. */
export function relatedProvisions(p: Provision): { refersTo: Provision[]; referredBy: Provision[] } {
  const refersTo = referencedArticles(p).map((n) => getArticle(n)!).slice(0, 12);
  const referredBy =
    p.kind === "article" && p.number
      ? provisions
          .filter((q) => q.kind === "article" && q.id !== p.id && referencedArticles(q).includes(p.number!))
          .slice(0, 12)
      : [];
  return { refersTo, referredBy };
}

type SourceDoc = (typeof manifest.documents)[number];
export const sources = manifest.documents as SourceDoc[];
export const textSource = sources.find((d) => d.id === manifest.activeTextSource)! as SourceDoc & {
  consolidatedThrough: string; verification: string; pdfUrl: string; url: string; publisher: string; title: string;
};
export const retrievedOn = manifest.retrievedOn;

/**
 * Editorial status notes: things a reader should know that are not in the
 * text itself. Each must cite where the information comes from.
 */
export const statusNotes: Record<string, { text: string; sourceUrl: string; sourceLabel: string }> = {
  "article-163": {
    text:
      "Clause (1) as shown here includes wording added by the Constitution (Tenth Amendment) Act, 2022. Press reports state that the Constitutional Court later declared that amendment unconstitutional. This site has not been able to confirm the judgment or its effect on the text from an official source, so treat the current wording of this article as uncertain and check the official text.",
    sourceUrl: "https://nation.sc/articles/31689/court-invalidates-10th-constitutional-amendment",
    sourceLabel: "Seychelles Nation report (not an official source)",
  },
};
