'use client'

import React from 'react'
import Link from 'next/link'
import styles from './hero.module.css'

interface HeroProps {
  className?: string
}

interface CTASectionProps {
  title: string
  buttonText: string
  href: string
  className?: string
}

const CTASection: React.FC<CTASectionProps> = ({ 
  title, 
  buttonText, 
  href, 
  className = '' 
}) => {
  return (
    <Link 
      href={href} 
      className={`${styles.hero__ctaSection} ${className}`}
      aria-label={`${buttonText} packages - ${title}`}
    >
      <h2 className={styles.hero__ctaHeading}>
        {title}
      </h2>
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
      role="main"
      aria-label="Main content"
    >
    <div className={styles.hero__container}>
      <CTASection
        title="Search Best Packages for:"
        buttonText="HAJJ"
        href="/hajj"
      />
      <CTASection
        title="Search Best Packages for:"
        buttonText="UMRAH"
        href="/umrah"
      />
    </div>
    </main>
  )
}
