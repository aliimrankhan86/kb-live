import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
  },

  // Tree-shake barrel imports from heavy dependencies. Works with both
  // Turbopack (dev) and webpack (production build).
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

  // No custom webpack config. Development uses Turbopack (--turbopack flag
  // in npm run dev), which has its own Rust-based module system and does not
  // suffer from the __webpack_modules__[moduleId] HMR bug. Production builds
  // use webpack with default settings, which are stable for one-shot builds.
};

export default nextConfig;
