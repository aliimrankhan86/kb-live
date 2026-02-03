import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { OperatorProfileDetail } from '@/components/operators/OperatorProfileDetail'
import { Repository } from '@/lib/api/repository'
import type { OperatorProfile, Package } from '@/lib/types'

interface OperatorPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const operator = Repository.getOperatorBySlug(slug)
    if (operator) {
      return {
        title: `${operator.companyName} | Operator`,
        description: `Browse packages and reviews for ${operator.companyName}.`,
      }
    }
  } catch (err) {
    // fall through to generic metadata
  }

  return {
    title: 'Operator not found',
    description: 'Operator details are unavailable.',
  }
}

const renderNotFound = (message: string) => (
  <section className="w-full max-w-3xl mx-auto px-4 py-16">
    <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-5 py-4">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Operator not found</h1>
      <p className="mt-2 text-sm text-red-100">{message}</p>
    </div>
  </section>
)

export default async function OperatorProfilePage({ params }: OperatorPageProps) {
  const { slug } = await params
  let operator: OperatorProfile | undefined
  let packages: Package[] = []
  let error: string | undefined

  try {
    operator = Repository.getOperatorBySlug(slug)
    if (operator) {
      packages = Repository.listPackages().filter((pkg) => pkg.operatorId === operator?.id)
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load this operator right now.'
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)]">{renderNotFound(error)}</main>
      </>
    )
  }

  if (!operator) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)]">
          {renderNotFound('This operator is not available.')}
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <OperatorProfileDetail operator={operator} packages={packages} />
      </main>
    </>
  )
}
