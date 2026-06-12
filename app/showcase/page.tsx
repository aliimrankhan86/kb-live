import { Metadata } from 'next'
import { DesignSystemPlayground } from '@/components/showcase/DesignSystemPlayground'

export const metadata: Metadata = {
  title: 'Design System | PilgrimCompare',
  description: 'PilgrimCompare design system playground.',
  robots: { index: false, follow: false },
}

export default function ShowcasePage() {
  return (
    <>
      <DesignSystemPlayground />
    </>
  )
}
