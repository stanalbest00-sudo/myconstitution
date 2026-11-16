import type { Metadata } from "next";
import Link from "next/link";
import { retrievedOn, sources, stats, textSource } from "@/lib/constitution";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Sources, method and limitations" };

export default async function About() {
  const { t } = await getI18n();
  return (
    <div className="wrap max-w-3xl py-8 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
      <h1 className="display text-3xl font-semibold sm:text-4xl">{t.about.title}</h1>
      <p className="text-lg text-muted">{t.independent}</p>

      <h2 className="display">Where the constitutional text comes from</h2>
      <p>
        The text shown on this site was transcribed from <strong>{textSource.title}</strong>, published by the {textSource.publisher}, and
        retrieved on {retrievedOn}. It is consolidated through the {textSource.consolidatedThrough}.
      </p>
      <p>
        <span className="badge bg-warn-soft text-warn">{t.reader.unofficial}</span>{" "}
        This is a reputable academic transcription, but it is <strong>not an official publication</strong> of the Republic of Seychelles.
        {" "}{textSource.verification}
      </p>
      <p>
        The dataset contains {stats.chapters} chapters, {stats.articles} articles (numbered 1 to 170, with seven inserted articles such as 10A and 115A)
        and {stats.schedules} schedules. Every import is checked automatically for missing, duplicated or out-of-order articles before it can be published.
      </p>

      <h2 className="display">Documents consulted</h2>
      <ul>
        {sources.map((d) => (
          <li key={d.id}>
            <a className="link" href={d.url} target="_blank" rel="noopener noreferrer">{d.title}</a>{" "}
            <span className="text-muted">— {d.publisher}. {d.official ? "Official publication." : "Not an official publication."}</span>
            {"note" in d && d.note ? <span className="text-muted"> {d.note}</span> : null}
          </li>
        ))}
      </ul>

      <h2 className="display">Known issues with the text</h2>
      <ul>
        <li>The official revised edition of the Constitution that the Law Commission was directed to prepare as at 1 June 2026 (S.I. 46 of 2026) had not been located when this site was built. When it is available, the text here should be re-verified against it.</li>
        <li>The official marginal headings of articles are not included in the source used. The short labels beside article numbers are written by this site and are marked as editorial.</li>
        <li>The transcription contains occasional typographical slips (for example a missing hyphen in “Vice-President” in a few places, and paragraph (c) is absent from the list in article 40). They are reproduced as found rather than silently corrected.</li>
        <li>Article 163 includes wording from the Tenth Amendment (2022), which press reports say the Constitutional Court declared unconstitutional. See the note on <Link className="link" href="/constitution/article-163">Article 163</Link>.</li>
        <li>No official Kreol Seselwa or French translation of the consolidated Constitution was located. The constitutional text is therefore shown in English only.</li>
      </ul>

      <h2 className="display">Three kinds of content, kept separate</h2>
      <ul>
        <li><strong>{t.reader.officialText}.</strong> Shown in a serif typeface inside a marked box. Never edited, summarised or translated by AI.</li>
        <li><strong>Editorial content.</strong> Article labels, topic guides and scenarios written for this site. Marked as editorial and linked to the provisions they describe.</li>
        <li><strong>{t.answer.aiLabel}.</strong> Produced by Constitution AI for your question, always carrying a purple label, with links to the provisions it relied on.</li>
      </ul>

      <h2 className="display">How Constitution AI works</h2>
      <p>
        When you ask a question, the site first searches the Constitution for the most relevant provisions. Only those provisions are given to the AI model,
        which is instructed to answer from them alone and to say so when they do not answer the question. Before an answer is shown, the site checks that every
        cited provision was actually retrieved, removes any that were not, and warns you if the explanation mentions an article it was never shown.
      </p>
      <p>AI can still make mistakes in how it explains a provision. Always read the linked text. If AI is unavailable, the site shows the matching provisions without an explanation.</p>

      <h2 className="display">Languages and voice</h2>
      <ul>
        <li>The interface is complete in English. French and Kreol Seselwa interface translations are provided as unreviewed previews and are labelled as such.</li>
        <li>You can ask questions in English, French or Kreol Seselwa. AI explanations in other languages are AI-generated and are never official translations of the Constitution.</li>
        <li>Voice input uses your browser&apos;s built-in speech recognition where available (for example Chrome, Edge and Safari). We have not found a speech recognition service that supports Kreol Seselwa, so that option is experimental and uses French recognition. You can always edit the text before asking.</li>
      </ul>

      <h2 className="display">Privacy</h2>
      <ul>
        <li>No account is needed and no advertising or tracking scripts are used.</li>
        <li>Questions are sent to the site&apos;s server and, when AI is enabled, to the AI provider (Anthropic) to generate the answer. This site does not store questions or answers.</li>
        <li>Your question is kept in the part of the web address after “#”, which browsers do not send to servers, so it does not appear in server access logs.</li>
        <li>Audio is never sent to or stored by this site. Speech recognition is performed by your browser&apos;s speech service, which may process audio on the browser vendor&apos;s servers.</li>
        <li>Two small preferences (language and colour theme) are saved in your browser.</li>
      </ul>

      <h2 className="display">{t.disclaimer.title}</h2>
      <p>{t.disclaimer.body}</p>
      <p>
        Many questions depend on Acts of the National Assembly, regulations and court decisions that are not part of the Constitution and are not covered by this site.
        The official laws of Seychelles are published in the Official Gazette and on SeyLII.
      </p>
    </div>
  );
}
