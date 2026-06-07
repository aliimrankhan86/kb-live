import path from "node:path";
import type { NextConfig } from "next";

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
        ],
      },
    ];
  },

  // Keep Node-only packages out of the client/edge bundle.
  // pg and Prisma runtime use Node core modules (net, tls, dns) that do
  // not exist in the browser or Edge Runtime.
  serverExternalPackages: ['pg', '@prisma/adapter-pg', '@prisma/client'],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        [path.resolve(process.cwd(), 'lib/api/db/adapter.ts')]: false,
      };
    }

    return config;
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

  // Development uses Turbopack (--turbopack flag in npm run dev). Production
  // webpack keeps a small client-only alias above so Repository can remain
  // usable in MockDB-era client components without bundling pg/Prisma.
};

export default nextConfig;
