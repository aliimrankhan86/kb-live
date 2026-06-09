# KaabaTrip - Compare Umrah & Hajj Packages from Verified Operators

A UK-focused Next.js platform connecting pilgrims with verified travel operators for Hajj and Umrah packages. Built with production-grade architecture, strict TypeScript, and UK GDPR compliance.

## 🚀 Live Features

- **Package Discovery**: Browse, sort, and filter Umrah packages with real-time filters (budget, dates, hotel stars, distance to Haram, flight type)
- **Umrah Search Form**: 4-step progressive form with real date picker, traveller stepper, hotel star selection, and budget slider
- **Quote Journey**: Request quotes from operators with prefilled package details
- **Booking Intent**: Track high-intent bookings with unique reference codes (`KT-...`)
- **Payment Handoff**: Secure pay-operator-direct flow with evidence upload and bank detail display
- **Operator Dashboard**: Registration, profile management, leads inbox, package CSV import/export, analytics
- **Admin Tools**: Complaint triage, bank change review queue, audit logs
- **UK Compliance**: GDPR privacy policy, terms & conditions, cookie consent banner, marketing consent
- **SEO Optimised**: JSON-LD structured data, dynamic sitemap, city corridor pages (`/umrah/london`, `/umrah/birmingham`, `/umrah/manchester`)
- **Accessibility**: WCAG 2.2 AA, semantic HTML, ARIA labels, keyboard navigation, 44px+ tap targets

## 🛠 Tech Stack

### Core

- **Next.js 15.5** - App Router, Server Components by default
- **React 19** - Latest with concurrent features
- **TypeScript** - Strict mode, zero `any`
- **Tailwind CSS** - Utility-first with custom design tokens

### Backend & Data

- **Supabase** (London `eu-west-2`) - Auth, PostgreSQL, Row Level Security, Storage
- **Prisma ORM** - Type-safe queries, migrations, schema management
- **MockDB** - In-memory store for rapid dev iteration (tests + dev mode)

### Testing & Quality

- **Vitest 4.1.8** - Unit tests (238 tests passing)
- **Testing Library** - React component testing
- **Playwright** - End-to-end testing
- **ESLint** + **Prettier** - Code quality

## 📁 Project Structure

```
kaabatrip/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── umrah/page.tsx            # Umrah search form
│   ├── hajj/page.tsx             # Hajj interest capture (coming soon)
│   ├── search/packages/          # Package search results
│   ├── packages/[slug]/          # Package detail
│   ├── quote/page.tsx            # Quote wizard
│   ├── requests/[id]/            # Request tracker
│   ├── operator/                 # Operator dashboard
│   ├── admin/                    # Admin tools
│   ├── login/, signup/           # Auth pages
│   ├── privacy/, terms/          # Legal pages
│   └── api/                      # API routes
├── components/
│   ├── layout/                   # Header, Footer
│   ├── marketing/                # Hero, CityCorridor
│   ├── search/                   # PackageCard, PackageList, FilterOverlay
│   ├── umrah/                    # UmrahSearchForm
│   ├── operator/                 # Dashboard, Forms, Sidebar
│   ├── operators/                # Public operator profile
│   ├── packages/                 # Package detail
│   ├── request/                  # Quote, Payment, Complaint
│   ├── auth/                     # LoginForm, SignUpForm
│   ├── admin/                    # ComplaintsTriage, AuditLogView
│   ├── compliance/               # CookieConsent
│   └── ui/                       # VerifiedBadge, InclusionChip, Table
├── lib/
│   ├── api/                      # Repository, MockDB, DB Adapter, Prisma client
│   ├── auth/                     # Session, API auth helpers
│   ├── supabase/                 # SSR client, middleware
│   ├── seo/                      # JSON-LD schemas
│   └── i18n/                     # Region/currency formatting
├── docs/                         # Architecture, UX, SEO, Security, Compliance
├── tests/                        # Unit tests
├── e2e/                          # Playwright tests
├── prisma/                       # Schema, seed, migrations
├── supabase/                     # RLS policies, storage buckets
└── styles/                       # Global CSS, design tokens
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone git@github.com:aliimrankhan86/kb-live.git
cd kb-live
npm install
```

### Environment Setup

```bash
cp env.example .env.local
```

Fill in `.env.local` with your Supabase credentials (or leave placeholders for MockDB-only dev):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://...   # PgBouncer connection
DIRECT_URL=postgresql://...     # Direct connection for migrations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FEATURE_USE_REAL_DB=false       # Set true when ready for Supabase
```

### Development

```bash
npm run dev          # Start dev server on 127.0.0.1:3000
npm run dev:clean    # Clear .next cache and restart (fixes chunk 404s)
npm run dev:turbo    # Use Turbopack instead of Webpack
```

### Available Scripts

```bash
# Development
npm run dev          # Dev server
npm run dev:clean    # Clean start (recommended after git pull)
npm run build        # Production build
npm run start        # Production server

# Testing
npm test             # Unit tests (Vitest)
npm run test:watch   # Watch mode
npm run e2e          # Playwright E2E tests

# Code Quality
npm run lint         # ESLint
npm run format       # Prettier

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Prisma Studio GUI
```

## 🎨 Design System

### Color Palette

- **Background**: `#0B0B0B` - Deep black
- **Text**: `#FFFFFF` - Pure white
- **Text Muted**: `rgba(255, 255, 255, 0.64)`
- **Yellow Accent**: `#FFD31D` - Brand yellow
- **Surface Dark**: `#111111`
- **Success**: `#4CAF50`

### Typography

- **Font**: Inter (via next/font) + Exo 2 (display)
- **Mobile-first**: 320px base, scaling to 1280px+

## 🧪 Testing

```bash
npm test             # 238 unit tests
npx playwright test  # E2E tests
```

All tests must pass before pushing. See `AGENTS.md` for the full pre-push checklist.

## 🔒 Security & Compliance

- **Row Level Security** (RLS) on all Supabase tables
- **httpOnly cookies** for auth sessions (no localStorage tokens)
- **GDPR compliant**: Privacy policy, cookie consent, data subject rights, retention policies
- **ATOL/ABTA** transparency: operator self-reported numbers with verification badges
- **CSP headers**, **HSTS**, **X-Frame-Options**, **Referrer-Policy**

See `docs/SECURITY.md` and `docs/COMPLIANCE.md` for full details.

## 🗺 Roadmap

### Shipped

- ✅ Landing page with trust bar
- ✅ Umrah search with real date picker, budget slider, traveller stepper
- ✅ Package search, sort, filter (budget, dates, stars, distance, flight type)
- ✅ Operator registration, dashboard, leads, profile, settings
- ✅ Quote wizard with prefill from package detail
- ✅ Booking intent with unique reference codes
- ✅ Payment handoff with evidence upload
- ✅ Complaint routing (customer → operator → admin)
- ✅ Bank change review with cooling period
- ✅ CSV import/export for operator packages
- ✅ SEO corridor pages (London, Birmingham, Manchester)
- ✅ UK GDPR compliance suite

### In Progress

- 🔄 Repository → Prisma cutover (`FEATURE_USE_REAL_DB`)
- 🔄 Real-time ATOL/ABTA API verification

### Future

- 🎯 Multi-currency UI selector
- 🎯 GDPR data export & account deletion
- 🎯 Hajj 2027 season packages
- 🎯 Live chat between pilgrims and operators

## 🤝 Contributing

1. Create a feature branch from `current-branch`
2. Follow the pre-push checklist in `AGENTS.md`
3. Update `docs/NOW.md` before every push
4. Ensure `npm test` and `npm run build` pass

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**KaabaTrip** - Making your spiritual journey accessible, transparent, and memorable. 🌙
