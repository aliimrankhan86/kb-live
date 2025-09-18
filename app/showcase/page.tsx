import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { ShowcaseHero } from '@/components/showcase/ShowcaseHero'
import { FeaturesGrid } from '@/components/showcase/FeaturesGrid'
import { Testimonials } from '@/components/showcase/Testimonials'
import { ShowcaseCTA } from '@/components/showcase/ShowcaseCTA'

export const metadata: Metadata = {
  title: 'Showcase',
  description: 'Discover the amazing features and experiences that make KaabaTrip the perfect choice for your spiritual journey.',
}

export default function ShowcasePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <ShowcaseHero />
        <FeaturesGrid />
        <Testimonials />
        <ShowcaseCTA />
      </main>
    </>
  )
}
