import { test, expect, type Page } from '@playwright/test'

// Real local Supabase DB + seeded LOCAL TEST DATA (scripts/seed-local-test-data.mjs).
const shot = (page: Page, name: string) =>
  page.screenshot({ path: `test-results/local-db/screens/${name}.png`, fullPage: true })

const cardCount = (page: Page) => page.locator('[data-testid^="package-card-"]').count()
const resultCount = async (page: Page) =>
  Number((await page.locator('[aria-live="polite"] strong').first().textContent()) ?? 'NaN')

async function collectErrors(page: Page) {
  const errors: string[] = []
  // Gotcha: Vercel Web Analytics script only exists on Vercel; 404s locally by design.
  const expected = (t: string) => t.includes('_vercel/insights') || /status of 404/.test(t)
  page.on('console', (m) => { if (m.type() === 'error' && !expected(m.text())) errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith('http://127.0.0.1') && !r.url().includes('_vercel/insights')) errors.push(`${r.status()} ${r.url()}`) })
  return errors
}

test('browse tab and an unfiltered search show the same published packages', async ({ page }) => {
  await page.goto('/packages')
  const browse = await cardCount(page)
  await page.goto('/search/packages')
  expect(await resultCount(page)).toBe(browse)
  // 15 seeded: 1 draft, 1 from an unverified operator, 2 from a verified operator with no ATOL number.
  expect(browse).toBe(11)
})

test('submitting the untouched search form loses no Umrah packages', async ({ page }) => {
  await page.goto('/umrah')
  await page.getByTestId('find-packages-submit').click()
  await page.waitForURL(/search\/packages/)
  expect(await resultCount(page)).toBe(10)
  expect(page.url()).not.toMatch(/departureAirport|budgetMin|departureDate/)
})

test('form airport list is generated from live packages', async ({ page }) => {
  await page.goto('/umrah')
  const opts = await page.getByTestId('departure-airport-select').locator('option').allTextContents()
  expect(opts.join('|')).toContain('Birmingham Airport (BHX)')
  expect(opts.join('|')).not.toContain('Glasgow')
})

test('London city search includes Heathrow, Gatwick and free-text Stansted', async ({ page }) => {
  await page.goto('/search/packages?type=umrah&departureCity=London')
  expect(await resultCount(page)).toBe(4)
  await expect(page.getByRole('button', { name: /Remove filter: From London/ })).toBeVisible()
})

test('budget too low shows closest matches with reasons, never a silent page', async ({ page }) => {
  await page.goto('/search/packages?type=umrah&departureAirport=BHX&budgetMax=1000')
  await expect(page.getByTestId('no-exact-matches')).toBeVisible()
  await expect(page.getByTestId('close-matches')).toBeVisible()
  await expect(page.getByText(/is above your £1,000 budget/).first()).toBeVisible()
  await shot(page, 'close-matches-desktop')
})

test('nothing matches: honest empty state and Clear all removes location + dates', async ({ page }) => {
  await page.goto('/search/packages?type=umrah&departureAirport=MAN&departureDate=2027-06-01&returnDate=2027-06-10')
  await expect(page.getByTestId('search-empty-state')).toBeVisible()
  await expect(page.getByText('support@pilgrimcompare.co.uk').first()).toBeVisible()
  await page.getByTestId('search-empty-reset').click()
  await expect.poll(() => resultCount(page)).toBe(10)
  expect(page.url()).not.toMatch(/departureAirport|departureDate/)
})

test('reload, shared link and back button reproduce identical results', async ({ page }) => {
  const url = '/search/packages?type=umrah&departureCity=London&sort=price-asc'
  await page.goto(url)
  const first = await page.locator('[data-testid^="package-card-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
  await page.reload()
  const second = await page.locator('[data-testid^="package-card-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
  expect(second).toEqual(first)
  await page.locator('[data-testid^="package-view-"]').first().click()
  await page.waitForURL(/\/packages\//)
  await page.goBack()
  await page.waitForURL(/departureCity=London/)
  const third = await page.locator('[data-testid^="package-card-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
  expect(third).toEqual(first)
})

test('pagination page survives reload', async ({ page }) => {
  await page.goto('/search/packages?type=umrah')
  await page.getByRole('button', { name: /page 2|^2$/i }).first().click()
  await expect(page).toHaveURL(/page=2/)
  const a = await page.locator('[data-testid^="package-card-"]').first().getAttribute('data-testid')
  await page.reload()
  expect(await page.locator('[data-testid^="package-card-"]').first().getAttribute('data-testid')).toBe(a)
})

test('cards never show undefined/null/NaN and gaps read Not provided', async ({ page }) => {
  await page.goto('/search/packages?type=umrah&departureCity=Birmingham')
  const text = await page.locator('[data-testid^="package-card-"]').allInnerTexts()
  for (const t of text) expect(t).not.toMatch(/\bundefined\b|\bnull\b|NaN/)
  const incomplete = page.getByTestId('package-card-local-test-pkg-04')
  await expect(incomplete).toContainText('Not provided')
  await expect(incomplete).toContainText('Distance not provided')
})

for (const vp of [{ n: 'desktop', w: 1280, h: 900 }, { n: 'tablet', w: 768, h: 1024 }, { n: 'mobile', w: 375, h: 812 }]) {
  test(`key pages: no console errors, no horizontal overflow @${vp.n}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h })
    const errors = await collectErrors(page)
    for (const [name, url] of [['home', '/'], ['umrah', '/umrah'], ['search', '/search/packages?type=umrah'], ['browse', '/packages'], ['package', '/packages/local-test-01'], ['enquire', '/packages/local-test-01/enquire'], ['corridor', '/umrah/london']]) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect.soft(overflow, `${name} overflow @${vp.n}`).toBeLessThanOrEqual(0)
      await shot(page, `${name}-${vp.n}`)
    }
    expect.soft(errors, 'console/network errors').toEqual([])
  })
}
