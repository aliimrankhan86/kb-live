'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CookieConsentState {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'kb_cookie_consent_v1';

function getStoredConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredConsent(state: CookieConsentState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const state: CookieConsentState = {
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    setStoredConsent(state);
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    const state: CookieConsentState = {
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    setStoredConsent(state);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
      data-testid="cookie-consent-banner"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4 shadow-2xl"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <p className="text-sm text-[var(--text)]">
              <strong className="block text-base mb-1">We value your privacy</strong>
              KaabaTrip uses cookies to operate this site and improve your experience.
              Essential cookies are required for authentication and security.
              Analytics cookies help us understand how our site is used.
              By continuing to browse, you agree to our use of cookies.
              {' '}
              <Link
                href="/privacy"
                className="underline text-[var(--yellow)] hover:brightness-95"
                onClick={() => setVisible(false)}
              >
                Privacy Policy
              </Link>
              {' and '}
              <Link
                href="/terms"
                className="underline text-[var(--yellow)] hover:brightness-95"
                onClick={() => setVisible(false)}
              >
                Terms & Conditions
              </Link>
              .
            </p>

            {showDetails && (
              <div className="mt-3 rounded-md border border-[var(--borderSubtle)] bg-[var(--surface)] p-3 text-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--borderSubtle)]">
                      <th className="py-2 pr-4 font-semibold">Cookie type</th>
                      <th className="py-2 pr-4 font-semibold">Purpose</th>
                      <th className="py-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--borderSubtle)]">
                      <td className="py-2 pr-4">Essential</td>
                      <td className="py-2 pr-4">Authentication, session security, CSRF protection</td>
                      <td className="py-2">Session + 7 days refresh</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Analytics</td>
                      <td className="py-2 pr-4">Understand site usage (post-MVP only)</td>
                      <td className="py-2">Up to 2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch lg:flex-row">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="rounded-md border border-[var(--borderSubtle)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)]"
              data-testid="cookie-details-toggle"
            >
              {showDetails ? 'Hide details' : 'Manage cookies'}
            </button>
            <button
              onClick={handleAcceptEssential}
              className="rounded-md border border-[var(--yellow)] bg-[var(--yellow)] px-4 py-2 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,211,29,0.25)] hover:brightness-95"
              data-testid="cookie-essential-only"
            >
              Essential only
            </button>
            <button
              onClick={handleAcceptAll}
              className="rounded-md border border-[var(--borderSubtle)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)]"
              data-testid="cookie-accept-all"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
