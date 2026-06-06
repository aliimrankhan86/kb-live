'use client';

import React, { useEffect, useState } from 'react';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

const adminCtx = { userId: 'admin1', role: 'admin' as const };

const SEVERITY_FILTER_OPTIONS = [
  { label: 'All severities', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Operator notified', value: 'operator_notified' },
  { label: 'Operator responding', value: 'operator_responding' },
  { label: 'Admin triage', value: 'admin_triage' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Cannot resolve', value: 'cannot_resolve' },
  { label: 'Closed', value: 'closed' },
];

const ADMIN_STATUS_OPTIONS: { label: string; value: ComplaintStatus }[] = [
  { label: 'Admin triage', value: 'admin_triage' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-[rgba(34,197,94,0.12)] text-[var(--success)]',
  medium: 'bg-[rgba(245,158,11,0.12)] text-[var(--warning)]',
  high: 'bg-[rgba(239,68,68,0.12)] text-[var(--danger)]',
};

function AdminComplaintCard({
  complaint,
  onUpdate,
}: {
  complaint: Complaint;
  onUpdate: () => void;
}) {
  const [notes, setNotes] = useState(complaint.adminNotes ?? '');
  const [flagged, setFlagged] = useState(complaint.adminFlaggedOperator ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSaveNotes = async () => {
    setError(null);
    setSubmitting(true);
    try {
      MockDB.setCurrentUser('operator'); // needed for MockDB simulation
      await Repository.updateComplaintAdminNotes(adminCtx, complaint.id, notes, flagged);
      setEditing(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status: ComplaintStatus) => {
    try {
      MockDB.setCurrentUser('operator');
      await Repository.updateComplaintStatus(adminCtx, complaint.id, status);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  return (
    <div
      className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4"
      data-testid="admin-complaint-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--text)]">
            Reference:{' '}
            <span className="font-mono text-[var(--yellow)]">{complaint.referenceCode}</span>
          </p>
          <p className="text-xs text-[var(--textMuted)]">
            {new Date(complaint.createdAt).toLocaleDateString()} • Customer: {complaint.customerId} •
            Operator: {complaint.operatorId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={SEVERITY_STYLES[complaint.severity] ?? ''}>{complaint.severity}</Badge>
          <Badge variant="default">{complaint.status.replace('_', ' ')}</Badge>
          {complaint.adminFlaggedOperator && <Badge variant="danger">Flagged</Badge>}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium text-[var(--text)]">Category: {complaint.category.replace('_', ' ')}</p>
        <p className="mt-1 text-sm text-[var(--textMuted)]">{complaint.description}</p>
      </div>

      {complaint.operatorResponse && (
        <div className="mt-3 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.02)] p-3">
          <p className="text-xs font-medium text-[var(--text)]">Operator response</p>
          <p className="mt-1 text-sm text-[var(--textMuted)]">{complaint.operatorResponse}</p>
          {complaint.operatorRespondedAt && (
            <p className="mt-1 text-xs text-[var(--textMuted)]">
              {new Date(complaint.operatorRespondedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {editing ? (
          <div className="space-y-2">
            <Textarea
              label="Admin notes (internal only)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              helperText="These notes are visible only to admin. The operator will not see them."
              data-testid="admin-complaint-notes"
            />
            <Checkbox
              id={`flag-operator-${complaint.id}`}
              label="Flag operator internally"
              helperText="This is an internal flag only. No public shaming or automated penalties in MVP."
              checked={flagged}
              onChange={(e) => setFlagged(e.target.checked)}
              data-testid="admin-flag-operator"
            />
            {error && (
              <p role="alert" className="text-xs text-[var(--danger)]">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                loading={submitting}
                disabled={submitting}
                onClick={handleSaveNotes}
                data-testid="admin-save-notes"
              >
                Save notes
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setEditing(false);
                  setNotes(complaint.adminNotes ?? '');
                  setFlagged(complaint.adminFlaggedOperator ?? false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {complaint.adminNotes && (
              <div className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.02)] p-3">
                <p className="text-xs font-medium text-[var(--textMuted)]">Internal notes</p>
                <p className="mt-1 text-sm text-[var(--text)]">{complaint.adminNotes}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditing(true)}
                data-testid="admin-edit-notes"
              >
                Edit notes / flag
              </Button>
              <Select
                options={ADMIN_STATUS_OPTIONS}
                value={complaint.status}
                onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
                selectClassName="min-h-9 py-1.5 text-xs"
                aria-label="Update complaint status"
                data-testid="admin-status-select"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ComplaintsTriage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadComplaints = () => {
    MockDB.setCurrentUser('operator');
    Repository.getComplaints(adminCtx).then(setComplaints);
  };

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = complaints.filter((c) => {
    const severityMatch = severityFilter === 'all' || c.severity === severityFilter;
    const statusMatch = statusFilter === 'all' || c.status === statusFilter;
    return severityMatch && statusMatch;
  });

  return (
    <div className="space-y-4" data-testid="complaints-triage">
      <div className="flex flex-wrap gap-3">
        <Select
          label="Filter by severity"
          options={SEVERITY_FILTER_OPTIONS}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          selectClassName="min-h-9 py-1.5 text-xs"
          data-testid="severity-filter"
        />
        <Select
          label="Filter by status"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          selectClassName="min-h-9 py-1.5 text-xs"
          data-testid="status-filter"
        />
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-md border border-dashed border-[var(--borderSubtle)] p-8 text-center text-sm text-[var(--textMuted)]"
          data-testid="complaints-triage-empty"
        >
          <p>No complaints match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <AdminComplaintCard key={c.id} complaint={c} onUpdate={loadComplaints} />
          ))}
        </div>
      )}
    </div>
  );
}