'use client';

import { useState } from 'react';
import type { Package } from '@/lib/types';
import { OperatorPackagesList } from '@/components/operator/OperatorPackagesList';
import { PackageWizard } from '@/components/operator/wizard/PackageWizard';

type View = 'list' | 'create' | 'edit';

export default function OperatorPackagesPage() {
  const [view, setView] = useState<View>('list');
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPackage, setEditingPackage] = useState<Package | undefined>(undefined);

  const handleCreate = () => {
    setEditingPackage(undefined);
    setView('create');
  };

  const handleEdit = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg) {
      setEditingPackage(pkg);
      setView('edit');
    }
  };

  const handleDelete = (packageId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== packageId));
  };

  const handleWizardSuccess = (pkg: Package) => {
    setPackages((prev) => {
      const existing = prev.findIndex((p) => p.id === pkg.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = pkg;
        return next;
      }
      return [pkg, ...prev];
    });
    setView('list');
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <PackageWizard
          initialData={editingPackage}
          onSuccess={handleWizardSuccess}
          onCancel={() => setView('list')}
        />
      </div>
    );
  }

  return (
    <OperatorPackagesList
      packages={packages}
      isLoading={false}
      error={undefined}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
