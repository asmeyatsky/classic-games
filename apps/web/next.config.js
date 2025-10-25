/** @type {import('next').NextConfig} */
const nextConfig = {
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

    return config;
  },
};

module.exports = nextConfig;
