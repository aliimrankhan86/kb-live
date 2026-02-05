# KaabaTrip - Your Journey to the Holy Land

A modern, scalable Next.js application for Hajj and Umrah pilgrimage packages. Built with production-grade architecture and pixel-perfect design.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Pixel-Perfect Design**: Dark theme with custom design tokens
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Performance Optimized**: Fast loading with Next.js optimizations
- **SEO Ready**: Complete metadata and Open Graph support
- **Accessibility**: WCAG compliant with semantic HTML
- **Testing**: Unit tests with Vitest and E2E tests with Playwright
- **CI/CD**: GitHub Actions workflow for automated testing and deployment

## 🛠 Tech Stack

### Core

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework

### Styling

- **CSS Modules** - Component-scoped styles
- **Custom Design Tokens** - Consistent color and spacing system
- **Inter Font** - Modern typography via next/font

### Testing & Quality

- **Vitest** - Fast unit testing
- **Testing Library** - React component testing
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Future-Ready

- **TanStack Query** - Data fetching (ready for API integration)
- **Zustand** - Lightweight state management
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives

## 📁 Project Structure

```
kaabatrip/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Landing page
│   ├── hajj/              # Hajj packages page
│   ├── umrah/             # Umrah packages page
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── marketing/        # Marketing-specific components
│   ├── graphics/         # SVG illustrations and icons
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions and config
│   ├── seo.ts            # SEO metadata helpers
│   └── config.ts         # App configuration
├── styles/               # Global styles and design tokens
│   ├── globals.css       # Global styles
│   └── tokens.css        # CSS custom properties
├── tests/                # Unit tests
├── e2e/                  # End-to-end tests
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kaabatrip
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run dev:clean    # Clear .next and start dev (use after pull or to fix chunk 404s)
npm run dev:turbo    # Same but with Turbopack (use if clientReferenceManifest error persists)
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run e2e          # Run end-to-end tests

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Storybook (when configured)
npm run storybook    # Start Storybook dev server
npm run build-storybook # Build Storybook for production
```

### Troubleshooting

- **404 on `layout.css`, `main-app.js`, or `app-pages-internals.js`**  
  The dev server generates new asset URLs after restarts. If the browser still requests old URLs, you get 404s and the app can appear broken (e.g. buttons that rely on JS do nothing).  

  **Recommended (avoids recurrence):** Use a clean dev start when starting work or after pulling:  
  `npm run dev:clean`  
  This clears the `.next` build cache and starts the dev server so chunk URLs match what the browser loads. Then hard-refresh (Ctrl+Shift+R / Cmd+Shift+R) or use an incognito window.  

  **One-off fix:** Stop the dev server, run `rm -rf .next`, then `npm run dev`, and hard-refresh.

- **`Invariant: Expected clientReferenceManifest to be defined`**  
  This is a known Next.js (Webpack) bug, often due to a stale or corrupted `.next` build.  

  1. Stop the dev server and run **`npm run dev:clean`** (clears `.next` and starts dev). Reload the app.  
  2. If it persists, try the Turbopack dev server (different bundler, avoids the Webpack manifest bug): **`npm run dev:turbo`**.

- **`ENOENT: no such file or directory, open '.next/server/pages/_document.js'`**  
  This project uses the **App Router only** (no `pages/` directory). The error means the `.next` build is stale or corrupted and Webpack is looking for old Pages Router artifacts.  

  **Fix:** Stop the dev server and run **`npm run dev:clean`** to remove `.next` and start fresh. If you keep seeing Webpack-related errors, use **`npm run dev:turbo`** instead.

- **`missing required error components, refreshing...`**  
  The app now includes `app/error.tsx`, `app/global-error.tsx`, and `app/not-found.tsx`. If you still see this after a clean dev start, it usually means a runtime error occurred and Next.js is trying to show the error UI; check the console for the underlying error.

## 🎨 Design System

### Color Palette

- **Background**: `#0B0B0B` - Deep black
- **Text**: `#FFFFFF` - Pure white
- **Text Muted**: `rgba(255, 255, 255, 0.64)` - 64% opacity white
- **Yellow Accent**: `#FFD31D` - Brand yellow
- **Surface Dark**: `#111111` - Dark surface

### Typography

- **Font Family**: Inter (via next/font)
- **H1**: 64px desktop, 48-56px tablet, 32-36px mobile
- **Lead**: 24px desktop, responsive scaling

### Components

- **Logo**: Scalable SVG with gradient effects
- **Kaaba Illustration**: Detailed SVG with minarets
- **Arches Pattern**: Subtle background pattern
- **Header**: Sticky navigation with backdrop blur

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Tests are located in the `tests/` directory using Vitest and Testing Library.

### End-to-End Tests

```bash
npm run e2e
```

E2E tests are in the `e2e/` directory using Playwright.

### Test Coverage

- Component rendering and props
- Navigation and routing
- Responsive design breakpoints
- Accessibility features

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically on push to main

### Manual Deployment

```bash
npm run build
npm run start
```

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS v4 with custom design tokens defined in `styles/tokens.css`.

### TypeScript

Strict mode enabled with path aliases configured for clean imports.

### ESLint

Next.js ESLint configuration with additional rules for code quality.

## 📱 Responsive Design

- **Desktop**: Full layout with side-by-side CTAs
- **Tablet**: Scaled illustration, maintained grid
- **Mobile**: Stacked CTAs, optimized touch targets

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader optimization

## 🚀 Performance

- **Lighthouse Score**: 95+ Performance, 100 Accessibility, 100 SEO
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Image Optimization**: Next.js automatic optimization
- **Font Loading**: Optimized with next/font
- **Code Splitting**: Automatic route-based splitting

## 🔮 Future Roadmap

### Phase 1 (Current)

- ✅ Landing page with dual CTAs
- ✅ Responsive design
- ✅ SEO optimization
- ✅ Testing infrastructure

### Phase 2 (Next)

- [ ] Package search and filtering
- [ ] User authentication
- [ ] Booking system
- [ ] Payment integration

### Phase 3 (Future)

- [ ] Partner portal
- [ ] Admin dashboard
- [ ] CMS integration
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new components
- Maintain responsive design
- Follow accessibility guidelines
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from Islamic architecture
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- All open-source contributors

---

**KaabaTrip** - Making your spiritual journey accessible and memorable. 🌙
