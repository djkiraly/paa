import type { Metadata } from "next";
import { getInitiatives, getSiteConfig } from "@/lib/queries";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const defaultDesc =
    "Explore the Panhandle Aviation Alliance's initiatives for air service retention, infrastructure modernization, economic development, and community engagement.";
  return {
    title: config.seo_title_initiatives || "Initiatives",
    description: config.seo_description_initiatives || defaultDesc,
    ...(config.seo_og_image_initiatives || config.seo_og_image
      ? {
          openGraph: {
            images: [{ url: config.seo_og_image_initiatives || config.seo_og_image }],
          },
        }
      : {}),
  };
}

const detailedDescriptions: Record<string, string> = {
  "Air Service Retention":
    "Maintaining reliable air service is the cornerstone of our mission. We work directly with the U.S. Department of Transportation, airline partners, and local stakeholders to ensure that Essential Air Service connections remain viable and responsive to community needs. This includes monitoring subsidy renewals, advocating for schedule improvements, and building the ridership data that demonstrates demand.",
  "Infrastructure Modernization":
    "Modern aviation demands modern infrastructure. We advocate for continued investment in KBFF's runways, terminal facilities, navigational aids, and ground-side access. Current priorities include terminal renovation to improve the passenger experience, taxiway improvements for safety, and technology upgrades to support future aviation needs.",
  "Economic Development":
    "Aviation is an economic multiplier. We work to quantify and communicate the airport's economic impact—over $28 million in annual output and 230+ jobs—to decision-makers at every level. Our goal is to ensure that aviation investment is seen not as a cost, but as an essential driver of regional prosperity.",
  "Community Engagement":
    "Public support is the foundation of effective advocacy. Through educational events, media outreach, community forums, and partnerships with schools and civic organizations, we build understanding of why aviation matters to every resident of the Panhandle—whether or not they ever board a plane.",
};

export const dynamic = "force-dynamic";

export default async function InitiativesPage() {
  const initiativesData = await getInitiatives();

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <p className="mb-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Our Work
          </p>
          <h1 className="mb-6 font-heading text-5xl font-bold text-paa-white md:text-6xl">
            Initiatives
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-paa-gray">
            The Panhandle Aviation Alliance pursues a focused set of initiatives
            designed to protect and enhance aviation in Western Nebraska.
          </p>
        </ScrollReveal>
      </section>

      {/* Initiatives List */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="space-y-8">
          {initiativesData.map((init, i) => (
            <ScrollReveal key={init.id} delay={i * 100}>
              <div className="rounded-xl border border-white/10 bg-navy/50 p-8 transition-all hover:border-accent/20">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="font-heading text-2xl font-bold text-paa-white">
                    {init.title}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      init.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : init.status === "planned"
                          ? "bg-sky/20 text-sky"
                          : "bg-paa-gray/20 text-paa-gray"
                    }`}
                  >
                    {init.status}
                  </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-paa-gray">
                  {init.description}
                </p>
                {detailedDescriptions[init.title] && (
                  <p className="text-sm leading-relaxed text-paa-gray/80">
                    {detailedDescriptions[init.title]}
                  </p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="topo-texture border-t border-white/10 bg-navy/20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 text-center">
          <ScrollReveal>
            <h2 className="mb-4 font-heading text-3xl font-bold text-paa-white">
              Support Our Initiatives
            </h2>
            <p className="mb-8 text-sm text-paa-gray">
              Your voice matters. Contact us to learn how you can contribute to
              these efforts.
            </p>
            <a
              href="/#get-involved"
              className="inline-block rounded-full bg-accent px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light"
            >
              Get Involved
            </a>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
