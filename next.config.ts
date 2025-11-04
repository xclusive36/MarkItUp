import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // Optimize package imports for better bundle size
  experimental: {
    // Increase body size limit for file uploads
    serverActions: {
      bodySizeLimit: '15mb',
    },
    // Optimize imports for heavy packages
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'd3',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-code-block-lowlight',
      'react-markdown',
    ],
  },

  // Configure turbopack for faster builds
  turbopack: {
    resolveAlias: {
      // Add any path aliases you use frequently
    },
  },

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

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
})(nextConfig);
