import Link from 'next/link'
import styles from './hero.module.css'

interface HeroProps {
  className?: string
}

interface CTASectionProps {
  title: string
  subtitle: string
  buttonText: string
  href: string
  className?: string
  badge?: string
  disabled?: boolean
}

const CTASection: React.FC<CTASectionProps> = ({ 
  title, 
  subtitle,
  buttonText, 
  href, 
  className = '',
  badge,
  disabled = false,
}) => {
  if (disabled) {
    return (
      <div 
        className={`${styles.hero__ctaSection} ${styles.hero__ctaSectionDisabled} ${className}`}
        aria-label={`${title} - Coming soon`}
      >
        {badge && <span className={styles.hero__badge}>{badge}</span>}
        <h2 className={styles.hero__ctaHeading}>{title}</h2>
        <p className={styles.hero__ctaSubtitle}>{subtitle}</p>
        <span className={styles.hero__ctaButtonDisabled}>
          {buttonText}
        </span>
      </div>
    )
  }

  return (
    <Link 
      href={href} 
      className={`${styles.hero__ctaSection} ${className}`}
      aria-label={`${buttonText} - ${title}`}
    >
      {badge && <span className={styles.hero__badge}>{badge}</span>}
      <h2 className={styles.hero__ctaHeading}>
        {title}
      </h2>
      <p className={styles.hero__ctaSubtitle}>{subtitle}</p>
      <span className={styles.hero__ctaButton}>
        {buttonText}
      </span>
    </Link>
  )
}

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  return (
    <main 
      className={`${styles.hero} ${className}`}
      aria-label="Main content"
    >
      <div className={styles.hero__container}>
        <div className={styles.hero__valueProp}>
          <h1 className={styles.hero__title}>
            Compare Umrah & Hajj Packages from Verified Travel Operators
          </h1>
          <p className={styles.hero__subtitle}>
            Transparent pricing. Verified operators. No hidden fees. Find the journey that fits your budget and spiritual goals.
          </p>
        </div>

        <div className={styles.hero__ctas}>
          <CTASection
            title="Umrah Packages"
            subtitle="Ramadan, school holidays & flexible dates"
            buttonText="Find Umrah Packages"
            href="/umrah"
            badge="Available Now"
            className={styles.hero__ctaUmrah}
          />
          <CTASection
            title="Hajj Packages"
            subtitle="Coming soon — register your interest"
            buttonText="Coming Soon"
            href="/hajj"
            badge="2027 Season"
            disabled
            className={styles.hero__ctaHajj}
          />
          <CTASection
            title="Are you a travel agent?"
            subtitle="List your packages and reach pilgrims directly"
            buttonText="Become a Partner"
            href="/operator/onboarding"
            className={styles.hero__ctaPartner}
          />
        </div>

        <div className={styles.hero__trustBar} role="region" aria-label="Trust indicators">
          <div className={styles.hero__trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Verified Operators</span>
          </div>
          <div className={styles.hero__trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>ATOL Protected</span>
          </div>
          <div className={styles.hero__trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Transparent Pricing</span>
          </div>
          <div className={styles.hero__trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Price Match</span>
          </div>
        </div>
      </div>
    </main>
  )
}