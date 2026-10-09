import type { MetadataRoute } from 'next'
import { isProduction } from '@/lib/env'

// Private and parked areas. A crawler that matches a named group ignores the
// '*' group, so every group must repeat these.
export const PRIVATE_PATHS = ['/quote', '/requests', '/operator', '/admin', '/settings', '/showcase', '/reset-password', '/api/']

export default function robots(): MetadataRoute.Robots {
  // Previews and local builds are the fictional test site: keep every crawler out.
  if (!isProduction()) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // Explicit allow for AI crawlers: increases citation visibility in AI-generated answers.
      // Allowing these bots means our Umrah/Hajj content can be cited by ChatGPT, Perplexity,
      // Google AI Overviews, and Claude. Review policy if content strategy changes.
      { userAgent: 'GPTBot', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: 'ClaudeBot', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: 'PerplexityBot', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: 'Google-Extended', allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: 'https://pilgrimcompare.co.uk/sitemap.xml',
  }
}
