'use client';

import { AuditLogEntry } from '@/lib/types';
import { Table, TableContainer, Th, Td } from '@/components/ui/Table';
import { Text } from '@/components/ui/Text';

interface AuditLogViewProps {
  entries: AuditLogEntry[];
  showOperator?: boolean;
  maxEntries?: number;
}

const formatAction = (action: AuditLogEntry['action']) => {
  const map: Record<string, string> = {
    'payment_details.created': 'Payment details created',
    'bank_change.requested': 'Bank change requested',
    'bank_change.approved': 'Bank change approved',
    'bank_change.rejected': 'Bank change rejected',
    'bank_change.cancelled': 'Bank change cancelled',
    'bank_change.activated': 'Bank change activated',
  };
  return map[action] ?? action;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function AuditLogView({ entries, showOperator = false, maxEntries }: AuditLogViewProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const display = maxEntries ? sorted.slice(0, maxEntries) : sorted;

  if (display.length === 0) {
    return (
      <Text tone="muted" size="sm">
        No audit entries.
      </Text>
    );
  }

  return (
    <TableContainer data-testid="audit-log-view">
      <Table>
        <thead>
          <tr>
            <Th scope="col">Date</Th>
            <Th scope="col">Actor</Th>
            <Th scope="col">Action</Th>
            {showOperator && <Th scope="col">Operator</Th>}
          </tr>
        </thead>
        <tbody>
          {display.map((entry) => (
            <tr key={entry.id}>
              <Td>{formatDate(entry.createdAt)}</Td>
              <Td>
                {entry.actorUserId}{' '}
                <span className="text-[var(--textMuted)]">({entry.actorRole})</span>
              </Td>
              <Td>{formatAction(entry.action)}</Td>
              {showOperator && <Td>{entry.operatorId}</Td>}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}