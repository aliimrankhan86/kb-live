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

test('search has one h1, list pages keep the silhouette out from behind text, operators signing up go to /partner', async ({ page, request }) => {
  // UX-19: the Suspense fallback and the client list each rendered an h1.
  const html = await (await request.get('/packages?type=umrah')).text()
  expect(html.match(/<h1[\s>]/g)?.length).toBe(1)
  // UX-17: the Kaaba silhouette stays on the homepage, not behind cards and text:
  // list and detail pages sit on an opaque wrapper at least a screen tall.
  const plain = async (path: string) => {
    await page.goto(path)
    return page.evaluate(() => {
      const el = document.querySelector('[data-plain-background]')
      if (!el) return null
      const s = getComputedStyle(el)
      return { colour: s.backgroundColor, tall: el.getBoundingClientRect().height >= window.innerHeight }
    })
  }
  expect(await plain('/')).toBeNull()
  for (const path of ['/packages', '/packages?type=umrah&departureCity=London', '/packages/local-test-01', '/operators/local-test-operator-a']) {
    expect(await plain(path), path).toEqual({ colour: 'rgb(10, 10, 10)', tall: true })
  }
  // UX-12: operator self-serve is parked, so /signup?type=operator goes to /partner.
  await page.goto('/signup?type=operator')
  await expect(page).toHaveURL(/\/partner$/)
})
