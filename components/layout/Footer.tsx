import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--borderSubtle)] bg-[var(--surfaceDark)] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">KaabaTrip Limited</h3>
          <address className="text-xs not-italic leading-relaxed text-[var(--textMuted)]">
            Slough, Berkshire<br />
            United Kingdom<br />
            <a
              href="mailto:support@kaabatrip.com"
              className="underline text-[var(--accent)] hover:text-[var(--accentHover)]"
            >
              support@kaabatrip.com
            </a>
          </address>
          <p className="mt-2 text-xs text-[var(--textMuted)]">
            Company Reg: [Registration in progress] &middot; VAT: [To be completed]
          </p>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">Legal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/terms"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms#cookies"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:complaints@kaabatrip.com"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  Complaints
                </a>
              </li>
            </ul>
          </div>

          {/* Platform info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">Platform</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/quote"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  Get a Quote
                </Link>
              </li>
              <li>
                <Link
                  href="/search/packages"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  Search Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/operator/onboarding"
                  className="text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline"
                >
                  For Partners
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-8 border-t border-[var(--borderSubtle)] pt-6">
          <p className="mb-3 text-xs leading-relaxed text-[var(--textMuted)]">
            <strong className="text-[var(--text)]">Important disclaimer:</strong> KaabaTrip is a
            comparison platform only. We do not organise, sell, or fulfil travel packages. Your
            contract is directly with the travel operator. We do not collect, hold, or transfer
            customer funds. We do not independently verify ATOL or ABTA credentials. Always confirm
            protection details directly with the operator before paying.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-[var(--textMuted)]">
            ATOL and ABTA numbers displayed on this platform are provided by operators. Verify
            ATOL at{' '}
            <a
              href="https://www.caa.co.uk/atol-protection"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              caa.co.uk
            </a>{' '}
            and ABTA at{' '}
            <a
              href="https://www.abta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              abta.com
            </a>.
          </p>
          <p className="text-xs text-[var(--textMuted)]">
            &copy; {new Date().getFullYear()} KaabaTrip Limited. All rights reserved.{' '}
            Governed by the laws of England and Wales.
          </p>
        </div>
      </div>
    </footer>
  );
}