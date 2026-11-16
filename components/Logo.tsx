/** Abstract mark: an open book whose pages rise like a coco-de-mer palm fan. Not a state emblem. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="10" fill="var(--accent)" />
      <g fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 29V15" />
        <path d="M20 29c-3-2.200-6.500-3-10-3V13c3.500 0 7 .8 10 3" />
        <path d="M20 29c3-2.200 6.500-3 10-3V13c-3.500 0-7 .8-10 3" />
        <path d="M20 12c0-2 1-3.500 2.800-4.500M20 12c0-2-1-3.500-2.800-4.500M20 12V6.500" opacity=".85" />
      </g>
    </svg>
  );
}
