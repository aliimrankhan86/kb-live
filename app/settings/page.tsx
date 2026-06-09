'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { createClient } from '@/lib/supabase/client';

type NotifPrefs = {
  offerUpdates: boolean;
  bookingUpdates: boolean;
  marketing: boolean;
};

function Toggle({
  checked,
  onChange,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 44,
        height: 24,
        borderRadius: 999,
        background: checked ? 'var(--yellow)' : 'rgba(255,255,255,0.15)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: checked ? '#000' : '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function SectionCard({
  id,
  title,
  children,
  danger,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      aria-labelledby={id}
      style={{
        borderRadius: 12,
        border: `1px solid ${danger ? 'rgba(239,68,68,0.4)' : 'var(--borderSubtle)'}`,
        background: danger ? 'rgba(239,68,68,0.04)' : 'var(--surfaceDark)',
        padding: '1.5rem',
        marginBottom: '1rem',
      }}
    >
      <h2
        id={id}
        style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: danger ? 'var(--danger)' : 'var(--text)',
          margin: '0 0 1.25rem',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function InitialsAvatar({ name, email, size = 64 }: { name: string; email: string; size?: number }) {
  const letter = (name || email || 'U')[0].toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--yellow)',
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: 'var(--font-exo2)',
        userSelect: 'none',
      }}
    >
      {letter}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // Name edit
  const [name, setName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Password reset
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notifications
  const [notifs, setNotifs] = useState<NotifPrefs>({
    offerUpdates: true,
    bookingUpdates: true,
    marketing: false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Data export / delete (existing)
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?next=/settings');
        return;
      }
      setEmail(user.email ?? '');
      setRole(user.app_metadata?.role ?? 'customer');
      const n = (user.user_metadata?.name as string | undefined) ?? '';
      setName(n);
      setNameInput(n);
      const saved = user.user_metadata?.notifications as Partial<NotifPrefs> | undefined;
      if (saved) {
        setNotifs({
          offerUpdates: saved.offerUpdates ?? true,
          bookingUpdates: saved.bookingUpdates ?? true,
          marketing: saved.marketing ?? false,
        });
      }
      setLoading(false);
    });
  }, [router, supabase]);

  const handleSaveName = async () => {
    if (!supabase) return;
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length > 100) {
      setNameError('Name must be 1–100 characters.');
      return;
    }
    setSavingName(true);
    setNameError(null);
    const { error } = await supabase.auth.updateUser({ data: { name: trimmed } });
    if (error) {
      setNameError(error.message);
    } else {
      setName(trimmed);
      setEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    }
    setSavingName(false);
  };

  const handleResetPassword = async () => {
    if (!supabase) return;
    setResettingPassword(true);
    setPasswordError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordResetSent(true);
    }
    setResettingPassword(false);
  };

  const handleToggleNotif = async (key: keyof NotifPrefs) => {
    if (!supabase) return;
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    setSavingNotifs(true);
    await supabase.auth.updateUser({ data: { notifications: updated } });
    setSavingNotifs(false);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch('/api/user/export', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Export failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cd = res.headers.get('Content-Disposition') ?? '';
      const match = cd.match(/filename="([^"]+)"/);
      link.download = match ? match[1] : 'my-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Deletion failed');
      }
      if (typeof window !== 'undefined') localStorage.clear();
      router.push('/?account_deleted=1');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const ROLE_LABEL: Record<string, string> = {
    customer: 'Traveller',
    operator: 'Operator',
    admin: 'Admin',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--textMuted)', fontSize: '0.9375rem' }}>Loading…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <Breadcrumb
        className="mb-6"
        items={[{ label: 'Home', href: '/' }, { label: 'Account settings' }]}
      />
      <h1 className="mb-8 text-2xl font-semibold text-[var(--text)]">Account settings</h1>

      {/* Profile */}
      <SectionCard id="profile-heading" title="Profile">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <InitialsAvatar name={name} email={email} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', wordBreak: 'break-word' }}>
                {name || email.split('@')[0]}
              </span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem',
                borderRadius: 999, background: 'rgba(255,211,29,0.12)', color: 'var(--yellow)',
                border: '1px solid rgba(255,211,29,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {ROLE_LABEL[role] ?? role}
              </span>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--textMuted)', wordBreak: 'break-all' }}>{email}</span>
          </div>
        </div>

        {/* Name field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="display-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--textMuted)', marginBottom: '0.375rem' }}>
            Display name
          </label>
          {editingName ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="display-name"
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                autoFocus
                maxLength={100}
                style={{
                  flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--borderSubtle)', borderRadius: 8, padding: '0.5rem 0.75rem',
                  color: 'var(--text)', fontSize: '0.9375rem', outline: 'none',
                }}
              />
              <Button size="sm" onClick={handleSaveName} loading={savingName} disabled={savingName}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameInput(name); setNameError(null); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text)', padding: '0.5rem 0' }}>
                {name || <span style={{ color: 'var(--textMuted)', fontStyle: 'italic' }}>Not set</span>}
              </span>
              <button
                onClick={() => { setEditingName(true); setNameInput(name); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.8125rem', color: 'var(--textMuted)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem',
                  borderRadius: 6, transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--yellow)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--textMuted)')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            </div>
          )}
          {nameError && <p role="alert" style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>{nameError}</p>}
          {nameSuccess && <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#4ade80' }}>Name updated.</p>}
        </div>

        {/* Email field (read-only) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--textMuted)', marginBottom: '0.375rem' }}>
            Email address
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              flex: 1, padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
              fontSize: '0.9375rem', color: 'var(--textMuted)', wordBreak: 'break-all',
            }}>
              {email}
            </span>
            <span title="Email cannot be changed here" aria-label="Email is locked" style={{ color: 'var(--textMuted)', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
          </div>
          <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
            Contact support to change your email address.
          </p>
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard id="security-heading" title="Security">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', color: 'var(--text)', fontWeight: 500 }}>Password</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--textMuted)' }}>
              {passwordResetSent
                ? `Reset link sent to ${email}. Check your inbox.`
                : `We'll email a reset link to ${email}.`}
            </p>
            {passwordError && (
              <p role="alert" style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>{passwordError}</p>
            )}
          </div>
          {!passwordResetSent ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetPassword}
              loading={resettingPassword}
              disabled={resettingPassword}
              data-testid="reset-password-btn"
            >
              Change password
            </Button>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#4ade80', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Email sent
            </span>
          )}
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard id="notif-heading" title="Email notifications">
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.8125rem', color: 'var(--textMuted)' }}>
          Choose which emails KaabaTrip sends you.
          {savingNotifs && <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>Saving…</span>}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {([
            { key: 'offerUpdates' as const, label: 'Offer responses', desc: 'When an operator replies to your quote request' },
            { key: 'bookingUpdates' as const, label: 'Booking updates', desc: 'Payment confirmations and status changes' },
            { key: 'marketing' as const, label: 'Promotions & tips', desc: 'Guides, seasonal deals and Umrah insights' },
          ]).map(({ key, label, desc }) => (
            <label
              key={key}
              htmlFor={`notif-${key}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}
            >
              <div>
                <p style={{ margin: '0 0 0.125rem', fontSize: '0.9375rem', color: 'var(--text)', fontWeight: 500 }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--textMuted)' }}>{desc}</p>
              </div>
              <Toggle
                id={`notif-${key}`}
                checked={notifs[key]}
                onChange={() => void handleToggleNotif(key)}
                disabled={savingNotifs}
              />
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Data export */}
      <SectionCard id="export-heading" title="Download your data">
        <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--textMuted)' }}>
          Under UK GDPR Article 20, you can receive a copy of the personal data KaabaTrip holds — your requests, booking intents, and interests in a portable format.
        </p>
        {exportError && <p role="alert" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--danger)' }}>{exportError}</p>}
        <Button variant="secondary" onClick={handleExport} loading={exporting} disabled={exporting} data-testid="export-data-btn">
          Download my data
        </Button>
      </SectionCard>

      {/* Delete account */}
      <section
        aria-labelledby="delete-heading"
        style={{
          borderRadius: 12,
          border: '1px solid rgba(239,68,68,0.4)',
          background: 'rgba(239,68,68,0.04)',
          padding: '1.5rem',
        }}
      >
        <h2 id="delete-heading" style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--danger)' }}>
          Delete account
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--textMuted)' }}>
          Under UK GDPR Article 17, you can request erasure of your personal data. Deleting your account permanently removes your profile, requests, and booking history. This cannot be undone.
        </p>
        {deleteError && <p role="alert" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--danger)' }}>{deleteError}</p>}
        {!showDeleteConfirm ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={deleting} data-testid="delete-account-btn">
            Delete my account
          </Button>
        ) : (
          <div
            role="alertdialog"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
            style={{ padding: '1rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.08)' }}
          >
            <p id="delete-confirm-title" style={{ margin: '0 0 0.375rem', fontWeight: 600, color: 'var(--danger)' }}>This cannot be undone</p>
            <p id="delete-confirm-desc" style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--textMuted)' }}>
              Your account, requests, booking intents, and personal data will be permanently deleted. You will be signed out immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting} disabled={deleting} data-testid="delete-account-confirm-btn">
                Yes, permanently delete my account
              </Button>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={deleting} data-testid="delete-account-cancel-btn">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
