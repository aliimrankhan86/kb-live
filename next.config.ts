import path from "node:path";
import type { NextConfig } from "next";

const dbAdapterPath = path.resolve(process.cwd(), 'lib/api/db/adapter.ts');
const dbAdapterClientStubPath = './lib/api/db/client-adapter-stub.ts';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Forward auth environment flags into Edge Runtime (middleware) at build time.
  // Dev auth stays disabled for true production unless explicitly enabled.
  env: {
    E2E_TESTING: process.env.E2E_TESTING || '',
    KAABATRIP_ENABLE_DEV_AUTH: process.env.KAABATRIP_ENABLE_DEV_AUTH || '',
    VERCEL_ENV: process.env.VERCEL_ENV || '',
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
    ],
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
