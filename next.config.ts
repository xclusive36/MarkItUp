import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

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
