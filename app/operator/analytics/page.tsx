import { AnalyticsDashboard } from '@/components/operator/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-[#FFFFFF]">Operator Analytics</h1>
        <AnalyticsDashboard />
      </div>
    </main>
  );
}
