"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/airport", label: "Airport" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-midnight/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Panhandle Aviation Alliance"
            width={44}
            height={44}
            className="rounded"
          />
          <div className="hidden sm:block">
            <div className="font-heading text-sm font-bold uppercase tracking-wider text-paa-white">
              Panhandle Aviation
            </div>
            <div className="font-heading text-xs uppercase tracking-wider text-paa-gray">
              Alliance
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-sm uppercase tracking-wider text-paa-gray transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#get-involved"
            className="rounded-full bg-accent px-5 py-2 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
          >
            Get Involved
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-paa-gray transition-colors hover:text-accent md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-midnight/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-2 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 font-heading text-sm uppercase tracking-wider text-paa-gray transition-colors hover:bg-white/5 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#get-involved"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-accent px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
            >
              Get Involved
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
