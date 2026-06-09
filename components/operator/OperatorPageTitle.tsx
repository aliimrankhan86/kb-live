'use client';

import { usePathname } from 'next/navigation';

const SEGMENT_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  packages: 'Packages',
  leads: 'Leads',
  analytics: 'Analytics',
  profile: 'Profile',
  settings: 'Settings',
  onboarding: 'Registration',
};

export function OperatorPageTitle() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean)[1] ?? 'dashboard';
  const title = SEGMENT_TITLES[segment] ?? 'Workspace';
  return <h1 className="text-2xl font-semibold text-[#FFFFFF]">{title}</h1>;
}
