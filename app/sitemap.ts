import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kaabatrip.example'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/umrah`, lastModified: new Date() },
    { url: `${baseUrl}/hajj`, lastModified: new Date() },
    { url: `${baseUrl}/umrah/ramadan`, lastModified: new Date() },
    { url: `${baseUrl}/umrah/london`, lastModified: new Date() },
    { url: `${baseUrl}/umrah/birmingham`, lastModified: new Date() },
    { url: `${baseUrl}/umrah/manchester`, lastModified: new Date() },
    { url: `${baseUrl}/packages`, lastModified: new Date() },
  ]
}
