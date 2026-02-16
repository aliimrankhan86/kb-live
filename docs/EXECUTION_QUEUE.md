# Execution Queue

Ordered list of tasks for building the operator dashboard and enhancing the platform. Execute in order. Each task is self-contained — read the task spec, build it, test it, mark it done.

**How to use this file:**

1. Find the first task with status `[ ]` (pending).
2. Read the task spec below + any referenced docs.
3. Build it. Test it. Verify it.
4. Change the status to `[x]` and add the date.
5. Move to the next task.

**After every task:** `npm run test` + `npm run build` must pass.
**After every push:** Update `docs/NOW.md`.

---

## Status legend

- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Done (add date: `[x] 2026-02-04`)
- `[-]` — Skipped (add reason)

## Ad-hoc Completed

- `[x] 2026-02-16` Design system foundation: added UI primitives (`Text`, `Heading`, `Button`, `Input`, `Select`), updated `/showcase` as styleguide, and added `docs/DESIGN_SYSTEM.md` + `docs/TOKENS.md`.
- `[x] 2026-02-16` Design system complete: added comprehensive `components/ui` primitives (forms, overlay, feedback, navigation, data display, charts), rebuilt `/showcase` with live state demos + section navigation, and aligned docs.

---

## Phase 1: Foundation (must complete before Phase 2)

### Task 1: Evolve types — OperatorProfile + Package

**Status:** `[x] 2026-02-15`
**Complexity:** Small
**Files to modify:** `lib/types.ts`
**Read first:** `docs/OPERATOR_ONBOARDING.md` §2 (OperatorProfile) and §4 (Package interface)

**What to do:**

Add new **optional** fields to the existing interfaces. This is backward-compatible — no existing code breaks.

Add to `OperatorProfile`:
```typescript
  tradingName?: string;
  companyRegistrationNumber?: string;
  atolNumber?: string;
  abtaMemberNumber?: string;
  contactPhone?: string; // already optional
  officeAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  websiteUrl?: string;
  servingRegions?: string[];
  departureAirports?: string[];
  yearsInBusiness?: number;
  pilgrimageTypesOffered?: ('umrah' | 'hajj')[];
  createdAt?: string;
  updatedAt?: string;
```

Add to `Package`:
```typescript
  hotelMakkahName?: string;
  hotelMadinahName?: string;
  distanceToHaramMakkahMetres?: number;
  distanceToHaramMadinahMetres?: number;
  airline?: string;
  departureAirport?: string;
  flightType?: 'direct' | 'one-stop' | 'multi-stop';
  depositAmount?: number;
  paymentPlanAvailable?: boolean;
  cancellationPolicy?: string;
  highlights?: string[];
  groupType?: 'private' | 'small-group' | 'large-group';
  createdAt?: string;
  updatedAt?: string;
```

**Verify:**
- `npm run test` passes (no existing code affected).
- `npm run build` passes (TypeScript compiles).

---

### Task 2: Update MockDB seed data

**Status:** `[x] 2026-02-15`
**Complexity:** Small
**Files to modify:** `lib/api/mock-db.ts`
**Depends on:** Task 1

**What to do:**

1. Update `SEED_OPERATORS` to include new fields:
```typescript
{
  id: 'op1',
  slug: 'al-hidayah-travel',
  companyName: 'Al-Hidayah Travel',
  tradingName: 'Al-Hidayah',
  companyRegistrationNumber: '12345678',
  verificationStatus: 'verified',
  atolNumber: '11234',
  contactEmail: 'info@alhidayah.com',
  contactPhone: '+44 20 7123 4567',
  officeAddress: { line1: '45 Whitechapel Road', city: 'London', postcode: 'E1 1DU', country: 'GB' },
  websiteUrl: 'https://alhidayah.example.com',
  servingRegions: ['UK'],
  departureAirports: ['LHR', 'MAN', 'BHX'],
  yearsInBusiness: 12,
  pilgrimageTypesOffered: ['umrah', 'hajj'],
}
```
Do the same for `op2` (Makkah Tours) with different realistic data.

2. Update `SEED_PACKAGES` to include hotel names, airline, departure airport, and cancellation policy for all 5 seed packages.

3. Bump `PACKAGES_SEED_VERSION` to `3` so existing localStorage gets refreshed.

**Verify:**
- `npm run test` passes.
- `npm run build` passes.
- `npm run dev` → open `/packages` → confirm packages load (localStorage refreshed).

---

### Task 3: Operator layout with sidebar navigation

**Status:** `[x] 2026-02-15`
**Complexity:** Small-Medium
**Files to create:** `app/operator/layout.tsx`, `components/operator/OperatorSidebar.tsx`
**Files to modify:** `app/operator/dashboard/page.tsx`, `app/operator/packages/page.tsx`, `app/operator/analytics/page.tsx`
**Read first:** `docs/APP_STRUCTURE.md` §4 (shared layout), `docs/UX_GUIDELINES.md` §4 (component rules)

**What to do:**

1. Create `app/operator/layout.tsx`:
   - Server component that wraps all `/operator/*` routes.
   - Imports `OperatorSidebar`.
   - Layout: sidebar (240px) on left, main content on right.
   - Mobile: sidebar hidden, hamburger button shows slide-out.

2. Create `components/operator/OperatorSidebar.tsx`:
   - Client component (needs `usePathname` for active state).
   - Nav items: Dashboard, My Packages, Leads, Analytics, Profile.
   - Each item links to its route.
   - Active item highlighted with `--yellow`.
   - Bottom section: operator name, verification status.
   - `data-testid="operator-sidebar"`.

3. Update existing operator page files:
   - Remove `<main>` wrapper and `<h1>` from each — the layout handles this.
   - Each page just renders its content component.

**Design:**
- Background: `#0B0B0B` (page), `#111111` (sidebar).
- Border between sidebar and content: `rgba(255,255,255,0.1)`.
- Nav items: 44px min height, `--textMuted` default, `--text` on hover, `--yellow` active indicator.
- Mobile breakpoint: below `768px` sidebar collapses to hamburger.

**Verify:**
- All 3 operator routes render with sidebar.
- Active nav item highlights correctly.
- Mobile: hamburger toggles sidebar.
- `npm run test` + `npm run build` pass.

---

## Phase 2: Operator Onboarding (execute after Phase 1)

### Task 4: Operator registration form

**Status:** `[ ]`
**Complexity:** Medium
**Files to create:** `app/operator/onboarding/page.tsx`, `components/operator/OperatorRegistrationForm.tsx`
**Files to modify:** `lib/api/repository.ts`, `lib/api/mock-db.ts`
**Read first:** `docs/OPERATOR_ONBOARDING.md` §2 (mandatory fields), §6 (validation), §7 (onboarding UX)

**What to do:**

1. Create the registration form page at `/operator/onboarding`.
2. Form fields (all mandatory for submission):
   - Company name (text, 2-100 chars)
   - Company registration number (text)
   - ATOL number (text, optional but prompted)
   - ABTA member number (text, optional)
   - Contact email (email input)
   - Contact phone (tel input with country code)
   - Office address (line1, line2 optional, city, postcode, country dropdown)
   - Serving regions (multi-select: UK, EU, US, ME, SA)
   - Departure airports (multi-select with search: LHR, MAN, BHX, BRS, EDI, GLA, LTN, STN, LGW)
   - Pilgrimage types (checkboxes: Umrah, Hajj)
3. CTA: "Submit for Verification".
4. On submit: create OperatorProfile via Repository with `verificationStatus: 'pending'`.
5. Redirect to `/operator/onboarding/status`.

**Validation:**
- Client-side: all mandatory fields filled, email format, phone format.
- Show inline error messages below each field.
- Disable submit until form is valid.
- All inputs need `<label>`, `data-testid`, `aria-required`.

**Repository changes:**
- Add `Repository.createOperator(profile: Partial<OperatorProfile>): OperatorProfile`.
- Add `MockDB.saveOperator(op: OperatorProfile)`.

**Verify:**
- Form renders with all fields.
- Validation shows errors for empty/invalid fields.
- Submit creates operator in MockDB.
- Redirect works.
- `npm run test` + `npm run build` pass.

---

### Task 5: Verification status screen

**Status:** `[ ]`
**Complexity:** Small
**Files to create:** `app/operator/onboarding/status/page.tsx`, `components/operator/VerificationStatus.tsx`

**What to do:**

1. Create page showing current verification status.
2. Three states:
   - **Pending:** "We're reviewing your application. This usually takes 1-2 business days." + CTA: [Go to Dashboard] (can create draft packages).
   - **Verified:** "Congratulations! Your account is verified." + CTA: [Go to Dashboard].
   - **Rejected:** "Your application needs updates." + reason + CTA: [Update Application] → back to form.
3. Read operator status from MockDB.

**Verify:**
- All 3 states render correctly.
- CTAs navigate correctly.
- `npm run test` + `npm run build` pass.

---

## Phase 3: Operator Dashboard (execute after Phase 2)

### Task 6: Dashboard home — enhanced

**Status:** `[ ]`
**Complexity:** Medium
**Files to modify:** `app/operator/dashboard/page.tsx`, `components/operator/OperatorDashboard.tsx`
**Read first:** `docs/APP_STRUCTURE.md` §3 (dashboard wireframe), `docs/UX_GUIDELINES.md` §6 (trust signals)

**What to do:**

1. Replace current inline-request-list dashboard with:
   - **Overview cards** (top row): Published Packages, Active Leads, Offers Sent, Booking Intents.
   - **Recent activity feed** (middle): last 5 events (new lead, offer sent, booking intent).
   - **Quick actions**: [Create Package] [View Leads].
   - **Completeness nudge**: "Your profile is N% complete. Add ATOL to build trust." [Complete Profile →].

2. Move the quote-request list out of dashboard into leads page (Task 9).

3. Stats from Repository (not MockDB directly):
   - Published packages: `Repository.getPackagesByOperator(ctx.userId).filter(p => p.status === 'published').length`
   - Active leads: `Repository.getRequests(ctx).filter(r => r.status === 'open').length`
   - Offers sent: from MockDB offers filtered by operatorId
   - Booking intents: from MockDB bookingIntents filtered by operatorId

**Verify:**
- Dashboard shows 4 stat cards with correct numbers.
- Activity feed shows recent items.
- Quick actions navigate correctly.
- Completeness nudge shows (hardcoded % for now).
- `npm run test` + `npm run build` pass.

---

### Task 7: Package list — wired to real data

**Status:** `[ ]`
**Complexity:** Medium
**Files to modify:** `app/operator/packages/page.tsx`, `components/operator/OperatorPackagesList.tsx`
**Files to modify (maybe):** `components/operator/PackageForm.tsx`
**Read first:** `docs/OPERATOR_ONBOARDING.md` §3 (package fields)

**What to do:**

1. Wire `OperatorPackagesList` to real data from Repository:
   ```typescript
   const packages = Repository.getPackagesByOperator(ctx.userId);
   ```

2. Add filter tabs: All | Published | Draft.
3. Add completeness indicator per package (% of optional fields filled).
4. Add "Duplicate" action per package.
5. Wire Edit → opens PackageForm in overlay with `initialData`.
6. Wire Delete → confirm dialog → `Repository.deletePackage(ctx, id)`.
7. Wire Create → opens PackageForm in overlay (empty).

**Verify:**
- Seed packages appear in list.
- Edit pre-fills form and saves.
- Delete removes with confirmation.
- Create adds new package.
- Filter tabs work.
- `npm run test` + `npm run build` pass.

---

### Task 8: Package creation wizard

**Status:** `[ ]`
**Complexity:** Large
**Files to create:** `components/operator/PackageWizard.tsx`, step components
**Files to modify:** `components/operator/PackageForm.tsx` (replace or enhance)
**Read first:** `docs/OPERATOR_ONBOARDING.md` §3 (every field), §6 (validation), §7 (wizard steps)

**What to do:**

Replace the flat `PackageForm` with a multi-step wizard.

**Steps:**
1. **Basic info:** Title, type (umrah/hajj), season label, date range.
2. **Pricing:** Price per person, price type (from/exact), currency, deposit amount, payment plan toggle.
3. **Hotels:** Makkah hotel (name, stars, distance in metres, image URL, nights). Madinah hotel (same). Total nights auto-computed.
4. **Flights:** Included toggle. If yes: airline, departure airport (dropdown of operator's airports), flight type (direct/1-stop/multi).
5. **Inclusions + rooms:** Visa, flights, transfers, meals, ziyarat, guide checkboxes. Room options: single, double, triple, quad, family.
6. **Policies:** Cancellation policy (textarea, required for publish), refund policy, amendment policy. Group type + size.
7. **Marketing:** Notes (textarea), highlights (up to 5 bullet points, add/remove), image URLs.
8. **Review:** Summary of all sections. Expandable/collapsible. [Save as Draft] or [Publish] (only if operator is verified and all publish-required fields are filled).

**UX:**
- Progress bar at top showing step N of 8.
- [Back] [Next] buttons. [Next] validates current step before proceeding.
- Each step saves to form state (not to DB until final submit).
- If operator is not verified, [Publish] is disabled with tooltip: "Complete verification first."

**Validation per step:**
- Step 1: title required (5-120 chars), type required, at least one date.
- Step 2: price required (> 0), currency required.
- Step 3: hotel names required (for publish), stars required, distance required, nights > 0.
- Step 4: if included, at least airline or airport.
- Step 5: at least one room option selected.
- Step 6: cancellation policy required (for publish, 10-1000 chars).
- Step 7: optional.
- Step 8: review only.

**Verify:**
- All 8 steps navigate correctly.
- Validation blocks [Next] with inline errors.
- Save as Draft works (creates package with status 'draft').
- Publish works (creates with status 'published') if operator is verified.
- Saved package appears in `/operator/packages` list.
- `npm run test` + `npm run build` pass.

---

### Task 9: Leads / enquiries page

**Status:** `[ ]`
**Complexity:** Medium
**Files to create:** `app/operator/leads/page.tsx`, `components/operator/LeadsList.tsx`
**Files to modify:** `components/operator/OfferForm.tsx` (enhance)

**What to do:**

1. Create dedicated leads page at `/operator/leads`.
2. List incoming quote requests (from Repository.getRequests):
   - Card per request: type, season, dates, budget, departure city, nights, hotel preference.
   - Status badge: "New" (open, no offer from this operator), "Responded" (has offer), "Closed".
   - Sort: newest first.
   - Filter: All | New | Responded.
3. Click [View & Respond] → opens overlay with:
   - Request details (read-only top section).
   - If not responded: OfferForm (enhanced with hotel names, airline, departure airport fields).
   - If responded: show the offer sent (read-only).
4. Enhance `OfferForm`:
   - Add hotel name fields (Makkah, Madinah).
   - Add airline, departure airport.
   - Add notes/pitch textarea.
   - Pre-fill from request preferences.

**Verify:**
- Leads page shows requests.
- Filter/sort work.
- Respond flow creates offer in MockDB.
- Already-responded shows read-only offer.
- `npm run test` + `npm run build` pass.

---

### Task 10: Operator profile editor

**Status:** `[ ]`
**Complexity:** Medium
**Files to create:** `app/operator/profile/page.tsx`, `components/operator/OperatorProfileForm.tsx`
**Files to modify:** `lib/api/repository.ts`

**What to do:**

1. Create profile editor at `/operator/profile`.
2. Pre-fill form with current operator data from MockDB.
3. Editable fields (same as registration form + branding):
   - Company name, trading name, registration #.
   - ATOL, ABTA.
   - Contact email, phone, address.
   - Website, logo URL, primary colour.
   - Serving regions, departure airports.
4. Non-editable: verification status (display only), ID.
5. Completeness score display with guidance:
   - "Add ATOL number to increase trust with travellers."
   - "Upload a logo for brand visibility on package cards."
6. CTA: [Save Changes].
7. Repository: add `Repository.updateOperator(ctx, id, updates)`.

**Verify:**
- Form pre-fills with operator data.
- Save updates MockDB.
- Completeness score reflects filled fields.
- `npm run test` + `npm run build` pass.

---

## Phase 4: Public Flow Enhancement (execute after Phase 3)

### Task 11: Package cards show operator info

**Status:** `[ ]`
**Complexity:** Small
**Files to modify:** `components/search/PackageCard.tsx`, `components/search/PackageList.tsx`
**Read first:** `docs/UX_GUIDELINES.md` §2 (card design), §6 (trust signals)

**What to do:**

1. Pass operator data to PackageCard (resolve operatorId → operator name + verified status).
2. Add to card: operator name, verified badge (green checkmark), ATOL number (subtle).
3. Add hotel names if available (from new Package fields).
4. Add departure airport badge.
5. Follow card layout from UX_GUIDELINES.md.

**Verify:**
- Cards show operator name + verified badge.
- Hotel names display.
- `npm run test` + `npm run build` pass.

---

### Task 12: Enhanced operator public profile

**Status:** `[ ]`
**Complexity:** Small
**Files to modify:** `components/operators/OperatorProfileDetail.tsx`, `app/operators/[slug]/page.tsx`
**Read first:** `docs/UX_GUIDELINES.md` §6 (trust signals), `docs/SEO.md` §2 (dynamic meta), §3 (Organization JSON-LD)

**What to do:**

1. Show new operator fields: ATOL, ABTA, years in business, serving regions, departure airports.
2. Add verified badge.
3. Add TravelAgency JSON-LD structured data.
4. Improve meta tags with `generateMetadata`.

**Verify:**
- Profile shows all available operator info.
- JSON-LD renders in page source.
- `npm run test` + `npm run build` pass.

---

### Task 13: SEO structured data

**Status:** `[ ]`
**Complexity:** Medium
**Files to create:** `lib/seo/json-ld.ts`
**Files to modify:** `app/packages/[slug]/page.tsx`, `app/operators/[slug]/page.tsx`, `app/search/packages/page.tsx`
**Read first:** `docs/SEO.md` §3 (all JSON-LD specs)

**What to do:**

1. Create `lib/seo/json-ld.ts` with helper functions:
   - `packageJsonLd(pkg, operator)` → Product schema.
   - `operatorJsonLd(operator)` → TravelAgency schema.
   - `searchResultsJsonLd(results)` → ItemList schema.
   - `breadcrumbJsonLd(items)` → BreadcrumbList schema.
2. Wire into pages via `<script type="application/ld+json">`.
3. Update sitemap to include dynamic package + operator pages.

**Verify:**
- View page source on `/packages/[slug]` → JSON-LD present.
- Run Google Structured Data Testing Tool.
- `npm run test` + `npm run build` pass.

---

## Phase 5: Polish & Merge (execute last)

### Task 14: Validation utility

**Status:** `[ ]`
**Complexity:** Small
**Files to create:** `lib/validation.ts`

**What to do:**

1. Create reusable validation functions:
   - `validateEmail(email: string): string | null` — returns error or null.
   - `validatePhone(phone: string): string | null`.
   - `validateRequired(value: string, fieldName: string): string | null`.
   - `validateLength(value: string, min: number, max: number, fieldName: string): string | null`.
   - `validateOperatorForPublish(operator: OperatorProfile): string[]` — returns list of errors.
   - `validatePackageForDraft(pkg: Partial<Package>): string[]`.
   - `validatePackageForPublish(pkg: Partial<Package>): string[]`.
2. Unit tests for all validators.

**Verify:**
- All validators have tests.
- `npm run test` passes.

---

### Task 15: Unit tests for new components

**Status:** `[ ]`
**Complexity:** Medium
**Files to create:** `tests/operator-*.test.ts`

**What to do:**

1. Test `OperatorRegistrationForm` renders all fields, validates, submits.
2. Test `OperatorPackagesList` renders packages, filter works.
3. Test `PackageWizard` step navigation, validation per step.
4. Test `Repository.createOperator`, `Repository.updateOperator`.
5. Test validation functions from `lib/validation.ts`.

**Verify:**
- All new tests pass.
- No existing tests break.

---

### Task 16: E2E smoke test for operator flow

**Status:** `[ ]`
**Complexity:** Small
**Files to create/modify:** `e2e/operator.spec.ts`

**What to do:**

1. E2E test: navigate to `/operator/onboarding` → fill form → submit → see status page.
2. E2E test: navigate to `/operator/packages` → see package list → click create → wizard opens.
3. E2E test: navigate to `/operator/dashboard` → see stats.

**Verify:**
- `npx playwright test e2e/operator.spec.ts` passes.

---

### Task 17: Final integration test + push

**Status:** `[ ]`
**Complexity:** Small

**What to do:**

1. `npm run test` — all unit tests pass.
2. `npm run build` — production build succeeds.
3. `npm run dev` — manual smoke:
   - `/` → landing loads.
   - `/umrah` → search form works.
   - `/search/packages` → cards show operator names + badges.
   - `/packages/[slug]` → detail page loads with operator section.
   - `/operator/onboarding` → registration form works.
   - `/operator/dashboard` → stats + sidebar nav.
   - `/operator/packages` → list + create + edit + delete.
   - `/operator/leads` → leads list + respond.
   - `/operator/profile` → profile editor.
4. Update `docs/NOW.md` with final state.
5. Update this file — mark all tasks `[x]`.
6. Update `docs/APP_STRUCTURE.md` — change all `[TODO]` to `[DONE]`.
7. `git add -A && git commit -m "feat: operator dashboard + onboarding + package wizard"`.
8. `git push`.

---

## Quick reference: execution order

```
Phase 1 (Foundation)
  Task 1  → Evolve types
  Task 2  → Update seed data
  Task 3  → Operator layout + sidebar

Phase 2 (Onboarding)
  Task 4  → Registration form
  Task 5  → Verification status

Phase 3 (Dashboard)
  Task 6  → Dashboard home enhanced
  Task 7  → Package list wired
  Task 8  → Package wizard (largest task)
  Task 9  → Leads page
  Task 10 → Profile editor

Phase 4 (Public Enhancement)
  Task 11 → Package cards + operator info
  Task 12 → Public operator profile
  Task 13 → SEO structured data

Phase 5 (Polish & Merge)
  Task 14 → Validation utility
  Task 15 → Unit tests
  Task 16 → E2E tests
  Task 17 → Final integration + push
```

---

## For the AI executing these tasks

1. **Before starting any task:** Read this file, find the first `[ ]` task, mark it `[~]`.
2. **Read the task spec completely** including "Read first" docs.
3. **Build it.** Follow the spec exactly. Use components from `docs/UX_GUIDELINES.md`.
4. **Test it.** `npm run test` + `npm run build` must pass after every task.
5. **Mark it done.** Change `[~]` to `[x]` with today's date.
6. **Update `docs/NOW.md`** with what changed.
7. **Move to the next task.** Do not skip ahead.

If a task fails or a dependency is missing, note it in the task status and move to the next independent task. Flag the blocker.
