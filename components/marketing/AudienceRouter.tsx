import Link from 'next/link'
import styles from './home.module.css'

interface AudienceCard {
  badge: string
  title: string
  text: string
  action: string
  href: string
}

const CARDS: AudienceCard[] = [
  {
    badge: 'Available now',
    title: 'Umrah packages',
    text: 'Ramadan, school holidays and flexible dates.',
    action: 'Find Umrah packages',
    href: '/umrah',
  },
  {
    badge: '2027 season',
    title: 'Hajj packages',
    text: 'Coming for the 2027 season. Register your interest.',
    action: 'Register your interest',
    href: '/hajj',
  },
  {
    badge: 'For operators',
    title: 'List your packages',
    text: 'Reach pilgrims comparing UK operators. We build your profile to rank at its best.',
    action: 'List your packages',
    href: '/partner',
  },
]

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export function AudienceRouter() {
  return (
    <section className={styles.section} aria-labelledby="audience-heading">
      <h2 id="audience-heading" className="sr-only">
        Choose your path
      </h2>
      <div className={styles.audienceGrid}>
        {CARDS.map((card) => (
          <Link key={card.href} href={card.href} className={styles.audienceCard}>
            <span className={styles.badge}>{card.badge}</span>
            <h3 className={styles.audienceTitle}>{card.title}</h3>
            <p className={styles.audienceText}>{card.text}</p>
            <span className={styles.audienceAction}>
              {card.action}
              <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
