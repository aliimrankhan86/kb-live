import { test, expect } from '@playwright/test'
import { dismissCookieBanner } from '../helpers/cookies'

// Item 9 / UX-11 on the real local DB. Seed: package 01 states all three room
// prices, 09 only double, 07 none.
const STATED = /As stated by Local Test Operator A, updated \d{1,2} \w{3} \d{4}/

test('package page shows "Prices by room type" only when stated, each line attributed and dated', async ({ page }) => {
  await page.goto('/packages/local-test-01')
  const block = page.getByTestId('package-room-prices')
  await expect(block.getByRole('heading', { name: 'Prices by room type' })).toBeVisible()
  for (const price of ['£1,495 per person', '£1,650 per person', '£1,895.50 per person']) await expect(block).toContainText(price)
  await expect(block.getByText(STATED)).toHaveCount(3)
  await expect(page.getByTestId('package-price')).toHaveText('From £1,495')

  await page.goto('/packages/local-test-09')
  await expect(page.getByTestId('package-room-prices')).toContainText('£1,550 per person')
  await expect(page.getByTestId('package-room-prices').getByText('Not provided')).toHaveCount(2)

  await page.goto('/packages/local-test-07')
  await expect(page.getByTestId('package-price')).toBeVisible()
  await expect(page.getByTestId('package-room-prices')).toHaveCount(0)
})

test('compare shows one row per room type, stated price or Not provided, and never marks them', async ({ page }) => {
  await dismissCookieBanner(page)
  await page.goto('/packages?departureCity=London')
  for (const n of ['01', '09', '07']) await page.getByTestId(`package-compare-toggle-local-test-pkg-${n}`).check()
  await page.getByTestId('search-compare-button').click()
  const table = page.getByTestId('comparison-table')
  await expect(table).toBeVisible()
  const row = (label: string) => table.locator('tr', { has: page.getByRole('rowheader', { name: label, exact: true }) })
  const cells = async (label: string) => (await row(label).locator('td').allInnerTexts()).map((t) => t.trim())

  const quad = await cells('Quad room (4 sharing)')
  expect(quad.filter((t) => t === 'Not provided')).toHaveLength(2)
  expect(quad.find((t) => t !== 'Not provided')).toMatch(new RegExp(`^£1,495 per person\\s+${STATED.source}$`))
  const double = await cells('Double room (2 sharing)')
  expect(double.filter((t) => t === 'Not provided')).toHaveLength(1)
  expect(double.join('|')).toContain('£1,895.50 per person')
  expect(double.join('|')).toContain('£1,550 per person')
  for (const label of ['Quad room (4 sharing)', 'Triple room (3 sharing)', 'Double room (2 sharing)']) {
    await expect(row(label).getByTestId('comparison-best')).toHaveCount(0)
  }
})
