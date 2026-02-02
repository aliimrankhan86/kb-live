'use client';

import { useEffect, useState } from 'react';
import { Package } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';
import { Repository, RequestContext } from '@/lib/api/repository';
import { PackageForm } from './PackageForm';
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';

export function OperatorPackagesList() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | undefined>(undefined);

  // Mock Context
  const context: RequestContext = { userId: 'op1', role: 'operator' };

  const loadPackages = () => {
    // In real app, use Repository.getPackagesByOperator(context.userId)
    // For now, access MockDB directly for simplicity in Client Component
    const pkgs = MockDB.getPackages().filter(p => p.operatorId === context.userId);
    setPackages(pkgs);
  };

  useEffect(() => {
    MockDB.setCurrentUser('operator');
    loadPackages();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      Repository.deletePackage(context, id);
      loadPackages();
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingPackage(undefined);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadPackages();
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleCreate}
          className="rounded bg-[#FFD31D] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A]"
        >
          Create Package
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[rgba(255,255,255,0.4)]">
            No packages found. Create one to get started.
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#111111] p-6 transition-colors hover:border-[#FFD31D]"
            >
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded bg-[rgba(255,211,29,0.1)] px-2 py-0.5 text-xs font-medium text-[#FFD31D] uppercase">
                    {pkg.pilgrimageType}
                  </span>
                  <span className="text-xs text-[rgba(255,255,255,0.4)]">
                    {pkg.seasonLabel || 'Custom Dates'}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#FFFFFF] line-clamp-2">{pkg.title}</h3>
                <p className="mb-4 text-2xl font-bold text-[#FFD31D]">
                  {pkg.currency} {pkg.pricePerPerson}
                  <span className="text-sm font-normal text-[rgba(255,255,255,0.64)]">
                    {pkg.priceType === 'from' ? ' (from)' : ''}
                  </span>
                </p>
                <div className="space-y-1 text-sm text-[rgba(255,255,255,0.64)]">
                  <p>{pkg.totalNights} Nights ({pkg.nightsMakkah} Makkah / {pkg.nightsMadinah} Madinah)</p>
                  <p>{pkg.hotelMakkahStars}★ Makkah / {pkg.hotelMadinahStars}★ Madinah</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2 border-t border-[rgba(255,255,255,0.1)] pt-4">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 rounded bg-[rgba(255,255,255,0.1)] py-2 text-sm text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.2)]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 rounded bg-red-500/10 py-2 text-sm text-red-500 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <OverlayContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <OverlayHeader>
            <OverlayTitle>{editingPackage ? 'Edit Package' : 'Create Package'}</OverlayTitle>
          </OverlayHeader>
          <PackageForm
            initialData={editingPackage}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </OverlayContent>
      </Dialog>
    </div>
  );
}
