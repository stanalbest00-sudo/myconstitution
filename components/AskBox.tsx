"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { askHref } from "@/lib/links";
import { useI18n } from "./I18nProvider";
import { useSpeech, type SpeechLang } from "./useSpeech";

const MAX = 500;

export function AskBox({ initial = "", onAsk, large = false }: { initial?: string; onAsk?: (q: string) => void; large?: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(initial);
  const [interim, setInterim] = useState("");
  const [heard, setHeard] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [lang, setLang] = useState<SpeechLang>(locale === "fr" || locale === "crs" ? (locale as SpeechLang) : "en");
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setValue(initial); }, [initial]); // eslint-disable-line react-hooks/set-state-in-effect -- follow the question shown on the page

  const speech = useSpeech((fin, part) => {
    setInterim(part);
    if (fin) {
      setValue((v) => (v ? v.trimEnd() + " " : "") + fin.trim());
      setHeard(true);
    }
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (speech.listening) speech.stop();
    const q = value.trim();
    if (q.length < 3) { setProblem(t.ask.tooShort); box.current?.focus(); return; }
    setProblem(null);
    setHeard(false);
    if (onAsk) onAsk(q); else router.push(askHref(q));
  }

  const voiceError = speech.error ? t.voice[speech.error] : null;

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <label htmlFor={id} className={large ? "sr-only" : "eyebrow mb-2 block"}>{t.ask.label}</label>
      <div className="card overflow-hidden shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
        <textarea
          id={id}
          ref={box}
          value={value}
          onChange={(e) => { setValue(e.target.value.slice(0, MAX)); setProblem(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
          rows={large ? 3 : 2}
          maxLength={MAX}
          placeholder={t.ask.placeholder}
          aria-describedby={`${id}-hint`}
          aria-invalid={problem ? true : undefined}
          enterKeyHint="search"
          className="block w-full resize-none bg-transparent px-4 pt-4 text-[1.05rem] leading-snug outline-none placeholder:text-muted/80"
        />
        {speech.listening && (
          <p className="px-4 text-sm text-muted" aria-live="polite">
            <span className="pulse-dot mr-2 inline-block h-2.5 w-2.5 rounded-full bg-warn align-middle" aria-hidden />
            {t.voice.listening} <span className="italic">{interim}</span>
          </p>
        )}
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (speech.listening ? speech.stop() : speech.start(lang))}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? t.voice.stop : t.voice.start}
              title={speech.listening ? t.voice.stop : t.voice.start}
              disabled={!speech.supported}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                speech.listening ? "border-warn bg-warn-soft text-warn" : "border-line bg-surface hover:border-accent"
              }`}
            >
              {speech.listening ? (
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              ) : (
                <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
              )}
            </button>
            <label className="text-sm">
              <span className="sr-only">{t.voice.lang}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as SpeechLang)}
                disabled={!speech.supported || speech.listening}
                className="h-11 max-w-[8.5rem] rounded-full border border-line bg-surface px-3 text-sm disabled:opacity-45 sm:max-w-none"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="crs">Kreol Seselwa (experimental)</option>
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs tabular-nums text-muted min-[400px]:inline" aria-hidden>{value.length}/{MAX}</span>
            <button type="submit" className="btn btn-primary px-5 sm:px-6">
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.500-3.500" /></svg>
              {t.ask.submit}
            </button>
          </div>
        </div>
      </div>
      <div id={`${id}-hint`} className="mt-2 space-y-1 text-sm text-muted">
        {problem && <p role="alert" className="font-medium text-warn">{problem}</p>}
        {voiceError && <p role="alert" className="text-warn">{voiceError}</p>}
        {!speech.supported && !voiceError && <p>{t.voice.unsupported}</p>}
        {heard && !speech.listening && <p role="status" className="font-medium text-ink">{t.voice.review}</p>}
        {lang === "crs" && speech.supported && <p>{t.voice.crsNote}</p>}
        {large && !problem && !voiceError && !heard && <p>{t.ask.hint}</p>}
      </div>
    </form>
  );
}
