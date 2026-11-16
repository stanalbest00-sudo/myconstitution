"use client";
import { useState } from "react";
import { useI18n } from "./I18nProvider";

export function CopyLink({ path, title }: { path: string; title: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const url = () => new URL(path, window.location.origin).toString();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      // Clipboard API unavailable (older browsers, insecure context): fall back to a prompt the user can copy from.
      window.prompt(t.reader.copy, url());
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button type="button" onClick={copy} className="btn btn-ghost text-sm">
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" /></svg>
        <span aria-live="polite">{copied ? t.reader.copied : t.reader.copy}</span>
      </button>
      <button
        type="button"
        className="btn btn-ghost text-sm"
        onClick={() => {
          if (navigator.share) navigator.share({ title, url: url() }).catch(() => {});
          else copy();
        }}
      >
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
        {t.reader.share}
      </button>
    </div>
  );
}
