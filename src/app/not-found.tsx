import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="mb-2 font-heading text-6xl font-bold text-accent">404</p>
        <h1 className="mb-4 font-heading text-3xl font-bold text-paa-white">
          Page Not Found
        </h1>
        <p className="mb-8 text-sm text-paa-gray">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-full bg-accent px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
