"use client";
import { useEffect, useState } from "react";
import { Answer } from "@/components/Answer";
import { AskBox } from "@/components/AskBox";
import { useI18n } from "@/components/I18nProvider";

function readHash(): string {
  const m = /[#&]q=([^&]*)/.exec(window.location.hash);
  if (!m) return "";
  try { return decodeURIComponent(m[1]).slice(0, 500).trim(); } catch { return ""; }
}

export function AskClient() {
  const { t } = useI18n();
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const sync = () => setQuestion(readHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className="wrap max-w-3xl py-8">
      <h1 className="display text-3xl font-semibold sm:text-4xl">{t.ask.heading}</h1>
      <p className="mt-2 text-muted">{t.ask.hint}</p>
      <div className="mt-5">
        <AskBox
          initial={question}
          onAsk={(q) => {
            // Keep the question in the fragment so it is shareable but never sent in a URL to the server.
            window.history.pushState(null, "", `#q=${encodeURIComponent(q)}`);
            setQuestion(q);
          }}
        />
      </div>
      {question && (
        <div className="mt-8">
          <p className="eyebrow">{t.ask.newQuestion}</p>
          <p className="display mb-5 mt-1 text-xl font-semibold">{question}</p>
          <Answer key={question} question={question} />
        </div>
      )}
      <p className="mt-10 text-sm text-muted">{t.voice.privacy}</p>
    </div>
  );
}
