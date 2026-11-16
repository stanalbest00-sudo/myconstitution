"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typings for the Web Speech API (not in TypeScript's DOM lib). */
interface SpeechResult { isFinal: boolean; 0: { transcript: string } }
interface SpeechEvent { resultIndex: number; results: ArrayLike<SpeechResult> }
interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

export type SpeechError = "unsupported" | "denied" | "noSpeech" | "error";
export type SpeechLang = "en" | "fr" | "crs";

/** Recogniser locale per interface language. No engine offers Seychellois Creole; French is the closest fallback. */
const RECOGNISER_LANG: Record<SpeechLang, string> = { en: "en-GB", fr: "fr-FR", crs: "fr-FR" };

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Microphone dictation. Audio goes from the browser to the browser vendor's
 * speech service; this app only ever sees the resulting text, and only after
 * the user has had the chance to edit it.
 */
export function useSpeech(onText: (finalText: string, interim: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechError | null>(null);
  const [supported, setSupported] = useState(true);
  const rec = useRef<Recognition | null>(null);
  const cb = useRef(onText);
  useEffect(() => { cb.current = onText; });

  useEffect(() => {
    setSupported(getCtor() !== null); // eslint-disable-line react-hooks/set-state-in-effect -- feature-detect after mount
    return () => {
      // Release the microphone if the component goes away mid-recording.
      if (rec.current) { rec.current.onresult = rec.current.onerror = rec.current.onend = null; rec.current.abort(); rec.current = null; }
    };
  }, []);

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback((lang: SpeechLang) => {
    const Ctor = getCtor();
    if (!Ctor) { setSupported(false); setError("unsupported"); return; }
    setError(null);
    rec.current?.abort();
    const r = new Ctor();
    r.lang = RECOGNISER_LANG[lang];
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      let fin = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) fin += res[0].transcript; else interim += res[0].transcript;
      }
      cb.current(fin, interim);
    };
    r.onerror = (e) => {
      if (e.error === "aborted") return;
      setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "noSpeech" : "error");
    };
    r.onend = () => { setListening(false); rec.current = null; cb.current("", ""); };
    rec.current = r;
    try { r.start(); setListening(true); } catch { setError("error"); setListening(false); }
  }, []);

  return { listening, error, supported, start, stop };
}
