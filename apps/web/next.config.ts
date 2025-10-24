import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@classic-games/game-engine',
    '@classic-games/shared-ui',
    '@classic-games/three-components',
    '@classic-games/utils',
  ],
  webpack: (config, { isServer }) => {
    // Fix for Three.js in Next.js
    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Ensure single React instance - point to root node_modules in monorepo
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-runtime'),
      '@classic-games/game-engine': path.resolve(__dirname, '../../packages/game-engine/src'),
    };

    return config;
  },
};

export default nextConfig;
