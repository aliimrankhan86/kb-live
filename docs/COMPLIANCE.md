# UK Compliance & Data Protection

This document maps PilgrimCompare's data handling, security, and consumer practices to UK legal requirements.

---

## 1. GDPR (UK GDPR post-Brexit)

### 1.1 Lawful basis for processing

| Purpose                           | Lawful Basis        | Notes                                                      |
| --------------------------------- | ------------------- | ---------------------------------------------------------- |
| User registration & auth          | Contract            | Necessary to provide the service                           |
| Operator profile & verification   | Legitimate interest | To verify travel operators for consumer safety             |
| Booking intent & payment evidence | Contract            | Facilitating pilgrimage bookings                           |
| Complaint handling                | Legal obligation    | Consumer protection requirements                           |
| Audit logs                        | Legal obligation    | Financial record-keeping                                   |
| Marketing communications          | Consent             | Explicit opt-in via signup checkbox; stored with timestamp |
| Cookie preferences                | Consent             | Banner with granular essential/analytics choice            |

### 1.2 Data residency

- **Primary database**: Supabase Postgres, `eu-west-2` (London)
- **Rationale**: UK/EU data residency aligns with GDPR Article 44 (transfers)
- **No data leaves UK/EU** for core business operations
- Supabase Auth sessions are JWT-based, cookie-only, no localStorage

### 1.3 Data subject rights

| Right                           | Implementation                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Access                          | `Repository.getUserById` — user can view own profile, requests, bookings                                         |
| Rectification                   | `Repository.updateOperator` / user profile edit forms                                                            |
| Erasure (Right to be forgotten) | **TODO**: `Repository.deleteUserData()` to cascade-delete personal data while preserving anonymised audit trails |
| Portability                     | **TODO**: Export user data as JSON via `/api/user/export`                                                        |
| Objection                       | Users can close account; marketing requires explicit consent                                                     |
| Restriction                     | Account can be suspended by admin for compliance review                                                          |

### 1.4 Retention periods

| Data type                   | Retention                           | Rationale                                             |
| --------------------------- | ----------------------------------- | ----------------------------------------------------- |
| User account (active)       | Indefinite                          | Necessary for service                                 |
| User account (deleted)      | 90 days grace                       | Then hard-delete personal data                        |
| Booking intent + evidence   | 90 days                             | MVP retention; auto-purged after `retentionExpiresAt` |
| Flagged evidence (disputes) | Indefinite (until dispute resolved) | Admin `disputeFlag` preserves bytes                   |
| Audit log entries           | 7 years                             | Financial/legal record-keeping                        |
| Complaint records           | 7 years                             | Consumer protection / regulatory requirement          |
| CSV exports                 | 30 days                             | Operator convenience; not primary data                |
| Session cookies             | Session + 7 days refresh            | Auth lifecycle                                        |

### 1.5 Security measures (Article 32)

- **Encryption at rest**: Supabase Postgres (AES-256)
- **Encryption in transit**: TLS 1.3
- **Access control**: Role-based (RBAC) + Row Level Security (RLS) deny-by-default
- **Pseudonymisation**: User IDs are UUIDs; no PII in audit log metadata
- **Regular testing**: Automated test suite (94 tests), `npm audit` on every build

### 1.6 Data breach response

1. **Detection**: Monitor Supabase logs, application error tracking
2. **Assessment**: Determine scope within 24 hours
3. **Notification**: ICO within 72 hours if high risk (Article 33)
4. **Communication**: Affected users without undue delay (Article 34)
5. **Documentation**: Record in incident log, review security controls

---

## 2. Consumer Rights (UK)

### 2.1 Package Travel Regulations 2018

- PilgrimCompare is a **comparison platform**, not the package organiser
- The **operator** is the contractual counterparty for the traveller
- Clear disclosure on every page: _"PilgrimCompare does not collect customer funds. You pay the operator directly."_
- Operator ATOL/ABTA numbers displayed where available
- No "best price" or "guaranteed availability" claims

### 2.2 ATOL / ABTA protection

| Signal         | Where shown                              | Implementation                          |
| -------------- | ---------------------------------------- | --------------------------------------- |
| ATOL number    | Package detail (prominent badge + panel) | From `OperatorProfile.atolNumber`       |
| ABTA member    | Package detail (prominent badge + panel) | From `OperatorProfile.abtaMemberNumber` |
| No protection  | Package detail (alert banner)            | Shown when both fields absent           |
| Verified badge | Card, detail, comparison                 | `verificationStatus === 'verified'`     |

**Operator registration requirement:**

- ATOL/ABTA fields are collected during operator onboarding (`OperatorRegistrationForm`)
- A mandatory "Financial Protection Disclosure" section explains ATOL, ABTA, and no-protection scenarios
- Operators must check a checkbox acknowledging that PilgrimCompare displays their protection status prominently and that PilgrimCompare does not verify credentials
- The checkbox is validated — form cannot submit without acknowledgment

**Traveller-facing disclosure:**

- Package detail page shows a **green badge** when ATOL/ABTA is present (with numbers)
- Package detail page shows a **red alert banner** when no protection is listed
- A dedicated "Important — Your Protection" panel explains:
  - The operator (not PilgrimCompare) is the seller
  - What ATOL/ABTA means for the traveller
  - A clear warning if no protection is listed
  - A liability disclaimer stating PilgrimCompare does not verify credentials

**Liability limitation (UK law compliant):**

- "PilgrimCompare is a comparison platform. We do not verify ATOL/ABTA credentials and are not responsible for the operator's financial protection status."
- "Your contract is directly with the operator. Always confirm protection details in writing before paying."
- This appears on every package detail page and in the operator registration form

### 2.3 Cooling-off / cancellation

- BookingIntent creation is a **non-binding expression of interest**
- No payment collected by PilgrimCompare
- Cancellation terms are between traveller and operator
- Complaint mechanism available for disputes

### 2.4 Pricing transparency

- Price always shows "from" or "exact" indicator (`priceType`)
- Currency is GBP for MVP; multi-currency infra built but hidden
- All inclusions explicitly listed (visa, flights, transfers, meals)

---

## 3. Financial Services

### 3.1 Payment handling

- **PilgrimCompare never holds customer funds**
- Payment instructions are delivered in-app only (`delivery: 'in_app_only'`)
- Bank details are repository-gated to BookingIntent parties
- Bank changes require admin review + cooling period + audit logging
- Evidence bytes are RBAC-restricted and auto-purged after 90 days

### 3.2 Anti-money laundering (AML)

- Operator verification requires company registration number
- ATOL/ABTA numbers cross-checked where provided
- Audit log is append-only and immutable
- Suspicious activity can be flagged by admin

---

## 4. Accessibility (Equality Act 2010)

- WCAG 2.2 Level AA compliance required
- All interactive elements have `data-testid` for automated testing
- Form inputs have labels, `aria-required`, `role="alert"` for errors
- Colour contrast meets 4.5:1 ratio (dark theme validated)
- Keyboard navigation supported
- Screen reader support for dynamic content (`aria-live="polite"`)

---

## 5. Cookies & Tracking

### 5.1 Current state (MVP)

| Cookie                | Purpose             | Type       | Duration             |
| --------------------- | ------------------- | ---------- | -------------------- |
| Supabase auth session | Authentication      | Essential  | Session + 7d refresh |
| `kb_language`         | Language preference | Preference | Persistent           |

### 5.2 Cookie consent banner (implemented)

- **Component:** `components/compliance/CookieConsent.tsx`
- **Granular control:** Essential only / Accept all / Manage details
- **Consent record:** Stored in `localStorage` as `kb_cookie_consent_v1`
- **Revocable:** Users can clear localStorage or contact us
- **Accessible:** `role="dialog"`, `aria-label="Cookie consent"`, `aria-modal="true"`
- **Links:** Direct links to `/privacy` and `/terms` from the banner
- **Cookie table:** Detailed breakdown of cookie purpose and duration

### 5.3 Future (post-MVP)

- Analytics cookies (Google Analytics, etc.) require **explicit consent**
- Cookie consent sync with server-side user record (Prisma `cookieConsentAnalytics`)
- Consent preference centre in user settings

---

## 6. Compliance Checklist

| Item                                     | Status  | Evidence                                           |
| ---------------------------------------- | ------- | -------------------------------------------------- |
| Privacy policy page                      | ✅ DONE | `/privacy` route with full UK GDPR disclosure      |
| Terms of service page                    | ✅ DONE | `/terms` route with ATOL/ABTA, consumer rights     |
| Cookie consent banner                    | ✅ DONE | `CookieConsent` component with granular choices    |
| Marketing consent capture                | ✅ DONE | Sign-up form with explicit opt-in checkbox         |
| Data retention table                     | ✅ DONE | Documented in Privacy Policy and COMPLIANCE.md     |
| Data export endpoint                     | ❌ TODO | `/api/user/export`                                 |
| Account deletion flow                    | ❌ TODO | `/settings/delete-account`                         |
| DPIA (Data Protection Impact Assessment) | ❌ TODO | Document for operator verification process         |
| ICO registration                         | ❌ TODO | Required if processing personal data as controller |
| ATOL verification integration            | ❌ TODO | CAA ATOL lookup API                                |
| ABTA verification integration            | ❌ TODO | ABTA member lookup                                 |
| Footer with legal links                  | ✅ DONE | `Footer` component on all pages via layout         |

---

## 7. Reference Code Policy (Booking Intent)

- Every BookingIntent generates a unique immutable reference code (`PC-XXXXX`)
- **Traveller obligation**: Must provide the reference code when paying the operator
- **Consequence of omission**: If the reference is not provided, PilgrimCompare cannot verify the booking originated through our platform. Any dispute becomes a matter solely between the traveller and the operator. PilgrimCompare will not offer assistance, mediation, or complaint routing.
- **Terms coverage**: Section 7 (Booking reference and payment) of `/terms` documents this clearly
- **UI coverage**: `PaymentInstructions` component displays the reference prominently with a warning callout

## 8. ATOL/ABTA Transparency

### 8.1 Operator registration

- ATOL and ABTA fields are collected during `OperatorRegistrationForm`
- Mandatory `atolAbtaAcknowledged` checkbox: operator confirms they understand PilgrimCompare will display their protection status (or lack thereof) prominently
- Financial Protection Disclosure section explains ATOL, ABTA, and no-protection scenarios

### 8.2 Package detail page

- **Individual badges**: ATOL and ABTA shown as separate badges when each is present
- **Green badge** with ✓ for each protection type, showing the actual number
- **Red warning banner** with ⚠ only when neither ATOL nor ABTA is listed
- **"Important — Your Protection" panel** explains:
  - The operator (not PilgrimCompare) is the seller
  - What ATOL/ABTA means for the traveller
  - Clear warning if no protection is listed
  - Liability disclaimer: PilgrimCompare does not verify credentials

### 8.3 Operator verification (post-MVP)

- Real-time ATOL/ABTA API verification is planned for post-MVP
- Current approach: operator-provided numbers displayed as-is with prominent transparency disclaimers

## 9. Review Schedule

- **Quarterly**: Review retention periods, access logs, audit findings
- **Annually**: Full GDPR compliance audit, update privacy policy
- **On incident**: Immediate review of security controls and breach response

---

_Last updated: 2026-06-05_
_Next review: 2026-09-05_
