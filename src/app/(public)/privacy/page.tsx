import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/queries";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config.site_name || "Panhandle Aviation Alliance";
  return {
    title: "Privacy Policy",
    description: `Privacy Policy for ${siteName}`,
  };
}

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const config = await getSiteConfig();
  const content = config.policy_privacy;

  return (
    <div className="pt-24">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <ScrollReveal>
          <h1 className="mb-8 font-heading text-3xl font-bold text-paa-white sm:text-4xl">
            Privacy Policy
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          {content ? (
            <div
              className="policy-content prose prose-invert max-w-none text-paa-gray"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-paa-gray">
              No privacy policy has been published yet.
            </p>
          )}
        </ScrollReveal>
      </section>
      <style>{policyStyles}</style>
    </div>
  );
}

const policyStyles = `
  .policy-content h1 { font-size: 1.75rem; font-weight: 700; color: var(--paa-white); margin-top: 2rem; margin-bottom: 0.75rem; font-family: var(--font-heading); }
  .policy-content h2 { font-size: 1.375rem; font-weight: 700; color: var(--paa-white); margin-top: 1.75rem; margin-bottom: 0.5rem; font-family: var(--font-heading); }
  .policy-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--paa-white); margin-top: 1.5rem; margin-bottom: 0.5rem; font-family: var(--font-heading); }
  .policy-content p { margin-bottom: 1rem; line-height: 1.75; }
  .policy-content ul, .policy-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
  .policy-content ul { list-style-type: disc; }
  .policy-content ol { list-style-type: decimal; }
  .policy-content li { margin-bottom: 0.375rem; line-height: 1.75; }
  .policy-content a { color: var(--paa-accent-light); text-decoration: underline; }
  .policy-content a:hover { color: var(--paa-accent); }
  .policy-content strong { color: var(--paa-white); font-weight: 600; }
`;
