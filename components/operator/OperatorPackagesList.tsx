'use client';

import { Package } from '@/lib/types';

interface OperatorPackagesListProps {
  packages: Package[];
  isLoading?: boolean;
  error?: string;
  onCreate: () => void;
  onEdit: (packageId: string) => void;
  onDelete: (packageId: string) => void;
  onRetry?: () => void;
}

const getSeasonOrDateWindow = (pkg: Package) => {
  if (pkg.seasonLabel) return pkg.seasonLabel;
  if (pkg.dateWindow?.start && pkg.dateWindow?.end) {
    return `${pkg.dateWindow.start} - ${pkg.dateWindow.end}`;
  }
  if (pkg.dateWindow?.start) return `From ${pkg.dateWindow.start}`;
  if (pkg.dateWindow?.end) return `Until ${pkg.dateWindow.end}`;
  return 'Custom Dates';
};

export function OperatorPackagesList({
  packages,
  isLoading = false,
  error,
  onCreate,
  onEdit,
  onDelete,
  onRetry,
}: OperatorPackagesListProps) {
  const hasPackages = packages.length > 0;

  return (
    <div data-testid="operator-packages-list">
      {isLoading ? (
        <div className="py-10 text-center" role="status" aria-live="polite" aria-busy="true">
          Loading packages…
        </div>
      ) : error ? (
        <div className="py-10 text-center" role="alert">
          <p className="text-red-500">{error}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded bg-[#FFD31D] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A]"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : !hasPackages ? (
        <div className="py-12 text-center text-[rgba(255,255,255,0.4)]" data-testid="operator-packages-empty">
          <p>No packages found. Create one to get started.</p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-4 rounded bg-[#FFD31D] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A]"
          >
            Create package
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCreate}
              className="rounded bg-[#FFD31D] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A]"
            >
              Create package
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse" aria-label="Operator packages list">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)] text-left text-sm text-[rgba(255,255,255,0.6)]">
                  <th scope="col" className="px-3 py-2">Title</th>
                  <th scope="col" className="px-3 py-2">Type</th>
                  <th scope="col" className="px-3 py-2">Season/Date window</th>
                  <th scope="col" className="px-3 py-2">Price</th>
                  <th scope="col" className="px-3 py-2">Nights</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                  <th scope="col" className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    data-testid={`operator-package-item-${pkg.id}`}
                    className="border-b border-[rgba(255,255,255,0.06)]"
                  >
                    <td className="px-3 py-3 font-medium text-[#FFFFFF]">{pkg.title}</td>
                    <td className="px-3 py-3 uppercase text-[rgba(255,255,255,0.7)]">{pkg.pilgrimageType}</td>
                    <td className="px-3 py-3 text-[rgba(255,255,255,0.7)]">{getSeasonOrDateWindow(pkg)}</td>
                    <td className="px-3 py-3 text-[#FFD31D]">
                      {pkg.currency ?? 'GBP'} {pkg.pricePerPerson}
                      {pkg.priceType === 'from' ? ' (from)' : ''}
                    </td>
                    <td className="px-3 py-3 text-[rgba(255,255,255,0.7)]">
                      {pkg.totalNights}
                      {pkg.nightsMakkah != null && pkg.nightsMadinah != null
                        ? ` (${pkg.nightsMakkah} Makkah / ${pkg.nightsMadinah} Madinah)`
                        : ''}
                  </td>
                    <td className="px-3 py-3 text-[rgba(255,255,255,0.7)]">{pkg.status ?? 'Not set'}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(pkg.id)}
                          data-testid={`operator-package-edit-${pkg.id}`}
                          className="rounded bg-[rgba(255,255,255,0.1)] px-3 py-1.5 text-sm text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.2)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(pkg.id)}
                          data-testid={`operator-package-delete-${pkg.id}`}
                          className="rounded bg-red-500/10 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
