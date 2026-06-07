'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch('/api/user/export', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Export failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cd = res.headers.get('Content-Disposition') || '';
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
        const data = await res.json();
        throw new Error(data.error || 'Deletion failed');
      }
      // Clear MockDB data from localStorage (dev path)
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      router.push('/?account_deleted=1');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-[var(--text)]">Account settings</h1>

      {/* Data export */}
      <section
        className="mb-6 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-6"
        aria-labelledby="export-heading"
      >
        <h2 id="export-heading" className="mb-1 text-base font-semibold text-[var(--text)]">
          Download your data
        </h2>
        <p className="mb-4 text-sm text-[var(--textMuted)]">
          Under UK GDPR Article 20, you have the right to receive a copy of the personal data
          KaabaTrip holds about you in a portable format. This includes your requests, booking
          intents, and any interests you have expressed.
        </p>
        {exportError && (
          <p role="alert" className="mb-3 text-sm text-[var(--danger)]">
            {exportError}
          </p>
        )}
        <Button
          variant="secondary"
          onClick={handleExport}
          loading={exporting}
          disabled={exporting}
          data-testid="export-data-btn"
        >
          Download my data
        </Button>
      </section>

      {/* Account deletion */}
      <section
        className="rounded-xl border border-[var(--danger)]/40 bg-[rgba(239,68,68,0.04)] p-6"
        aria-labelledby="delete-heading"
      >
        <h2 id="delete-heading" className="mb-1 text-base font-semibold text-[var(--danger)]">
          Delete account
        </h2>
        <p className="mb-4 text-sm text-[var(--textMuted)]">
          Under UK GDPR Article 17, you have the right to request erasure of your personal data.
          Deleting your account will permanently remove your profile, requests, and booking
          history. This action cannot be undone.
        </p>
        {deleteError && (
          <p role="alert" className="mb-3 text-sm text-[var(--danger)]">
            {deleteError}
          </p>
        )}
        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            data-testid="delete-account-btn"
          >
            Delete my account
          </Button>
        ) : (
          <div
            className="space-y-3 rounded-md border border-[var(--danger)]/60 bg-[rgba(239,68,68,0.08)] p-4"
            role="alertdialog"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
          >
            <p id="delete-confirm-title" className="font-semibold text-[var(--danger)]">
              This cannot be undone
            </p>
            <p id="delete-confirm-desc" className="text-sm text-[var(--textMuted)]">
              Your account, requests, booking intents, and personal data will be permanently
              deleted. You will be signed out immediately.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={deleting}
                disabled={deleting}
                data-testid="delete-account-confirm-btn"
              >
                Yes, permanently delete my account
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                data-testid="delete-account-cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
