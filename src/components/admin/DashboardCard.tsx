import Link from "next/link";

export function DashboardCard({
  label,
  count,
  href,
  icon,
}: {
  label: string;
  count: number;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6 transition-colors hover:border-[var(--paa-accent)]/30"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
          {count}
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--paa-gray)]">{label}</p>
    </Link>
  );
}
