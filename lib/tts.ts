/** Helpers for reading text aloud. Pure functions, so they can be unit-tested. */

/** Make text sound right when spoken, without changing what is displayed. */
export function prepareForSpeech(text: string): string {
  return text
    .replace(/\.{2,}/g, ", ") // "I.........." placeholders in the oaths
    .replace(/\s*\/\s*/g, " or ") // "swear/solemnly" -> "swear or solemnly"
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split text into short pieces. Browsers (notably Chrome) cut off a single long
 * utterance after about 15 seconds, so long articles are read piece by piece.
 */
export function chunkText(text: string, max = 220): string[] {
  const clean = prepareForSpeech(text);
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.;:?!])\s+/);
  const out: string[] = [];
  let buf = "";
  const push = (s: string) => {
    if (s.trim()) out.push(s.trim());
  };
  for (const s of sentences) {
    if (s.length > max) {
      push(buf);
      buf = "";
      // Break an over-long sentence at commas, then at spaces.
      let rest = s;
      while (rest.length > max) {
        let cut = rest.lastIndexOf(", ", max);
        if (cut < max / 3) cut = rest.lastIndexOf(" ", max);
        if (cut <= 0) cut = max;
        push(rest.slice(0, cut + 1));
        rest = rest.slice(cut + 1);
      }
      buf = rest;
    } else if ((buf + " " + s).length > max) {
      push(buf);
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  push(buf);
  return out;
}

/** Recogniser-style language tag for a content language. No engine ships a Kreol Seselwa voice. */
export function speechLang(lang: string): string {
  if (lang === "fr" || lang === "crs") return "fr-FR";
  return "en-GB";
}
