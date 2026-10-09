import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DesignSystemPlayground } from '@/components/showcase/DesignSystemPlayground'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'PilgrimCompare design system playground.',
  robots: { index: false, follow: false },
}

export default function ShowcasePage() {
  // Developer playground with sample data: never served on the live site.
  if (process.env.VERCEL_ENV === 'production') notFound()
  return (
    <>
      <DesignSystemPlayground />
    </>
  )
}
