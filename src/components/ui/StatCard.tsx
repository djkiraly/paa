import { AnimatedCounter } from "./AnimatedCounter";

interface StatCardProps {
  label: string;
  numericValue?: number | null;
  value: string;
  prefix?: string | null;
  suffix?: string | null;
  source?: string | null;
  year?: number | null;
}

export function StatCard({
  label,
  numericValue,
  value,
  prefix,
  suffix,
  source,
  year,
}: StatCardProps) {
  return (
    <div className="group rounded-xl border border-white/10 bg-navy/50 p-6 transition-all hover:border-accent/30 hover:bg-navy/80">
      <div className="mb-2 font-heading text-3xl font-bold text-accent lg:text-4xl">
        {numericValue ? (
          <AnimatedCounter
            value={numericValue}
            prefix={prefix || ""}
            suffix={suffix || ""}
          />
        ) : (
          <span>{value}</span>
        )}
      </div>
      <div className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-paa-white">
        {label}
      </div>
      {(source || year) && (
        <div className="text-xs text-paa-gray">
          {source && <span>Source: {source}</span>}
          {source && year && <span> &middot; </span>}
          {year && <span>{year}</span>}
        </div>
      )}
    </div>
  );
}
