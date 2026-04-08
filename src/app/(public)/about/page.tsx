import type { Metadata } from "next";
import { getLeadership, getSiteConfig } from "@/lib/queries";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const defaultDesc =
    "Learn about the Panhandle Aviation Alliance — our mission, vision, and the people working to strengthen aviation in Western Nebraska.";
  return {
    title: config.seo_title_about || "About",
    description: config.seo_description_about || defaultDesc,
    ...(config.seo_og_image_about || config.seo_og_image
      ? {
          openGraph: {
            images: [{ url: config.seo_og_image_about || config.seo_og_image }],
          },
        }
      : {}),
  };
}

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const leadershipData = await getLeadership();

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Our Story
          </p>
          <h1 className="mb-6 font-heading text-5xl font-bold text-paa-white md:text-6xl">
            About the Alliance
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-paa-gray">
            The Panhandle Aviation Alliance is a regional advocacy organization
            dedicated to preserving and enhancing aviation infrastructure, air
            service, and aviation-driven economic development in Western
            Nebraska.
          </p>
        </ScrollReveal>
      </section>

      {/* Mission / Vision */}
      <section className="topo-texture border-y border-white/10 bg-navy/20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <div>
                <h2 className="mb-4 font-heading text-3xl font-bold text-accent">
                  Mission
                </h2>
                <p className="text-sm leading-relaxed text-paa-gray">
                  To advocate for the continued investment in, and improvement
                  of, aviation infrastructure and air service in the Nebraska
                  Panhandle region, ensuring that our communities remain
                  connected to the national air transportation network and that
                  aviation continues to drive regional economic development.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div>
                <h2 className="mb-4 font-heading text-3xl font-bold text-accent">
                  Vision
                </h2>
                <p className="text-sm leading-relaxed text-paa-gray">
                  A Western Nebraska where reliable, affordable air service
                  connects our communities to the world—fueling economic growth,
                  healthcare access, educational opportunity, and quality of life
                  for every resident of the Panhandle.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <h2 className="mb-6 font-heading text-3xl font-bold text-paa-white">
            Why This Matters
          </h2>
          <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-paa-gray">
            <p>
              Rural communities across America face a growing air service crisis.
              As airlines consolidate operations in larger hubs, smaller markets
              risk losing the connectivity that sustains their economies.
            </p>
            <p>
              The Nebraska Panhandle is no exception. Western Nebraska Regional
              Airport (KBFF) in Scottsbluff is the primary commercial aviation
              facility for a service area spanning over 95,000 people across
              western Nebraska, southeastern Wyoming, and northeastern Colorado.
            </p>
            <p>
              The Essential Air Service program provides a vital lifeline, but
              advocacy is needed to ensure continued federal support, to improve
              airport infrastructure, and to make the case for aviation&apos;s role
              as an economic engine for the region.
            </p>
            <p>
              The Panhandle Aviation Alliance was formed to be that voice—uniting
              community leaders, business owners, elected officials, pilots, and
              engaged citizens in the shared mission of keeping our skies open
              and our communities connected.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Leadership */}
      {leadershipData.length > 0 && (
        <section className="topo-texture border-y border-white/10 bg-navy/20">
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
            <ScrollReveal>
              <h2 className="mb-8 font-heading text-3xl font-bold text-paa-white">
                Leadership
              </h2>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leadershipData.map((person, i) => (
                <ScrollReveal key={person.id} delay={i * 75}>
                  <div className="rounded-xl border border-white/10 bg-navy/50 p-6">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 font-heading text-2xl font-bold text-accent">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-paa-white">
                      {person.name}
                    </h3>
                    <p className="font-heading text-sm text-accent">
                      {person.title}
                    </p>
                    {person.organization && (
                      <p className="mt-1 text-xs text-paa-gray">
                        {person.organization}
                      </p>
                    )}
                    {person.bio && (
                      <p className="mt-3 text-sm leading-relaxed text-paa-gray">
                        {person.bio}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <ScrollReveal>
          <h2 className="mb-4 font-heading text-3xl font-bold text-paa-white">
            Ready to Make a Difference?
          </h2>
          <p className="mb-8 text-sm text-paa-gray">
            Join the Panhandle Aviation Alliance and help shape the future of
            aviation in Western Nebraska.
          </p>
          <a
            href="/#get-involved"
            className="inline-block rounded-full bg-accent px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
          >
            Get Involved
          </a>
        </ScrollReveal>
      </section>
    </div>
  );
}
