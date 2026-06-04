import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hajj Packages',
  description: 'Discover Hajj packages and compare trusted operators.',
}

export default function HajjPage() {
  return (
    <div className="min-h-screen text-[var(--text)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hajj Packages</h1>
        <p className="text-[var(--textMuted)]">Coming soon...</p>
      </div>
    </div>
  )
}
