# Research summary

Research was carried out on 16 November 2026 before any application code was written.

## Verified

| Finding | Source | How verified |
| --- | --- | --- |
| The Constitution was promulgated in 1993 (S.I. 38 of 1993, 21 June 1993) and is cited as Cap. 42. | SeyLII listing; ILO NATLEX listing | Search-result metadata only. SeyLII pages could not be opened (see below). |
| The latest amendment located is the **Twelfth Amendment Act, 2025 (Act 6 of 2025)**, assented 4 July 2025. It amends articles 113 and 114 (voting age wording and registration in an election year). | Official Gazette supplement, copy hosted by the Electoral Commission (`ecs.sc`) | Downloaded and read. PDF stored at `data/sources/act-6-2025-twelfth-amendment.pdf`. |
| The text used here incorporates that amendment. | Constitute Project text vs. Gazette Act | Word-for-word comparison of articles 113 and 114; enforced by a unit test. |
| The Attorney General directed the Law Commission to prepare a **revised edition of the Constitution as at 1 June 2026** (S.I. 46 of 2026). | Official Gazette (`gazette.sc`) | Downloaded and read. |
| Structure: Preamble, 16 chapters, articles 1–170 plus inserted articles 10A, 52A (repealed), 66A, 84A, 115A, 115B, 115C; 7 schedules. | Parsed dataset | Automated integrity checks in `scripts/ingest.mjs`. |
| Article 4: the national languages are Creole, English and French. | Dataset, article 4 | Read directly. |

## Unresolved

1. **No official consolidated text could be ingested.** SeyLII (`seylii.org`) holds a consolidation dated 4 July 2025, but it serves a CAPTCHA to automated clients. That is a deliberate access control and was not bypassed. Refworld's mirror also refused automated access. `lawcommission.gov.sc` and the old SeyLII archive were unreachable.
2. **The 2026 revised edition was not found.** S.I. 46 of 2026 orders it; no published copy was located. Any amendment after 4 July 2025 would not be reflected here.
3. **Tenth Amendment (2022), article 163.** A Seychelles Nation report says the Constitutional Court declared it unconstitutional. The judgment was not obtained. The source text still contains the amended wording, so article 163 carries a visible status note.
4. **Official marginal headings** of articles are absent from the source. The site uses clearly marked editorial labels instead.
5. **No official French or Kreol Seselwa translation** of the consolidated text was located. The constitutional text is shown in English only.
6. **Source defects found during ingestion**: article 55's number line carries its heading (handled); article 40 lists paragraphs (a), (b), (d)… with no (c); occasional typos such as "VicePresident". These are reproduced as found.

## Decisions that followed

| Question | Decision | Why |
| --- | --- | --- |
| Which text to publish? | Constitute Project structured text, labelled "unofficial transcription" everywhere it appears. | The only complete, current, machine-readable text obtainable without bypassing access controls. Published by an academic project, and spot-verified against the Gazette. |
| Database for the text? | Ship the text as a versioned JSON file inside the app; provide a tested Supabase schema for later. | About 220 provisions and 230 KB. In-process search is faster, free, has no connection to fail, and makes the reader work even if every external service is down. |
| Vector search (pgvector)? | Not in v1. | Lexical BM25 with synonyms scored 31/31 on the relevance set. For other languages the AI planner writes English search queries. Embeddings would add a paid dependency for little gain at this size. |
| AI provider | Anthropic API, server-side, structured output. Default `claude-opus-5-5` for answers and `claude-haiku-5-5` for query planning; both configurable. | Structured outputs make citation validation mechanical. |
| Hallucination control | Retrieve first; give the model only retrieved provisions; validate citations in code; flag unverified article mentions; fall back to retrieval-only on any failure. | Prompt instructions alone are not a guarantee, so the checks that matter are enforced after generation. |
| Speech-to-text | Browser Web Speech API with an editable transcript. | Free, no audio reaches this site. Desk research found no recogniser (browser engines or Whisper-family services) listing Seychellois Creole. This was **not verified by live testing**; the Kreol option falls back to French recognition and is labelled experimental. |
| Languages | Cookie-based interface language; English complete; French and Kreol dictionaries shipped as labelled, unreviewed previews. | The brief asks that translations be introduced only after quality checks; the banner makes their status explicit until a human review is done. |
| Question privacy | Questions are carried in the URL fragment and sent by POST. | Fragments are never sent to servers, so questions stay out of access logs. |
