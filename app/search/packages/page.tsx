'use client'

import React from 'react';
import { Header } from '@/components/layout/Header';
import PackageList from '@/components/search/PackageList';
import { mockPackages } from '@/lib/mock-packages';
import styles from '@/components/search/packages.module.css';

export default function SearchPackagesPage() {
  const handleFilter = () => {
    // Placeholder for filter functionality
    console.log('Filter clicked');
  };

  const handleSort = () => {
    // Placeholder for sort functionality
    console.log('Sort clicked');
  };

  return (
    <>
      <Header />
      <main className={styles.searchPage}>
        {/* Screen reader only heading for accessibility */}
        <h1 className="sr-only">
          Search Results - Amazing Hajj and Umrah Packages
        </h1>
        
        <PackageList 
          packages={mockPackages}
          onFilter={handleFilter}
          onSort={handleSort}
        />
      </main>
    </>
  );
}
