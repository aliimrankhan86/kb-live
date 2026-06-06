import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ramadan Umrah Packages 2026 from the UK',
  description:
    'Compare Ramadan Umrah packages from verified UK operators. Book your spiritual journey during the holy month of Ramadan with ATOL and ABTA protected operators.',
  alternates: {
    canonical: '/umrah/ramadan',
  },
  openGraph: {
    title: 'Ramadan Umrah Packages 2026 | KaabaTrip',
    description: 'Find Ramadan Umrah packages from verified UK operators with ATOL protection.',
    url: 'https://kaabatrip.com/umrah/ramadan',
    siteName: 'KaabaTrip',
    type: 'website',
    locale: 'en_GB',
  },
}

export default function RamadanUmrahPage() {
  return (
    <main className="min-h-screen text-[var(--text)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Ramadan Umrah Packages</h1>
        <p className="text-[var(--textMuted)]">Curated Ramadan Umrah offers are coming soon.</p>
      </div>
    </main>
  )
}
