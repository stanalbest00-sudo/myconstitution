export type ContentNode =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: { m: string; c: ContentNode[] }[] };

export interface Provision {
  /** Stable identifier, e.g. "article-22", "preamble", "schedule-2--para-1". */
  id: string;
  kind: "preamble" | "article" | "schedule";
  number: string | null;
  /** Neutral citation label, e.g. "Article 22". */
  label: string;
  chapter?: string;
  part?: string | null;
  schedule?: string;
  sectionHeading?: string | null;
  /** Heading that appears in the source text itself (rare). */
  sourceHeading?: string | null;
  repealed?: boolean;
  order: number;
  content: ContentNode[];
  /** Flattened text of `content`, used for search and retrieval. */
  text: string;
}

export interface Part { number: string | null; title: string | null; heading: string }
export interface Chapter { number: string; title: string | null; heading: string; parts: Part[] }
export interface Schedule { number: string; title: string | null; heading: string }

export interface Dataset {
  schema: number;
  language: string;
  textStatus: string;
  sourceId: string;
  sourceSha256: string;
  consolidatedThrough: string;
  stats: Record<string, unknown>;
  chapters: Chapter[];
  schedules: Schedule[];
  provisions: Provision[];
}
