'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/graphics/Logo'
import { LoginModal, LoginCredentials } from '@/components/auth/LoginModal'
import styles from './header.module.css'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Handle login form submission
  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // TODO: Replace with actual authentication API call
      console.log('Login attempt:', credentials)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, just show success (replace with actual auth logic)
      console.log('Login successful!')
      
      // In a real app, you would:
      // 1. Call your authentication API
      // 2. Store the token/user data
      // 3. Update the UI state
      // 4. Redirect or update the header
      
    } catch (error) {
      // Re-throw the error to be handled by the LoginModal
      throw new Error('Invalid email or password. Please try again.')
    }
  }

  // Handle login button click
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoginModalOpen(true)
  }

  return (
    <>
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
            <button
              className={styles.header__navLink}
              onClick={handleLoginClick}
              aria-label="Open login modal"
            >
              Login
            </button>
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        ariaLabel="Login to your KaabaTrip account"
        closeOnBackdropClick={true}
      />
    </>
  )
}
