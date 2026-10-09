import { test, expect } from '@playwright/test'

// UX-23 and UX-24 at phone width: text is at least 12px, every tap target is at
// least 24px high, and footer links, filter controls, card Save and contact
// links reach 44px.
const pages = [
  '/', '/umrah', '/umrah/london', '/hajj', '/packages', '/search/packages?type=umrah&departureCity=London',
  '/packages/local-test-01', '/operators/local-test-operator-a', '/partner', '/login', '/signup',
  '/how-we-rank', '/privacy', '/terms',
]
const BIG = '[role="contentinfo"] li a, [role="contentinfo"] button, [role="contentinfo"] a[href^="mailto:"], [class*="segmentBtn"], [class*="savedChip"], [class*="filterButton"], [class*="sortButton"], main select, [data-testid^="shortlist-toggle-"], [data-testid="operator-contact-email"]'

test.use({ viewport: { width: 390, height: 844 } })

test('phone: 12px minimum text and 24px (44px where practical) tap targets', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const r = await page.evaluate((big) => {
      const shown = (el: Element) => {
        const b = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return b.width > 1 && b.height > 1 && s.visibility !== 'hidden' && !el.closest('.sr-only')
      }
      const name = (el: Element) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}"`
      const smallText = [...document.querySelectorAll('body *')]
        .filter((el) => shown(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12)
        .map(name)
      const under24 = [...document.querySelectorAll('a[href], button, select, summary')]
        .filter((el) => shown(el) && el.getBoundingClientRect().height < 24)
        .map((el) => `${name(el)} ${Math.round(el.getBoundingClientRect().height)}px`)
      const under44 = [...document.querySelectorAll(big)]
        .filter((el) => shown(el) && el.getBoundingClientRect().height < 44)
        .map((el) => `${name(el)} ${Math.round(el.getBoundingClientRect().height)}px`)
      return { smallText, under24, under44 }
    }, BIG)
    expect.soft(r.smallText, `${path} text under 12px`).toEqual([])
    expect.soft(r.under24, `${path} targets under 24px`).toEqual([])
    expect.soft(r.under44, `${path} targets under 44px`).toEqual([])
  }
})
