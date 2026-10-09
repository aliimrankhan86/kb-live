import path from "node:path";
import type { NextConfig } from "next";
import { isProduction } from "./lib/env";

const dbAdapterPath = path.resolve(process.cwd(), 'lib/api/db/adapter.ts');
const dbAdapterClientStubPath = './lib/api/db/client-adapter-stub.ts';

function supabaseStoragePattern() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '');
    return [{
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/storage/v1/object/public/**',
    }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Forward only the E2E flag into Edge Runtime (middleware) at build time.
  // Dev auth is localhost + E2E only: no remote/preview toggle exists, so
  // No dev-auth toggle env var exists: dev auth is localhost + E2E_TESTING only.
  env: {
    E2E_TESTING: process.env.E2E_TESTING || '',
  },

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Operator package images in this project's Supabase public storage.
      ...supabaseStoragePattern(),
    ],
    // Prevent SVG script execution when operator logos become uploadable
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // UX-08: one package list. The old search URL answers 308 to /packages;
  // Next keeps the query string, so shared and indexed links still filter.
  async redirects() {
    return [{ source: '/search/packages', destination: '/packages', permanent: true }];
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
          // Previews and local builds are the fictional test site: never indexed.
          ...(isProduction() ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        ],
      },
    ];
  },

  // Keep Node-only packages out of the client/edge bundle.
  // pg and Prisma runtime use Node core modules (net, tls, dns) that do
  // not exist in the browser or Edge Runtime.
  serverExternalPackages: ['pg', '@prisma/adapter-pg', '@prisma/client'],

  turbopack: {
    resolveAlias: {
      [dbAdapterPath]: { browser: dbAdapterClientStubPath },
      './db/adapter': { browser: dbAdapterClientStubPath },
      '@/lib/api/db/adapter': { browser: dbAdapterClientStubPath },
    },
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        [dbAdapterPath]: false,
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
