'use client'

import React from 'react'
import styles from './CompareBar.module.css'

export interface CompareBarItem {
  id: string
  label: string
  price?: string
}

interface CompareBarProps {
  items: CompareBarItem[]
  min?: number
  max?: number
  onRemove: (id: string) => void
  onClear: () => void
  onCompare: () => void
}

/**
 * Sticky bottom bar that anchors the "compare-first" flow. It only appears once
 * the traveller has selected at least one package, and tells them in plain words
 * exactly what to do next (pick 2–3, then compare).
 */
export const CompareBar: React.FC<CompareBarProps> = ({
  items,
  min = 2,
  max = 3,
  onRemove,
  onClear,
  onCompare,
}) => {
  const count = items.length
  const ready = count >= min
  const remaining = Math.max(0, min - count)

  if (count === 0) return null

  return (
    <div className={styles.wrap} role="region" aria-label="Packages selected to compare">
      <div className={styles.bar}>
        <div className={styles.info}>
          <span className={styles.count} aria-live="polite">
            {count} of {max} selected
          </span>
          <span className={styles.hint}>
            {ready
              ? 'Ready — tap Compare to see them side by side'
              : `Pick ${remaining} more to compare`}
          </span>
        </div>

        <div className={styles.chips}>
          {items.map((item) => (
            <span key={item.id} className={styles.chip}>
              <span className={styles.chipLabel} title={item.label}>{item.label}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.label} from comparison`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear
          </button>
          <button
            type="button"
            className={styles.compare}
            onClick={onCompare}
            disabled={!ready}
            aria-disabled={!ready}
            data-testid="search-compare-button"
          >
            Compare
            <span className={styles.compareCount}>{count}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompareBar
