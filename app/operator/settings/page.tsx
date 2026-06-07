import Link from 'next/link';

export const metadata = {
  title: 'Settings',
};

export default function OperatorSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Settings</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/operator/settings/payment-details"
          className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 transition-colors hover:border-[var(--yellow)]"
          data-testid="settings-payment-link"
        >
          <h2 className="text-lg font-medium text-[var(--text)]">Payment Details</h2>
          <p className="mt-1 text-sm text-[var(--textMuted)]">
            Manage bank account information for receiving customer payments.
          </p>
        </Link>
        <Link
          href="/operator/profile"
          className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 transition-colors hover:border-[var(--yellow)]"
          data-testid="settings-profile-link"
        >
          <h2 className="text-lg font-medium text-[var(--text)]">Profile</h2>
          <p className="mt-1 text-sm text-[var(--textMuted)]">
            Update company information, address, and branding.
          </p>
        </Link>
      </div>
    </div>
  );
}