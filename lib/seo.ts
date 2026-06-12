import { Metadata } from 'next'

export const baseMetadata: Metadata = {
  title: {
    default: 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
    template: '%s | PilgrimCompare'
  },
  description: 'Compare Hajj and Umrah packages from verified UK travel operators. Review prices, hotels near Haram, inclusions, and ATOL details before requesting a quote.',
  keywords: ['Hajj', 'Umrah', 'Islamic pilgrimage', 'Mecca', 'Medina', 'Kaaba', 'spiritual journey'],
  authors: [{ name: 'PilgrimCompare' }],
  creator: 'PilgrimCompare',
  publisher: 'PilgrimCompare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pilgrimcompare.co.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://pilgrimcompare.co.uk',
    title: 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
    description: 'Compare Hajj and Umrah packages from verified UK travel operators. Review prices, hotels near Haram, inclusions, and ATOL details.',
    siteName: 'PilgrimCompare',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
    description: 'Compare Hajj and Umrah packages from verified UK travel operators. Review prices, hotels near Haram, inclusions, and ATOL details.',
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
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  manifest: '/site.webmanifest',
}
