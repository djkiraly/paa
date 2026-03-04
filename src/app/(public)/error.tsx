"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 font-heading text-3xl font-bold text-paa-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-paa-gray">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-accent px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
