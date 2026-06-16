import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { baseMetadata } from "@/lib/seo";
import { exo2Font } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/compliance/CookieConsent";
import { JsonLdScript, graphJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { Repository } from "@/lib/api/repository";
import { isRfqQuoteEnabled } from "@/lib/config";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
};

const siteJsonLd = graphJsonLd([organizationJsonLd(), websiteJsonLd()]);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let departureCities: string[] = [];
  try {
    departureCities = await Repository.getDistinctDepartureCities();
  } catch {
    // DB unavailable — footer renders without city links
  }

  // Nonce set by middleware CSP. The inline theme script below must carry it,
  // otherwise the strict 'script-src' nonce policy blocks it (no 'unsafe-inline').
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // PARKED: RFQ quote engine — hide /quote entry links in global nav when off.
  // See PARKED_FEATURES.md entry 2. Evaluated server-side, passed as a prop.
  const rfqEnabled = isRfqQuoteEnabled();

  return (
    <html lang="en-GB" className={`${exo2Font.variable} ${inter.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <JsonLdScript data={siteJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:rounded focus:bg-[var(--yellow)] focus:px-4 focus:py-2 focus:text-black focus:font-medium"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer cities={departureCities} rfqEnabled={rfqEnabled} />
          <CookieConsent />
        </ThemeProvider>
        {/*
          Vercel Web Analytics — cookieless, privacy-friendly (no consent banner
          needed). Script + beacon are same-origin (/_vercel/insights/*), so the
          strict CSP needs no external allowance: 'self' covers the src'd script
          (nonces are only required for inline scripts). Auto-disabled outside
          production; preview/prod are separated in the dashboard.
        */}
        <Analytics />
      </body>
    </html>
  );
}
