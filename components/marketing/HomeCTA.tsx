import Link from 'next/link'
import styles from './home.module.css'

/**
 * Single closing reinforcement — a clear final next step at the end of the
 * scroll. Deliberately NOT a second audience block (the AudienceRouter under
 * the hero owns audience routing).
 */
export function HomeCTA() {
  return (
    <section className={styles.section} aria-labelledby="home-cta-heading">
      <div className={styles.ctaCard}>
        <h2 id="home-cta-heading" className={styles.ctaCardTitle}>
          Ready to compare?
        </h2>
        <p className={styles.ctaCardText}>
          Line up Umrah packages from verified UK operators, side by side.
        </p>
        <Link
          href="/search/packages"
          className={`${styles.ctaButton} ${styles.ctaButtonFilled}`}
        >
          Compare packages
        </Link>
      </div>
    </section>
  )
}
