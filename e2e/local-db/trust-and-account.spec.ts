import { test, expect, type Page } from '@playwright/test'
import { config } from 'dotenv'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

// LOCAL ONLY: refuses anything but the local stack.
config({ path: '.env.local', quiet: true })
const local = (key: string) => {
  const value = process.env[key]!
  if (new URL(value).hostname !== '127.0.0.1') throw new Error(`${key} is not local`)
  return value
}
const admin = () =>
  createClient(local('NEXT_PUBLIC_SUPABASE_URL'), process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const sql = async <T,>(text: string, values: unknown[]): Promise<T[]> => {
  const client = new pg.Client({ connectionString: local('DIRECT_URL') })
  await client.connect()
  try { return (await client.query(text, values)).rows as T[] } finally { await client.end() }
}
const MAILPIT = 'http://127.0.0.1:54324'

async function login(page: Page, email: string, password = 'TestPass1!') {
  await page.goto('/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL((u) => !u.pathname.startsWith('/login'))
}

test.describe.configure({ mode: 'serial' })

test('unverified operator packages and profile are never public', async ({ page }) => {
  await page.goto('/search/packages')
  await expect(page.locator('body')).not.toContainText('unverified operator')
  await page.goto('/packages/local-test-15')
  await expect(page.locator('body')).toContainText('no longer available')
  // Operator C is verified but has no ATOL number, so it is not listed either.
  await page.goto('/packages/local-test-05')
  await expect(page.locator('body')).toContainText('no longer available')
  await page.goto('/operators/local-test-operator-c')
  await expect(page.locator('body')).not.toContainText('Local Test Operator C')
  const res = await page.goto('/operators/local-test-operator-d')
  await expect(page.locator('body')).not.toContainText('Local Test Operator D')
  expect(res?.status()).toBeLessThan(500)
})

test('uploaded package image renders under the CSP', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy|Refused to load the image/i.test(m.text())) errors.push(m.text()) })
  await page.goto('/packages/local-test-01')
  const img = page.locator('img[src*="package-images"], img[srcset*="package-images"]').first()
  await expect(img).toBeVisible()
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
  await page.goto('/search/packages?departureAirport=LHR')
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})

test('every price is attributed and dated; inclusions are three-state', async ({ page }) => {
  await page.goto('/search/packages?type=umrah')
  await expect(page.getByTestId('price-attribution-local-test-pkg-01')).toContainText(/As stated by Local Test Operator A, updated \d{1,2} \w{3} \d{4}/)
  await page.goto('/packages/local-test-04')
  await expect(page.getByTestId('package-price-attribution')).toContainText('Confirm the final price with the operator before paying')
  await expect(page.getByTestId('package-inclusions')).toContainText('Transfers: Not provided')
})

test('guide pages state no prices, dates or urgency of their own', async ({ page }) => {
  for (const url of ['/umrah', '/umrah/cost', '/umrah/ramadan', '/umrah/london', '/umrah/birmingham', '/hajj']) {
    await page.goto(url)
    const text = await page.locator('#main-content').innerText()
    expect.soft(text, url).not.toMatch(/£\s?\d|sell out|cheapest|30–50%|18 February/i)
  }
})

test('password reset works end to end through the emailed link', async ({ page }) => {
  await fetch(`${MAILPIT}/api/v1/messages`, { method: 'DELETE' })
  // Real UI: the browser's fetch sends the Origin header the route relies on.
  await page.goto('/login')
  await page.getByTestId('login-forgot-password').click()
  await page.getByTestId('login-forgot-email').fill('customer@test.local')
  await page.getByTestId('login-forgot-submit').click()
  await expect(page.getByTestId('login-forgot-success')).toBeVisible()
  let link = ''
  await expect.poll(async () => {
    const list = await (await fetch(`${MAILPIT}/api/v1/messages`)).json()
    const msg = list.messages?.find((m: { To: { Address: string }[] }) => m.To.some((t) => t.Address === 'customer@test.local'))
    if (!msg) return ''
    const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json()
    link = (String(full.HTML || full.Text).match(/href="([^"]+verify[^"]+)"/)?.[1] ?? '').replace(/&amp;/g, '&')
    return link
  }, { timeout: 15000 }).not.toBe('')
  await page.goto(link)
  await page.waitForURL(/reset-password/)
  await page.getByTestId('reset-password').fill('NewPass1!x')
  await page.getByTestId('reset-confirm').fill('NewPass1!x')
  await page.getByTestId('reset-submit').click()
  await expect(page.getByTestId('reset-done')).toBeVisible()
  // Restore the shared local test password.
  const { data } = await admin().auth.admin.listUsers()
  const id = data.users.find((u) => u.email === 'customer@test.local')!.id
  await admin().auth.admin.updateUserById(id, { password: 'TestPass1!' })
})

test('account deletion removes the sign-in and consent, and anonymises enquiries', async ({ page }) => {
  const email = `delete-me-${Date.now()}@test.local`
  const { data, error } = await admin().auth.admin.createUser({ email, password: 'TestPass1!', email_confirm: true, app_metadata: { role: 'customer' } })
  expect(error).toBeNull()
  const enq = await page.request.post('/api/enquiries', {
    data: { packageId: 'local-test-pkg-01', name: 'Delete Me', email, phone: '07000000000', message: 'Two adults', marketingConsent: true },
  })
  expect(enq.status()).toBe(201)
  const { referenceCode } = await enq.json()
  expect(await sql('select 1 from marketing_consents where email = $1', [email])).toHaveLength(1)

  await login(page, email)
  const res = await page.request.delete('/api/user/delete')
  expect(res.status()).toBe(200)
  expect(await res.json()).toEqual({ deleted: true })
  const { data: after } = await admin().auth.admin.getUserById(data.user!.id)
  expect(after.user).toBeNull()
  expect(await sql('select 1 from marketing_consents where email = $1', [email])).toEqual([])
  expect(await sql('select name, email, phone, message, package_id from enquiries where reference_code = $1', [referenceCode]))
    .toEqual([{ name: 'Deleted account', email: null, phone: null, message: null, package_id: 'local-test-pkg-01' }])
})
