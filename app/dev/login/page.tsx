import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  DEV_ACCOUNT_PASSWORD,
  DEV_AUTH_USERS,
  type DevAuthKey,
  toSessionUser,
} from '@/lib/auth/dev-users';

/**
 * Dev-only login bypass page. Available only in development.
 * Set __dev_user cookie to instantly authenticate as customer, operator, or admin.
 * Redirects to / in production.
 */

function DevLoginCard({
  user,
}: {
  user: (typeof DEV_AUTH_USERS)[DevAuthKey];
}) {
  return (
    <form
      action={async () => {
        'use server';
        const cookieStore = await cookies();
        cookieStore.set({
          name: '__dev_user',
          value: JSON.stringify(toSessionUser(user)),
          path: '/',
          sameSite: 'lax',
          httpOnly: false,
          secure: false,
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }}
      method="post"
      className="flex flex-col gap-4 rounded-lg border p-6 transition-colors hover:border-[var(--yellow)]"
      style={{ borderColor: 'var(--borderSubtle)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: user.color }}
        />
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--yellow)' }}
        >
          {user.label}
        </h2>
      </div>
      <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
        {user.description}
      </p>
      <div className="text-xs" style={{ color: 'var(--textMuted)' }}>
        <span className="font-medium">Email:</span> {user.email}
        <br />
        <span className="font-medium">Password:</span> {DEV_ACCOUNT_PASSWORD}
        <br />
        <span className="font-medium">ID:</span> {user.id}
        <br />
        <span className="font-medium">Role:</span> {user.role}
      </div>
      <button
        type="submit"
        className="mt-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--yellow)',
          color: 'var(--bgPrimary)',
        }}
      >
        Log in as {user.label}
      </button>
    </form>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server';
        const cookieStore = await cookies();
        cookieStore.delete('__dev_user');
      }}
      method="post"
    >
      <button
        type="submit"
        className="rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        style={{
          borderColor: 'var(--borderSubtle)',
          color: 'var(--textMuted)',
        }}
      >
        Clear dev session
      </button>
    </form>
  );
}

export default async function DevLoginPage() {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  const cookieStore = await cookies();
  const devCookie = cookieStore.get('__dev_user');
  const currentUser = devCookie?.value
    ? (JSON.parse(devCookie.value) as { id: string; email: string; role: string; name?: string })
    : null;

  return (
    <main
      className="mx-auto max-w-5xl px-4 py-12"
      style={{ color: 'var(--textPrimary)' }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--yellow)' }}>
            Dev Login Bypass
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--textMuted)' }}>
            Instantly switch between personas for local development. Only available in{' '}
            <code className="rounded px-1 py-0.5 text-xs" style={{ backgroundColor: 'var(--bgSecondary)' }}>
              NODE_ENV=development
            </code>
            .
          </p>
        </div>
        {currentUser && <LogoutButton />}
      </div>

      {currentUser && (
        <div
          className="mb-8 rounded-lg border p-4 text-sm"
          style={{
            borderColor: 'var(--yellow)',
            backgroundColor: 'rgba(255,211,29,0.06)',
          }}
        >
          <span className="font-medium">Current session:</span>{' '}
          {currentUser.name ?? currentUser.email} ({currentUser.role}) — ID: {currentUser.id}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {(Object.keys(DEV_AUTH_USERS) as DevAuthKey[]).map((key) => (
          <DevLoginCard key={key} user={DEV_AUTH_USERS[key]} />
        ))}
      </div>

      <div
        className="mb-6 rounded-lg border p-4 text-sm"
        style={{
          borderColor: 'var(--borderSubtle)',
          backgroundColor: 'var(--bgSecondary)',
        }}
      >
        <p className="font-medium" style={{ color: 'var(--textPrimary)' }}>
          Password complexity requirements
        </p>
        <ul className="mt-2 space-y-1 text-xs" style={{ color: 'var(--textMuted)' }}>
          <li>• Minimum 8 characters</li>
          <li>• At least 1 uppercase letter (A–Z)</li>
          <li>• At least 1 lowercase letter (a–z)</li>
          <li>• At least 1 number (0–9)</li>
          <li>• At least 1 special character (!@#$%^&*)</li>
        </ul>
        <p className="mt-2 text-xs" style={{ color: 'var(--textMuted)' }}>
          All dev accounts use the same password:{' '}
          <code className="rounded px-1 py-0.5" style={{ backgroundColor: 'var(--bgPrimary)' }}>
            {DEV_ACCOUNT_PASSWORD}
          </code>
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <span style={{ color: 'var(--textMuted)' }}>Quick links:</span>
        <Link
          href="/operator/dashboard"
          className="underline underline-offset-2 transition-colors hover:text-[var(--yellow)]"
          style={{ color: 'var(--textMuted)' }}
        >
          Operator Dashboard
        </Link>
        <Link
          href="/operator/packages"
          className="underline underline-offset-2 transition-colors hover:text-[var(--yellow)]"
          style={{ color: 'var(--textMuted)' }}
        >
          Operator Packages
        </Link>
        <Link
          href="/operator/profile"
          className="underline underline-offset-2 transition-colors hover:text-[var(--yellow)]"
          style={{ color: 'var(--textMuted)' }}
        >
          Operator Profile
        </Link>
        <Link
          href="/operator/onboarding"
          className="underline underline-offset-2 transition-colors hover:text-[var(--yellow)]"
          style={{ color: 'var(--textMuted)' }}
        >
          Operator Onboarding
        </Link>
        <Link
          href="/admin/bank-changes"
          className="underline underline-offset-2 transition-colors hover:text-[var(--yellow)]"
          style={{ color: 'var(--textMuted)' }}
        >
          Admin Bank Changes
        </Link>
        <Link
          href="/admin/complaints"
          className="underline underline-offset-2 transition-colors hover:text-[var(--yellow)]"
          style={{ color: 'var(--textMuted)' }}
        >
          Admin Complaints
        </Link>
      </div>
    </main>
  );
}
