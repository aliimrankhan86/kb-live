import type { MetadataRoute } from 'next';
import { Repository } from '@/lib/api/repository';
import type { Package, OperatorProfile } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

const CITY_CORRIDORS: { city: string; path: string }[] = [
  { city: 'London', path: '/umrah/london' },
  { city: 'Birmingham', path: '/umrah/birmingham' },
  { city: 'Manchester', path: '/umrah/manchester' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — always index
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/umrah`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/hajj`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/umrah/ramadan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/umrah/cost`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/search/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/partner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // City corridor pages — only include when live packages exist for that departure city
  let corridorPages: MetadataRoute.Sitemap = [];
  try {
    const activeCities = await Repository.getDistinctDepartureCities();
    corridorPages = CITY_CORRIDORS
      .filter(({ city }) => activeCities.includes(city))
      .map(({ path }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
  } catch {
    // DB unavailable — omit corridor pages rather than include zero-supply ones
  }

  // Published packages
  let packagePages: MetadataRoute.Sitemap = [];
  try {
    const packages = await Repository.listPackages();
    packagePages = packages
      .filter((p: Package) => p.status === 'published')
      .map((p: Package) => ({
        url: `${baseUrl}/packages/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  // Verified operators
  let operatorPages: MetadataRoute.Sitemap = [];
  try {
    const operators = await Repository.getOperators({ userId: 'system', role: 'admin' });
    operatorPages = operators
      .filter((o: OperatorProfile) => o.verificationStatus === 'verified' && o.slug)
      .map((o: OperatorProfile) => ({
        url: `${baseUrl}/operators/${o.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  return [...staticPages, ...corridorPages, ...packagePages, ...operatorPages];
}
