#!/usr/bin/env node
/**
 * Constitution ingestion pipeline.
 *
 * Reads a pinned source snapshot (data/sources/<file>), parses it into a
 * structured dataset, runs integrity checks and writes
 * data/constitution.en.json. Nothing is published if a check fails.
 *
 * Usage: node scripts/ingest.mjs            (parse + verify + write)
 *        node scripts/ingest.mjs --check    (parse + verify, fail if output differs)
 *
 * The text is copied verbatim from the snapshot. The only normalisation is
 * collapsing runs of whitespace. No wording is generated or corrected here.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "data/sources/manifest.json"), "utf8"));
const source = manifest.documents.find((d) => d.id === manifest.activeTextSource);
const html = readFileSync(join(root, "data/sources", source.file), "utf8");

const sha256 = createHash("sha256").update(html).digest("hex");
const problems = [];
if (sha256 !== source.sha256) {
  problems.push(`Source snapshot hash mismatch: expected ${source.sha256}, got ${sha256}`);
}

const $ = cheerio.load(html);
const clean = (s) => s.replace(/\s+/g, " ").trim();
const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The element's own text, ignoring nested structure. */
const ownP = (el) => $(el).children("p").first();
const titleOf = (el) => {
  const h = $(el).children("h2,h3").first();
  if (h.length) return { level: h.is("h2") ? 2 : 3, text: clean(h.text()) };
  const p = ownP(el);
  if (p.length && !p.hasClass("content")) return { level: 4, text: clean(p.text()) };
  return null;
};

/**
 * Convert the children of a container into content nodes:
 *   { t: "p", text }                       paragraph
 *   { t: "h", text }                       sub-heading inside a provision
 *   { t: "list", items: [{ m, c: [...] }] } enumerated list (m = original marker)
 */
function contentNodes(container, skipTitle = false) {
  const out = [];
  $(container)
    .children()
    .each((i, child) => {
      const c = $(child);
      if (c.is("h2,h3")) return;
      if (c.is("p")) {
        if (c.hasClass("content")) out.push({ t: "p", text: clean(c.text()) });
        else if (!(skipTitle && i === 0)) out.push({ t: "h", text: clean(c.text()) });
        return;
      }
      if (c.is("ol,ul")) {
        const items = [];
        c.children("li").each((_, li) => {
          const style = $(li).attr("style") || "";
          const m = /list-style-type:\s*'([^']*)'/.exec(style);
          items.push({ m: m ? m[1].trim() : "", c: contentNodes(li) });
        });
        out.push({ t: "list", items });
        return;
      }
      if (c.is("div")) {
        const t = titleOf(child);
        if (t && t.level === 4) {
          out.push({ t: "h", text: t.text });
          out.push(...contentNodes(child, true));
        } else out.push(...contentNodes(child));
      }
    });
  return out;
}

function plainText(nodes) {
  const parts = [];
  const walk = (ns) => {
    for (const n of ns) {
      if (n.t === "p" || n.t === "h") parts.push(n.text);
      else
        for (const it of n.items) {
          if (it.m) parts.push(`(${it.m})`);
          walk(it.c);
        }
    }
  };
  walk(nodes);
  return parts.join(" ");
}

const ARTICLE_NO = /^\d+[A-Z]?$/;
// One article in the snapshot carries its marginal heading in the number line ("55. Vacancy in ...").
const ARTICLE_TITLE = /^(\d+[A-Z]?)(?:\.\s+(\S.*))?$/;
const chapters = [];
const provisions = [];
const order = { n: 0 };

function addProvision(p) {
  p.order = order.n++;
  p.text = plainText(p.content);
  provisions.push(p);
}

function parseHeading(text) {
  // "CHAPTER IV. THE PRESIDENT" | "CHAPTER III" | "PART I. NATIONAL ASSEMBLY" | "SCHEDULE 2. PRINCIPLES ..."
  const m = /^(CHAPTER|PART|SCHEDULE)\s+([IVXLC]+|\d+)\.?\s*(.*)$/.exec(text);
  if (!m) return { kind: null, number: null, title: text };
  return { kind: m[1].toLowerCase(), number: m[2], title: m[3] || null };
}

function walkArticles(container, chapter, part) {
  $(container)
    .children("div")
    .each((_, el) => {
      const t = titleOf(el);
      if (t && t.level === 3) {
        const h = parseHeading(t.text);
        const partRec = { number: h.number, title: h.title, heading: t.text };
        chapter.parts.push(partRec);
        walkArticles(el, chapter, partRec);
      } else if (t && t.level === 4 && ARTICLE_TITLE.test(t.text)) {
        const [, number, sourceHeading] = ARTICLE_TITLE.exec(t.text);
        addProvision({
          id: `article-${number.toLowerCase()}`,
          kind: "article",
          number,
          label: `Article ${number}`,
          sourceHeading: sourceHeading || null,
          chapter: chapter.number,
          part: part ? part.number : null,
          content: contentNodes(el, true),
        });
      } else {
        // wrapper div without a title of its own
        walkArticles(el, chapter, part);
      }
    });
}

function parseSchedule(el, heading) {
  const h = parseHeading(heading);
  const sched = { number: h.number, title: h.title, heading, sections: [] };
  const sub = $(el).children("div").filter((_, d) => {
    const t = titleOf(d);
    return t && t.level === 3;
  });
  if (!sub.length) {
    sched.sections.push({ anchor: "text", heading: null, content: contentNodes(el) });
  } else {
    const lead = contentNodes(
      $(el).children().filter((_, d) => !(titleOf(d) && titleOf(d).level === 3)).toArray().length
        ? $("<div></div>").append(
            $(el).children().filter((_, d) => $(d).is("p.content")).clone(),
          )
        : $("<div></div>"),
    );
    if (lead.length) sched.sections.push({ anchor: "intro", heading: null, content: lead });
    sub.each((_, d) => {
      const t = titleOf(d).text;
      const isPara = ARTICLE_NO.test(t);
      sched.sections.push({
        anchor: isPara ? `para-${t.toLowerCase()}` : slugify(t),
        heading: isPara ? `Paragraph ${t}` : t,
        content: contentNodes(d),
      });
    });
  }
  for (const s of sched.sections) {
    addProvision({
      id: `schedule-${sched.number}${s.anchor === "text" ? "" : `--${s.anchor}`}`,
      kind: "schedule",
      number: sched.number,
      label: `Schedule ${sched.number}${s.heading ? `, ${s.heading}` : ""}`,
      schedule: sched.number,
      anchor: s.anchor,
      sectionHeading: s.heading,
      content: s.content,
    });
  }
  return { number: sched.number, title: sched.title, heading };
}

const schedules = [];
const top = $("div.constitution-content__copy > div.section").first();
top.children("div").each((_, el) => {
  const t = titleOf(el);
  if (!t || t.level !== 2) {
    problems.push(`Unexpected top-level block: ${clean($(el).text()).slice(0, 60)}`);
    return;
  }
  if (/^preamble$/i.test(t.text)) {
    addProvision({ id: "preamble", kind: "preamble", number: null, label: "Preamble", content: contentNodes(el) });
  } else if (t.text.startsWith("CHAPTER")) {
    const h = parseHeading(t.text);
    const chapter = { number: h.number, title: h.title, heading: t.text, parts: [] };
    chapters.push(chapter);
    walkArticles(el, chapter, null);
  } else if (t.text.startsWith("SCHEDULE")) {
    schedules.push(parseSchedule(el, t.text));
  } else problems.push(`Unrecognised heading: ${t.text}`);
});

/* ---------------------------------------------------------------- checks */
const articles = provisions.filter((p) => p.kind === "article");
const ids = new Set();
for (const p of provisions) {
  if (ids.has(p.id)) problems.push(`Duplicate provision id: ${p.id}`);
  ids.add(p.id);
  if (!p.text) problems.push(`Empty provision: ${p.id}`);
}
// Articles must appear in non-decreasing numeric order with no gaps in the base numbers.
const key = (n) => [parseInt(n, 10), n.replace(/^\d+/, "")];
let prev = [0, ""];
const baseNumbers = new Set();
for (const a of articles) {
  const k = key(a.number);
  if (k[0] < prev[0] || (k[0] === prev[0] && k[1] <= prev[1])) {
    problems.push(`Article out of order: ${a.number} after ${prev.join("")}`);
  }
  baseNumbers.add(k[0]);
  prev = k;
}
const maxArticle = Math.max(...baseNumbers);
const missing = [];
for (let i = 1; i <= maxArticle; i++) if (!baseNumbers.has(i)) missing.push(i);
if (missing.length) problems.push(`Missing article numbers: ${missing.join(", ")}`);

const stats = {
  chapters: chapters.length,
  articles: articles.length,
  lastArticle: prev.join(""),
  insertedArticles: articles.filter((a) => /[A-Z]$/.test(a.number)).map((a) => a.number),
  repealedArticles: articles.filter((a) => /^\[repealed/i.test(a.text)).map((a) => a.number),
  schedules: schedules.length,
  provisions: provisions.length,
  characters: provisions.reduce((n, p) => n + p.text.length, 0),
};
for (const [k, v] of Object.entries(source.expected || {})) {
  if (JSON.stringify(stats[k]) !== JSON.stringify(v)) {
    problems.push(`Expected ${k}=${JSON.stringify(v)} but parsed ${JSON.stringify(stats[k])}`);
  }
}

// Mark repealed provisions so the reader can show them distinctly.
for (const a of articles) if (/^\[repealed/i.test(a.text)) a.repealed = true;

if (problems.length) {
  console.error("INGESTION FAILED — nothing written:\n - " + problems.join("\n - "));
  process.exit(1);
}

const dataset = {
  schema: 1,
  language: "en",
  textStatus: source.textStatus,
  sourceId: source.id,
  sourceSha256: sha256,
  consolidatedThrough: source.consolidatedThrough,
  stats,
  chapters,
  schedules,
  provisions,
};
const outPath = join(root, "data/constitution.en.json");
const json = JSON.stringify(dataset, null, 1) + "\n";
if (process.argv.includes("--check")) {
  if (!existsSync(outPath) || readFileSync(outPath, "utf8") !== json) {
    console.error("data/constitution.en.json is out of date with the source snapshot. Run: npm run ingest");
    process.exit(1);
  }
  console.log("Dataset is up to date.", stats);
} else {
  writeFileSync(outPath, json);
  console.log("Wrote data/constitution.en.json", stats);
}
