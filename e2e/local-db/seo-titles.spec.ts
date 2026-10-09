import { test, expect } from '@playwright/test'

// Batch 1 item 5: the root template appends "| PilgrimCompare", so a page title
// must not carry the brand itself. Before the fix 24 of 29 sitemap routes ended
// "| PilgrimCompare | PilgrimCompare" (or named the brand twice).
test('every sitemap route names PilgrimCompare exactly once in its title', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  expect(paths.length).toBeGreaterThan(20)
  for (const path of paths) {
    const html = await (await request.get(path)).text()
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
    expect.soft(title.match(/PilgrimCompare/g)?.length ?? 0, `${path}: ${title}`).toBe(1)
  }
})
