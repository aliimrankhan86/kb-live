# Analytics — PilgrimCompare

**Tool:** Vercel Web Analytics (free, Hobby plan)
**Status:** Live on production (`pilgrimcompare.co.uk`) since 2026-06-16
**Cost:** £0 (replaced paid Plausible Cloud during the POC)
**Last verified:** 2026-06-16 (manual — bump this date when you re-check; see §5)

> This doc is maintained by hand. When analytics wiring, the dashboard toggle, or the verified state changes, update the relevant section and the **Last verified** date above.

---

## 1. What we use and why

We use **Vercel Web Analytics** — a cookieless, privacy-first analytics product built into the Vercel platform.

- **Free** on the Hobby plan (no card, capped event volume — ample for a POC).
- **Cookieless** → no cookie-consent banner required; keeps our privacy posture true.
- **Same-origin** → the script and event beacons are served from `/_vercel/insights/*` on our own domain, so the strict Content-Security-Policy needs no third-party allowance.

It replaced **Plausible Cloud**, which was wired but never registered (no account) and is paid after a 30-day trial. The swap kept the exact same privacy story.

---

## 2. How it's wired

| Concern | File | Detail |
|---|---|---|
| Pageview tracking | `app/layout.tsx` | `<Analytics />` from `@vercel/analytics/next`, rendered once in the root layout. Auto-disabled outside production; preview/prod separated in the dashboard. |
| Conversion goal | `components/enquiry/EnquiryForm.tsx` | `track('Enquiry Submitted')` from `@vercel/analytics`, fired exactly once on the successful PC- enquiry confirmation. |
| CSP | `middleware.ts` | `script-src 'self' 'nonce-…'` and `connect-src 'self' …` — **no external analytics domain**. Vercel's script/beacon are same-origin, covered by `'self'` (nonces only gate inline scripts). |
| Privacy copy | `app/privacy/page.tsx`, `components/compliance/CookieConsent.tsx` | Names "Vercel Web Analytics"; cookieless / no-consent claims unchanged. |
| Dependency | `package.json` | `@vercel/analytics` |

**Events tracked:**
- `pageview` — automatic, every route.
- `Enquiry Submitted` — custom conversion goal, on each completed enquiry (client-side anonymous count; **not** the server-side lead log).

---

## 3. One-time setup (already done)

Enable Web Analytics in the Vercel dashboard:

> Vercel → project `pilgrimcompare` → **Analytics** tab → **Enable Web Analytics**

Until this is on, the script 404s and events no-op — it's a dashboard toggle, not a code change. **This is now enabled.** No redeploy is needed when toggling.

---

## 4. Verification (production, 2026-06-16)

| Check | Result |
|---|---|
| `/_vercel/insights/script.js` | `200` (served — analytics enabled) |
| Initialised on page | `window.vai === true`, `window.va` is a function, `window.vam === "production"` |
| CSP | clean — no `plausible.io`; script allowed; no violations |
| Pageviews | flowing (sent via `navigator.sendBeacon`, so they don't appear in the browser network panel — this is expected) |
| `Enquiry Submitted` goal | **fired** — captured `["event", { name: "Enquiry Submitted" }]` on a real confirmation (`PC-19259D36`) |

---

## 5. How to verify it yourself later

1. **Dashboard:** Vercel → project → **Analytics** tab. Pageviews + the `Enquiry Submitted` custom event appear within a minute or two of real traffic.
2. **In the browser console** on the live site:
   ```js
   window.vai   // true  → analytics initialised
   window.vam   // "production"
   typeof window.va // "function"
   ```
3. **Event firing** (beacons use `sendBeacon`, invisible to the network tab). To confirm a custom event fires, wrap `window.va` before triggering the action:
   ```js
   window.__c = [];
   const o = window.va; window.va = (...a) => { window.__c.push(a); return o?.(...a); };
   // …complete an enquiry…
   window.__c.some(c => c[0] === 'event' && c[1]?.name === 'Enquiry Submitted'); // true
   ```

---

## 6. Notes & gotchas

- **Don't expect to see beacons in the network panel** — Vercel Analytics uses `navigator.sendBeacon`, which most network inspectors don't surface. Use `window.vai` / the dashboard instead.
- **Preview vs production** are separated automatically in the dashboard; preview-deploy traffic won't pollute production stats.
- **Switching back / off:** remove `<Analytics />` from `app/layout.tsx`, the `track()` call from `EnquiryForm.tsx`, and the `@vercel/analytics` dependency. No CSP change needed (it was already same-origin).
- **Cost ceiling:** Hobby Web Analytics has a monthly event cap. If the POC outgrows it, upgrade the Vercel plan or revisit a dedicated analytics tool.

---

## 7. History

- **2026-06-16** — Plausible Cloud wired then **replaced** by Vercel Web Analytics (PR #94), promoted to `main` (PR #95). Verified live end-to-end (pageview + `Enquiry Submitted`). See `AI_NOTES.md` §Analytics swap.
