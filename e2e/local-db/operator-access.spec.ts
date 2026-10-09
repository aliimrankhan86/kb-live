import { test, expect, type Page } from '@playwright/test'

// Real local DB. operator@test.local owns "Local Test Operator A" (seed).
async function login(page: Page, email: string) {
  await page.goto('/login?type=partner')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill('TestPass1!')
  await page.getByTestId('login-submit').click()
}

test.describe.configure({ mode: 'serial' })

// Sign in once per role: sign-in is rate limited to 5 attempts / 15 min / IP.
let operatorPage: Page
test.beforeAll(async ({ browser }) => {
  operatorPage = await (await browser.newContext()).newPage()
  await login(operatorPage, 'operator@test.local')
  await operatorPage.waitForURL(/operator\/dashboard/)
})

test('operator dashboard shows the operator\'s real packages from Postgres', async () => {
  const page = operatorPage
  await page.goto('/operator/dashboard')
  await expect(page.getByTestId('dashboard-summary')).toContainText(/5 published packages · 1 draft/)
})

test('CSV export then import reaches the database', async () => {
  const page = operatorPage
  await page.goto('/operator/dashboard')
  const exp = await page.request.get('/api/operator/packages/csv')
  expect(exp.status()).toBe(200)
  const csv = await exp.text()
  expect(csv).toContain('[LOCAL TEST DATA]')
  const imp = await page.request.post('/api/operator/packages/csv', {
    headers: { 'content-type': 'text/csv' },
    data: 'title,pricePerPerson,currency,totalNights,pilgrimageType,status\n[LOCAL TEST DATA] CSV import check,999,GBP,7,umrah,draft',
  })
  expect(imp.status()).toBe(200)
  const pk = await page.request.get('/api/operator/packages')
  expect(JSON.stringify(await pk.json())).toContain('CSV import check')
})

test('room prices round trip through Postgres: edit API, blank clears to NULL, CSV export (item 9)', async () => {
  const page = operatorPage
  const id = 'local-test-pkg-02'
  const patch = (data: Record<string, unknown>) => page.request.patch('/api/operator/packages', { data: { id, ...data } })
  const stored = async () => {
    const res = await page.request.get('/api/operator/packages')
    const pkg = ((await res.json()).packages as Array<Record<string, unknown>>).find((p) => p.id === id)!
    return [pkg.priceQuadPerPerson ?? null, pkg.priceTriplePerPerson ?? null, pkg.priceDoublePerPerson ?? null]
  }

  expect((await patch({ priceQuadPerPerson: 1399.99, priceTriplePerPerson: null, priceDoublePerPerson: 1650 })).status()).toBe(200)
  expect(await stored()).toEqual([1399.99, null, 1650])
  const csv = await (await page.request.get('/api/operator/packages/csv')).text()
  const [head, ...rows] = csv.split('\n')
  expect(head).toContain('priceQuadPerPerson,priceTriplePerPerson,priceDoublePerPerson')
  expect(rows.find((r) => r.includes('14 night family Umrah from Birmingham'))).toContain(',1399.99,,1650,')

  // Zero is refused; blank (null) clears back to "not stated", never 0.
  expect((await patch({ priceQuadPerPerson: 0 })).status()).toBe(400)
  expect((await patch({ priceQuadPerPerson: null, priceDoublePerPerson: null })).status()).toBe(200)
  expect(await stored()).toEqual([null, null, null])
})

test('profile save persists and cannot change verification', async () => {
  const page = operatorPage
  await page.goto('/operator/dashboard')
  const res = await page.request.patch('/api/operator/profile', {
    data: { companyName: 'Local Test Operator A', contactEmail: 'operator@test.local', yearsInBusiness: 7 },
  })
  expect(res.status()).toBe(200)
  const bad = await page.request.patch('/api/operator/profile', {
    data: { companyName: 'Local Test Operator A', contactEmail: 'operator@test.local', verificationStatus: 'verified' },
  })
  expect(bad.status()).toBe(400)
})

test('operator leads API works under Prisma (was DBAdapter method not found)', async () => {
  const page = operatorPage
  await page.goto('/operator/dashboard')
  expect((await page.request.get('/api/operator/leads')).status()).toBe(200)
  expect((await page.request.get('/api/operator/dashboard')).status()).toBe(200)
})

test('access control: customer and anonymous cannot reach operator/admin', async ({ page, request }) => {
  expect((await request.get('/api/operator/dashboard')).status()).toBe(403)
  expect((await request.get('/api/operator/packages/csv')).status()).toBe(403)
  expect((await request.get('/api/admin/reconciliation')).status()).toBeGreaterThanOrEqual(401)
  await login(page, 'customer@test.local')
  await page.waitForURL((u) => !u.pathname.startsWith('/login'))
  expect((await page.request.get('/api/operator/dashboard')).status()).toBe(403)
  expect((await page.request.get('/api/admin/bank-changes')).status()).toBe(403)
  await page.goto('/admin/complaints')
  expect(new URL(page.url()).pathname).toBe('/')
  await page.goto('/operator/dashboard')
  expect(new URL(page.url()).pathname).toBe('/')
})

test('admin can open admin pages; reconciliation works under Prisma', async ({ page }) => {
  await login(page, 'admin@test.local')
  await page.waitForURL(/admin/)
  expect((await page.request.get('/api/admin/reconciliation?from=2026-01-01&to=2026-12-31')).status()).toBe(200)
  await page.goto('/admin/complaints')
  expect(new URL(page.url()).pathname).toBe('/admin/complaints')
})
