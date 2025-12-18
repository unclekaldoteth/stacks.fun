import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile @stacks packages for compatibility
  transpilePackages: ['@stacks/connect', '@stacks/network'],

  // Turbopack config (Next.js 16+ uses Turbopack by default)
  turbopack: {
    resolveAlias: {
      // Disable Node.js modules for client
      fs: { browser: '' },
      net: { browser: '' },
      tls: { browser: '' },
      crypto: { browser: '' },
      stream: { browser: '' },
      path: { browser: '' },
      os: { browser: '' },
      http: { browser: '' },
      https: { browser: '' },
      zlib: { browser: '' },
      worker_threads: { browser: '' },
    },
  },

  // Experimental settings
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
