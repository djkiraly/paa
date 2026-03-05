import type { Metadata } from "next";
import { getStats } from "@/lib/queries";
import { StatCard } from "@/components/ui/StatCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "KBFF Airport",
  description:
    "Statistics, infrastructure, and history of Western Nebraska Regional Airport (KBFF) in Scottsbluff, Nebraska.",
};

export const dynamic = "force-dynamic";

export default async function AirportPage() {
  const statsData = await getStats();

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            KBFF / BFF
          </p>
          <h1 className="mb-4 font-heading text-5xl font-bold text-paa-white md:text-6xl">
            Western Nebraska
            <br />
            Regional Airport
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-paa-gray">
            William B. Heilig Field — serving the Scottsbluff/Gering region and
            the greater Nebraska Panhandle since its establishment as a key
            regional aviation facility.
          </p>
        </ScrollReveal>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <ScrollReveal>
          <h2 className="mb-8 font-heading text-3xl font-bold text-paa-white">
            Airport Statistics
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statsData.map((stat, i) => (
            <ScrollReveal key={stat.id} delay={i * 75}>
              <StatCard
                label={stat.label}
                value={stat.value}
                numericValue={stat.numericValue}
                prefix={stat.prefix}
                suffix={stat.suffix}
                source={stat.source}
                year={stat.year}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Runway Divider */}
      <div className="runway-divider">
        <div className="runway-dash-short" />
        <div className="runway-dash" />
        <div className="runway-dash" />
        <div className="runway-dash" />
        <div className="runway-dash-short" />
      </div>

      {/* Infrastructure */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <h2 className="mb-8 font-heading text-3xl font-bold text-paa-white">
            Infrastructure
          </h2>
        </ScrollReveal>
        <div className="grid gap-8 lg:grid-cols-2">
          <ScrollReveal>
            <div className="rounded-xl border border-white/10 bg-navy/50 p-6">
              <h3 className="mb-4 font-heading text-xl font-bold text-accent">
                Runway 12/30 — Primary
              </h3>
              <div className="space-y-2 text-sm text-paa-gray">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Length</span>
                  <span className="font-mono text-paa-white">8,009 ft</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Width</span>
                  <span className="font-mono text-paa-white">150 ft</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Surface</span>
                  <span className="font-mono text-paa-white">Asphalt/Concrete</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Lighting</span>
                  <span className="font-mono text-paa-white">HIRL</span>
                </div>
                <div className="flex justify-between">
                  <span>ILS Equipped</span>
                  <span className="font-mono text-accent">Yes</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="rounded-xl border border-white/10 bg-navy/50 p-6">
              <h3 className="mb-4 font-heading text-xl font-bold text-accent">
                Runway 5/23 — Crosswind
              </h3>
              <div className="space-y-2 text-sm text-paa-gray">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Length</span>
                  <span className="font-mono text-paa-white">5,702 ft</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Width</span>
                  <span className="font-mono text-paa-white">75 ft</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Surface</span>
                  <span className="font-mono text-paa-white">Asphalt</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Lighting</span>
                  <span className="font-mono text-paa-white">MIRL</span>
                </div>
                <div className="flex justify-between">
                  <span>ILS Equipped</span>
                  <span className="font-mono text-paa-gray">No</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Facilities */}
      <section className="topo-texture border-y border-white/10 bg-navy/20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
          <ScrollReveal>
            <h2 className="mb-8 font-heading text-3xl font-bold text-paa-white">
              Facilities & Services
            </h2>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Elevation", value: "3,967 ft MSL" },
              { label: "Ownership", value: "Scotts Bluff County" },
              { label: "UNICOM", value: "122.8 MHz" },
              { label: "Approach", value: "Denver Center" },
              { label: "Fuel Types", value: "100LL, Jet-A" },
              { label: "Classification", value: "Non-hub Primary" },
              { label: "Terminal", value: "Commercial w/ TSA" },
              { label: "FBO", value: "On-field FBO" },
              { label: "Based Aircraft", value: "~42 total" },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 50}>
                <div className="rounded-lg border border-white/10 bg-navy/30 p-4">
                  <div className="mb-1 font-heading text-xs font-semibold uppercase tracking-wider text-paa-gray">
                    {item.label}
                  </div>
                  <div className="font-heading text-lg font-bold text-paa-white">
                    {item.value}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* EAS Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <h2 className="mb-4 font-heading text-3xl font-bold text-paa-white">
            Essential Air Service
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-paa-gray">
            Scottsbluff is an Essential Air Service community, receiving
            federally subsidized air service to ensure continued connectivity for
            rural communities.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <div className="mb-1 font-heading text-xs uppercase tracking-wider text-paa-gray">
                  Carrier
                </div>
                <div className="font-heading text-lg font-bold text-paa-white">
                  SkyWest / United Express
                </div>
              </div>
              <div>
                <div className="mb-1 font-heading text-xs uppercase tracking-wider text-paa-gray">
                  Destination
                </div>
                <div className="font-heading text-lg font-bold text-paa-white">
                  Denver (DEN)
                </div>
              </div>
              <div>
                <div className="mb-1 font-heading text-xs uppercase tracking-wider text-paa-gray">
                  Frequency
                </div>
                <div className="font-heading text-lg font-bold text-paa-white">
                  2 Daily Round Trips
                </div>
              </div>
              <div>
                <div className="mb-1 font-heading text-xs uppercase tracking-wider text-paa-gray">
                  Annual Subsidy
                </div>
                <div className="font-heading text-lg font-bold text-accent">
                  ~$3.2 Million
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Historical Enplanements */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <ScrollReveal>
          <h2 className="mb-8 font-heading text-3xl font-bold text-paa-white">
            Enplanement Trends
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-navy/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left font-heading text-xs font-bold uppercase tracking-wider text-paa-gray">
                    Year
                  </th>
                  <th className="px-6 py-4 text-right font-heading text-xs font-bold uppercase tracking-wider text-paa-gray">
                    Enplanements
                  </th>
                  <th className="px-6 py-4 text-left font-heading text-xs font-bold uppercase tracking-wider text-paa-gray">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { year: 2023, total: "8,213", note: "Near pre-COVID levels" },
                  { year: 2022, total: "7,650", note: "Continued recovery" },
                  { year: 2021, total: "6,100", note: "Recovery period" },
                  { year: 2020, total: "4,500", note: "COVID-19 impact" },
                  { year: 2019, total: "9,876", note: "Pre-COVID baseline" },
                ].map((row) => (
                  <tr
                    key={row.year}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-3 font-mono text-paa-white">
                      {row.year}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-accent">
                      {row.total}
                    </td>
                    <td className="px-6 py-3 text-paa-gray">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-paa-gray/60">
            Source: FAA Passenger Boarding Data (estimates pending verification).
          </p>
        </ScrollReveal>
      </section>
    </div>
  );
}
