import { OperatorDashboard } from '@/components/operator/OperatorDashboard';
import { ComplaintsInbox } from '@/components/operator/ComplaintsInbox';

export default function OperatorPage() {
  return (
    <div className="space-y-8">
      <OperatorDashboard />
      <section aria-labelledby="complaints-heading">
        <h2 id="complaints-heading" className="mb-4 text-lg font-semibold text-[var(--text)]">
          Complaints inbox
        </h2>
        <ComplaintsInbox />
      </section>
    </div>
  );
}
