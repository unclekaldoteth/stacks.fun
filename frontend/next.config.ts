import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dependencies that use Node.js modules - exclude from SSR
  serverExternalPackages: [
    '@stacks/connect',
    '@walletconnect/universal-provider',
    '@reown/appkit-universal-connector',
    'pino',
    'pino-pretty',
    'thread-stream',
  ],

  // Webpack config for fallbacks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
        worker_threads: false,
      };
    }
    return config;
  },

  // Turbopack config (Next.js 16+ dev uses Turbopack)
  turbopack: {
    resolveAlias: {
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
