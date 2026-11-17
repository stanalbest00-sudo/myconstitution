import { describe, expect, it } from "vitest";
import { getArticle, getProvision, provisions } from "@/lib/constitution";
import { chunkText, prepareForSpeech, speechLang } from "@/lib/tts";

describe("read-aloud text preparation", () => {
  it("removes placeholder dots and reads slashes as 'or'", () => {
    const oath = getProvision("schedule-6--oath-of-allegiance")!.text;
    const spoken = prepareForSpeech(oath);
    expect(spoken).not.toMatch(/\.\./);
    expect(spoken).toContain("do swear or solemnly");
  });

  it("splits long text into short pieces without losing or reordering words", () => {
    for (const p of provisions) {
      const chunks = chunkText(p.text);
      expect(chunks.length, p.id).toBeGreaterThan(0);
      for (const c of chunks) expect(c.length, p.id).toBeLessThanOrEqual(221);
      const words = (s: string) => s.split(/\s+/).filter(Boolean);
      expect(words(chunks.join(" ")), p.id).toEqual(words(prepareForSpeech(p.text)));
    }
  });

  it("keeps short text in one piece and handles empty text", () => {
    expect(chunkText(getArticle("1")!.text)).toEqual(["Seychelles is a sovereign democratic Republic."]);
    expect(chunkText("   ")).toEqual([]);
  });

  it("maps content languages to available voices", () => {
    expect(speechLang("en")).toBe("en-GB");
    expect(speechLang("fr")).toBe("fr-FR");
    expect(speechLang("crs")).toBe("fr-FR");
  });
});
