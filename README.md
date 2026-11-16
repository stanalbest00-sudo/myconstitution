# My Constitution Seychelles

**Know Your Constitution. Know Your Rights.**

An independent civic-education website that lets anyone search, read and ask questions about the Constitution of the Republic of Seychelles, and check every explanation against the actual text.

> Not an official government service. Legal information, not legal advice.

## What it does

| Feature | Status |
| --- | --- |
| Constitution library: 16 chapters, 177 articles, 7 schedules, exact text, shareable article links, previous/next, related provisions | Working, tested |
| Full-text search with highlighting, everyday-word synonyms, and a French/Kreol keyword bridge | Working, tested |
| Constitution AI: retrieval-grounded answers with Short Answer, Relevant Provisions, What This Means, Important Limitations, linked sources | Implemented; tested with a mocked model only. **Needs an API key and a live check** (see [docs/TESTING.md](docs/TESTING.md)) |
| Without an API key: questions return the best-matching provisions, clearly labelled | Working, tested |
| Voice input with editable transcript (browser speech recognition) | Working with a simulated recogniser; **not yet tested with a real microphone** |
| Kreol Seselwa voice | Experimental fallback to French recognition, labelled as such |
| Browse by topic: 11 plain-language guides, each statement linked to provisions | Working, tested |
| Interface languages: English (complete), French and Kreol Seselwa (unreviewed previews, labelled) | Working; translations need human review |
| Light and dark mode, mobile-first, WCAG 2.2 AA automated checks | Working, tested |
| Supabase/PostgreSQL schema, row-level security, seed generator | Tested on local PostgreSQL 16; **not deployed** |

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY to enable AI answers
npm run dev                  # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Develop, build, serve |
| `npm run check` | Dataset check, type-check, lint, unit tests |
| `npm run test:e2e` | Browser tests on mobile and desktop (builds first) |
| `npm run ingest` | Re-parse the pinned source snapshot into `data/constitution.en.json` |
| `node scripts/export-sql.mjs > supabase/seed.sql` | Generate SQL to load the dataset into Supabase |

## Where the text comes from

The text is an **unofficial transcription** from the Constitute Project (Comparative Constitutions Project), consolidated through the Twelfth Amendment Act, 2025. Articles 113 and 114 were verified word-for-word against the Official Gazette. The official SeyLII consolidation could not be ingested because the site blocks automated access. Full details, hashes and open issues: [docs/SOURCES.md](docs/SOURCES.md).

## Documentation

- [docs/RESEARCH.md](docs/RESEARCH.md) – research summary and the decisions it led to
- [docs/SOURCES.md](docs/SOURCES.md) – provenance of every document, verification status, unresolved issues
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – how it is built, security, database, costs
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) – deploying to Vercel, optional Supabase setup
- [docs/TESTING.md](docs/TESTING.md) – what was tested, results, what could not be tested
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md) – known limitations and recommended next steps

## Project layout

```
app/                 pages and API routes (Next.js App Router)
components/          UI components (question box, answer, reader, voice hook)
lib/                 constitution data access, search, AI pipeline, rate limiting, i18n, topics
data/                constitution.en.json (generated), editorial labels, pinned sources + manifest
scripts/             ingest.mjs (parse + verify), export-sql.mjs (database seed)
supabase/            migration, optional pgvector schema
tests/               unit (Vitest) and end-to-end (Playwright) tests
```
