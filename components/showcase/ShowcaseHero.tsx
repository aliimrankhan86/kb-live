'use client'

import React from 'react'
import styles from './showcase-hero.module.css'

interface ShowcaseHeroProps {
  className?: string
}

export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({ className = '' }) => {
  return (
    <section 
      className={`${styles.hero} ${className}`}
      role="banner"
      aria-label="Showcase introduction"
    >
      <div className={styles.hero__container}>
        <h1 className={styles.hero__title}>
          Showcase
        </h1>
        <p className={styles.hero__subtitle}>
          Discover the amazing features and experiences that make KaabaTrip the perfect choice for your spiritual journey.
        </p>
      </div>
    </section>
  )
}
