import Link from 'next/link'
import { PAYMENT_STANDARD_LINE, VERIFICATION_STATEMENT } from '@/lib/content-rules'
import styles from './home.module.css'

export function TrustBlock() {
  return (
    <section className={styles.section} aria-labelledby="trust-heading">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>Where you stand</p>
        <h2 id="trust-heading" className={styles.heading}>
          What we check, and what stays with the operator
        </h2>
      </div>
      <div className={styles.trustPanel}>
        <p className={styles.trustStatement} id="verification-statement">
          {VERIFICATION_STATEMENT}
        </p>
        <p className={styles.trustStandard}>{PAYMENT_STANDARD_LINE}</p>
        <p className={styles.trustRanking}>
          <Link href="/how-we-rank" className={styles.inlineLink}>
            No operator pays for ranking — how we rank packages
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </p>
      </div>
    </section>
  )
}
