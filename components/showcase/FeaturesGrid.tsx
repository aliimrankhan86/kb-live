'use client'

import React from 'react'
import styles from './features-grid.module.css'

interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

interface FeaturesGridProps {
  className?: string
}

const features: Feature[] = [
  {
    id: '1',
    title: 'Expert Guidance',
    description: 'Our experienced guides ensure you have a safe and meaningful pilgrimage experience.',
    icon: '🕌'
  },
  {
    id: '2',
    title: 'Premium Accommodations',
    description: 'Stay in comfortable hotels close to the holy sites with modern amenities.',
    icon: '🏨'
  },
  {
    id: '3',
    title: 'Transportation',
    description: 'Reliable and comfortable transportation throughout your journey.',
    icon: '🚌'
  },
  {
    id: '4',
    title: '24/7 Support',
    description: 'Round-the-clock assistance to help you with any questions or concerns.',
    icon: '📞'
  },
  {
    id: '5',
    title: 'Group Activities',
    description: 'Connect with fellow pilgrims through organized group activities and prayers.',
    icon: '👥'
  },
  {
    id: '6',
    title: 'Documentation',
    description: 'Complete assistance with visa processing and travel documentation.',
    icon: '📋'
  }
]

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ className = '' }) => {
  return (
    <section 
      className={`${styles.features} ${className}`}
      role="region"
      aria-label="Features showcase"
    >
      <div className={styles.features__container}>
        <div className={styles.features__grid}>
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={styles.feature}
              role="article"
              aria-labelledby={`feature-title-${feature.id}`}
            >
              <div className={styles.feature__icon}>
                {feature.icon}
              </div>
              <h3 
                id={`feature-title-${feature.id}`}
                className={styles.feature__title}
              >
                {feature.title}
              </h3>
              <p className={styles.feature__description}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
