import Link from 'next/link'
import styles from './home.module.css'

interface CTACard {
  title: string
  text: string
  href: string
  cta: string
  filled?: boolean
}

const CTA_CARDS: CTACard[] = [
  {
    title: 'Ready to compare?',
    text: 'Line up Umrah packages from verified UK operators, side by side.',
    href: '/search/packages',
    cta: 'Compare packages',
    filled: true,
  },
  {
    title: 'Hajj 2027',
    text: 'Hajj packages are coming for the 2027 season. Register your interest to hear first.',
    href: '/hajj',
    cta: 'Register your interest',
  },
  {
    title: 'Are you a travel operator?',
    text: 'List your packages and reach pilgrims comparing UK operators.',
    href: '/partner',
    cta: 'List your packages',
  },
]

export function HomeCTA() {
  return (
    <section className={styles.section} aria-labelledby="home-cta-heading">
      <h2 id="home-cta-heading" className="sr-only">
        Next steps
      </h2>
      <div className={styles.ctaBand}>
        {CTA_CARDS.map((card) => (
          <div key={card.href} className={styles.ctaCard}>
            <h3 className={styles.ctaCardTitle}>{card.title}</h3>
            <p className={styles.ctaCardText}>{card.text}</p>
            <Link
              href={card.href}
              className={`${styles.ctaButton} ${card.filled ? styles.ctaButtonFilled : ''}`}
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
