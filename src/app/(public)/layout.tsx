import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/queries";

const DEFAULTS = {
  site_name: "Panhandle Aviation Alliance",
  tagline: "Western Nebraska Aviation Advocacy",
  contact_email: "info@panhandleaviationalliance.org",
  location: "Scottsbluff, Nebraska",
};

// Map DB keys to CSS custom property names
const THEME_MAP: Record<string, string> = {
  theme_midnight: "--paa-midnight",
  theme_navy: "--paa-navy",
  theme_slate: "--paa-slate",
  theme_accent: "--paa-accent",
  theme_accent_light: "--paa-accent-light",
  theme_accent_dark: "--paa-accent-dark",
  theme_sky: "--paa-sky",
  theme_sky_light: "--paa-sky-light",
  theme_white: "--paa-white",
  theme_gray: "--paa-gray",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const siteName = config.site_name || DEFAULTS.site_name;
  const tagline = config.tagline || DEFAULTS.tagline;
  const contactEmail = config.contact_email || DEFAULTS.contact_email;
  const location = config.location || DEFAULTS.location;
  const logoUrl = config.logo_url || undefined;

  // Build inline style overrides for theme colors
  const themeOverrides: Record<string, string> = {};
  for (const [dbKey, cssVar] of Object.entries(THEME_MAP)) {
    if (config[dbKey]) {
      themeOverrides[cssVar] = config[dbKey];
    }
  }

  // Build Organization JSON-LD structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://panhandleaviationalliance.org";
  const orgType = config.seo_organization_type || "Organization";
  const orgDescription =
    config.seo_organization_description ||
    config.seo_description ||
    `The ${siteName} advocates for aviation infrastructure, air service, and economic development.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": orgType,
    name: siteName,
    description: orgDescription,
    url: siteUrl,
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(contactEmail ? { email: contactEmail } : {}),
    ...(location
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: location,
          },
        }
      : {}),
  };

  return (
    <div style={themeOverrides as React.CSSProperties}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar siteName={siteName} logoUrl={logoUrl} />
      <main>{children}</main>
      <Footer
        siteName={siteName}
        tagline={tagline}
        contactEmail={contactEmail}
        location={location}
        logoUrl={logoUrl}
      />
    </div>
  );
}
