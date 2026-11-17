"use client";
import { useEffect, useId, useRef, useState } from "react";
import { chunkText, speechLang } from "@/lib/tts";
import { useI18n } from "./I18nProvider";

type Status = "idle" | "playing" | "paused";
const RATES = [
  { value: 0.8, key: "slow" },
  { value: 1, key: "normal" },
  { value: 1.2, key: "fast" },
] as const;
const START_EVENT = "mcs-tts-start";

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.slice(0, 2);
  return (
    voices.find((v) => v.lang.replace("_", "-") === lang) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
    null
  );
}

/**
 * Reads text aloud with the browser's built-in speech synthesis.
 * Nothing is sent to this site. Pausing stops speech and remembers the
 * position, which behaves the same in every browser (native pause is
 * unreliable on Android).
 */
export function ReadAloud({ text, lang = "en", label }: { text: string; lang?: string; label?: string }) {
  const { t } = useI18n();
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [part, setPart] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(1);
  const chunks = useRef<string[]>([]);
  const index = useRef(0);
  const run = useRef(0); // bumped to invalidate callbacks from a stopped run
  const id = useRef(useId());
  const statusRef = useRef<Status>("idle");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSupported(ok); // eslint-disable-line react-hooks/set-state-in-effect -- feature-detect after mount
    if (!ok) return;
    const runRef = run;
    // Voices load asynchronously in some browsers; asking once starts the load.
    window.speechSynthesis.getVoices();
    const onOtherStart = (e: Event) => {
      if ((e as CustomEvent).detail !== id.current) {
        run.current++;
        setStatus("idle");
      }
    };
    window.addEventListener(START_EVENT, onOtherStart);
    return () => {
      window.removeEventListener(START_EVENT, onOtherStart);
      // Leaving the page stops speech that this reader started.
      if (statusRef.current !== "idle") window.speechSynthesis.cancel();
      runRef.current++;
    };
  }, []);

  // Stop if the text changes underneath us (for example a new answer).
  useEffect(() => {
    if (statusRef.current !== "idle") {
      run.current++;
      window.speechSynthesis?.cancel();
      setStatus("idle");
    }
  }, [text]);

  function speakFrom(i: number, token: number) {
      if (token !== run.current) return;
      if (i >= chunks.current.length) {
        setStatus("idle");
        index.current = 0;
        return;
      }
      index.current = i;
      setPart(i + 1);
      const u = new SpeechSynthesisUtterance(chunks.current[i]);
      const tag = speechLang(lang);
      u.lang = tag;
      const voice = pickVoice(tag);
      if (voice) u.voice = voice;
      u.rate = rateRef.current;
      u.onend = () => speakFrom(i + 1, token);
      u.onerror = (e) => {
        if (token !== run.current) return;
        if (e.error === "interrupted" || e.error === "canceled") {
          setStatus("idle");
          return;
        }
        setError(true);
        setStatus("idle");
      };
      window.speechSynthesis.speak(u);
  }

  const play = (from: number) => {
    const synth = window.speechSynthesis;
    window.dispatchEvent(new CustomEvent(START_EVENT, { detail: id.current }));
    const token = ++run.current;
    synth.cancel();
    setError(false);
    setStatus("playing");
    speakFrom(from, token);
  };

  const start = () => {
    chunks.current = chunkText(text);
    setTotal(chunks.current.length);
    play(0);
  };

  const pause = () => {
    run.current++;
    window.speechSynthesis.cancel();
    setStatus("paused");
  };

  const stop = () => {
    run.current++;
    window.speechSynthesis.cancel();
    index.current = 0;
    setStatus("idle");
  };

  if (!supported || !text.trim()) return null;

  const progress = t.tts.progress.replace("{n}", String(part)).replace("{total}", String(total));

  return (
    <div role="group" aria-label={label ?? t.tts.listen} className="no-print flex flex-wrap items-center gap-2">
      {status === "playing" ? (
        <button type="button" onClick={pause} className="btn btn-ghost text-sm">
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          {t.tts.pause}
        </button>
      ) : (
        <button type="button" onClick={() => (status === "paused" ? play(index.current) : start())} className="btn btn-ghost text-sm">
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.500 8.500a5 5 0 0 1 0 7M18.500 5.500a9 9 0 0 1 0 13" /></svg>
          {status === "paused" ? t.tts.resume : t.tts.listen}
        </button>
      )}
      {status !== "idle" && (
        <>
          <button type="button" onClick={stop} className="btn btn-ghost text-sm">
            <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            {t.tts.stop}
          </button>
          <label className="text-sm">
            <span className="sr-only">{t.tts.speed}</span>
            <select
              value={rate}
              onChange={(e) => {
                const r = Number(e.target.value);
                rateRef.current = r;
                setRate(r);
              }}
              className="h-11 rounded-full border border-line bg-surface px-3 text-sm"
            >
              {RATES.map((r) => (
                <option key={r.key} value={r.value}>{t.tts[r.key]}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <span className="text-sm text-muted" role="status" aria-live="polite">
        {status === "playing" && total > 1 ? progress : status === "paused" ? t.tts.paused : ""}
      </span>
      {error && <span role="alert" className="text-sm text-warn">{t.tts.error}</span>}
      {lang === "crs" && status !== "idle" && <span className="w-full text-sm text-muted">{t.tts.crsNote}</span>}
    </div>
  );
}
