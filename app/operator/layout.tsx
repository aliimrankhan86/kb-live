import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';
import { OperatorPageTitle } from '@/components/operator/OperatorPageTitle';

interface OperatorLayoutProps {
  children: ReactNode;
}

export default async function OperatorLayout({ children }: OperatorLayoutProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?redirect=/operator/dashboard');
  }

  if (user.role !== 'operator' && user.role !== 'admin') {
    redirect('/');
  }

  // Fetch operator profile for sidebar
  let operatorName = 'Operator';
  let verificationStatus: 'pending' | 'verified' | 'rejected' | undefined;
  try {
    const op = await Repository.getOperatorById(user.id);
    if (op) {
      operatorName = op.companyName || op.tradingName || 'Operator';
      verificationStatus = op.verificationStatus;
    }
  } catch {
    // Fallback to defaults
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#FFFFFF]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:px-6 md:py-6">
        <OperatorSidebar
          operatorName={operatorName}
          verificationStatus={verificationStatus}
          userRole={user.role}
          userName={user.name || user.email}
        />
        <main className="min-w-0 flex-1 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111111] p-4 md:p-6">
          <header className="mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
            <p className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.64)]">Operator Portal</p>
            <OperatorPageTitle />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}