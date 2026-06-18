/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Image optimization
  images: {
    domains: [
      'res.cloudinary.com',
      'example.com',
    ],
    // Enable automatic image optimization and modern formats
    formats: ['image/avif', 'image/webp'],
    // Cache images for 1 year (max-age)
    minimumCacheTTL: 31536000,
    // Responsive image sizes
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw',
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking in CI/CD only
    tsconfigPath: './tsconfig.json',
  },

  // JavaScript and CSS optimizations
  swcMinify: true,
  compress: true,

  // Bundle analysis and code splitting
  experimental: {
    optimizeFonts: true,
    // Enable modern JavaScript for modern browsers
    modern: true,
  },

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Tree shaking and code splitting optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        // Vendor chunk for node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
        // Radix UI components in separate chunk
        radixUI: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          priority: 20,
          reuseExistingChunk: true,
          enforce: true,
        },
        // TanStack React Query
        reactQuery: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
          name: 'react-query',
          priority: 20,
          reuseExistingChunk: true,
          enforce: true,
        },
        // Common chunk for shared code
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common',
        },
      };
    }
    return config;
  },

  // Headers for caching optimization
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      ],
    },
    // Static assets cache
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // Redirects for optimization
  redirects: async () => [],

  // Rewrites for optimization
  rewrites: async () => ({
    fallback: [],
  }),

  // Production source maps (disabled for performance)
  productionBrowserSourceMaps: false,

  // React strict mode for development
  reactStrictMode: true,
};

module.exports = withBundleAnalyzer(nextConfig);