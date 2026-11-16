#!/usr/bin/env node
/**
 * Generates SQL that loads the verified dataset into the Supabase schema.
 *
 *   node scripts/export-sql.mjs > supabase/seed.sql
 *
 * The import is one transaction: rows are inserted as a draft version and
 * publish_version() refuses to publish if the article count is wrong.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const data = read("data/constitution.en.json");
const manifest = read("data/sources/manifest.json");
const labels = read("data/labels.en.json");

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const out = [];
out.push("begin;");

for (const d of manifest.documents) {
  out.push(
    `insert into source_documents (id, title, publisher, is_official, url, pdf_url, sha256, retrieved_on, publication_date, notes) values (` +
      [q(d.id), q(d.title), q(d.publisher), d.official ? "true" : "false", q(d.url), q(d.pdfUrl), q(d.sha256), q(d.retrievedOn), q(d.publicationDate), q(d.note)].join(", ") +
      `) on conflict (id) do update set title = excluded.title, url = excluded.url, sha256 = excluded.sha256, retrieved_on = excluded.retrieved_on, notes = excluded.notes;`,
  );
}
const src = manifest.documents.find((d) => d.id === manifest.activeTextSource);
out.push(
  `insert into document_versions (source_document_id, language, text_status, consolidated_through, verification, stats, source_sha256) values (` +
    [q(src.id), q(data.language), q(src.textStatus), q(src.consolidatedThrough), q(src.verification), `${q(JSON.stringify(data.stats))}::jsonb`, q(data.sourceSha256)].join(", ") +
    `);`,
);
const V = "currval(pg_get_serial_sequence('document_versions', 'id'))";

data.chapters.forEach((c, i) => {
  out.push(`insert into chapters (version_id, number, title, heading, position) values (${V}, ${q(c.number)}, ${q(c.title)}, ${q(c.heading)}, ${i});`);
  c.parts.forEach((p, j) =>
    out.push(`insert into parts (version_id, chapter_number, number, title, heading, position) values (${V}, ${q(c.number)}, ${q(p.number)}, ${q(p.title)}, ${q(p.heading)}, ${j});`),
  );
});
for (const p of data.provisions) {
  out.push(
    `insert into provisions (version_id, provision_id, kind, number, label, chapter_number, part_number, schedule_number, section_heading, source_heading, repealed, position, content, body) values (` +
      [V, q(p.id), q(p.kind), q(p.number), q(p.label), q(p.chapter), q(p.part), q(p.schedule), q(p.sectionHeading), q(p.sourceHeading), p.repealed ? "true" : "false", p.order, `${q(JSON.stringify(p.content))}::jsonb`, q(p.text)].join(", ") +
      `);`,
  );
}
for (const [number, label] of Object.entries(labels)) {
  if (number === "_note") continue;
  out.push(`insert into editorial_labels (provision_id, language, label, reviewed) values (${q(`article-${number.toLowerCase()}`)}, 'en', ${q(label)}, false) on conflict (provision_id, language) do update set label = excluded.label;`);
}
out.push(
  `insert into amendments (title, act_reference, commenced_on, affected_provisions, source_url, verification_status, notes) values ` +
    `('Constitution of the Republic of Seychelles (Twelfth Amendment) Act, 2025', 'Act 6 of 2025', '2025-07-04', '{article-113,article-114}', ${q(manifest.documents.find((d) => d.id === "act-6-2025").url)}, 'verified-official', 'Compared word-for-word with the consolidated text.');`,
);
out.push(`select publish_version(${V}, ${data.stats.articles});`);
out.push("commit;");
process.stdout.write(out.join("\n") + "\n");
