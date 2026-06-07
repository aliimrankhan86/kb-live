'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Repository } from '@/lib/api/repository';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';


const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-[rgba(34,197,94,0.12)] text-[var(--success)]',
  medium: 'bg-[rgba(245,158,11,0.12)] text-[var(--warning)]',
  high: 'bg-[rgba(239,68,68,0.12)] text-[var(--danger)]',
};

const STATUS_OPTIONS: { label: string; value: ComplaintStatus }[] = [
  { label: 'Acknowledged', value: 'operator_responding' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Cannot resolve', value: 'cannot_resolve' },
];

function ComplaintCard({
  complaint,
  operatorId,
  onUpdate,
}: {
  complaint: Complaint;
  operatorId: string;
  onUpdate: () => void;
}) {
  const operatorCtx = { userId: operatorId, role: 'operator' as const };
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    setError(null);
    const trimmed = response.trim();
    if (trimmed.length < 5) {
      setError('Response must be at least 5 characters');
      return;
    }
    setSubmitting(true);
    try {
      await Repository.updateComplaintOperatorResponse(operatorCtx, complaint.id, trimmed);
      setResponding(false);
      setResponse('');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    setStatus(newStatus);
    try {
      await Repository.updateComplaintStatus(operatorCtx, complaint.id, newStatus);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  return (
    <div
      className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4"
      data-testid="complaint-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--text)]">
            Reference:{' '}
            <span className="font-mono text-[var(--yellow)]">{complaint.referenceCode}</span>
          </p>
          <p className="text-xs text-[var(--textMuted)]">
            {new Date(complaint.createdAt).toLocaleDateString()} • Category: {complaint.category.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={SEVERITY_STYLES[complaint.severity] ?? ''}>{complaint.severity}</Badge>
          <Badge variant="default">{complaint.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm text-[var(--textMuted)]">{complaint.description}</p>
      </div>

      {complaint.operatorResponse && (
        <div className="mt-3 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.02)] p-3">
          <p className="text-xs font-medium text-[var(--text)]">Your response</p>
          <p className="mt-1 text-sm text-[var(--textMuted)]">{complaint.operatorResponse}</p>
          {complaint.operatorRespondedAt && (
            <p className="mt-1 text-xs text-[var(--textMuted)]">
              {new Date(complaint.operatorRespondedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {complaint.adminNotes && (
        <div className="mt-3 rounded-md border border-[var(--warning)]/30 bg-[rgba(245,158,11,0.04)] p-3">
          <p className="text-xs font-medium text-[var(--warning)]">Admin note</p>
          <p className="mt-1 text-sm text-[var(--textMuted)]">{complaint.adminNotes}</p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {responding ? (
          <div className="space-y-2">
            <Textarea
              label="Your response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              minLength={5}
              data-testid="complaint-response-textarea"
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
                onClick={handleSubmitResponse}
                data-testid="complaint-submit-response"
              >
                Submit response
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setResponding(false);
                  setResponse('');
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setResponding(true)}
              data-testid="complaint-respond-btn"
            >
              Respond
            </Button>
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
              selectClassName="min-h-9 py-1.5 text-xs"
              aria-label="Update complaint status"
              data-testid="complaint-status-select"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ComplaintsInbox({ operatorId }: { operatorId: string }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const loadComplaints = useCallback(() => {
    const ctx = { userId: operatorId, role: 'operator' as const };
    Repository.getComplaints(ctx).then(setComplaints);
  }, [operatorId]);

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 5000);
    return () => clearInterval(interval);
  }, [loadComplaints]);

  if (complaints.length === 0) {
    return (
      <div
        className="rounded-md border border-dashed border-[var(--borderSubtle)] p-8 text-center text-sm text-[var(--textMuted)]"
        data-testid="complaints-empty"
      >
        <p>No complaints received.</p>
        <p className="mt-1 text-xs">Issues reported by customers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="complaints-inbox">
      {complaints.map((c) => (
        <ComplaintCard key={c.id} complaint={c} operatorId={operatorId} onUpdate={loadComplaints} />
      ))}
    </div>
  );
}