'use client';

import { useState } from 'react';
import { Repository } from '@/lib/api/repository';

export function PackageCsvExport({ operatorId }: { operatorId: string }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const ctx = { userId: operatorId, role: 'operator' as const };
      const csv = await Repository.exportPackagesAsCsv(ctx);
      if (!csv) {
        alert('No packages to export');
        setExporting(false);
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packages-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      data-testid="package-csv-export-btn"
      className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-success)] focus:ring-offset-2 transition-colors disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
