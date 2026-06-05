import type { MetadataRoute } from 'next';
import { Repository } from '@/lib/api/repository';
import type { Package, OperatorProfile } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kaabatrip.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/umrah`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/hajj`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/umrah/ramadan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/umrah/london`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/umrah/birmingham`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/umrah/manchester`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/search/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Published packages
  let packagePages: MetadataRoute.Sitemap = [];
  try {
    const packages = Repository.listPackages();
    packagePages = packages
      .filter((p: Package) => p.status === 'published')
      .map((p: Package) => ({
        url: `${baseUrl}/packages/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
  } catch {
    // If repository fails, skip dynamic pages
  }

  // Verified operators
  let operatorPages: MetadataRoute.Sitemap = [];
  try {
    const operators = Repository.getOperators({ userId: 'system', role: 'admin' });
    operatorPages = operators
      .filter((o: OperatorProfile) => o.verificationStatus === 'verified' && o.slug)
      .map((o: OperatorProfile) => ({
        url: `${baseUrl}/operators/${o.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
  } catch {
    // If repository fails, skip dynamic pages
  }

  return [...staticPages, ...packagePages, ...operatorPages];
}
