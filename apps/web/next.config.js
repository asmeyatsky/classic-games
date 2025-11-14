const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for development best practices
  reactStrictMode: true,

  // Production build optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,

  // Experimental features for better performance and bundle optimization
  experimental: {
    serverComponentsExternalPackages: ['@classic-games/game-engine', '@classic-games/shared-ui'],
    optimizePackageImports: [
      '@classic-games/game-engine',
      '@classic-games/shared-ui',
      '@classic-games/three-components',
      '@classic-games/utils',
      '@classic-games/audio',
    ],
  },

  // Packages that need transpilation from monorepo
  // Ensures TypeScript/ES modules are properly transpiled
  transpilePackages: [
    '@classic-games/game-engine',
    '@classic-games/shared-ui',
    '@classic-games/three-components',
    '@classic-games/utils',
    '@classic-games/audio',
  ],

  // Route-based code splitting configuration
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Remove inactive routes after 60s
    pagesBufferLength: 5, // Keep 5 route pages in memory
  },

  // Webpack customization for advanced optimization and code splitting
  webpack: (config, { isServer, dev }) => {
    // Alias local packages to their source for better tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      '@classic-games/game-engine': path.resolve(__dirname, '../../packages/game-engine/src'),
      '@classic-games/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
      '@classic-games/three-components': path.resolve(
        __dirname,
        '../../packages/three-components/src'
      ),
      '@classic-games/audio': path.resolve(__dirname, '../../packages/audio/src'),
      '@classic-games/utils': path.resolve(__dirname, '../../packages/utils/src'),
    };

    // Fix for Three.js bundling in Next.js
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
      });
    }

    // Production-only advanced code splitting
    if (!dev && !isServer) {
      // Configure aggressive code splitting for better caching
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic', // Deterministic module IDs for consistent caching
        runtimeChunk: {
          name: (entrypoint) => `runtime-${entrypoint.name}`,
        },

        // Aggressive code splitting into separate chunks
        splitChunks: {
          chunks: 'all',
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // Separate React framework code
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendors',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },

            // Separate Three.js and 3D graphics library
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three|@pmndrs)[\\/]/,
              name: 'three-vendors',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },

            // Game engine monorepo package
            gameEngine: {
              test: /[\\/]packages[\\/]game-engine[\\/]/,
              name: 'game-engine',
              priority: 15,
              reuseExistingChunk: true,
              minChunks: 2,
            },

            // Audio system monorepo package
            audio: {
              test: /[\\/]packages[\\/]audio[\\/]/,
              name: 'audio',
              priority: 15,
              reuseExistingChunk: true,
            },

            // Shared UI components monorepo package
            sharedUi: {
              test: /[\\/]packages[\\/]shared-ui[\\/]/,
              name: 'shared-ui',
              priority: 15,
              reuseExistingChunk: true,
              minChunks: 2,
            },

            // Utilities monorepo package
            utils: {
              test: /[\\/]packages[\\/]utils[\\/]/,
              name: 'utils',
              priority: 15,
              reuseExistingChunk: true,
            },

            // Remaining vendor dependencies
            vendor: {
              test: /[\\/]node_modules[\\/](?!three|react).*[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },

            // Common code shared between chunks
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // HTTP headers for optimal caching and compression
  async headers() {
    return [
      // Static assets - long-term caching (1 year)
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // JavaScript bundles - one week caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      // API routes - no caching
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
        ],
      },
      // HTML pages - revalidate frequently
      {
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
