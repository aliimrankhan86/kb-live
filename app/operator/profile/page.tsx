'use client';

import { useEffect, useState } from 'react';
import { OperatorProfileForm } from '@/components/operator/OperatorProfileForm';
import { OperatorProfile } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';

export default function OperatorProfilePage() {
  const [operator, setOperator] = useState<OperatorProfile | null>(null);

  useEffect(() => {
    MockDB.setCurrentUser('operator');
    const op = MockDB.getOperators()[0];
    if (op) setOperator(op);
  }, []);

  if (!operator) {
    return <div className="text-[var(--textMuted)]">Loading profile…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Profile & Settings</h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Manage your company information and preferences.</p>
      </div>
      <OperatorProfileForm operator={operator} />
    </div>
  );
}