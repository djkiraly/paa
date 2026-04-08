import type { Metadata } from "next";
import { Barlow_Condensed, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { getSiteConfig } from "@/lib/queries";
import "./globals.css";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const DEFAULTS = {
  site_name: "Panhandle Aviation Alliance",
  tagline: "Western Nebraska Aviation Advocacy",
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config.site_name || DEFAULTS.site_name;
  const tagline = config.tagline || DEFAULTS.tagline;

  const defaultDescription = `The ${siteName} advocates for aviation infrastructure, air service, and economic development in Western Nebraska. Supporting KBFF Western Nebraska Regional Airport.`;
  const description = config.seo_description || defaultDescription;

  const defaultKeywords = [
    siteName, "Western Nebraska", "KBFF", "Scottsbluff airport",
    "aviation advocacy", "Essential Air Service", "Nebraska aviation",
  ];
  const keywords = config.seo_keywords
    ? config.seo_keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : defaultKeywords;

  const metadata: Metadata = {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://panhandleaviationalliance.org"
    ),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title: `${siteName} — ${tagline}`,
      description,
      ...(config.seo_og_image ? { images: [{ url: config.seo_og_image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(config.seo_twitter_handle ? { creator: config.seo_twitter_handle } : {}),
      ...(config.seo_og_image ? { images: [config.seo_og_image] } : {}),
    },
  };

  // Favicon is injected via <link> in <head> — see RootLayout below

  if (config.seo_google_verification) {
    metadata.verification = { google: config.seo_google_verification };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();
  const recaptchaSiteKey =
    config.recaptcha_enabled === "true" && config.recaptcha_site_key
      ? config.recaptcha_site_key
      : null;

  return (
    <html lang="en" className="dark">
      <head>
        {config.favicon_url && (
          <link rel="icon" href={config.favicon_url} />
        )}
      </head>
      <body
        className={`${barlow.variable} ${sourceSerif.variable} ${jetbrains.variable} antialiased`}
      >
        {recaptchaSiteKey && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__RECAPTCHA_SITE_KEY__=${JSON.stringify(recaptchaSiteKey)};`,
              }}
            />
            <script
              src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
              async
            />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
