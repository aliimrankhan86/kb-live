# Master Review Prompt — PilgrimCompare Codebase Audit

Use this prompt with Claude Code (or any expert AI coding agent) to perform a comprehensive multi-disciplinary review of the entire PilgrimCompare codebase.

---

## Context

PilgrimCompare is a Next.js 15 (App Router) + React 19 + TypeScript web application for comparing Hajj and Umrah packages from verified UK travel operators. It targets Muslim travellers in the UK.

**Stack**: Next.js 15.5.19 · React 19.1.0 · TypeScript (strict) · Tailwind CSS · Supabase + Prisma · Vitest 4.1.8 · Playwright 1.60.0

**Repository**: `/Users/aliimrankhan/Documents/kb-live` (branch: `dev`)

---

## Instructions for the Reviewing AI

Read the entire codebase starting with these entry points, then branch out to all referenced files. Do NOT skim — read every file that is imported or referenced.

**Start here:**

1. `docs/AI_NOTES.md` — project status, architecture, historical decisions
2. `docs/NOW.md` — current session state and verification checklist
3. `.clinerules` — coding standards and guardrails
4. `package.json` — dependencies and scripts
5. `next.config.ts` — build configuration
6. `app/layout.tsx` — root layout
7. `app/page.tsx` — landing page
8. `app/signup/page.tsx` — auth page (recently fixed)
9. `app/umrah/page.tsx` — primary search journey
10. `app/search/packages/page.tsx` — search results
11. `app/packages/[slug]/page.tsx` — package detail
12. `app/operator/dashboard/page.tsx` — operator dashboard
13. `app/admin/complaints/page.tsx` — admin surface
14. `lib/api/repository.ts` — data layer
15. `lib/auth/api.ts` — auth layer
16. `middleware.ts` — route guards

Then read every component, type, utility, and config file referenced by these.

---

## Deliverable Format

Return a single comprehensive report organised into the categories below. Use bullet points with severity ratings where applicable: **[CRITICAL]**, **[HIGH]**, **[MEDIUM]**, **[LOW]**, **[INFO]**.

---

### 1. Technical Architecture Review

_Role: Expert Technical Architect_

Review:

- Folder structure and module boundaries
- Server vs Client Component boundaries (are we defaulting to Server Components?)
- Data flow architecture (Repository pattern, MockDB vs Prisma cutover)
- API route design (RESTful? Consistent error handling?)
- State management (Zustand usage, URL-as-state)
- Build configuration (Turbopack vs webpack, headers, CSP)
- TypeScript strictness (any `any` types? unsafe assertions?)
- Dependency graph (circular imports? barrel file issues?)
- Performance (bundle size, dynamic imports, image optimisation)

Questions to answer:

- Is the architecture scalable to 10k+ packages and 100+ operators?
- What refactoring would reduce coupling?
- Are there singletons or global state that would break in a serverless environment?

---

### 2. Information Architecture Review

_Role: Expert Information Architect_

Review:

- URL structure and route hierarchy
- Navigation hierarchy (header, footer, breadcrumbs)
- Content organisation on each page
- Search and filter architecture
- Data model alignment with UI (Prisma schema vs types vs UI)
- SEO structure (metadata, sitemap, JSON-LD, canonical URLs)
- URL-driven state (are filters deep-linkable?)

Questions to answer:

- Is the information architecture intuitive for a first-time user?
- Are there content gaps or orphaned pages?
- Does the URL structure support future scaling (e.g., multi-city, multi-country)?

---

### 3. Senior Developer Code Quality Review

_Role: Expert Senior-Level Developer_

Review:

- Code readability and maintainability
- Error handling (are all async operations wrapped? errors swallowed?)
- Type safety (strict null checks, exhaustive switch cases)
- Testing coverage (unit, integration, e2e — what's missing?)
- Edge cases (empty states, loading states, error states)
- Consistency (naming conventions, file organisation)
- Dead code (unused imports, commented code, unused files)
- Git hygiene (commit messages, branch strategy)

Questions to answer:

- What would break if we deployed this to production today?
- Which files have the highest technical debt?
- What is the test coverage gap?

---

### 4. Frontend Engineering Review

_Role: Expert Frontend Developer_

Review:

- React patterns (hooks discipline, memoisation, re-render optimisation)
- CSS architecture (Tailwind vs CSS modules, design tokens)
- Component composition (are components reusable? props interfaces?)
- Accessibility (ARIA labels, keyboard navigation, focus management, colour contrast)
- Responsive design (mobile-first, breakpoints, touch targets)
- Animation and motion (performance, reduced-motion support)
- Asset handling (images, fonts, SVGs)
- Browser compatibility

Questions to answer:

- Are there hydration mismatches between Server and Client Components?
- Is the CSS bundle size optimised?
- Are there any CLS (Cumulative Layout Shift) risks?

---

### 5. UX Design & User Journey Review

_Role: Expert UX Designer and User Journey Expert_

Review:

- Landing page flow (first impression, value proposition clarity)
- Search journey (`/umrah` → `/search/packages` → `/packages/[slug]` → `/quote`)
- Form UX (validation timing, error messaging, progress indication)
- Trust signals (ATOL/ABTA badges, verified operator status, reviews)
- Conversion optimisation (CTA placement, friction points)
- Mobile UX (thumb zones, scroll behaviour, tap targets)
- Empty states and error messages (are they helpful? on-brand?)
- Copy and tone of voice (British English consistency, clarity, persuasiveness)

Questions to answer:

- Where do users drop off in the journey?
- Are there dark patterns or deceptive UX?
- Does the design system support the brand's premium positioning?

---

### 6. Gap Analysis

_Role: Strategic Analyst_

Identify gaps between current implementation and production readiness:

- Missing features vs MVP scope
- Missing integrations (payment, email, analytics, CRM)
- Missing compliance (GDPR data export, account deletion, cookie consent gaps)
- Missing operational tools (operator onboarding, admin dashboards)
- Missing monitoring (error tracking, performance monitoring, logging)
- Missing documentation (API docs, runbooks, onboarding guides)

Prioritise gaps by business impact and engineering effort.

---

### 7. Security Review

_Role: Expert Security Engineer_

Review:

- Authentication flow (Supabase SSR, cookie handling, session expiry)
- Authorisation (RBAC, middleware guards, API route protection)
- Input validation (Zod schemas, SQL injection prevention)
- Output encoding (XSS prevention, CSP effectiveness)
- Secret management (env vars, no client-side secrets)
- Data privacy (GDPR compliance, PII handling, data retention)
- File uploads (if any — validation, size limits, malware scanning)
- CSRF protection
- Rate limiting (missing?)

Questions to answer:

- What is the blast radius if Supabase credentials leak?
- Are there any paths that bypass auth checks?
- Is the CSP strict enough to prevent inline script injection?

---

### 8. Production Readiness Roadmap

_Role: Engineering Lead_

Provide a prioritised checklist of what MUST be done to make this production-ready:

**P0 — Blockers (cannot launch without)**
**P1 — Critical (launch with known issues, fix within 2 weeks)**
**P2 — Important (fix within 1 month)**
**P3 — Nice to have (post-launch)**

For each item:

- What exactly needs to change
- Which files are affected
- Estimated effort
- Risk if not done

---

### 9. Efficiency, Language & Messaging Review

_Role: Copywriter + Performance Optimiser_

Review:

- Page load performance (Core Web Vitals targets)
- Bundle size per route
- Copy efficiency (word count, clarity, scan-ability)
- Messaging consistency (brand voice, value proposition repetition)
- Translation readiness (i18n infrastructure, hardcoded strings)
- Image optimisation (formats, lazy loading, placeholders)
- Font loading strategy (FOIT/FOUT prevention)

Questions to answer:

- Can we reduce the landing page LCP by 50%?
- Is the messaging compelling enough for a 40+ demographic?
- Are there cultural sensitivities in the copy or imagery?

---

## Constraints

- Be brutally honest. Do not sugarcoat.
- Cite specific files and line numbers where possible.
- If a category has no issues, say "No significant issues found" rather than inventing problems.
- Prioritise actionable recommendations over theoretical concerns.
- Respect the `.clinerules` standards (no `any`, GBP only, British English, "5 stars" convention, etc.).

---

## Final Output Structure

```
## Executive Summary
(3-5 bullet points of the most critical findings)

## 1. Technical Architecture
...

## 2. Information Architecture
...

## 3. Senior Developer Code Quality
...

## 4. Frontend Engineering
...

## 5. UX Design & User Journey
...

## 6. Gap Analysis
...

## 7. Security Review
...

## 8. Production Readiness Roadmap
...

## 9. Efficiency, Language & Messaging
...

## Appendix: File-by-File Quick Notes
(One-line notes for every file reviewed, grouped by directory)
```

---

Run this prompt with:

```bash
cd /Users/aliimrankhan/Documents/kb-live
# Then paste the entire prompt into Claude Code
```
