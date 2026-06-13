import styles from './home.module.css'

interface FaqEntry {
  question: string
  answer: string
}

interface FAQProps {
  /** Must be the SAME array fed to the FAQPage JSON-LD, so markup matches content. */
  items: FaqEntry[]
}

export function FAQ({ items }: FAQProps) {
  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>Questions</p>
        <h2 id="faq-heading" className={styles.heading}>
          Common questions
        </h2>
      </div>
      <div className={styles.faqList}>
        {items.map((item) => (
          <div key={item.question} className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>{item.question}</h3>
            <p className={styles.faqAnswer}>{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
