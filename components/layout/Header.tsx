'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/graphics/Logo';
import { WordmarkLogo } from '@/components/graphics/WordmarkLogo';
import type { UserRole } from '@/lib/types';
import styles from './header.module.css';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

// Minimal inline SVG icons — 24×24 stroked
function Icon({ d, d2, size = 18 }: { d: string; d2?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  );
}

const ICONS = {
  umrah: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  hajj: 'M3 21h18M5 21V7l7-4 7 4v14M9 21V12h6v9',
  quote: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  requests: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  partners: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  dashboard: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  admin: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  settings: {
    d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    d2: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  packages: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  compare: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  howItWorks: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

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
        if (isMounted) setUser(data.user);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    setLoading(true);
    void loadUser();
    return () => { isMounted = false; };
  }, [pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileDrawerOpen(false);
    await fetch('/api/auth/sign-out', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    setMobileDrawerOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const prevPaddingRight = body.style.paddingRight;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      body.style.paddingRight = prevPaddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [mobileDrawerOpen]);

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

  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const isOperator = user?.role === 'operator';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const displayName = user?.name ? user.name.split(' ')[0] : user?.email?.split('@')[0] ?? '';
  const avatarLetter = (user?.name || user?.email || 'U')[0].toUpperCase();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href) ?? false;

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(prev => !prev);
    setMenuOpen(false);
  }, []);


  const navLinks = [
    { href: '/packages', label: 'Packages', testId: 'nav-packages', icon: ICONS.packages },
    { href: '/search/packages', label: 'Compare', testId: 'nav-compare', icon: ICONS.compare },
    { href: '/how-it-works', label: 'How it works', testId: 'nav-how-it-works', icon: ICONS.howItWorks },
  ];

  const guestLinks = [
    { href: '/partner', label: 'For Operators', testId: 'nav-operators', icon: ICONS.partners },
  ];

  const customerLinks = [
    { href: '/requests', label: 'My Requests', testId: 'nav-requests', icon: ICONS.requests },
  ];

  const operatorAdminLinks = [
    {
      href: isAdmin ? '/admin/complaints' : '/operator/dashboard',
      label: isAdmin ? 'Admin' : 'Dashboard',
      testId: 'nav-dashboard',
      icon: isAdmin ? ICONS.admin : ICONS.dashboard,
    },
  ];

  return (
    <header className={`${styles.header} ${className}`} aria-label="Main navigation">
      <div className={styles.header__container}>
        {/* Brand */}
        <Link href="/" className={styles.header__brand} aria-label="PilgrimCompare - Go to homepage">
          <Logo size={32} />
          <WordmarkLogo className={styles.header__textLogo} height={30} pilgrimColor={isLight ? '#111827' : undefined} />
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
                    <Link href="/settings" className={styles.header__dropdownItem} onClick={() => setMenuOpen(false)} role="menuitem">
                      Settings
                    </Link>
                    <button onClick={handleLogout} className={styles.header__dropdownItem} data-testid="logout-btn" role="menuitem">
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
                        <Link href="/operator/profile" className={styles.header__dropdownItem} onClick={() => setMenuOpen(false)} role="menuitem">
                          Profile
                        </Link>
                        <Link href="/operator/settings" className={styles.header__dropdownItem} onClick={() => setMenuOpen(false)} role="menuitem">
                          Settings
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout} className={styles.header__dropdownItem} data-testid="logout-btn" role="menuitem">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !user && (
            <Link href="/login" className={styles.header__loginCta} data-testid="nav-login">
              Sign in
            </Link>
          )}
          <ThemeToggle />
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileDrawerOpen && (
        <div
          className={styles.header__mobileOverlay}
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          ref={mobileDrawerRef}
          id="mobile-drawer"
          className={`${styles.header__mobileDrawer} ${styles.header__mobileDrawerOpen}`}
          aria-labelledby="mobile-drawer-title"
          role="dialog"
          aria-modal="true"
        >
          <h2 id="mobile-drawer-title" className="sr-only">Mobile navigation</h2>

          {/* Drawer header */}
          <div className={styles.header__mobileDrawerHeader}>
            <Link href="/" className={styles.header__mobileBrand} onClick={() => setMobileDrawerOpen(false)}>
              <Logo size={28} />
              <WordmarkLogo className={styles.header__textLogoMobile} height={26} pilgrimColor={isLight ? '#111827' : undefined} />
            </Link>
            <button
              className={styles.header__mobileClose}
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close menu"
              data-testid="mobile-menu-close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav section */}
          <nav className={styles.header__mobileNav} aria-label="Mobile menu">

            {/* Theme toggle — above all nav links */}
            <button
              onClick={toggleTheme}
              className={styles.header__mobileThemeRow}
              aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              data-testid="mobile-theme-toggle"
            >
              <span className={styles.header__mobileThemeLabel}>
                {isLight ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
                {isLight ? 'Dark theme' : 'Light theme'}
              </span>
            </button>

            {/* Core nav links */}
            <div className={styles.header__mobileSectionLabel}>Explore</div>
            {navLinks.map(link => {
              const active = isActive(link.href);
              const isQuote = link.href === '/quote';
              if (isQuote) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.header__mobileNavQuoteCta}
                    onClick={() => setMobileDrawerOpen(false)}
                    data-testid={`mobile-${link.testId}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon d={link.icon} size={18} />
                    {link.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.header__mobileNavLink} ${active ? styles.header__mobileNavLinkActive : ''}`}
                  onClick={() => setMobileDrawerOpen(false)}
                  data-testid={`mobile-${link.testId}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon d={link.icon} size={18} />
                  {link.label}
                </Link>
              );
            })}

            {!user && guestLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.header__mobileNavLink} ${isActive(link.href) ? styles.header__mobileNavLinkActive : ''}`}
                onClick={() => setMobileDrawerOpen(false)}
                data-testid={`mobile-${link.testId}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                <Icon d={link.icon} size={18} />
                {link.label}
              </Link>
            ))}

            {/* Customer links */}
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
                    <Icon d={link.icon} size={18} />
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {/* Operator / Admin links */}
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
                    <Icon d={link.icon} size={18} />
                    {link.label}
                  </Link>
                ))}
                {!isAdmin && (
                  <Link
                    href="/operator/profile"
                    className={`${styles.header__mobileNavLink} ${isActive('/operator/profile') ? styles.header__mobileNavLinkActive : ''}`}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon d={ICONS.settings.d} d2={ICONS.settings.d2} size={18} />
                    Profile & settings
                  </Link>
                )}
              </>
            )}

            {/* Spacer pushes account section to bottom */}
            <div style={{ flex: 1 }} />

            {/* Logged-in user card + account actions */}
            {!loading && user && (
              <>
                <div className={styles.header__mobileDivider} />
                <div className={styles.header__mobileSectionLabel}>Account</div>

                {/* User card */}
                <div className={styles.header__mobileUserCard}>
                  <div className={styles.header__mobileUserAvatar}>{avatarLetter}</div>
                  <div className={styles.header__mobileUserInfo}>
                    <span className={styles.header__mobileUserName}>{displayName}</span>
                    <span className={styles.header__mobileUserEmail}>{user.email}</span>
                  </div>
                </div>

                {(isCustomer) && (
                  <Link
                    href="/settings"
                    className={`${styles.header__mobileNavLink} ${isActive('/settings') ? styles.header__mobileNavLinkActive : ''}`}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon d={ICONS.settings.d} d2={ICONS.settings.d2} size={18} />
                    Settings
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className={styles.header__mobileNavLinkDanger}
                  data-testid="mobile-logout-btn"
                >
                  <Icon d={ICONS.logout} size={18} />
                  Log out
                </button>
              </>
            )}

            {/* Guest: Sign in CTA */}
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
                <Link
                  href="/signup"
                  className={styles.header__mobileNavLink}
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ justifyContent: 'center', fontSize: '0.875rem', color: 'var(--textMuted)' }}
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
