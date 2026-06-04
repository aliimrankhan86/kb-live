import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { PackagesBrowse } from '@/components/packages/PackagesBrowse'
import { Repository } from '@/lib/api/repository'
import type { Package } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Browse published Umrah and Hajj packages from trusted operators.',
}

export default function PackagesPage() {
  let packages: Package[] = []
  let error: string | undefined

  try {
    packages = Repository.listPackages()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load packages right now.'
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <PackagesBrowse packages={packages} error={error} />
      </main>
    </>
  )
}
