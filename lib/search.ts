import MiniSearch from "minisearch";
import { editorialLabel, getArticle, provisions } from "./constitution";
import type { Provision } from "./types";

const STOP = new Set(
  ("a an and are as at be been but by can could do does for from had has have how i if in into is it its me my of on or our " +
    "shall should so than that the their them then there these they this to was we what when where which who whom why will with would you your " +
    "about am any get got he her him his she tell want need know say says said please may might must also under such").split(" "),
);

/** Very light stemmer: enough to match plural/verb forms without mangling legal terms. */
export function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 6 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 5 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es") && !w.endsWith("ses")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) return w.slice(0, -1);
  return w;
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 || /\d/.test(w));
}

const processTerm = (term: string) => (STOP.has(term) ? null : stem(term));

/**
 * Everyday words -> words the Constitution actually uses. This only widens
 * retrieval; it never changes what text is shown.
 */
const SYNONYMS: Record<string, string> = {
  arrested: "arrest detention liberty", arrest: "detention liberty", detained: "detention arrest liberty",
  jail: "detention imprisonment", prison: "detention imprisonment", bail: "release detention",
  lawyer: "legal practitioner", attorney: "legal practitioner", police: "arrest search force",
  speech: "expression", press: "expression", media: "expression broadcasting", newspaper: "expression",
  journalist: "expression", protest: "assembly", demonstration: "assembly", march: "assembly", union: "association",
  religion: "conscience religion", church: "conscience religion", belief: "conscience",
  privacy: "search correspondence premises", phone: "correspondence communication", tapping: "interception correspondence",
  surveillance: "interception correspondence", home: "premises property", house: "premises shelter property",
  land: "property", housing: "shelter", job: "work", employment: "work", worker: "work", strike: "work",
  school: "education", hospital: "health", healthcare: "health", doctor: "health", pension: "social security aged",
  elderly: "aged", disability: "disabled", kids: "children minors", child: "children minors", children: "minors",
  mother: "maternal women", maternity: "maternal women", women: "women maternal", gender: "discrimination equal protection",
  discrimination: "equal protection", equality: "equal protection discrimination", racism: "discrimination equal protection",
  passport: "citizenship", nationality: "citizenship", citizen: "citizenship", foreigner: "citizenship",
  voting: "vote voter registered", vote: "voter registered election", election: "vote voter electoral",
  mna: "member national assembly", parliament: "national assembly", mp: "member national assembly",
  impeach: "removal president", impeachment: "removal president", president: "president", term: "term office",
  judge: "judge justice court", court: "court judiciary", sue: "redress constitutional court contravened",
  violated: "contravened redress", violation: "contravention redress", remedy: "redress constitutional court",
  complain: "ombudsman complaint redress", corruption: "ombudsman", emergency: "emergency",
  torture: "torture cruel inhuman degrading", "death": "life death", execution: "sentence death life",
  amend: "alter alteration referendum", amendment: "alter alteration", change: "alter alteration",
  language: "languages creole english french", kreol: "creole", creole: "creole languages",
  tax: "taxation", budget: "appropriation estimates consolidated fund", army: "defence forces", military: "defence forces",
  environment: "environment ecologically", pollution: "environment", culture: "cultural", travel: "movement leave seychelles",
  deport: "movement expulsion extradition", trial: "fair hearing charged offence", innocent: "innocent presumed",
  information: "information access", pardon: "pardon", referendum: "referendum", duties: "duty", responsibilities: "duty",
};

/** Small French / Kreol Seselwa keyword bridge so text search works before any AI step. */
const FOREIGN: Record<string, string> = {
  drwa: "right", droit: "right", droits: "right", liberte: "freedom liberty", lalibert: "freedom liberty",
  arete: "arrest detention", arrete: "arrest detention", arrestation: "arrest detention", detansyon: "detention",
  lapolis: "police arrest search", vote: "vote voter", voter: "vote voter", vot: "vote voter",
  eleksyon: "election vote", election: "election vote", elections: "election vote",
  prezidan: "president", president: "president", lasanble: "national assembly", assemblee: "national assembly",
  nasyonal: "national", lakour: "court", cour: "court", tribunal: "court", ziz: "judge", juge: "judge",
  sitwayen: "citizen citizenship", citoyen: "citizen citizenship", citoyennete: "citizenship", nationalite: "citizenship",
  lekspresyon: "expression", expression: "expression", koze: "expression", parole: "expression", presse: "expression",
  prive: "privacy search correspondence", privee: "privacy search correspondence", propriete: "property",
  propriyete: "property", later: "property", terre: "property", lakaz: "shelter premises", maison: "shelter premises",
  logement: "shelter", ledikasyon: "education", education: "education", lekol: "education", ecole: "education",
  lasante: "health", sante: "health", travay: "work", travail: "work", zanfan: "children minors", enfant: "children minors",
  enfants: "children minors", fanm: "women maternal", femme: "women maternal", femmes: "women maternal",
  lalwa: "law", loi: "law", lois: "law", konstitisyon: "constitution", egalite: "equal protection",
  diskriminasyon: "discrimination equal protection", discrimination: "discrimination equal protection",
  relizyon: "conscience religion", religion: "conscience religion", lanvironnman: "environment",
  environnement: "environment", langaz: "languages", langue: "languages", langues: "languages",
  gouvernman: "government executive", gouvernement: "government executive", minis: "minister", ministre: "minister",
  ijans: "emergency", urgence: "emergency", lavi: "life", vie: "life", tortir: "torture", torture: "torture",
  referandom: "referendum", lafanmir: "family", famille: "family", reunion: "assembly", manifestasyon: "assembly",
  manifestation: "assembly", lasosyasyon: "association", avoka: "legal practitioner", avocat: "legal practitioner",
};

function expand(query: string): string {
  const extra: string[] = [];
  for (const w of tokenize(query)) {
    if (SYNONYMS[w]) extra.push(SYNONYMS[w]);
    const s = stem(w);
    if (s !== w && SYNONYMS[s]) extra.push(SYNONYMS[s]);
    if (FOREIGN[w]) extra.push(FOREIGN[w]);
  }
  return extra.join(" ");
}

interface Doc { id: string; label: string; heading: string; text: string }

let index: MiniSearch<Doc> | null = null;
function getIndex(): MiniSearch<Doc> {
  if (index) return index;
  index = new MiniSearch<Doc>({
    fields: ["heading", "text", "label"],
    storeFields: [],
    tokenize,
    processTerm,
    searchOptions: { tokenize, processTerm },
  });
  index.addAll(
    provisions
      .filter((p) => !p.repealed)
      .map((p) => ({ id: p.id, label: p.label, heading: editorialLabel(p) ?? "", text: p.text })),
  );
  return index;
}

export interface SearchHit {
  provision: Provision;
  score: number;
  /** Stemmed query terms that matched, for highlighting. */
  terms: string[];
  /** True when the user asked for this provision by number. */
  direct: boolean;
}

const ARTICLE_QUERY = /\b(?:art(?:icle|ik|\.)?s?|lartik)\s*(\d{1,3}\s?[a-c]?)\b/gi;

export function articleNumbersIn(query: string): string[] {
  return [...query.matchAll(ARTICLE_QUERY)].map((m) => m[1].replace(/\s/g, "").toUpperCase());
}

export function search(query: string, limit = 10): SearchHit[] {
  const q = query.trim().slice(0, 500);
  if (!q) return [];
  const hits = new Map<string, SearchHit>();

  for (const n of articleNumbersIn(q)) {
    const p = getArticle(n);
    if (p) hits.set(p.id, { provision: p, score: 1000, terms: [], direct: true });
  }

  const idx = getIndex();
  const run = (text: string, weight: number) => {
    if (!tokenize(text).some((t) => !STOP.has(t))) return;
    for (const r of idx.search(text, {
      boost: { heading: 3, label: 2 },
      prefix: (term) => term.length > 3,
      fuzzy: (term) => (term.length > 5 ? 0.15 : false),
      combineWith: "OR",
    })) {
      const p = provisions.find((x) => x.id === r.id)!;
      const prev = hits.get(r.id);
      const terms = [...new Set([...(prev?.terms ?? []), ...r.terms])];
      hits.set(r.id, {
        provision: p,
        score: (prev?.score ?? 0) + r.score * weight,
        terms,
        direct: prev?.direct ?? false,
      });
    }
  };
  run(q, 1);
  const extra = expand(q);
  if (extra) run(extra, 0.6);

  return [...hits.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Split text into highlighted / plain segments for the given stemmed terms. */
export function highlightSegments(text: string, terms: string[]): { text: string; hit: boolean }[] {
  if (!terms.length) return [{ text, hit: false }];
  const set = new Set(terms);
  const out: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(/[A-Za-z0-9À-ɏ]+/g)) {
    const tok = tokenize(m[0])[0];
    if (!tok || STOP.has(tok)) continue;
    const s = stem(tok);
    const hit = set.has(s) || [...set].some((t) => t.length > 3 && s.startsWith(t));
    if (!hit) continue;
    if (m.index! > last) out.push({ text: text.slice(last, m.index), hit: false });
    out.push({ text: m[0], hit: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false });
  return out;
}

/** Excerpt of a provision centred on the first matching term. */
export function snippet(p: Provision, terms: string[], length = 260): string {
  const text = p.text;
  if (text.length <= length) return text;
  let at = 0;
  const segs = highlightSegments(text, terms);
  let pos = 0;
  for (const s of segs) {
    if (s.hit) { at = pos; break; }
    pos += s.text.length;
  }
  let start = Math.max(0, at - 80);
  if (start > 0) {
    const sp = text.indexOf(" ", start);
    start = sp > -1 && sp < at ? sp + 1 : start;
  }
  let end = Math.min(text.length, start + length);
  if (end < text.length) end = text.lastIndexOf(" ", end);
  return (start > 0 ? "… " : "") + text.slice(start, end) + (end < text.length ? " …" : "");
}
