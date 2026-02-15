# Operator Onboarding & Package Data Specification

This document defines every piece of data a travel operator must provide to become a KaabaTrip partner, and exactly how that data helps travellers choose the right package. It is the single source of truth for the operator-facing forms, validation rules, and the data contract between operator and traveller.

---

## 1. Why this matters

Travellers spend £1,000-£5,000+ on pilgrimage. They compare 5-15 packages before choosing one. The quality and completeness of operator data directly determines:

- **Conversion:** Packages with complete data get 3-5x more enquiries than sparse ones.
- **Trust:** Verified operators with ATOL numbers convert at higher rates.
- **Comparison quality:** Users can only compare what operators provide. Missing fields hurt the comparison UX and reduce confidence.

---

## 2. Operator registration (company onboarding)

### Mandatory fields

Every operator must provide these before their account is activated. No packages can be published without them.

| Field | Type | Validation | Why travellers need it |
|-------|------|-----------|----------------------|
| **Company name** | `string` | 2-100 chars, no HTML | Who they're buying from |
| **Trading name** | `string?` | Optional, used if different from company name | Brand recognition |
| **Company registration number** | `string` | UK: 8 digits, varies by country | Legal entity verification |
| **ATOL number** | `string?` | UK: numeric, 4-5 digits. Required if flights included | Financial protection — most important UK trust signal |
| **ABTA member number** | `string?` | UK: letter + 4-5 digits (e.g., Y1234) | Additional trust signal |
| **Contact email** | `string` | Valid email format | Primary communication channel |
| **Contact phone** | `string` | Valid phone with country code | Direct contact for urgent queries |
| **Office address** | `object` | `{ line1, line2?, city, postcode, country }` | Physical presence = trust |
| **Website URL** | `string?` | Valid URL, https preferred | Cross-verification by travellers |
| **Company logo** | `string (URL)` | PNG/SVG, min 200x200px, max 2MB | Brand identity on cards and profiles |
| **Serving regions** | `string[]` | At least one from: `['UK', 'EU', 'US', 'ME', 'SA', 'global']` | Filters packages by traveller location |
| **Departure airports** | `string[]` | IATA codes, at least one (e.g., `['LHR', 'MAN', 'BHX']`) | Matches traveller's nearest airport |
| **Years in business** | `number` | Min 0, whole number | Experience signal for travellers |
| **Pilgrimage types offered** | `('umrah' \| 'hajj')[]` | At least one | Determines which search results include them |

### Enhanced TypeScript interface

```typescript
export interface OperatorProfile {
  id: string;
  userId: string; // linked to User.id
  
  // Identity (mandatory)
  companyName: string;
  tradingName?: string;
  slug: string; // auto-generated, url-friendly
  
  // Verification (mandatory)
  companyRegistrationNumber: string;
  verificationStatus: VerificationStatus; // set by admin
  verifiedAt?: string; // ISO date, set by admin
  
  // Licensing (conditional: ATOL required if flights included)
  atolNumber?: string;
  abtaMemberNumber?: string;
  
  // Contact (mandatory)
  contactEmail: string;
  contactPhone: string;
  officeAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string; // ISO 3166-1 alpha-2
  };
  websiteUrl?: string;
  
  // Branding
  branding: {
    logoUrl?: string;
    primaryColor?: string; // hex
  };
  
  // Business info (mandatory)
  servingRegions: string[]; // ['UK', 'EU', 'US', 'ME', 'SA', 'global']
  departureAirports: string[]; // IATA codes
  yearsInBusiness: number;
  pilgrimageTypesOffered: ('umrah' | 'hajj')[];
  
  // Platform metadata
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  packageCount: number; // computed, for display
}
```

### Verification flow

```
1. Operator registers → status: 'pending'
2. Admin reviews company registration + ATOL → status: 'verified' or 'rejected'
3. Only 'verified' operators can publish packages
4. Packages from 'pending' operators are saved as 'draft'
5. 'rejected' operators can resubmit with corrected information
```

---

## 3. Package data (what operators provide per package)

### Mandatory vs optional fields

Fields marked **M** are mandatory for publishing. Fields marked **O** are optional but improve comparison quality and conversion.

### Section A: Basic info

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Title** | M | `string` | 5-120 chars, descriptive | Card headline, detail page H1, search result |
| **Pilgrimage type** | M | `'umrah' \| 'hajj'` | Must match operator's offered types | Type filter, search categorisation |
| **Season label** | O | `string` | e.g., "Ramadan 2026", "Hajj 2026" | Season filter, card subtitle |
| **Date window start** | M | `string (ISO)` | Must be future date | Sort by departure, date filter |
| **Date window end** | M | `string (ISO)` | Must be after start | Duration calculation |
| **Status** | M | `'draft' \| 'published'` | Only admin-verified operators can publish | Not shown to traveller |

### Section B: Pricing (the #1 decision factor)

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Price per person** | M | `number` | Min 1, max 50,000 | Prominent on card, sortable |
| **Price type** | M | `'exact' \| 'from'` | — | "From £1,200" vs "£1,200" |
| **Currency** | M | `string` | ISO 4217: `'GBP' \| 'USD' \| 'EUR' \| 'SAR'` | Converted to user's currency |
| **Deposit amount** | O | `number` | Min 0, max price | "£200 deposit to secure" |
| **Payment plan available** | O | `boolean` | — | "Monthly payments available" badge |
| **What's included in price** | O | `string` | Max 500 chars, plain text | Tooltip or detail breakdown |
| **What's NOT included** | O | `string` | Max 500 chars, plain text | Transparency — reduces complaints |

### Section C: Accommodation (the #2 decision factor — proximity to Haram)

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Makkah hotel name** | M | `string` | 2-100 chars | Card, detail page — users Google it |
| **Makkah hotel stars** | M | `3 \| 4 \| 5` | — | Star rating visual on card |
| **Makkah distance to Haram** | M | `number` (metres) | 0-10000 | "200m to Haram" or "5 min walk" |
| **Makkah distance band** | Auto | `'near' \| 'medium' \| 'far'` | Computed: <500m=near, 500-1500m=medium, >1500m=far | Filter, card label |
| **Makkah hotel image URL** | O | `string` | Valid URL, HTTPS | Card thumbnail, detail gallery |
| **Makkah nights** | M | `number` | 1-30 | "5 nights in Makkah" |
| **Madinah hotel name** | M | `string` | Same as Makkah | Same presentation |
| **Madinah hotel stars** | M | `3 \| 4 \| 5` | — | Same |
| **Madinah distance to Haram** | M | `number` (metres) | 0-10000 | Same |
| **Madinah distance band** | Auto | `'near' \| 'medium' \| 'far'` | Same logic | Same |
| **Madinah hotel image URL** | O | `string` | Same | Same |
| **Madinah nights** | M | `number` | 1-30 | "3 nights in Madinah" |
| **Total nights** | Auto | `number` | Computed: Makkah + Madinah | Card, filter |

### Section D: Flights (if included)

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Flights included** | M | `boolean` | — | "Flights included" or "Flights not included" |
| **Airline** | O | `string` | Name of carrier | "Saudia" — users care about carrier |
| **Departure airport** | O | `string` | IATA code (e.g., LHR) | "From London Heathrow" |
| **Flight type** | O | `'direct' \| 'one-stop' \| 'multi-stop'` | — | "Direct flight" badge |
| **Outbound date** | O | `string (ISO)` | — | "Departs 15 Mar" |
| **Return date** | O | `string (ISO)` | — | "Returns 25 Mar" |

### Section E: Inclusions (what's covered)

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Visa** | M | `boolean` | — | ✓/✗ icon |
| **Flights** | M | `boolean` | — | ✓/✗ icon |
| **Airport transfers** | M | `boolean` | — | ✓/✗ icon |
| **Meals** | M | `boolean` | — | ✓/✗ icon |
| **Ziyarat tours** | O | `boolean` | — | ✓/✗ icon — visits to holy sites |
| **Religious guide/scholar** | O | `boolean` | — | "Guided by scholar" badge |
| **Laundry** | O | `boolean` | — | Detail page only |
| **SIM card / WiFi** | O | `boolean` | — | Detail page only |

### Section F: Room options

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Single room** | M | `boolean` | — | Room type selector |
| **Double room** | M | `boolean` | — | Same |
| **Triple room** | M | `boolean` | — | Same |
| **Quad room** | M | `boolean` | — | Same |
| **Family room** | O | `boolean` | — | Same |

### Section G: Policies (builds trust)

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Cancellation policy** | M | `string` | Max 1000 chars, plain text | Critical for booking confidence |
| **Refund policy** | O | `string` | Max 500 chars | Detail page |
| **Amendment policy** | O | `string` | Max 500 chars | Can I change dates? |
| **Group size** | O | `'private' \| 'small-group' \| 'large-group'` | — | "Private trip" vs "Group of 20" |
| **Min/max group size** | O | `{ min: number, max: number }` | — | "Groups of 10-25 people" |

### Section H: Operator notes

| Field | Req | Type | Validation | How users see it |
|-------|-----|------|-----------|-----------------|
| **Notes** | O | `string` | Max 2000 chars, no HTML, sanitised | Free text pitch on detail page |
| **Highlights** | O | `string[]` | Max 5 items, max 80 chars each | Bullet points on card: "✓ Walking distance", "✓ Saudia direct flights" |

---

## 4. Enhanced Package TypeScript interface

This is the target schema. Current `lib/types.ts` needs to evolve toward this.

```typescript
export interface Package {
  id: string;
  operatorId: string;
  
  // Basic info
  title: string;
  slug: string;
  status: 'draft' | 'published';
  pilgrimageType: 'umrah' | 'hajj';
  seasonLabel?: string;
  dateWindow: {
    start: string; // ISO date
    end: string;   // ISO date
  };
  
  // Pricing
  pricePerPerson: number;
  priceType: 'exact' | 'from';
  currency: string; // ISO 4217
  depositAmount?: number;
  paymentPlanAvailable?: boolean;
  priceIncludes?: string;  // plain text
  priceExcludes?: string;  // plain text
  
  // Accommodation — Makkah
  hotelMakkah: {
    name: string;
    stars: 3 | 4 | 5;
    distanceToHaramMetres: number;
    distanceBand: 'near' | 'medium' | 'far'; // computed
    imageUrl?: string;
    nights: number;
  };
  
  // Accommodation — Madinah
  hotelMadinah: {
    name: string;
    stars: 3 | 4 | 5;
    distanceToHaramMetres: number;
    distanceBand: 'near' | 'medium' | 'far'; // computed
    imageUrl?: string;
    nights: number;
  };
  
  totalNights: number; // computed: hotelMakkah.nights + hotelMadinah.nights
  
  // Flights
  flights?: {
    included: boolean;
    airline?: string;
    departureAirport?: string; // IATA code
    flightType?: 'direct' | 'one-stop' | 'multi-stop';
    outboundDate?: string;
    returnDate?: string;
  };
  
  // Inclusions
  inclusions: {
    visa: boolean;
    flights: boolean;
    transfers: boolean;
    meals: boolean;
    ziyarat?: boolean;
    guide?: boolean;
    laundry?: boolean;
    simCard?: boolean;
  };
  
  // Room options
  roomOptions: {
    single: boolean;
    double: boolean;
    triple: boolean;
    quad: boolean;
    family?: boolean;
  };
  
  // Policies
  cancellationPolicy: string;
  refundPolicy?: string;
  amendmentPolicy?: string;
  groupType?: 'private' | 'small-group' | 'large-group';
  groupSize?: { min: number; max: number };
  
  // Marketing
  notes?: string;
  highlights?: string[]; // max 5
  images?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### Migration path from current schema

The current `lib/types.ts` Package interface is a subset. Evolve incrementally:

| Phase | Changes | Backward compatible? |
|-------|---------|---------------------|
| **Phase 1 (now)** | Add optional fields: `highlights`, `cancellationPolicy`, hotel name fields, `flights` object | Yes — all new fields optional |
| **Phase 2** | Restructure hotels into `hotelMakkah`/`hotelMadinah` objects | Breaking — needs migration of mock data + repository |
| **Phase 3** | Add operator `departureAirports`, `atolNumber`, `servingRegions` | Yes — optional operator fields |
| **Phase 4** | Make new fields mandatory for publish, keep optional for draft | No breaking change if validation is at publish-time |

---

## 5. How data maps to the user's decision

This table shows which operator-provided data appears where in the traveller UI, and why.

| Data field | Package card | Detail page | Comparison | Why it helps decide |
|-----------|-------------|-------------|------------|-------------------|
| Price | ✅ Prominent | ✅ Header | ✅ Row | Budget fit |
| Operator name | ✅ | ✅ Full section | ✅ Column header | Trust |
| Verified badge | ✅ | ✅ | ✅ | Trust |
| ATOL number | ✅ Subtle | ✅ Prominent | ✅ | Financial protection |
| Hotel names | ✅ | ✅ | ✅ | Users Google the hotel |
| Hotel stars | ✅ | ✅ | ✅ | Comfort expectation |
| Distance to Haram | ✅ | ✅ | ✅ | The #1 factor for pilgrims |
| Nights split | ✅ | ✅ | ✅ | Balance of stay |
| Inclusions | ✅ Icons | ✅ Full list | ✅ Checkmarks | Hidden cost awareness |
| Airline | — | ✅ | ✅ | Carrier preference |
| Departure airport | ✅ Badge | ✅ | ✅ | Convenience / location match |
| Cancellation policy | — | ✅ | ✅ | Risk comfort |
| Deposit | — | ✅ | ✅ | Cash flow planning |
| Payment plan | ✅ Badge | ✅ | — | Affordability |
| Highlights | ✅ Top 2 | ✅ All | — | Quick differentiator |
| Group type | — | ✅ | ✅ | Private vs group preference |
| Ziyarat | ✅ Icon | ✅ | ✅ | Spiritual experience |
| Guide/scholar | ✅ Badge | ✅ | ✅ | Religious guidance |

---

## 6. Validation rules summary

### For operator registration

```
companyName:              required, 2-100 chars, trimmed
companyRegistrationNumber: required, format varies by country
contactEmail:             required, valid email
contactPhone:             required, valid phone with country code
officeAddress:            required, all sub-fields except line2
servingRegions:           required, at least one
departureAirports:        required, at least one valid IATA code
pilgrimageTypesOffered:   required, at least one
atolNumber:               required IF any package includes flights AND serving UK
```

### For package creation (draft)

```
title:            required, 5-120 chars
pilgrimageType:   required, 'umrah' or 'hajj'
pricePerPerson:   required, > 0
currency:         required, valid ISO 4217
```

### For package publishing

All draft requirements PLUS:

```
dateWindow.start:            required, future date
dateWindow.end:              required, after start
hotelMakkah.name:            required
hotelMakkah.stars:           required, 3-5
hotelMakkah.distanceToHaramMetres: required, 0-10000
hotelMakkah.nights:          required, > 0
hotelMadinah.name:           required
hotelMadinah.stars:          required, 3-5
hotelMadinah.distanceToHaramMetres: required, 0-10000
hotelMadinah.nights:         required, > 0
inclusions:                  all boolean fields required
roomOptions:                 all boolean fields required, at least one true
cancellationPolicy:          required, 10-1000 chars
operator.verificationStatus: must be 'verified'
```

---

## 7. Onboarding UX flow

### Step 1: Register

```
┌──────────────────────────────────────┐
│ Join KaabaTrip as a Travel Operator  │
│──────────────────────────────────────│
│ Company name: [__________________]   │
│ Registration #: [________________]   │
│ ATOL #: [________________________]   │
│ Contact email: [_________________]   │
│ Contact phone: [_________________]   │
│ Office address: [________________]   │
│ Regions you serve: [UK ✓] [EU] [US]  │
│ Departure airports: [LHR] [MAN] [+] │
│──────────────────────────────────────│
│ [Submit for verification]            │
└──────────────────────────────────────┘
```

### Step 2: Await verification

```
┌──────────────────────────────────────┐
│ ⏳ Verification in progress          │
│                                      │
│ We're checking your company details. │
│ This usually takes 1-2 business days.│
│                                      │
│ You can create draft packages while  │
│ you wait.                            │
│                                      │
│ [Create your first package →]        │
└──────────────────────────────────────┘
```

### Step 3: Create package (wizard)

Multi-step form matching sections A-H above. Progress indicator shows completion.

```
Step 1: Basic info (title, type, dates)
Step 2: Pricing (price, currency, deposit, payment plan)
Step 3: Hotels (Makkah + Madinah: name, stars, distance, image)
Step 4: Flights (if included: airline, airport, type)
Step 5: Inclusions (checkboxes for all items)
Step 6: Room options + group type
Step 7: Policies (cancellation, refund, amendment)
Step 8: Marketing (notes, highlights, images)
Step 9: Review & publish (or save as draft)
```

### Step 4: Package published

Dashboard shows published packages with:
- View count / enquiry count
- Status (draft/published)
- Edit / duplicate / unpublish actions
- Completion score (% of optional fields filled — incentivises data quality)

---

## 8. Completion score (incentivise quality data)

Show operators a "Package completeness" score that drives them to fill optional fields.

| Completeness level | Criteria | Reward |
|-------------------|----------|--------|
| **Bronze** (50%) | All mandatory fields | Listed in search results |
| **Silver** (75%) | + hotel names, airline, departure airport, highlights | "Detailed listing" badge |
| **Gold** (90%) | + images, policies, payment plan info | Featured in search, priority sort |
| **Complete** (100%) | All fields filled | "Complete listing" badge, top of results |

---

## 9. When AI builds operator features

Before working on any operator-facing feature, the AI must:

1. Read this file for the full data specification.
2. Ensure new fields match the TypeScript interface in section 4.
3. Add validation matching section 6.
4. Ensure every form field has a `<label>`, `data-testid`, and error message.
5. Show "Not provided" for optional empty fields in the traveller UI (never blank).
6. Update this file if adding or changing fields.
7. Update `lib/types.ts` to reflect any schema changes.
