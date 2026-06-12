'use client';

import { useState } from 'react';

interface ReferenceCodeDisplayProps {
  referenceCode: string;
  operatorName?: string;
}

export function ReferenceCodeDisplay({ referenceCode, operatorName }: ReferenceCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silent fail; code is still visible on screen
    }
  };

  return (
    <div className="rounded-xl border border-[var(--yellow)] bg-[rgba(255,211,29,0.06)] px-6 py-8 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--yellow)]">
        Booking reference
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <p
          className="font-mono text-3xl font-bold tracking-widest text-[var(--yellow)]"
          aria-label={`Booking reference code ${referenceCode}`}
        >
          {referenceCode}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Reference code copied' : 'Copy reference code to clipboard'}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--yellow)]/40 bg-transparent text-[var(--yellow)] transition-colors hover:bg-[rgba(255,211,29,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)]"
          data-testid="copy-reference-code"
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span className="sr-only">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      {copied && (
        <p className="mt-1 text-xs text-[var(--yellow)]" aria-live="polite">
          Copied to clipboard
        </p>
      )}
      <p className="mt-3 text-sm text-[var(--textMuted)]">
        {operatorName
          ? <>Your enquiry has been submitted to <strong className="text-[var(--text)]">{operatorName}</strong>.</>
          : 'Your enquiry has been submitted.'}
      </p>
    </div>
  );
}
