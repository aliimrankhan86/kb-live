import type { ReactNode } from 'react';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';

interface OperatorLayoutProps {
  children: ReactNode;
}

export default function OperatorLayout({ children }: OperatorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#FFFFFF]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:px-6 md:py-6">
        <OperatorSidebar />
        <main className="min-w-0 flex-1 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111111] p-4 md:p-6">
          <header className="mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
            <p className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.64)]">Operator Portal</p>
            <h1 className="text-2xl font-semibold text-[#FFFFFF]">Workspace</h1>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
