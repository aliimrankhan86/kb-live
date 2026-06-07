'use client';

import { useState, useRef } from 'react';
import { Repository } from '@/lib/api/repository';
import { MockDB } from '@/lib/api/mock-db';
import type { Package } from '@/lib/types';

export function PackageCsvImport({ onImport }: { onImport?: () => void }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ saved: Package[]; errors: { row: number; reason: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = MockDB.currentUser;
    if (!user || user.role !== 'operator') return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const importResult = await Repository.importPackagesFromCsv({ userId: user.id, role: user.role }, text);
      setResult(importResult);
      if (importResult.saved.length > 0 && onImport) {
        onImport();
      }
    } catch (err) {
      setResult({
        saved: [],
        errors: [{ row: 0, reason: err instanceof Error ? err.message : 'Import failed' }],
      });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={importing}
          data-testid="package-csv-import-input"
          className="hidden"
          aria-label="Import packages from CSV file"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          data-testid="package-csv-import-btn"
          className="rounded border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {importing ? 'Importing...' : 'Import CSV'}
        </button>
      </div>

      {result && (
        <div
          className="rounded border border-slate-200 bg-slate-50 p-3 text-sm"
          role="status"
          aria-live="polite"
          data-testid="package-csv-import-result"
        >
          {result.saved.length > 0 && (
            <p className="text-emerald-700">
              <strong>{result.saved.length}</strong> package(s) imported successfully.
            </p>
          )}
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-700">{result.errors.length} error(s):</p>
              <ul className="mt-1 list-disc pl-4 text-red-600">
                {result.errors.map((err, i) => (
                  <li key={i}>Row {err.row}: {err.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}