# QA Checklist & Testing Guide

## 1. Customer Quote Request Flow

- [ ] Navigate to `/quote`.
- [ ] **Step 1**: Select "Umrah" and "Flexible Dates". Click Next.
- [ ] **Step 2**: Enter Departure City "London". Toggle "Flexible" on. Click Next.
- [ ] **Step 3**: Enter Nights (5 Makkah, 5 Madinah). Select "4 Stars". Select "Medium" distance. Click Next.
- [ ] **Step 4**: Enter Occupancy (2 Double). Adjust Budget Slider (£1000-£5000). Toggle Inclusions. Click Next.
- [ ] **Step 5**: Review details. Enter Notes "Testing quote".
- [ ] Click **Submit Request**.
- [ ] Verify redirection to `/requests/[UUID]`.
- [ ] Verify status is **OPEN**.

## 2. Operator Dashboard & Offer

- [ ] Open a new tab or navigate to `/operator/dashboard`.
- [ ] Verify the new request appears in the list (Polling every 5s).
- [ ] Click the request to open the **Overlay**.
- [ ] Verify request details match what was submitted.
- [ ] Fill out the **Offer Form**:
  - Price: 1500 GBP
  - Hotel: 5 Stars
  - Distance: 200m
  - Nights: 5 / 5
  - Notes: "Special offer for you."
- [ ] Click **Send Offer**.
- [ ] Verify the overlay closes.
- [ ] Verify the request status updates to **RESPONDED** (in the list).

## 3. Customer Offer View & Comparison

- [ ] Go back to the Customer Request page `/requests/[UUID]` (refresh if needed).
- [ ] Verify the new offer appears in the list.
- [ ] **Test Comparison**:
  - (Requires 2+ offers): Repeat Operator step to send a second offer (different price/details).
  - Select both offers using checkboxes.
  - Click **Compare (2)** button.
  - Verify the Comparison Overlay opens.
  - Check table columns match the offers.

## 4. UI Consistency

- [ ] Verify the Overlay animation is smooth (fade/scale).
- [ ] Verify the Slider works correctly in Step 4.
- [ ] Verify dark mode styling is consistent.

## 5. Technical Verification

- [ ] Check `localStorage` (Key: `kb_requests`, `kb_offers`) to see data persistence.
- [ ] Verify `id`s are generated correctly.

## 6. Kanban Board

- [ ] Navigate to `/kanban`.
- [ ] Add a new task (Title, Assignee: Tuffy Dev).
- [ ] Verify it appears in "Backlog".
- [ ] Drag task to "In Progress".
- [ ] Verify task updates.
- [ ] Edit task -> Check "User Story" field is available.
- [ ] Move task to "Done".
- [ ] Check "History" tab (should be empty for new task as < 7 days).

## 7. Operator Analytics

- [ ] Navigate to `/operator/analytics`.
- [ ] Verify "Total Requests" matches dashboard.
- [ ] Verify "Booking Intents" count.

## 8. Operator Packages (Phase 2A)

- [ ] Navigate to `/operator/packages`.
- [ ] Verify existing packages are listed.
- [ ] Click **Create Package**.
- [ ] Fill form:
  - Title: "Test Package"
  - Type: Umrah
  - Price: 1200
  - Nights: 10
- [ ] Click **Save Package**.
- [ ] Verify new package appears in the list.
- [ ] Click **Edit** on the new package.
- [ ] Change title to "Test Package Updated".
- [ ] Click **Save Package**.
- [ ] Verify title is updated.
- [ ] Click **Delete**.
- [ ] Confirm deletion.
- [ ] Verify package is removed.

## 9. Search Packages – Option A (/search/packages)

- [ ] Go to `/umrah`, fill preferences, click **Search For Amazing Packages** → redirects to `/search/packages` with query params.
- [ ] On `/search/packages`: results show filtered packages (e.g. type=umrah, budgetMin/Max).
- [ ] **Shortlist:** Click shortlist on 1+ packages → count updates in header; refresh → shortlist persists (localStorage `kb_shortlist_packages`). Toggle "Shortlist only" → only shortlisted packages shown.
- [ ] **Compare:** Select 2 (or 3) packages via "Add to Compare" → **Compare (n)** button enables. Click **Compare (n)** → modal opens with comparison table (`[data-testid="comparison-table"]`). Close modal → works.
- [ ] Console: no hydration error, no Image aspect-ratio or LCP warnings.

## 10. E2E Tests

- [ ] Run `npx playwright test e2e/flow.spec.ts`.
- [ ] Verify all 3 browsers pass.

## 11. Verified Onboarding Bank Details (MT-1/MT-2)

- [ ] Confirm legacy operators without eligibility fields default to `tier='listed'` and cannot receive bookings.
- [ ] Confirm the seeded verified operator has active payment details and can receive BookingIntents.
- [ ] Confirm initial payment details require the operator owner and phone-confirmation stub (`confirmed=true`, `phoneLastFour`).
- [ ] Confirm active payment details cannot be edited directly; changes must create a bank change request.
- [ ] Confirm payment instructions are shown only in-app to the owning customer, involved operator, or admin.

## 12. Admin Bank Review Placeholders

- [ ] Confirm admin-only approval sets a cooling-period activation time.
- [ ] Confirm approved bank changes do not activate before the cooling period.
- [ ] Confirm lazy activation supersedes old active details after the cooling period.
- [ ] Confirm rejection and cancellation do not activate proposed details.
- [ ] Confirm audit log entries exist for create, request, approve, reject, cancel, and activate actions without full bank details in metadata.

## 13. Complaints Flow (P0-COMPLAINTS-FLOW)

- [ ] Customer: On `/requests/[id]`, with an existing BookingIntent, click **Report issue**.
- [ ] Select category and severity. Enter description (min 10 chars). Submit.
- [ ] Verify confirmation shows reference code and pay-operator-direct guidance.
- [ ] Operator: On `/operator/dashboard`, verify complaint appears in **Complaints inbox**.
- [ ] Click **Respond**, enter response (min 5 chars), submit. Verify status updates.
- [ ] Change status to **Resolved** via dropdown. Verify status updates.
- [ ] Admin: On `/admin/complaints`, verify all complaints appear with severity badges.
- [ ] Use severity/status filters. Verify list updates correctly.
- [ ] Click **Edit notes / flag**, add internal notes, check **Flag operator internally**, save.
- [ ] Change status to **Closed** via dropdown. Verify status updates.
- [ ] Verify customer cannot access `/admin/complaints` (routing or RBAC denial).
- [ ] Verify operator cannot access `/admin/complaints` (routing or RBAC denial).

## Phase 1 Regression Checklist (run before Phase 2 work)

Automated

- npm run test must pass
- npx playwright test e2e/flow.spec.ts must pass

Manual smoke (if dev server runs)

1. /quote submit request, confirm redirect to /requests/[id], refresh persists
2. /operator/dashboard submit offer, return to request, refresh shows offer
3. compare up to 3 offers renders correctly

Accessibility quick checks

- Keyboard works through wizard steps
- Overlay focus trap and close behaviour correct
- Sliders usable via keyboard
