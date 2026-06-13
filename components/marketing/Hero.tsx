import Link from 'next/link'
import { MODEL_DESCRIPTION } from '@/lib/content-rules'
import styles from './hero.module.css'

interface HeroProps {
  className?: string
}

interface TrustItem {
  label: string
  icon: React.ReactNode
  href?: string
}

const TRUST_ITEMS: TrustItem[] = [
  {
    label: 'Verified operators',
    href: '/how-we-rank#verification-heading',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: 'ATOL numbers checked',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    label: 'Transparent pricing',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Side-by-side comparison',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
      </svg>
    ),
  },
]

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  return (
    <section className={`${styles.hero} ${className}`} aria-label="Introduction">
      <div className={styles.hero__container}>
        <div className={styles.hero__valueProp}>
          <h1 className={styles.hero__title}>
            Compare Umrah &amp; Hajj Packages from Verified Travel Operators
          </h1>
          <p className={styles.hero__subtitle}>{MODEL_DESCRIPTION}</p>
          <div className={styles.hero__actions}>
            <Link href="/search/packages" className={styles.hero__ctaPrimary}>
              Compare packages
            </Link>
            <Link href="/how-it-works" className={styles.hero__ctaSecondary}>
              How it works
            </Link>
          </div>
        </div>

        <ul className={styles.hero__trustBar} aria-label="What we check">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className={styles.hero__trustItem}>
              {item.href ? (
                <Link href={item.href} className={styles.hero__trustLink}>
                  <span className={styles.hero__trustIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <>
                  <span className={styles.hero__trustIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
