'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './LoginModal.module.css'

export interface LoginModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to call when modal should close */
  onClose: () => void
  /** Function to call when login form is submitted */
  onLogin: (credentials: LoginCredentials) => Promise<void>
  /** Custom class name for styling */
  className?: string
  /** ARIA label for the modal */
  ariaLabel?: string
  /** Whether to close modal when clicking outside */
  closeOnBackdropClick?: boolean
  /** Custom z-index for the overlay */
  zIndex?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

// Main Login Modal Component
const LoginModalComponent: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  className = '',
  ariaLabel = 'Login modal',
  closeOnBackdropClick = true,
  zIndex = 1000
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const modalRef = useRef<HTMLDivElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const isMountedRef = useRef(true)
  const prefersReducedMotion = useReducedMotion()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Handle escape key
  useEscapeKey(isOpen, onClose)

  // Handle click outside
  useClickOutside(modalRef, isOpen && closeOnBackdropClick ? onClose : () => {})

  // Focus management
  useFocusTrap(modalRef, isOpen)

  // Store previous active element and restore focus on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setIsAnimating(true)
      
      // Focus on email input when modal opens
      const timer = setTimeout(() => {
        if (emailInputRef.current && isMountedRef.current) {
          emailInputRef.current.focus()
        }
      }, prefersReducedMotion ? 0 : 100)

      return () => clearTimeout(timer)
    } else {
      // Restore focus to previous element when modal closes
      if (previousActiveElement.current && isMountedRef.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, prefersReducedMotion])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setErrors({})
      setIsLoading(false)
    }
  }, [isOpen])

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email, password])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await onLogin({ email: email.trim(), password })
      onClose()
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }, [email, password, validateForm, onLogin, onClose])

  // Handle input changes
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }, [errors.email])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
  }, [errors.password])

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked')
  }, [])

  // Don't render if not open
  if (!isOpen) return null

  const modalContent = (
    <div
      className={`${styles.backdrop} ${isAnimating ? styles.backdropVisible : ''}`}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${isAnimating ? styles.modalVisible : ''} ${className}`}
        role="document"
      >
        <div className={styles.modalContent}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h2 id="login-modal-title" className={styles.modalTitle}>
              Login to KaabaTrip
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close login modal"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* Description */}
          <p id="login-modal-description" className={styles.modalDescription}>
            Sign in to your account to access your bookings and manage your profile.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
            {/* General Error */}
            {errors.general && (
              <div className={styles.errorMessage} role="alert" aria-live="polite">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className={styles.formField}>
              <label htmlFor="login-email" className={styles.fieldLabel}>
                Email Address
              </label>
              <input
                ref={emailInputRef}
                id="login-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`${styles.fieldInput} ${errors.email ? styles.fieldInputError : ''}`}
                placeholder="Enter your email address"
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && (
                <div id="email-error" className={styles.fieldError} role="alert">
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.formField}>
              <label htmlFor="login-password" className={styles.fieldLabel}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={`${styles.fieldInput} ${errors.password ? styles.fieldInputError : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                disabled={isLoading}
              />
              {errors.password && (
                <div id="password-error" className={styles.fieldError} role="alert">
                  {errors.password}
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className={styles.forgotPasswordContainer}>
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              aria-describedby="submit-button-description"
            >
              {isLoading ? (
                <>
                  <span className={styles.loadingSpinner} aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            <div id="submit-button-description" className={styles.submitDescription}>
              {isLoading ? 'Please wait while we sign you in' : 'Click to sign in to your account'}
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  // Ensure document.body exists before creating portal
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(modalContent, document.body)
}

export const LoginModal = React.memo(LoginModalComponent)
LoginModal.displayName = 'LoginModal'
