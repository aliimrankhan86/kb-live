# App Readiness Report — PilgrimCompare
**Date:** 14 June 2026  
**Tested by:** Automated audit (qa/app-readiness-audit branch)

---

## What I tested

I walked through every major journey the app supports, in the same order a real user would experience it.

**The pilgrim journey:**  
Homepage → browse packages → open a package → start a quote request → fill in all steps (trip type, departure airport, duration, hotel rating, budget) → submit → receive a reference code.

Then: an operator sees the quote in their leads list, replies with a price offer. The pilgrim goes back to their request page, sees the offer, compares two offers side by side, and clicks "Proceed direct" to create a booking intent — which shows the bank account details for direct payment.

**The operator journey:**  
Log in → view packages → view incoming leads → respond to a quote request with an offer price.

**Bank account management:**  
Operator submits a change to their bank details → enters the OTP code → change goes into "Under review" state. Admin logs in, reviews the change (sees the before/after comparison), and approves it. Operator now sees the cooling period message. Then: a separate test for rejection (admin requires a reason before it goes through), and one more for the operator cancelling a pending request before it's reviewed.

**All automated emails:**  
Checked every email the app sends — enquiry confirmation to the pilgrim, new enquiry alert to the operator, booking intent confirmation, payment evidence notification, outcome follow-up, and the operator nudge reminder. Verified they render correctly without crashes.

**Security:**  
Verified that each operator can only see their own packages, leads, and enquiries. No cross-contamination between accounts.

**Mobile sizing:**  
All pages were tested at 390px width (iPhone-sized). The quote form, package cards, comparison table, and booking intent dialog all fit correctly without anything overflowing or getting cut off.

---

## What was broken

Seven things were broken. All seven are now fixed.

### 1. Emails were crashing in production
Every automated email — confirmation to pilgrims, alerts to operators, booking receipts — would silently fail when the app was in production mode. The email templates were built but couldn't be sent because of a technical conflict between the email library versions. Fixed: emails now render correctly before being handed to the sending service.

### 2. Created records vanished between steps
When a pilgrim submitted a quote request, the record was created but then immediately lost. If the app tried to load it a moment later (e.g. to show the pilgrim their request page), it found nothing. This was a server memory issue — the test environment was not holding onto data between separate requests. Fixed: data now persists correctly within a server session.

### 3. Rate limiter blocked legitimate test submissions
The app has a protection that limits how many quote requests can be submitted from the same connection in 15 minutes (to prevent spam). During automated testing, this limit was being hit after just a few test runs, causing all subsequent quote submissions to be rejected with "Too many attempts." Fixed: the rate limiter is automatically bypassed during automated testing, while remaining active for real users.

### 4. Admin users were locked out of operator settings
An admin account that also manages an operator (a real use case — the site admin needs to check their own operator settings) was being rejected by the bank details, bank change, and audit log pages. The code was checking for "operator" role only, not "admin". Fixed: admin accounts now have access to operator settings.

### 5. Bank change tests left dirty state for each other
The four bank account tests run one after another. The first one approves a bank change, which puts the account into a 7-day cooling period. The third test then tried to submit a new change request but found no button to do so (because the account was in cooling). Fixed: each test now resets the bank change state before it runs, so they don't interfere with each other.

### 6. Quote form tests matched the old UI
The automated tests for the quote submission flow were written when the form used text boxes. The quote form was redesigned to use tap-to-select buttons (you tap "London", it shows airport options, you tap "LHR"). The old tests looked for text boxes that no longer exist and timed out. Fixed: tests now use the button-based selectors that match the current design.

### 7. Comparison table price check was looking in the wrong place
The test that verifies prices appear in the side-by-side comparison table was looking for prices in the table rows. In the actual design, prices are in the column headers. Fixed: the check now looks at the whole table.

---

## What is confirmed working

Everything below was tested and passes.

- **Pilgrim quote journey**: home → quote form (all 5 steps) → submit → reference code page loads with correct request details
- **Operator leads**: new quote requests appear in the operator's leads list; operator can respond with a price; offer appears on the pilgrim's page
- **Two-offer comparison**: pilgrim can tick two offers and open the side-by-side comparison table; prices and operator names are visible
- **Booking intent**: pilgrim clicks "Proceed direct", skips payment proof upload, submits → reference code starting with "PC-" is issued
- **Bank account display after booking**: the operator's bank details (account holder, sort code, account number) are shown to the pilgrim after creating a booking intent; the PilgrimCompare non-collection disclaimer is present
- **Bank change — full approval flow**: change submitted → OTP verified → "Under review" state → admin sees it in the queue → admin approves → back to empty queue → operator sees "Approved — cooling period" with the activation date
- **Bank change — rejection**: admin must fill in a reason before rejection goes through; empty reason keeps the dialog open; after rejection, operator sees "Previous change request rejected"
- **Bank change — operator cancellation**: operator can cancel a pending change; page returns to active state with "request change" button
- **Operator data isolation**: each operator's leads, packages, and bank details are scoped to their own account; no cross-contamination
- **All 6 email functions**: enquiry confirmation, operator enquiry alert, booking intent confirmation, payment evidence notification, operator nudge, outcome follow-up — all render and send without errors
- **Email branding**: all emails are branded as PilgrimCompare, sent from the correct address, with correct legal disclaimers; no KaabaTrip references anywhere
- **KaabaTrip text/logos**: zero occurrences anywhere in the codebase, emails, or assets — already removed before this audit
- **Hotel star "Not provided"**: packages without a hotel rating show "Not provided" on the package card, not a fabricated star count
- **Mobile layout at 390px**: all pages render correctly at iPhone size
- **1,830 unit tests**: all pass
- **19 Playwright end-to-end tests**: all pass (2 are intentionally skipped — pre-existing)
- **TypeScript type check**: clean
- **Production build**: clean

---

## What to personally check on your phone

A few things can only be verified by a human looking at a real device:

1. **Quote form chip buttons** — tap "Umrah", tap "Flexible Dates", tap "Next Step". Then tap "London", wait for the airport chips to appear, tap "LHR". Verify the buttons feel responsive and easy to tap on a real screen.

2. **Booking intent payment details** — go through a full booking, reach the payment instructions screen. Verify the bank account holder name, sort code, and account number all render clearly and nothing is clipped or overlapping on a small screen.

3. **Comparison table on mobile** — tick two offers and open the comparison. On a narrow screen this table scrolls horizontally; verify the scroll works smoothly and prices are readable.

4. **Admin approval on mobile** — log in as admin, go to bank changes, tap a review link, and approve. Verify the confirmation dialog appears and the buttons are tappable without being too small.

5. **Email appearance** — trigger a quote submission and check the confirmation email in a real inbox on your phone. Verify it looks correct, the PilgrimCompare name is right, and the reference code is visible.

---

## Nav label note (not a bug, but worth knowing)

The navigation has two links that could confuse users: "Packages" (the full browseable catalogue) and "Compare" (a filterable search view). They are intentionally two separate pages — one is a curated browse experience, the other is a filter-and-compare tool. The names are slightly ambiguous. Worth revisiting the labels before launch, but it is not a technical defect.
