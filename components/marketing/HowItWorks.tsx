import Link from 'next/link'
import styles from './home.module.css'

interface Step {
  title: string
  text: string
}

const STEPS: Step[] = [
  {
    title: 'Compare',
    text: 'Filter and line up packages from verified UK operators on the details that matter to you.',
  },
  {
    title: 'Enquire',
    text: 'Send an enquiry to the operators you shortlist. Your details go to the operator you choose.',
  },
  {
    title: 'Operator replies',
    text: 'The operator confirms availability, the final price, and the itinerary directly with you.',
  },
  {
    title: 'Book and pay the operator',
    text: 'You book and pay the operator directly. Your reference code tracks the enquiry, nothing more.',
  },
]

export function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="how-it-works-heading">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>How it works</p>
        <h2 id="how-it-works-heading" className={styles.heading}>
          Compare, enquire, then book with the operator
        </h2>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNum} aria-hidden="true">
              {index + 1}
            </span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
          </li>
        ))}
      </ol>
      <div className={styles.guideRow}>
        <Link href="/how-it-works" className={styles.inlineLink}>
          Read how PilgrimCompare works
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
