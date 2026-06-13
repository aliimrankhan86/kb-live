'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Optional stagger, in milliseconds, applied as a transition delay. */
  delay?: number
  className?: string
}

/**
 * Restrained scroll-reveal: fade + small upward translate as the element
 * enters the viewport. Progressive enhancement only —
 *
 *  - No JS / no IntersectionObserver  → content renders fully visible (the
 *    `.reveal` hidden state is added by this component, never in SSR markup).
 *  - prefers-reduced-motion: reduce   → the hidden state is never applied, so
 *    there is zero motion (belt-and-braces guard also lives in globals.css).
 *
 * Uses opacity + transform only, so it never triggers layout shift (no CLS).
 */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      return
    }

    el.classList.add('reveal')
    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
            obs.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
