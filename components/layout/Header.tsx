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
      aria-label="Main navigation"
    >
      <div className={styles.header__container}>
        {/* Logo and Brand */}
        <Link 
          href="/" 
          scroll={false}
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
          <Link 
            href="/quote" 
            scroll={false}
            className={styles.header__navLink}
          >
            Get a Quote
          </Link>
          <Link 
            href="/operator/dashboard" 
            scroll={false}
            className={styles.header__navLink}
          >
            Operator Dashboard
          </Link>
          <Link 
            href="/kanban" 
            scroll={false}
            className={styles.header__navLink}
          >
            Kanban
          </Link>
          <Link 
            href="/login" 
            scroll={false}
            className={styles.header__navLink}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
