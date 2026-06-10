import type { Metadata } from 'next'
import { OperatorProfileDetail } from '@/components/operators/OperatorProfileDetail'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Repository } from '@/lib/api/repository'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, operatorJsonLd } from '@/lib/seo/json-ld'
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
    const operator = await Repository.getOperatorBySlug(slug)
    if (operator) {
      const packages = (await Repository.listPackages()).filter(
        (pkg) => pkg.operatorId === operator.id && pkg.status === 'published'
      )
      const statusLabel = operator.verificationStatus === 'verified' ? 'Verified' : 'Listed'
      const trustParts = [
        operator.atolNumber ? `ATOL ${operator.atolNumber}` : undefined,
        operator.abtaMemberNumber ? `ABTA ${operator.abtaMemberNumber}` : undefined,
      ].filter(Boolean)

      return {
        title: `${operator.companyName} - ${statusLabel} Umrah & Hajj Operator`,
        description: `View ${operator.companyName}'s public operator profile, ${packages.length} published package${packages.length === 1 ? '' : 's'}, departure airports, contact details${trustParts.length ? `, and ${trustParts.join(' / ')} details` : ''}.`,
        alternates: {
          canonical: `/operators/${operator.slug}`,
        },
        openGraph: {
          title: `${operator.companyName} | PilgrimCompare operator profile`,
          description: `Compare published packages, departure airports, and trust signals for ${operator.companyName}.`,
          url: `https://pilgrimcompare.co.uk/operators/${operator.slug}`,
          siteName: 'PilgrimCompare',
          type: 'profile',
          locale: 'en_GB',
        },
      }
    }
  } catch {
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
    operator = await Repository.getOperatorBySlug(slug)
    if (operator) {
      packages = (await Repository.listPackages()).filter(
        (pkg) => pkg.operatorId === operator?.id && pkg.status === 'published'
      )
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load this operator right now.'
  }

  if (error) {
    return (
      <>
        <main className="min-h-screen bg-[var(--background)]">{renderNotFound(error)}</main>
      </>
    )
  }

  if (!operator) {
    return (
      <>
        <main className="min-h-screen bg-[var(--background)]">
          {renderNotFound('This operator is not available.')}
        </main>
      </>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search/packages' },
    { label: operator.companyName },
  ];
  const operatorProfileJsonLd = graphJsonLd([
    operatorJsonLd(operator),
    breadcrumbJsonLd(breadcrumbItems.map((item) => ({ name: item.label, path: item.href }))),
    faqPageJsonLd([
      {
        question: `What can I verify about ${operator.companyName}?`,
        answer:
          'PilgrimCompare shows the operator profile details available in the platform, including verification status, ATOL and ABTA details where listed, departure airports, serving regions, contact details, and published packages.',
      },
      {
        question: `Does PilgrimCompare publish all packages from ${operator.companyName}?`,
        answer:
          'This public profile shows packages currently published on PilgrimCompare. Travellers should confirm final availability, itinerary, and payment terms directly with the operator.',
      },
    ]),
  ]);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)]">
        <JsonLdScript data={operatorProfileJsonLd} />
        <div className="w-full max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <OperatorProfileDetail operator={operator} packages={packages} />
      </main>
    </>
  )
}
