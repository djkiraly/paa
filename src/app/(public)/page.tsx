import Link from "next/link";
import { getStats, getInitiatives } from "@/lib/queries";
import { StatCard } from "@/components/ui/StatCard";
import { InitiativeCard } from "@/components/ui/InitiativeCard";
import { ContactForm } from "@/components/ui/ContactForm";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function HomePage() {
  const [statsData, initiativesData] = await Promise.all([
    getStats(),
    getInitiatives(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight via-navy to-midnight" />
        {/* Runway dashes animation */}
        <div className="absolute bottom-0 left-1/2 h-64 w-px -translate-x-1/2">
          <div className="runway-animation flex flex-col items-center gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-1 rounded-full bg-accent/40"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  opacity: 1 - i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <ScrollReveal>
            <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Western Nebraska Aviation Advocacy
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-paa-white sm:text-5xl md:text-7xl lg:text-8xl">
              Connecting the
              <br />
              <span className="text-accent">Panhandle</span> to the World
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-paa-gray md:text-xl">
              The Panhandle Aviation Alliance champions air service, airport
              infrastructure, and aviation-driven economic growth for Western
              Nebraska.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/airport"
                className="rounded-full bg-accent px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
              >
                Explore KBFF Stats
              </Link>
              <Link
                href="#get-involved"
                className="rounded-full border border-white/20 px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-paa-white transition-colors hover:border-accent/50 hover:text-accent"
              >
                Get Involved
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission Band */}
      <section className="topo-texture border-y border-white/10 bg-navy/30">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
          <ScrollReveal>
            <blockquote className="mb-12 text-center font-heading text-2xl font-semibold italic text-paa-white md:text-3xl">
              &ldquo;Every runway is a lifeline. Every flight connects our
              community to opportunity.&rdquo;
            </blockquote>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "Advocate",
                desc: "We champion Western Nebraska's aviation needs at the local, state, and federal level.",
              },
              {
                title: "Educate",
                desc: "We build public understanding of aviation's critical role in our regional economy.",
              },
              {
                title: "Collaborate",
                desc: "We unite stakeholders—airports, airlines, businesses, and government—toward shared goals.",
              },
            ].map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 100}>
                <div className="text-center">
                  <h3 className="mb-3 font-heading text-xl font-bold uppercase tracking-wider text-accent">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-paa-gray">
                    {pillar.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
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

      {/* Stats Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              By the Numbers
            </p>
            <h2 className="font-heading text-3xl font-bold text-paa-white sm:text-4xl md:text-5xl">
              KBFF Airport Statistics
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statsData.slice(0, 6).map((stat, i) => (
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
        <div className="mt-8 text-center">
          <Link
            href="/airport"
            className="text-sm text-accent underline transition-colors hover:text-accent-light"
          >
            View detailed airport data &rarr;
          </Link>
        </div>
      </section>

      {/* Regional Importance */}
      <section className="topo-texture border-y border-white/10 bg-navy/20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <div>
                <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                  Regional Impact
                </p>
                <h2 className="mb-6 font-heading text-3xl font-bold text-paa-white sm:text-4xl">
                  The Heart of Western Nebraska Aviation
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-paa-gray">
                  <p>
                    Western Nebraska Regional Airport (KBFF) serves as the
                    primary commercial airport for the entire Nebraska Panhandle
                    and portions of southeastern Wyoming and northeastern
                    Colorado—a service area of approximately 95,000 people.
                  </p>
                  <p>
                    As an Essential Air Service (EAS) community, Scottsbluff
                    receives federally subsidized air service connecting the
                    region to Denver&apos;s hub, providing crucial access to
                    medical care, business travel, and economic opportunity.
                  </p>
                  <p>
                    The airport supports an estimated $28 million in annual
                    economic output and over 230 jobs—making it an indispensable
                    engine for the Panhandle economy.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="rounded-xl border border-white/10 bg-navy/50 p-5 sm:p-8">
                <h3 className="mb-6 font-heading text-lg font-bold uppercase tracking-wider text-paa-white">
                  Service Area
                </h3>
                <div className="space-y-3">
                  {[
                    { city: "Scottsbluff", pop: "14,598", role: "County Seat" },
                    { city: "Gering", pop: "8,500", role: "Twin City" },
                    { city: "Sidney", pop: "6,757", role: "Cheyenne Co." },
                    { city: "Alliance", pop: "8,491", role: "Box Butte Co." },
                    {
                      city: "Chadron",
                      pop: "5,851",
                      role: "Dawes Co.",
                    },
                    {
                      city: "Torrington, WY",
                      pop: "6,501",
                      role: "Cross-state",
                    },
                  ].map((c) => (
                    <div
                      key={c.city}
                      className="flex items-center justify-between border-b border-white/5 pb-2"
                    >
                      <div>
                        <span className="font-heading text-sm font-semibold text-paa-white">
                          {c.city}
                        </span>
                        <span className="ml-2 text-xs text-paa-gray">
                          {c.role}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-accent">
                        {c.pop}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Initiatives */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              What We Do
            </p>
            <h2 className="font-heading text-3xl font-bold text-paa-white sm:text-4xl md:text-5xl">
              Our Initiatives
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {initiativesData.map((init, i) => (
            <ScrollReveal key={init.id} delay={i * 75}>
              <InitiativeCard
                title={init.title}
                description={init.description}
                icon={init.icon}
                status={init.status}
                category={init.category}
              />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/initiatives"
            className="text-sm text-accent underline transition-colors hover:text-accent-light"
          >
            Learn more about our work &rarr;
          </Link>
        </div>
      </section>

      {/* Get Involved */}
      <section
        id="get-involved"
        className="topo-texture border-t border-white/10 bg-navy/20"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Join Us
              </p>
              <h2 className="font-heading text-3xl font-bold text-paa-white sm:text-4xl md:text-5xl">
                Get Involved
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <ScrollReveal>
              <div>
                <h3 className="mb-4 font-heading text-2xl font-bold text-paa-white">
                  Send Us a Message
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-paa-gray">
                  Whether you&apos;re a community member, business leader, pilot,
                  or public official—we&apos;d love to hear from you.
                </p>
                <ContactForm />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div>
                <h3 className="mb-4 font-heading text-2xl font-bold text-paa-white">
                  Partner With Us
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-paa-gray">
                  The Panhandle Aviation Alliance brings together businesses,
                  government agencies, and community organizations to strengthen
                  aviation in Western Nebraska.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      title: "Community Partners",
                      desc: "Local businesses and organizations supporting aviation advocacy.",
                    },
                    {
                      title: "Government Liaisons",
                      desc: "City, county, and state officials working on aviation policy.",
                    },
                    {
                      title: "Aviation Stakeholders",
                      desc: "Pilots, FBOs, airlines, and airport authorities.",
                    },
                    {
                      title: "Individual Supporters",
                      desc: "Community members who value air service connectivity.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg border border-white/10 bg-navy/30 p-4"
                    >
                      <h4 className="mb-1 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                        {item.title}
                      </h4>
                      <p className="text-sm text-paa-gray">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
