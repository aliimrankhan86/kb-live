import { Metadata } from 'next'
import { DesignSystemPlayground } from '@/components/showcase/DesignSystemPlayground'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'Comprehensive KaabaTrip design system playground.',
}

export default function ShowcasePage() {
  return (
    <>
      <DesignSystemPlayground />
    </>
  )
}
