const iconMap: Record<string, string> = {
  plane: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  building: "M3 21h18M3 7v14M21 7v14M6 11h.01M6 15h.01M10 11h.01M10 15h.01M14 11h.01M14 15h.01M18 11h.01M18 15h.01M6 3h12l3 4H3l3-4z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  planned: "bg-sky/20 text-sky",
  completed: "bg-paa-gray/20 text-paa-gray",
};

interface InitiativeCardProps {
  title: string;
  description: string;
  icon?: string | null;
  status: string;
  category?: string | null;
}

export function InitiativeCard({
  title,
  description,
  icon,
  status,
}: InitiativeCardProps) {
  const path = icon && iconMap[icon] ? iconMap[icon] : iconMap.plane;
  const statusClass = statusColors[status] || statusColors.active;

  return (
    <div className="group rounded-xl border border-white/10 bg-navy/50 p-6 transition-all hover:border-accent/30 hover:bg-navy/80">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={path} />
          </svg>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClass}`}
        >
          {status}
        </span>
      </div>
      <h3 className="mb-2 font-heading text-lg font-bold text-paa-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-paa-gray">{description}</p>
    </div>
  );
}
