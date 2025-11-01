import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // Empty turbopack config to acknowledge webpack config is intentional
  turbopack: {},

  // Exclude markdown folder from HMR watch to prevent page reloads when markdown files change
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ignore markdown folder changes in development
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/markdown/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
