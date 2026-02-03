import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { UmrahSearchForm } from '@/components/umrah/UmrahSearchForm'

export const metadata: Metadata = {
  title: 'Umrah Packages',
  description: 'Find and compare Umrah packages from verified operators.',
}

export default function UmrahPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <UmrahSearchForm />
      </main>
    </>
  )
}
