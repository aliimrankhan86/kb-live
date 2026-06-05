'use client';

import { useState } from 'react';
import { Repository } from '@/lib/api/repository';
import { MockDB } from '@/lib/api/mock-db';

export function PackageCsvExport() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    const user = MockDB.currentUser;
    if (!user || user.role !== 'operator') return;
    setExporting(true);
    try {
      const csv = Repository.exportPackagesAsCsv({ userId: user.id, role: user.role });
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
      className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}