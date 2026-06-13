import Link from 'next/link'
import type { Package } from '@/lib/types'
import { INCLUSIONS, friendlyDistance } from '@/lib/packages/display'
import styles from './home.module.css'

interface ComparePreviewProps {
  packages: Package[]
}

function formatPrice(pkg: Package): string {
  const amount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: pkg.currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(pkg.pricePerPerson)
  return pkg.priceType === 'from' ? `From ${amount}` : amount
}

function makkahHotel(pkg: Package): string {
  if (pkg.hotelMakkahName) return pkg.hotelMakkahName
  if (pkg.hotelMakkahStars) return `${pkg.hotelMakkahStars}-star hotel`
  return 'Not provided'
}

function distanceText(pkg: Package): string {
  return (
    friendlyDistance('Makkah', pkg.distanceToHaramMakkahMetres, pkg.distanceBandMakkah)?.primary ??
    'Not provided'
  )
}

function includedText(pkg: Package): string {
  const items = INCLUSIONS.filter((inc) => pkg.inclusions[inc.key]).map((inc) => inc.label)
  return items.length > 0 ? items.join(', ') : 'Not provided'
}

/**
 * A small, real side-by-side so a visitor can see what comparing looks like.
 * LIVE DATA ONLY — renders nothing unless at least two real published packages
 * exist. Never fabricates packages, prices, operators, or counts.
 */
export function ComparePreview({ packages }: ComparePreviewProps) {
  if (packages.length < 2) return null
  const pair = packages.slice(0, 2)

  const rows: { label: string; value: (pkg: Package) => string }[] = [
    { label: 'Total nights', value: (p) => `${p.totalNights} nights (${p.nightsMakkah} Makkah / ${p.nightsMadinah} Madinah)` },
    { label: 'Makkah hotel', value: makkahHotel },
    { label: 'Distance to Haram', value: distanceText },
    { label: "What's included", value: includedText },
  ]

  return (
    <section className={styles.section} aria-labelledby="preview-heading">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>See it in action</p>
        <h2 id="preview-heading" className={styles.heading}>
          What a side-by-side comparison looks like
        </h2>
        <p className={styles.lead}>
          Two live packages, the same fields for each. Anything an operator has not
          supplied shows as &ldquo;Not provided&rdquo;, never guessed.
        </p>
      </div>

      <div className={styles.previewWrap}>
        <table className={styles.previewTable}>
          <caption className="sr-only">Example comparison of two live packages.</caption>
          <colgroup>
            <col className={styles.previewLabelCol} />
            {pair.map((pkg) => (
              <col key={pkg.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Feature</span>
              </th>
              {pair.map((pkg) => (
                <th key={pkg.id} scope="col">
                  <span className={styles.previewTitle}>{pkg.title}</span>
                  <span className={styles.previewPrice}>{formatPrice(pkg)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className={styles.previewRowLabel}>
                  {row.label}
                </th>
                {pair.map((pkg) => (
                  <td key={pkg.id} className={styles.previewCell}>
                    {row.value(pkg)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.previewFoot}>
        <Link href="/search/packages" className={styles.inlineLink}>
          See the full comparison
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
