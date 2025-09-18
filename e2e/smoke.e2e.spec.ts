import { test, expect } from '@playwright/test'

test.skip('homepage loads correctly', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/')
  
  // Wait for page to load
  await page.waitForLoadState('networkidle')
  
  // Check page title
  await expect(page).toHaveTitle(/KaabaTrip/)
  
  // Check main headings
  await expect(page.getByText('Search Best Packages for:')).toHaveCount(2)
  
  // Check CTA buttons
  await expect(page.getByRole('link', { name: 'HAJJ' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'UMRAH' })).toBeVisible()
  
  // Check header
  await expect(page.getByRole('link', { name: /KaabaTrip Logo KaabaTrip/ })).toBeVisible()
})

test.skip('navigation links work', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/')
  await page.waitForLoadState('networkidle')
  
  // Test Hajj link
  await page.getByRole('link', { name: 'HAJJ' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3000/hajj')
  await expect(page.getByRole('heading', { name: 'Hajj Packages' })).toBeVisible()
  
  // Test Umrah link
  await page.goto('http://127.0.0.1:3000/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: 'UMRAH' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3000/umrah')
  await expect(page.getByRole('heading', { name: 'Umrah Packages' })).toBeVisible()
})
