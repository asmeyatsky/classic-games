const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      '@classic-games/game-engine',
      '@classic-games/shared-ui',
    ],
  },
  transpilePackages: [
    '@classic-games/game-engine',
    '@classic-games/shared-ui',
    '@classic-games/three-components',
    '@classic-games/utils',
  ],
  webpack: (config, { isServer }) => {
    // Alias local packages to their source
    config.resolve.alias = {
      ...config.resolve.alias,
      '@classic-games/game-engine': path.resolve(__dirname, '../../packages/game-engine/src'),
      '@classic-games/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
      '@classic-games/three-components': path.resolve(__dirname, '../../packages/three-components/src'),
      '@classic-games/utils': path.resolve(__dirname, '../../packages/utils/src'),
    };

    // Fix for Three.js in Next.js
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
