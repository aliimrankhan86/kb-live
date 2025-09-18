import { Metadata } from 'next'

export const baseMetadata: Metadata = {
  title: {
    default: 'KaabaTrip - Your Journey to the Holy Land',
    template: '%s | KaabaTrip'
  },
  description: 'Discover the best Hajj and Umrah packages for your spiritual journey to the Holy Land. Expert guidance, comfortable accommodations, and unforgettable experiences.',
  keywords: ['Hajj', 'Umrah', 'Islamic pilgrimage', 'Mecca', 'Medina', 'Kaaba', 'spiritual journey'],
  authors: [{ name: 'KaabaTrip' }],
  creator: 'KaabaTrip',
  publisher: 'KaabaTrip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kaabatrip.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kaabatrip.com',
    title: 'KaabaTrip - Your Journey to the Holy Land',
    description: 'Discover the best Hajj and Umrah packages for your spiritual journey to the Holy Land.',
    siteName: 'KaabaTrip',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'KaabaTrip - Your Journey to the Holy Land',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KaabaTrip - Your Journey to the Holy Land',
    description: 'Discover the best Hajj and Umrah packages for your spiritual journey to the Holy Land.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}
