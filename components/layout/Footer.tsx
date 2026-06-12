'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/graphics/Logo';
import { WordmarkLogo } from '@/components/graphics/WordmarkLogo';
import { LEGAL_ENTITY_BLOCK } from '@/lib/legal';

const LEGAL_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/how-we-rank', label: 'How we rank' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/privacy', label: 'Privacy Policy' },
];

const PLATFORM_LINKS = [
  { href: '/packages', label: 'Browse Packages' },
  { href: '/search/packages', label: 'Compare Packages' },
  { href: '/quote', label: 'Get a Quote' },
  { href: '/partner', label: 'For Operators' },
];

const linkClass =
  'inline-flex min-h-[24px] items-center text-[var(--textMuted)] hover:text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-4 transition-transform duration-200 md:hidden ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Section({
  title,
  defaultOpen,
  forceOpen,
  isFirst,
  isLast,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  forceOpen: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const expanded = forceOpen || open;
  const contentId = `footer-section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      className={`border-t border-[var(--borderSubtle)] py-3 md:border-0 md:py-0 ${
        isLast ? 'border-b md:border-b-0' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[var(--text)] md:cursor-default md:pointer-events-none"
      >
        <span>{title}</span>
        <Chevron open={expanded} />
      </button>
      <div
        id={contentId}
        hidden={!expanded}
        className="pt-3"
      >
        {children}
      </div>
    </div>
  );
}

function BrandBlock() {
  return (
    <>
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2"
        aria-label="PilgrimCompare - Go to homepage"
      >
        <Logo size={26} />
        <WordmarkLogo height={24} style={{ color: 'var(--wordmark-color, var(--yellow, #FFD31D))' }} />
      </Link>
      <p className="text-xs leading-relaxed text-[var(--textMuted)]">
        PilgrimCompare is a UK comparison and enquiry service for Umrah travel packages. We list
        packages from independent, verified UK travel operators so you can compare them side by
        side and send enquiries directly. We are not a travel agent, tour operator, or organiser.
        We do not sell travel, take bookings, or handle payments. Your booking, contract, and
        payment are always with the operator you choose.
      </p>
    </>
  );
}

export function Footer({ cities = [] }: { cities?: string[] }) {
  const currentYear = new Date().getFullYear();
  const isDesktop = useIsDesktop();

  return (
    <footer className="border-t border-[var(--borderSubtle)] bg-[var(--surfaceDark)]" role="contentinfo">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">

        {/* Mobile brand block — shown only on mobile, above the accordions */}
        <div className="mb-6 flex flex-col gap-3 md:hidden">
          <BrandBlock />
        </div>

        {/* Main grid:
            Mobile  — single-column stacked accordions
            Desktop — 4-col: [brand 2fr] [contact 1fr] [legal 1fr] [platform 1fr] */}
        <div className="grid gap-1 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-10 md:items-start">

          {/* Brand col — desktop only */}
          <div className="hidden md:flex md:flex-col md:gap-4">
            <BrandBlock />
          </div>

          <Section title="Contact" defaultOpen isFirst forceOpen={isDesktop}>
            <address className="text-xs not-italic leading-relaxed text-[var(--textMuted)]">
              United Kingdom<br />
              <a
                href="mailto:support@pilgrimcompare.co.uk"
                className="mt-1 inline-block min-h-[24px] underline text-[var(--accent)] hover:text-[var(--accentHover)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
              >
                support@pilgrimcompare.co.uk
              </a>
            </address>
          </Section>

          <Section title="Legal" forceOpen={isDesktop}>
            <ul className="space-y-2 text-xs">
              {LEGAL_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:complaints@pilgrimcompare.co.uk" className={linkClass}>
                  Complaints
                </a>
              </li>
              <li>
                <a href="mailto:dpo@pilgrimcompare.co.uk" className={linkClass}>
                  Data Protection (DPO)
                </a>
              </li>
            </ul>
          </Section>

          <Section title="Platform" isLast forceOpen={isDesktop}>
            <ul className="space-y-2 text-xs">
              {PLATFORM_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {cities.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--textMuted)]">
                  Departing from
                </p>
                <ul className="space-y-2 text-xs">
                  {cities.map(city => (
                    <li key={city}>
                      <Link
                        href={`/umrah/${city.toLowerCase()}`}
                        className={linkClass}
                      >
                        {city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 border-t border-[var(--borderSubtle)] pt-5 md:mt-10 md:pt-6">
          <p className="text-xs leading-relaxed text-[var(--textMuted)]">
            <strong className="text-[var(--text)]">Important:</strong> PilgrimCompare is a comparison
            platform only. We do not organise, sell, or fulfil travel packages and do not collect, hold,
            or transfer customer funds. Your contract is directly with the travel operator. ATOL/ABTA
            numbers are provided by operators — verify at{' '}
            <a
              href="https://www.caa.co.uk/atol-protection"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)] hover:text-[var(--accentHover)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
            >
              caa.co.uk
            </a>
            {' '}and{' '}
            <a
              href="https://www.abta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)] hover:text-[var(--accentHover)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
            >
              abta.com
            </a>{' '}
            before paying.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-5 flex flex-col gap-1 border-t border-[var(--borderSubtle)] pt-4 justify-center text-xs text-[var(--textMuted)] md:justify-between md:flex-row md:items-center md:gap-2">
          <p className="text-center md:text-left">&copy; {currentYear} PilgrimCompare. All rights reserved.</p>
          <p className="text-center md:text-left">Governed by the laws of England and Wales.</p>
        </div>

        {/* Legal entity disclosure — Companies Act 2006 §82 */}
        <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--textMuted)]">
          {LEGAL_ENTITY_BLOCK.tradingName} is a trading name of{' '}
          <span className="text-[var(--text)]">{LEGAL_ENTITY_BLOCK.companyName}</span>, registered
          in {LEGAL_ENTITY_BLOCK.registeredCountry} (company no.{' '}
          <span className="text-[var(--text)]">{LEGAL_ENTITY_BLOCK.companyNumber}</span>). VAT
          no.{' '}
          <span className="text-[var(--text)]">{LEGAL_ENTITY_BLOCK.vatNumber}</span>.
        </p>
      </div>
    </footer>
  );
}
