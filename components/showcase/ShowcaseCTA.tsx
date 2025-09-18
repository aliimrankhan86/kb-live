'use client'

import React from 'react'
import Link from 'next/link'
import styles from './showcase-cta.module.css'

interface ShowcaseCTAProps {
  className?: string
}

export const ShowcaseCTA: React.FC<ShowcaseCTAProps> = ({ className = '' }) => {
  return (
    <section 
      className={`${styles.cta} ${className}`}
      role="region"
      aria-label="Call to action"
    >
      <div className={styles.cta__container}>
        <div className={styles.cta__content}>
          <h2 className={styles.cta__title}>
            Ready to Begin Your Journey?
          </h2>
          <p className={styles.cta__description}>
            Join thousands of satisfied pilgrims who have trusted KaabaTrip for their spiritual journey. 
            Book your package today and experience the difference.
          </p>
          <div className={styles.cta__buttons}>
            <Link 
              href="/hajj" 
              className={styles.cta__button}
              aria-label="Explore Hajj packages"
            >
              Explore Hajj Packages
            </Link>
            <Link 
              href="/umrah" 
              className={`${styles.cta__button} ${styles.cta__buttonSecondary}`}
              aria-label="Explore Umrah packages"
            >
              Explore Umrah Packages
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
