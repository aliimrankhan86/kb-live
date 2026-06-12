'use client';

import { useState, useRef } from 'react';
import { Repository } from '@/lib/api/repository';
import type { Package } from '@/lib/types';

const REQUIRED_COLUMNS = ['title', 'pricePerPerson', 'currency', 'totalNights', 'pilgrimageType'] as const;
const OPTIONAL_COLUMNS = ['status', 'description', 'departureCity', 'departureDate'] as const;
const ALL_TARGET_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

type TargetColumn = (typeof ALL_TARGET_COLUMNS)[number];

type ImportStep = 'idle' | 'mapping' | 'importing' | 'done';

interface ImportResult {
  saved: Package[];
  errors: { row: number; reason: string }[];
}

function applyMapping(csvText: string, mapping: Record<string, TargetColumn | ''>): string {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  const newHeaders = headers.map((h) => mapping[h] || h);
  return [newHeaders.join(','), ...lines.slice(1)].join('\n');
}

export function PackageCsvImport({ operatorId, onImport }: { operatorId: string; onImport?: () => void }) {
  const [step, setStep] = useState<ImportStep>('idle');
  const [csvText, setCsvText] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, TargetColumn | ''>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map((h) => h.trim());
    const missingRequired = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));

    if (missingRequired.length === 0) {
      // Happy path — all required columns present, import directly
      await runImport(text);
      return;
    }

    // Build auto-mapping: case-insensitive match
    const autoMap: Record<string, TargetColumn | ''> = {};
    for (const h of headers) {
      const match = ALL_TARGET_COLUMNS.find((t) => t.toLowerCase() === h.toLowerCase());
      autoMap[h] = match ?? '';
    }

    setCsvText(text);
    setCsvHeaders(headers);
    setMapping(autoMap);
    setStep('mapping');
    if (fileRef.current) fileRef.current.value = '';
  };

  const runImport = async (text: string) => {
    setStep('importing');
    setResult(null);
    try {
      const ctx = { userId: operatorId, role: 'operator' as const };
      const importResult = await Repository.importPackagesFromCsv(ctx, text);
      setResult(importResult);
      if (importResult.saved.length > 0 && onImport) onImport();
    } catch (err) {
      setResult({ saved: [], errors: [{ row: 0, reason: err instanceof Error ? err.message : 'Import failed' }] });
    }
    setStep('done');
  };

  const handleMappingConfirm = async () => {
    const remapped = applyMapping(csvText, mapping);
    await runImport(remapped);
  };

  const unmappedRequired = REQUIRED_COLUMNS.filter(
    (req) => !Object.values(mapping).includes(req)
  );
  const canConfirm = unmappedRequired.length === 0;

  if (step === 'mapping') {
    return (
      <div className="space-y-4 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Map your CSV columns</p>
          <p className="mt-0.5 text-xs text-[var(--textMuted)]">
            Some required columns weren&apos;t found by name. Match your columns to the fields below.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--borderSubtle)]">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-[var(--textMuted)]">Your column</th>
                <th className="pb-2 text-left text-xs font-medium text-[var(--textMuted)]">Maps to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--borderSubtle)]">
              {csvHeaders.map((header) => (
                <tr key={header}>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--text)]">{header}</td>
                  <td className="py-2">
                    <select
                      value={mapping[header] ?? ''}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value as TargetColumn | '' }))}
                      className="w-full rounded border border-[var(--borderSubtle)] bg-[var(--bgSecondary)] px-2 py-1 text-xs text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
                      aria-label={`Map column ${header}`}
                    >
                      <option value="">— skip —</option>
                      {ALL_TARGET_COLUMNS.map((col) => (
                        <option key={col} value={col}>
                          {col}{REQUIRED_COLUMNS.includes(col as typeof REQUIRED_COLUMNS[number]) ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {unmappedRequired.length > 0 && (
          <p className="text-xs text-[var(--color-error)]" role="alert">
            Still required: {unmappedRequired.join(', ')}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleMappingConfirm}
            disabled={!canConfirm}
            className="rounded-md bg-[var(--yellow)] px-4 py-2 text-xs font-medium text-black transition-colors hover:brightness-95 disabled:opacity-40"
          >
            Import with mapping
          </button>
          <button
            type="button"
            onClick={() => { setStep('idle'); setCsvText(''); setCsvHeaders([]); }}
            className="rounded-md border border-[var(--borderSubtle)] px-4 py-2 text-xs font-medium text-[var(--textMuted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={step === 'importing'}
          className="hidden"
          aria-label="Import packages from CSV file"
          data-testid="package-csv-import-input"
        />
        <button
          type="button"
          onClick={() => { setStep('idle'); setResult(null); fileRef.current?.click(); }}
          disabled={step === 'importing'}
          data-testid="package-csv-import-btn"
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 py-2 text-xs font-medium text-[var(--textMuted)] transition-colors hover:border-[var(--borderStrong)] hover:text-[var(--text)] disabled:opacity-50"
        >
          {step === 'importing' ? 'Importing…' : 'Import CSV'}
        </button>
      </div>

      {result && (
        <div
          className="rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-3 text-xs"
          role="status"
          aria-live="polite"
          data-testid="package-csv-import-result"
        >
          {result.saved.length > 0 && (
            <p className="text-[var(--color-success)]">
              <strong>{result.saved.length}</strong> package{result.saved.length !== 1 ? 's' : ''} imported.
            </p>
          )}
          {result.errors.length > 0 && (
            <div className={result.saved.length > 0 ? 'mt-2' : ''}>
              <p className="font-medium text-[var(--color-error)]">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:</p>
              <ul className="mt-1 space-y-0.5 pl-3 text-[var(--color-error)]/80">
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
