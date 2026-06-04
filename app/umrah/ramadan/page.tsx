import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ramadan Umrah Packages',
  description: 'Browse Ramadan Umrah packages and compare verified operators.',
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
