import type { NextConfig } from "next";
import { IS_DEV_ENV } from "./lib/config";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Forward E2E_TESTING into Edge Runtime (middleware) — compiled at build time.
  // Only truthy when Playwright webServer injects E2E_TESTING=1.
  // Production deployments never set this, so the bypass compiles to false.
  env: {
    E2E_TESTING: process.env.E2E_TESTING || '',
  },

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
    // Prevent SVG script execution when operator logos become uploadable
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers for all routes
  async headers() {
    // CSP: allow unsafe-eval only in development (Next.js dev mode needs it)
    // In production, remove unsafe-eval to prevent XSS
    const scriptSrc = IS_DEV_ENV
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            // Note: remove 'preload' once HSTS preload list application is submitted
            value: 'max-age=63072000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Tree-shake barrel imports from heavy dependencies. Works with both
  // Turbopack (dev) and webpack (production build).
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slider",
      "clsx",
      "zustand",
    ],
  },

  // No custom webpack config. Development uses Turbopack (--turbopack flag
  // in npm run dev), which has its own Rust-based module system and does not
  // suffer from the __webpack_modules__[moduleId] HMR bug. Production builds
  // use webpack with default settings, which are stable for one-shot builds.
};

export default nextConfig;