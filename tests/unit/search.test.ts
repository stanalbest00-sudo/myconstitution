import { describe, expect, it } from "vitest";
import { articleNumbersIn, highlightSegments, search, snippet } from "@/lib/search";

const top = (q: string, n = 5) => search(q, n).map((h) => h.provision.id);

/** Realistic everyday questions and the provision a careful reader would expect to see. */
const RELEVANCE: [question: string, expected: string, within: number][] = [
  ["What are my rights if I am arrested?", "article-18", 3],
  ["How long can the police hold me before I see a court?", "article-18", 5],
  ["Do I have the right to a lawyer?", "article-18", 5],
  ["Can the police search my house without permission?", "article-20", 3],
  ["Can my phone calls be intercepted?", "article-20", 3],
  ["Do I have freedom of speech?", "article-22", 3],
  ["Can I join a peaceful protest?", "article-23", 3],
  ["freedom of religion", "article-21", 3],
  ["What does the Constitution say about discrimination?", "article-27", 3],
  ["Who can vote in Seychelles?", "article-113", 5],
  ["At what age can I register as a voter?", "article-114", 5],
  ["How long can a President serve?", "article-52", 5],
  ["How can the President be removed from office?", "article-54", 5],
  ["Who is a citizen of Seychelles?", "article-7", 8],
  ["Is a child born abroad to a Seychellois parent a citizen?", "article-11", 5],
  ["What are the national languages?", "article-4", 3],
  ["How can the Constitution be amended?", "article-91", 3],
  ["What can I do if my rights are violated?", "article-46", 5],
  ["right to education", "article-33", 3],
  ["right to health care", "article-29", 3],
  ["Is the death penalty allowed?", "article-15", 3],
  ["What does the Ombudsman do?", "schedule-5--para-1", 5],
  ["Who appoints the Ombudsman?", "article-143", 3],
  ["state of emergency", "article-41", 3],
  ["duties of citizens", "article-40", 3],
  ["right to own property and land", "article-26", 3],
  ["independence of the judiciary", "article-119", 5],
  ["protection of the environment", "article-38", 3],
  // French and Kreol Seselwa keyword bridge
  ["Ki mon drwa si mon ganny arete?", "article-18", 5],
  ["liberté d'expression", "article-22", 3],
  ["droit de vote élection", "article-113", 6],
];

describe("search relevance", () => {
  it.each(RELEVANCE)("%s -> %s", (q, expected, within) => {
    expect(top(q, within)).toContain(expected);
  });
});

describe("search behaviour", () => {
  it("returns a named article first", () => {
    expect(top("article 22")[0]).toBe("article-22");
    expect(top("What does Article 115A say?")[0]).toBe("article-115a");
    expect(articleNumbersIn("art. 18 and Article 19")).toEqual(["18", "19"]);
  });

  it("does not invent a provision for an article number that does not exist", () => {
    expect(search("article 999").some((h) => h.direct)).toBe(false);
    expect(top("article 999")).not.toContain("article-999");
  });

  it("returns nothing for empty, stop-word-only or nonsense queries", () => {
    expect(search("")).toEqual([]);
    expect(search("   ")).toEqual([]);
    expect(search("the of and")).toEqual([]);
    expect(search("zzqxv wlkjh")).toEqual([]);
  });

  it("never returns the repealed article and tolerates hostile input", () => {
    expect(top("52A repealed eleventh amendment", 20)).not.toContain("article-52a");
    expect(() => search("<script>alert(1)</script> ' OR 1=1 -- " + "x".repeat(5000))).not.toThrow();
  });

  it("highlights matched words without altering the text", () => {
    const hit = search("arrested", 1)[0];
    const text = hit.provision.text;
    const segs = highlightSegments(text, hit.terms);
    expect(segs.map((s) => s.text).join("")).toBe(text);
    expect(segs.some((s) => s.hit && /arrest/i.test(s.text))).toBe(true);
    const sn = snippet(hit.provision, hit.terms, 200);
    expect(text).toContain(sn.replace(/^… /, "").replace(/ …$/, ""));
  });
});
