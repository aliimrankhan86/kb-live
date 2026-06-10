import Link from 'next/link';
import { Logo } from '@/components/graphics/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--borderSubtle)] bg-[var(--surfaceDark)]" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Top section: Logo + tagline */}
        <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="PilgrimCompare - Go to homepage">
            <Logo size={28} />
            <span style={{ fontFamily: "var(--font-nunito), 'Nunito', system-ui, sans-serif", fontSize: '1.375rem', fontWeight: 800, letterSpacing: 0, lineHeight: 1, color: '#FFD31D', userSelect: 'none' }}>
              PilgrimCompare
            </span>
          </Link>
          <p className="text-center text-xs text-[var(--textMuted)] sm:text-left sm:max-w-xs">
            Compare Umrah and Hajj packages from verified UK travel operators.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Company info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">PilgrimCompare Limited</h3>
            <address className="text-xs not-italic leading-relaxed text-[var(--textMuted)]">
              Slough, Berkshire<br />
              United Kingdom<br />
              <a
                href="mailto:support@pilgrimcompare.co.uk"
                className="inline-block mt-1 min-h-[24px] underline text-[var(--accent)] hover:text-[var(--accentHover)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
              >
                support@pilgrimcompare.co.uk
              </a>
            </address>
            <p className="mt-3 text-xs text-[var(--textMuted)]">
              Company Reg: <span className="text-[var(--text)]">[Registration in progress]</span>
            </p>
            <p className="text-xs text-[var(--textMuted)]">
              VAT: <span className="text-[var(--text)]">[To be completed]</span>
            </p>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">Legal</h3>
            <ul className="space-y-2 text-xs">
              {[
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms#cookies', label: 'Cookie Policy' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[24px] items-center text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:complaints@pilgrimcompare.co.uk"
                  className="inline-flex min-h-[24px] items-center text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
                >
                  Complaints
                </a>
              </li>
            </ul>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">Platform</h3>
            <ul className="space-y-2 text-xs">
              {[
                { href: '/quote', label: 'Get a Quote' },
                { href: '/search/packages', label: 'Search Packages' },
                { href: '/partner', label: 'For Partners' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[24px] items-center text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-8 border-t border-[var(--borderSubtle)] pt-6 space-y-3">
          <p className="text-xs leading-relaxed text-[var(--textMuted)]">
            <strong className="text-[var(--text)]">Important disclaimer:</strong> PilgrimCompare is a
            comparison platform only. We do not organise, sell, or fulfil travel packages. Your
            contract is directly with the travel operator. We do not collect, hold, or transfer
            customer funds. We do not independently verify ATOL or ABTA credentials. Always confirm
            protection details directly with the operator before paying.
          </p>
          <p className="text-xs leading-relaxed text-[var(--textMuted)]">
            ATOL and ABTA numbers displayed on this platform are provided by operators. Verify
            ATOL at{' '}
            <a
              href="https://www.caa.co.uk/atol-protection"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)] hover:text-[var(--accentHover)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
            >
              caa.co.uk
            </a>
            {' '}and ABTA at{' '}
            <a
              href="https://www.abta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)] hover:text-[var(--accentHover)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
            >
              abta.com
            </a>.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-[var(--borderSubtle)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--textMuted)]">
            &copy; {currentYear} PilgrimCompare Limited. All rights reserved.
          </p>
          <p className="text-xs text-[var(--textMuted)]">
            Governed by the laws of England and Wales.
          </p>
        </div>
      </div>
    </footer>
  );
}