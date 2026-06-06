import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/quote', '/requests', '/operator', '/admin', '/settings'],
      },
      // Explicit allow for AI crawlers — increases citation visibility in AI-generated answers.
      // Allowing these bots means our Umrah/Hajj content can be cited by ChatGPT, Perplexity,
      // Google AI Overviews, and Claude. Review policy if content strategy changes.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
    ],
    sitemap: 'https://kaabatrip.com/sitemap.xml',
  }
}
