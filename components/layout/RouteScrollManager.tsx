'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function RouteScrollManager() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Keep anchor-link behavior intact when URL includes a hash.
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname]);

  return null;
}
