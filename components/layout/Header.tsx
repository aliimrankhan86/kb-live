'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/graphics/Logo'
import styles from './header.module.css'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header 
      className={`${styles.header} ${className}`}
      role="banner"
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
          />
        </Link>

        {/* Navigation */}
        <nav 
          className={styles.header__navigation}
          role="navigation"
          aria-label="Main menu"
        >
          <Link 
            href="/partner" 
            className={styles.header__navLink}
            aria-label="Become a partner with KaabaTrip"
          >
            Become A Partner
          </Link>
          <Link 
            href="/login" 
            className={styles.header__navLink}
            aria-label="Login to your account"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
