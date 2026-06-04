'use client';

import { OperatorPackagesList } from '@/components/operator/OperatorPackagesList';

export default function OperatorPackagesPage() {
  return (
    <OperatorPackagesList
      packages={[]}
      isLoading={false}
      error={undefined}
      onCreate={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  );
}
