import type { Metadata } from "next";
import { Barlow_Condensed, Source_Serif_4, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Panhandle Aviation Alliance — Western Nebraska Aviation Advocacy",
    template: "%s | Panhandle Aviation Alliance",
  },
  description:
    "The Panhandle Aviation Alliance advocates for aviation infrastructure, air service, and economic development in Western Nebraska. Supporting KBFF Western Nebraska Regional Airport.",
  keywords: [
    "Panhandle Aviation Alliance",
    "Western Nebraska",
    "KBFF",
    "Scottsbluff airport",
    "aviation advocacy",
    "Essential Air Service",
    "Nebraska aviation",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://panhandleaviationalliance.org"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Panhandle Aviation Alliance",
    title: "Panhandle Aviation Alliance — Western Nebraska Aviation Advocacy",
    description:
      "Advocating for aviation infrastructure, air service, and economic development in the Nebraska Panhandle.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${barlow.variable} ${sourceSerif.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
