# Source provenance

Machine-readable version: [`data/sources/manifest.json`](../data/sources/manifest.json). All documents were retrieved on **2026-11-16**.

## Text used on the site

| | |
| --- | --- |
| Title | Seychelles's Constitution of 1993 with Amendments through 2025 |
| Publisher | Constitute Project (Comparative Constitutions Project) |
| Official? | **No.** Academic transcription. |
| URL | https://www.constituteproject.org/constitution/Seychelles_2025 |
| PDF | https://www.constituteproject.org/constitution/Seychelles_2025.pdf (publisher-generated 9 June 2026) |
| Snapshot | `data/sources/constitute-seychelles-2025.html` |
| SHA-256 | recorded in the manifest and checked on every ingestion |
| Consolidated through | Constitution of the Republic of Seychelles (Twelfth Amendment) Act, 2025 (Act 6 of 2025), 4 July 2025 |
| Verification status | **Partially verified.** Articles 113 and 114 match the Official Gazette text of Act 6 of 2025 word for word. The rest has not been compared with an official consolidation. |

The constitutional text itself is a public legal instrument. Constitute's presentation and topic tagging are theirs; this project stores only the text and structure and credits the source on every page. Confirm Constitute's current terms of use before any commercial use.

## Official documents consulted

| Document | Publisher | Use |
| --- | --- | --- |
| Constitution of the Republic of Seychelles (Twelfth Amendment) Act, 2025 (Act 6 of 2025), 4 July 2025. https://ecs.sc/wp-content/uploads/2025/07/Act-6-2025-Constitution-of-the-Republic-of-Seychelles-Twelfth-Amendment-Act-2025.pdf | Supplement to Official Gazette (copy hosted by the Electoral Commission) | Verification of articles 113 and 114. Stored in `data/sources/`. |
| Law Commission (Special Revision Date for Specific Laws of Seychelles) Notice, 2026 (S.I. 46 of 2026), 1 June 2026. https://www.gazette.sc/ | Supplement to Official Gazette | Shows a revised edition as at 1 June 2026 was ordered. |

## Referenced but not ingested

| Document | Why not |
| --- | --- |
| SeyLII consolidated Constitution (Cap. 42), version at 4 July 2025. https://seylii.org/akn/sc/act/si/1993/38/eng@2025-07-04 | CAPTCHA for automated clients; not bypassed. This is the recommended place for a human to check wording. |
| Refworld mirror of the SeyLII PDF | Refused automated access. |
| Law Commission revised edition (as at 1 June 2026) | Not located. |
| Seychelles Nation report on the Tenth Amendment ruling. https://nation.sc/articles/31689/court-invalidates-10th-constitutional-amendment | Press report, not opened directly; cited only in the article 163 status note. |

## Content types and how they are kept apart

| Type | Where it lives | How it is marked |
| --- | --- | --- |
| Constitutional text | `data/constitution.en.json` (generated, never hand-edited) | Serif text in a box titled "Text of the Constitution", `lang="en"` |
| Editorial labels | `data/labels.en.json` | "Editorial label" badge |
| Editorial topic guides and scenarios | `lib/topics.ts` | "Editorial guide" notice; every statement links to provisions |
| Status notes | `lib/constitution.ts` (`statusNotes`) | Warning box with its own source link |
| AI explanations | Generated per request, never stored | Purple "AI-generated explanation" badge |

## Updating the text after an amendment

1. Obtain the new consolidated text from a verifiable source and save it under `data/sources/`.
2. Add it to `manifest.json` with URL, date, SHA-256 and the `expected` structure; set `activeTextSource`.
3. Run `npm run ingest`. It refuses to write output if the hash, numbering, ordering or expected counts are wrong.
4. Review the diff of `data/constitution.en.json`, update `data/labels.en.json` and `lib/topics.ts` for any changed articles, and run `npm run check`.
5. Git history is the version history of the text. For the database, `publish_version()` supersedes the previous version only after a completeness check.
