export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="font-heading text-sm uppercase tracking-wider text-paa-gray">
          Loading...
        </p>
      </div>
    </div>
  );
}
