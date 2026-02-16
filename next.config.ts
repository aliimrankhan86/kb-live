import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
  },

  // Reduce module count for heavy dependencies — fewer module IDs = fewer
  // stale-cache collisions during HMR.
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slider",
      "clsx",
      "zustand",
    ],
  },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Use in-memory cache during development instead of filesystem cache.
      // Webpack's persistent filesystem cache (.next/cache/webpack/) is the
      // root cause of "__webpack_modules__[moduleId] is not a function" —
      // module IDs from a previous session become stale after branch switches,
      // dependency updates, or file renames, and HMR references them before
      // the manifest is refreshed. Memory cache is fast within a session and
      // automatically clean on every restart.
      config.cache = { type: "memory" };
    }

    // Ensure consistent module ID generation so HMR patches reference the
    // same IDs the runtime already has loaded.
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "named",
        chunkIds: "named",
      };
    }

    return config;
  },
};

export default nextConfig;
