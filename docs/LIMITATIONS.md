# Known limitations and next steps

## Limitations

1. **The text is an unofficial transcription**, verified against an official source for two articles only. It may contain transcription errors and may not reflect amendments after 4 July 2025 or the 2026 revised edition.
2. **Article 163** may show wording that a court has invalidated. This is flagged on the page but unresolved.
3. **No official article headings.** Labels are editorial.
4. **English text only.** No official French or Kreol translation was found.
5. **Constitution AI has not been run against the live API.** See `docs/TESTING.md`.
6. **French and Kreol interface translations are unreviewed.** The Kreol dictionary is partial and falls back to English.
7. **Voice input depends on the browser.** No Firefox support; Kreol is a French-recogniser fallback.
8. **The Constitution only.** No Acts, regulations or case law. Many practical questions depend on those.
9. **Topic guides were written without review by a Seychelles lawyer.**
10. **Rate limiting is per server instance**, not global.
11. **No analytics or feedback collection**, so there is no data on which answers are poor.
12. **Schedule 7 parts are long single pages** rather than split by paragraph.

## Recommended next steps

In priority order:

1. Obtain the official consolidated text (ask SeyLII or the Law Commission for the 2026 revised edition or a bulk copy), diff it against the dataset, and switch `textStatus` to official once reconciled. Add official article headings at the same time.
2. Add an API key and complete the "Before launch" checks.
3. Confirm the status of the Tenth Amendment from the Constitutional Court judgment and update article 163.
4. Legal review of topics and labels; native-speaker review of French and Kreol strings.
5. Shared rate limiting (Vercel firewall or a small key-value store).
6. A feedback button ("this explanation looks wrong") using the existing `feedback` table.
7. An evaluation set of questions with expected citations, run automatically against the live model on each change.
8. If official translations become available, add them as separate document versions with `text_status = 'official-translation'`.
9. Spoken answers (text-to-speech), after voice input is proven on real devices.
10. Offline reading via a service worker, useful on poor connections.
