import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { OperatorProfileForm } from '@/components/operator/OperatorProfileForm';

export default async function OperatorProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/profile');

  const operator = await Repository.getOperatorById(user.id);

  if (!operator) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Profile & Settings</h1>
          <p className="mt-1 text-sm text-[var(--textMuted)]">Manage your company information and preferences.</p>
        </div>
        <div className="text-[var(--textMuted)]">
          Operator profile not found. Contact support to set up your account.
        </div>
      </div>
    );
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
