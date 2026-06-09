'use client';

import { useRouter } from 'next/navigation';
import { MockDB } from '@/lib/api/mock-db';

export function AnalyticsSeedButton({ operatorId }: { operatorId: string }) {
  const router = useRouter();

  const handleSeed = () => {
    MockDB.seedAnalyticsForOperator(operatorId, 30);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] text-[var(--textMuted)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--text)]">No activity yet</p>
      <p className="max-w-xs text-xs text-[var(--textMuted)]">
        Events appear here once travellers view your packages and request quotes.
      </p>
      <button
        type="button"
        onClick={handleSeed}
        className="mt-1 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-2 text-xs font-medium text-[var(--textMuted)] transition-colors hover:border-[var(--borderStrong)] hover:text-[var(--text)]"
      >
        Load sample data
      </button>
    </div>
  );
}
