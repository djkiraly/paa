import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/airport", label: "Airport" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Panhandle Aviation Alliance"
                width={44}
                height={44}
                className="rounded"
              />
              <div>
                <div className="font-heading text-sm font-bold uppercase tracking-wider text-paa-white">
                  Panhandle Aviation Alliance
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-paa-gray">
              Advocating for aviation infrastructure, air service, and economic
              development in Western Nebraska.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-paa-white">
              Navigation
            </h3>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-1 text-sm text-paa-gray transition-colors hover:text-accent sm:py-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-paa-white">
              Contact
            </h3>
            <div className="flex flex-col gap-2 text-sm text-paa-gray">
              <p>Scottsbluff, Nebraska</p>
              <a
                href="mailto:info@panhandleaviationalliance.org"
                className="break-all transition-colors hover:text-accent"
              >
                info@panhandleaviationalliance.org
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-paa-gray">
              &copy; {new Date().getFullYear()} Panhandle Aviation Alliance. All
              rights reserved.
            </p>
            <p className="text-xs text-paa-gray/60">
              Statistics are estimates based on public data sources. See
              individual source citations for details.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
