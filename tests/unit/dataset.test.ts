import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import labels from "@/data/labels.en.json";
import { chapters, getArticle, getProvision, provisions, referencedArticles, relatedProvisions, schedules, statusNotes } from "@/lib/constitution";

const articles = provisions.filter((p) => p.kind === "article");

describe("constitution dataset", () => {
  it("is in sync with the pinned source snapshot and passes ingestion checks", () => {
    const out = execFileSync("node", ["scripts/ingest.mjs", "--check"], { encoding: "utf8" });
    expect(out).toContain("up to date");
  });

  it("has the expected structure", () => {
    expect(chapters).toHaveLength(16);
    expect(schedules).toHaveLength(7);
    expect(articles).toHaveLength(177);
    expect(getProvision("preamble")?.text).toMatch(/^We, the People of Seychelles/);
  });

  it("has every article from 1 to 170 exactly once, in order", () => {
    const base = new Set(articles.map((a) => parseInt(a.number!, 10)));
    for (let i = 1; i <= 170; i++) expect(base.has(i), `article ${i}`).toBe(true);
    expect(new Set(provisions.map((p) => p.id)).size).toBe(provisions.length);
    const orders = provisions.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((x, y) => x - y));
  });

  it("has no empty provisions and marks the repealed article", () => {
    for (const p of provisions) expect(p.text.length, p.id).toBeGreaterThan(0);
    expect(getArticle("52A")?.repealed).toBe(true);
  });

  it("matches the Official Gazette wording of the Twelfth Amendment (Act 6 of 2025)", () => {
    expect(getArticle("113")!.text).toContain("in an electoral area and who has attained the age of eighteen years");
    expect(getArticle("114")!.text).toContain(
      "Provided that, where an election is to be held in a particular year, a citizen of Seychelles who will attain the age of eighteen years in that year, is entitled to be registered as a voter unless that person is otherwise disqualified from registration as provided under this clause.",
    );
  });

  it("preserves well-known wording verbatim", () => {
    expect(getArticle("1")!.text).toBe("Seychelles is a sovereign democratic Republic.");
    expect(getArticle("5")!.text).toMatch(/^This Constitution is the supreme law of Seychelles/);
    expect(getArticle("4")!.text).toContain("Creole, English and French");
  });

  it("keeps generated or editorial text out of the constitutional text", () => {
    const editorial = Object.entries(labels).filter(([k]) => k !== "_note");
    expect(editorial).toHaveLength(177);
    for (const p of provisions) expect(JSON.stringify(p.content)).not.toMatch(/editorial|AI-generated/i);
  });

  it("derives cross-references only to articles that exist", () => {
    expect(referencedArticles(getArticle("8")!)).toEqual(["9"]);
    expect(referencedArticles(getArticle("43")!)).toEqual(expect.arrayContaining(["15", "16", "17", "18", "19", "21", "27"]));
    const rel = relatedProvisions(getArticle("9")!);
    expect(rel.referredBy.map((p) => p.number)).toContain("8");
    for (const a of articles) for (const n of referencedArticles(a)) expect(getArticle(n), `${a.id} -> ${n}`).toBeDefined();
  });

  it("attaches status notes only to real provisions, each with a source", () => {
    for (const [id, note] of Object.entries(statusNotes)) {
      expect(getProvision(id)).toBeDefined();
      expect(note.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});
