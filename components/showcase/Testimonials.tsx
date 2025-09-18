'use client'

import React from 'react'
import styles from './testimonials.module.css'

interface Testimonial {
  id: string
  name: string
  location: string
  text: string
  rating: number
}

interface TestimonialsProps {
  className?: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ahmad Hassan',
    location: 'London, UK',
    text: 'KaabaTrip made my Hajj journey unforgettable. The guides were knowledgeable, accommodations were excellent, and everything was perfectly organized.',
    rating: 5
  },
  {
    id: '2',
    name: 'Fatima Al-Zahra',
    location: 'Toronto, Canada',
    text: 'The Umrah package exceeded my expectations. The team was supportive throughout the journey, and I felt safe and comfortable at all times.',
    rating: 5
  },
  {
    id: '3',
    name: 'Omar Abdullah',
    location: 'New York, USA',
    text: 'Professional service from start to finish. The documentation process was smooth, and the spiritual guidance provided was invaluable.',
    rating: 5
  }
]

export const Testimonials: React.FC<TestimonialsProps> = ({ className = '' }) => {
  return (
    <section 
      className={`${styles.testimonials} ${className}`}
      role="region"
      aria-label="Customer testimonials"
    >
      <div className={styles.testimonials__container}>
        <h2 className={styles.testimonials__title}>
          What Our Pilgrims Say
        </h2>
        <div className={styles.testimonials__grid}>
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className={styles.testimonial}
              role="article"
              aria-labelledby={`testimonial-${testimonial.id}`}
            >
              <div className={styles.testimonial__rating}>
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <span key={i} className={styles.testimonial__star}>⭐</span>
                ))}
              </div>
              <blockquote className={styles.testimonial__text}>
                "{testimonial.text}"
              </blockquote>
              <div className={styles.testimonial__author}>
                <cite className={styles.testimonial__name}>
                  {testimonial.name}
                </cite>
                <span className={styles.testimonial__location}>
                  {testimonial.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
