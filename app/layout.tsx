import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { baseMetadata } from "@/lib/seo";
import { exo2Font } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/compliance/CookieConsent";
import { JsonLdScript } from "@/lib/seo/json-ld";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
};

const travelAgencyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'PilgrimCompare',
  url: 'https://pilgrimcompare.co.uk',
  description: 'Discover the best Hajj and Umrah packages for your spiritual journey to the Holy Land.',
  areaServed: { '@type': 'Country', name: 'United Kingdom' },
  serviceType: ['Hajj packages', 'Umrah packages'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${exo2Font.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <JsonLdScript data={travelAgencyJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:rounded focus:bg-[var(--yellow)] focus:px-4 focus:py-2 focus:text-black focus:font-medium"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
