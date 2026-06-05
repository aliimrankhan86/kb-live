'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/graphics/Logo';
import { createClient } from '@/lib/supabase/client';
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setUser({
          id: u.id,
          email: u.email || '',
          role: (u.user_metadata?.role as UserRole) || 'customer',
          name: u.user_metadata?.name || u.user_metadata?.full_name || null,
        });
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: (session.user.user_metadata?.role as UserRole) || 'customer',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || null,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await fetch('/api/auth/sign-out', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const isOperator = user?.role === 'operator';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  // Don't show header on operator pages (they have sidebar)
  if (pathname?.startsWith('/operator/') || pathname?.startsWith('/admin/')) {
    return null;
  }

  return (
    <header className={`${styles.header} ${className}`} aria-label="Main navigation">
      <div className={styles.header__container}>
        <Link href="/" className={styles.header__brand} aria-label="KaabaTrip - Go to homepage">
          <Logo size={32} />
          <Image src="/text-logo.svg" alt="KaabaTrip" className={styles.header__textLogo} width={108} height={45} priority />
        </Link>

        <nav className={styles.header__navigation} aria-label="Main menu">
          <Link href="/quote" className={styles.header__navLink}>
            Get a Quote
          </Link>

          {!loading && !user && (
            <>
              <Link href="/operator/onboarding" className={styles.header__navLink}>
                For Partners
              </Link>
              <Link href="/login" className={styles.header__navLink}>
                Partner Login
              </Link>
            </>
          )}

          {!loading && isCustomer && (
            <>
              <Link href="/requests" className={styles.header__navLink}>
                My Requests
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`${styles.header__navLink} flex items-center gap-1`}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  data-testid="user-menu-trigger"
                >
                  {user?.name || user?.email}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] py-1 shadow-lg">
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--surfaceLight)]"
                      data-testid="logout-btn"
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
              <Link href={isAdmin ? '/admin/complaints' : '/operator/dashboard'} className={styles.header__navLink}>
                {isAdmin ? 'Admin' : 'Dashboard'}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`${styles.header__navLink} flex items-center gap-1`}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  data-testid="user-menu-trigger"
                >
                  {user?.name || user?.email}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] py-1 shadow-lg">
                    {!isAdmin && (
                      <>
                        <Link
                          href="/operator/profile"
                          className="block px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surfaceLight)]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/operator/settings"
                          className="block px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surfaceLight)]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Settings
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--surfaceLight)]"
                      data-testid="logout-btn"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}