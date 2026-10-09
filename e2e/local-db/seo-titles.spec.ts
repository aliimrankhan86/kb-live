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

// Batch 3 item 1: an unknown slug or an unpublished package was a soft 404
// (HTTP 200, robots "index, follow"). Departed and published pages are unchanged.
test('an unknown or unpublished package URL is a real 404 with noindex', async ({ page, request }) => {
  const robots = (html: string) => [...html.matchAll(/<meta name="robots" content="([^"]*)"/g)].map((m) => m[1])
  for (const path of ['/packages/does-not-exist', '/packages/local-test-14']) { // 14 is the seeded draft
    const res = await request.get(path)
    expect(res.status(), path).toBe(404)
    const tags = robots(await res.text())
    expect(tags.length, path).toBeGreaterThan(0)
    for (const tag of tags) expect(tag, path).toMatch(/noindex/)
    await page.goto(path)
    await expect(page.getByTestId('package-not-found')).toContainText('This package is no longer available.')
    await expect(page.getByRole('alert').filter({ hasText: 'Package not found' })).toBeVisible()
  }
  const departed = await request.get('/packages/local-test-16')
  expect(departed.status()).toBe(200)
  expect(robots(await departed.text())).toContain('noindex, follow')
  const live = await request.get('/packages/local-test-01')
  expect(live.status()).toBe(200)
  expect(robots(await live.text()).join()).not.toMatch(/noindex/)
})
