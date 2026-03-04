"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/stats", label: "Stats", icon: "📈" },
  { href: "/admin/initiatives", label: "Initiatives", icon: "🎯" },
  { href: "/admin/leadership", label: "Leadership", icon: "👥" },
  { href: "/admin/partners", label: "Partners", icon: "🤝" },
  { href: "/admin/sections", label: "Sections", icon: "📄" },
  { href: "/admin/contacts", label: "Contacts", icon: "✉️" },
  { href: "/admin/users", label: "Users", icon: "🔑" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-[var(--paa-midnight)]">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <Link href="/" className="text-lg font-bold text-[var(--paa-accent-light)] font-[family-name:var(--font-barlow)] hover:text-[var(--paa-accent)]">
          PAA Admin
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--paa-accent)]/20 text-[var(--paa-accent-light)]"
                  : "text-[var(--paa-gray)] hover:bg-white/5 hover:text-[var(--paa-white)]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 w-full border-t border-white/10 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--paa-gray)] transition-colors hover:bg-white/5 hover:text-[var(--paa-white)]"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
