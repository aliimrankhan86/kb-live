import Link from 'next/link'
import styles from './home.module.css'

interface GuideLink {
  label: string
  href: string
}

interface DepartureCitiesProps {
  /** Cities derived from live published packages — never a hardcoded list. */
  cities: string[]
  guideLinks: GuideLink[]
}

export function DepartureCities({ cities, guideLinks }: DepartureCitiesProps) {
  return (
    <section className={styles.section} aria-labelledby="departures-heading">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>Departures</p>
        <h2 id="departures-heading" className={styles.heading}>
          Compare Umrah packages by departure city
        </h2>
      </div>

      {cities.length > 0 ? (
        <nav aria-label="Umrah packages by departure city" className={styles.cityGrid}>
          {cities.map((city) => (
            <Link
              key={city}
              href={`/umrah/${city.toLowerCase()}`}
              className={styles.cityLink}
            >
              Umrah from {city}
            </Link>
          ))}
        </nav>
      ) : (
        <p className={styles.emptyState}>
          No packages are currently listed for a departure city. New operators
          are being added — check back soon.
        </p>
      )}

      <nav aria-label="Guides and seasons" className={styles.guideRow}>
        {guideLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.cityLink}>
            {link.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
