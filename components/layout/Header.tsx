'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/graphics/Logo';
import type { UserRole } from '@/lib/types';
import styles from './header.module.css';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

export function Header({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          if (isMounted) setUser(null);
          return;
        }

        const data = (await response.json()) as { user: AuthUser | null };
        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileDrawerOpen(false);
    await fetch('/api/auth/sign-out', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  // Close mobile drawer on click outside
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileDrawerRef.current &&
        !mobileDrawerRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileDrawerOpen]);

  // Focus trap for mobile drawer
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const drawer = mobileDrawerRef.current;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    drawer.addEventListener('keydown', handleTab);
    return () => drawer.removeEventListener('keydown', handleTab);
  }, [mobileDrawerOpen]);

  const isOperator = user?.role === 'operator';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const displayName = user?.name ? user.name.split(' ')[0] : user?.email;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href) ?? false;

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(prev => !prev);
    setMenuOpen(false);
  }, []);

  // Don't show header on operator pages (they have sidebar)
  if (pathname?.startsWith('/operator/') || pathname?.startsWith('/admin/')) {
    return null;
  }

  const navLinks = [
    { href: '/umrah', label: 'Umrah', testId: 'nav-umrah' },
    { href: '/hajj', label: 'Hajj', testId: 'nav-hajj' },
    { href: '/quote', label: 'Get a Quote', testId: 'nav-quote' },
  ];

  const guestLinks = [
    { href: '/partner', label: 'For Partners', testId: 'nav-partners' },
  ];

  const customerLinks = [
    { href: '/requests', label: 'My Requests', testId: 'nav-requests' },
  ];

  const operatorAdminLinks = [
    {
      href: isAdmin ? '/admin/complaints' : '/operator/dashboard',
      label: isAdmin ? 'Admin' : 'Dashboard',
      testId: 'nav-dashboard',
    },
  ];

  return (
    <header className={`${styles.header} ${className}`} aria-label="Main navigation">
      <div className={styles.header__container}>
        {/* Brand */}
        <Link href="/" className={styles.header__brand} aria-label="KaabaTrip - Go to homepage">
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

        {/* Desktop Navigation */}
        <nav className={styles.header__desktopNav} aria-label="Main menu">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.header__navLink} ${isActive(link.href) ? styles.header__navLinkActive : ''}`}
              data-testid={link.testId}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}

          {!user && guestLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.header__navLink} ${isActive(link.href) ? styles.header__navLinkActive : ''}`}
              data-testid={link.testId}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}

          {!loading && isCustomer && (
            <>
              {customerLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.header__navLink} ${isActive(link.href) ? styles.header__navLinkActive : ''}`}
                  data-testid={link.testId}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <div className={styles.header__dropdownWrapper}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={styles.header__navLink}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  data-testid="user-menu-trigger"
                >
                  {displayName}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className={styles.header__dropdown} role="menu">
                    <Link
                      href="/settings"
                      className={styles.header__dropdownItem}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={styles.header__dropdownItem}
                      data-testid="logout-btn"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && (isOperator || isAdmin) && (
            <>
              {operatorAdminLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.header__navLink} ${isActive(link.href) ? styles.header__navLinkActive : ''}`}
                  data-testid={link.testId}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <div className={styles.header__dropdownWrapper}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={styles.header__navLink}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  data-testid="user-menu-trigger"
                >
                  {displayName}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className={styles.header__dropdown} role="menu">
                    {!isAdmin && (
                      <>
                        <Link
                          href="/operator/profile"
                          className={styles.header__dropdownItem}
                          onClick={() => setMenuOpen(false)}
                          role="menuitem"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/operator/settings"
                          className={styles.header__dropdownItem}
                          onClick={() => setMenuOpen(false)}
                          role="menuitem"
                        >
                          Settings
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className={styles.header__dropdownItem}
                      data-testid="logout-btn"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !user && (
            <Link
              href="/login"
              className={styles.header__loginCta}
              data-testid="nav-login"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          ref={hamburgerRef}
          className={styles.header__hamburger}
          onClick={toggleMobileDrawer}
          aria-label={mobileDrawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileDrawerOpen}
          aria-controls="mobile-drawer"
          data-testid="mobile-menu-toggle"
        >
          {mobileDrawerOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className={styles.header__mobileOverlay}
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      {mobileDrawerOpen && (
        <div
          ref={mobileDrawerRef}
          id="mobile-drawer"
          className={`${styles.header__mobileDrawer} ${styles.header__mobileDrawerOpen}`}
          aria-labelledby="mobile-drawer-title"
          role="dialog"
          aria-modal="true"
        >
          <h2 id="mobile-drawer-title" className="sr-only">
            Mobile navigation
          </h2>
          <div className={styles.header__mobileDrawerHeader}>
            <Link href="/" className={styles.header__mobileBrand} onClick={() => setMobileDrawerOpen(false)}>
              <Logo size={28} />
              <Image
                src="/text-logo.svg"
                alt="KaabaTrip"
                width={90}
                height={38}
                priority
              />
            </Link>
            <button
              className={styles.header__mobileClose}
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close menu"
              data-testid="mobile-menu-close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className={styles.header__mobileNav} aria-label="Mobile menu">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.header__mobileNavLink} ${isActive(link.href) ? styles.header__mobileNavLinkActive : ''}`}
                onClick={() => setMobileDrawerOpen(false)}
                data-testid={`mobile-${link.testId}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            {!user && guestLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.header__mobileNavLink} ${isActive(link.href) ? styles.header__mobileNavLinkActive : ''}`}
                onClick={() => setMobileDrawerOpen(false)}
                data-testid={`mobile-${link.testId}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            {!loading && isCustomer && (
              <>
                {customerLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.header__mobileNavLink} ${isActive(link.href) ? styles.header__mobileNavLinkActive : ''}`}
                    onClick={() => setMobileDrawerOpen(false)}
                    data-testid={`mobile-${link.testId}`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className={styles.header__mobileDivider} />
                <span className={styles.header__mobileUserLabel}>{displayName}</span>
                <Link
                  href="/settings"
                  className={styles.header__mobileNavLink}
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className={styles.header__mobileNavLink}
                  data-testid="mobile-logout-btn"
                >
                  Log out
                </button>
              </>
            )}

            {!loading && (isOperator || isAdmin) && (
              <>
                {operatorAdminLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.header__mobileNavLink} ${isActive(link.href) ? styles.header__mobileNavLinkActive : ''}`}
                    onClick={() => setMobileDrawerOpen(false)}
                    data-testid={`mobile-${link.testId}`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAdmin && (
                  <>
                    <Link
                      href="/operator/profile"
                      className={styles.header__mobileNavLink}
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/operator/settings"
                      className={styles.header__mobileNavLink}
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      Settings
                    </Link>
                  </>
                )}
                <div className={styles.header__mobileDivider} />
                <span className={styles.header__mobileUserLabel}>{displayName}</span>
                <button
                  onClick={handleLogout}
                  className={styles.header__mobileNavLink}
                  data-testid="mobile-logout-btn"
                >
                  Log out
                </button>
              </>
            )}

            {!loading && !user && (
              <>
                <div className={styles.header__mobileDivider} />
                <Link
                  href="/login"
                  className={styles.header__mobileLoginCta}
                  onClick={() => setMobileDrawerOpen(false)}
                  data-testid="mobile-nav-login"
                >
                  Sign in
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
