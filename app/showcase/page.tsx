import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Text } from '@/components/ui/Text'
import { Heading } from '@/components/ui/Heading'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'Core KaabaTrip UI primitives and component states.',
}

export default function ShowcasePage() {
  const selectOptions = [
    { label: 'Select season', value: '' },
    { label: 'Ramadan 2026', value: 'ramadan-2026' },
    { label: 'Hajj 2026', value: 'hajj-2026' },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <section className="space-y-3">
            <Heading as={1} size="display">Design System Foundations</Heading>
            <Text tone="muted">
              Shared primitives for typography, buttons, form inputs, and selects.
            </Text>
          </section>

          <section className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[var(--surfaceDark)] p-5">
            <Heading as={2} size="md">Buttons</Heading>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">Primary Small</Button>
              <Button variant="primary" size="md">Primary Medium</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="danger" size="md">Danger</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[var(--surfaceDark)] p-5">
            <Heading as={2} size="md">Inputs</Heading>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Normal input" />
              <Input placeholder="Disabled input" disabled />
              <Input placeholder="Error input" hasError defaultValue="Invalid value" />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[var(--surfaceDark)] p-5">
            <Heading as={2} size="md">Select</Heading>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select options={selectOptions} defaultValue="" />
              <Select options={selectOptions} defaultValue="" disabled />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[var(--surfaceDark)] p-5">
            <Heading as={2} size="md">Typography</Heading>
            <div className="space-y-2">
              <Heading as={3} size="xl">Heading XL</Heading>
              <Heading as={4} size="lg">Heading LG</Heading>
              <Heading as={5} size="md">Heading MD</Heading>
              <Text size="lg">Text LG</Text>
              <Text size="md">Text MD</Text>
              <Text size="sm" tone="muted">Text SM muted</Text>
              <Text size="xs" tone="accent">Text XS accent</Text>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
