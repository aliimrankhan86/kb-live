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

## 9. E2E Tests

- [ ] Run `npx playwright test e2e/flow.spec.ts`.
- [ ] Verify all 3 browsers pass.
