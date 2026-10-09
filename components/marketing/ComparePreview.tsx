import Link from 'next/link'
import type { Package } from '@/lib/types'
import { NEUTRAL_SORT_DISCLOSURE } from '@/lib/content-rules'
import { INCLUSIONS, friendlyDistance, nightsText, priceAttributionShort, priceText } from '@/lib/packages/display'
import styles from './home.module.css'

interface ComparePreviewProps {
  packages: Package[]
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
  const items = INCLUSIONS.filter((inc) => pkg.inclusions[inc.key] === true).map((inc) => inc.label)
  if (items.length > 0) return items.join(', ')
  return INCLUSIONS.every((inc) => pkg.inclusions[inc.key] === false) ? 'None' : 'Not provided'
}

/**
 * A small, real side-by-side so a visitor can see what comparing looks like.
 * LIVE DATA ONLY: renders nothing unless at least two real published packages
 * exist. Never fabricates packages, prices, operators, or counts.
 */
export function ComparePreview({ packages }: ComparePreviewProps) {
  if (packages.length < 2) return null
  const pair = packages.slice(0, 2)

  const rows: { label: string; value: (pkg: Package) => string }[] = [
    { label: 'Total nights', value: (p) => nightsText(p) },
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
                  <span className={styles.previewPrice}>{priceText(pkg)}</span>
                  <span className="block text-xs font-normal text-[var(--textMuted)]">{priceAttributionShort(undefined, pkg.updatedAt)}</span>
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

      <p className="mt-2 text-xs text-[var(--textMuted)]" data-testid="preview-sort-disclosure">
        The first two packages in our default order. {NEUTRAL_SORT_DISCLOSURE}{' '}
        <Link href="/how-we-rank" className="py-1.5 underline underline-offset-2">How we rank</Link>
      </p>

      <div className={styles.previewFoot}>
        <Link href="/packages" className={styles.inlineLink}>
          See the full comparison
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
