'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/graphics/Logo'
import { Select } from '@/components/ui/Select'
import {
  DISPLAY_CURRENCY_OPTIONS,
  getPreferredCurrency,
  setPreferredCurrency,
  type DisplayCurrency,
} from '@/lib/i18n/region'
import styles from './header.module.css'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [currency, setCurrency] = useState<DisplayCurrency>('GBP')

  useEffect(() => {
    const preferred = getPreferredCurrency()
    if (preferred) setCurrency(preferred)
  }, [])

  return (
    <header 
      className={`${styles.header} ${className}`}
      aria-label="Main navigation"
    >
      <div className={styles.header__container}>
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className={styles.header__brand}
          aria-label="KaabaTrip - Go to homepage"
        >
          <Logo size={32} />
          <Image 
            src="/text-logo.svg" 
            alt="KaabaTrip" 
            className={styles.header__textLogo}
            width={108}
            height={45}
            priority
          />
        </Link>

        {/* Navigation */}
        <nav 
          className={styles.header__navigation}
          aria-label="Main menu"
        >
          <div className={styles.header__currency}>
            <Select
              id="header-currency-select"
              aria-label="Display currency"
              value={currency}
              options={DISPLAY_CURRENCY_OPTIONS}
              onChange={(event) => {
                const next = event.target.value as DisplayCurrency
                setCurrency(next)
                setPreferredCurrency(next)
              }}
              selectClassName={styles.header__currencySelect}
            />
          </div>
          <Link 
            href="/quote" 
            className={styles.header__navLink}
          >
            Get a Quote
          </Link>
          <Link 
            href="/operator/dashboard" 
            className={styles.header__navLink}
          >
            Operator Dashboard
          </Link>
          <Link 
            href="/kanban" 
            className={styles.header__navLink}
          >
            Kanban
          </Link>
          <Link 
            href="/login" 
            className={styles.header__navLink}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
