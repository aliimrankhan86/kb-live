'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Package } from '@/lib/types';
import { OperatorPackagesList } from '@/components/operator/OperatorPackagesList';
import { PackageWizard } from '@/components/operator/wizard/PackageWizard';

type View = 'list' | 'create' | 'edit';

export default function OperatorPackagesPage() {
  const [view, setView] = useState<View>('list');
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPackage, setEditingPackage] = useState<Package | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const res = await fetch('/api/operator/packages');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load packages');
      }
      const data = await res.json();
      setPackages(data.packages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'list') {
      fetchPackages();
    }
  }, [view, fetchPackages]);

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

  const handleDelete = async (packageId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/operator/packages?id=${encodeURIComponent(packageId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete package');
      }
      setPackages((prev) => prev.filter((p) => p.id !== packageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete package');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardSuccess = async (pkg: Package) => {
    const isEdit = Boolean(editingPackage);
    try {
      const res = await fetch('/api/operator/packages', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} package`);
      }
      const data = await res.json();
      const saved = data.package as Package;
      setPackages((prev) => {
        const existing = prev.findIndex((p) => p.id === saved.id);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setView('list');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} package`);
    }
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
      isLoading={isLoading}
      error={error}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}