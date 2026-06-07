import { Suspense } from 'react';
import { OperatorDashboard } from '@/components/operator/OperatorDashboard';
import { ComplaintsInbox } from '@/components/operator/ComplaintsInbox';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] animate-pulse" />
        ))}
      </div>
      <div className="h-40 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] animate-pulse" />
    </div>
  );
}

export default function OperatorPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <OperatorDashboard />
      </Suspense>
      <section aria-labelledby="complaints-heading">
        <h2 id="complaints-heading" className="mb-4 text-lg font-semibold text-[var(--text)]">
          Complaints inbox
        </h2>
        <ComplaintsInbox />
      </section>
    </div>
  );
}
