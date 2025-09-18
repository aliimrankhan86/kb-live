import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { baseMetadata } from "@/lib/seo";
import { exo2Font } from "@/lib/fonts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${exo2Font.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#0B0B0B" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
