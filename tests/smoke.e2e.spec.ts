import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  
  // Check page title
  await expect(page).toHaveTitle(/KaabaTrip/)
  
  // Check background color
  const body = page.locator('body')
  await expect(body).toHaveCSS('background-color', 'rgb(11, 11, 11)')
  
  // Check favicon
  const favicon = page.locator('link[rel="icon"]')
  await expect(favicon).toHaveAttribute('href', '/favicon.ico')
  
  // Check main headings
  await expect(page.getByText('Search Best Packages for:')).toHaveCount(2)
  
  // Check CTA buttons
  await expect(page.getByRole('link', { name: 'HAJJ' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'UMRAH' })).toBeVisible()
  
  // Check header
  await expect(page.getByText('KaabaTrip')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Become A Partner' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible()
})

test('navigation links work', async ({ page }) => {
  await page.goto('/')
  
  // Test Hajj link
  await page.getByRole('link', { name: 'HAJJ' }).click()
  await expect(page).toHaveURL('/hajj')
  await expect(page.getByText('Hajj Packages')).toBeVisible()
  
  // Test Umrah link
  await page.goto('/')
  await page.getByRole('link', { name: 'UMRAH' }).click()
  await expect(page).toHaveURL('/umrah')
  await expect(page.getByText('Umrah Packages')).toBeVisible()
})
