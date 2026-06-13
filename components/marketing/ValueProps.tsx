import styles from './home.module.css'

interface ValueProp {
  title: string
  text: string
  icon: React.ReactNode
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: 'Compare side by side',
    text: 'Line up packages on price, hotels near the Haram, inclusions, and nights split, using the same fields for every operator.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
      </svg>
    ),
  },
  {
    title: 'Verified operators',
    text: 'We check each operator’s ATOL number against the CAA register, their Companies House status, and a real UK trading address before listing.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'Enquire directly, pay the operator',
    text: 'Send an enquiry to the operators you choose. Your booking, contract, and payment are always with the operator — never with PilgrimCompare.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 4h16v12H7l-3 3z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    ),
  },
]

export function ValueProps() {
  return (
    <section className={styles.section} aria-labelledby="value-props-heading">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>Why PilgrimCompare</p>
        <h2 id="value-props-heading" className={styles.heading}>
          A calmer way to choose a pilgrimage package
        </h2>
      </div>
      <div className={styles.grid}>
        {VALUE_PROPS.map((prop) => (
          <div key={prop.title} className={styles.card}>
            <span className={styles.cardIcon}>{prop.icon}</span>
            <h3 className={styles.cardTitle}>{prop.title}</h3>
            <p className={styles.cardText}>{prop.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
