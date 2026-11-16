"use client";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="wrap max-w-xl py-16 text-center">
      <h1 className="display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">The page could not be displayed. The Constitution text is unaffected.</p>
      <button type="button" onClick={retry} className="btn btn-primary mt-6">Try again</button>
    </div>
  );
}
