import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    ...(process.env.DISABLE_CACHE === 'true' && {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    }),
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Cache control headers
  headers: async () => {
    if (process.env.DISABLE_CACHE === 'true' || process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    }
    return [];
  },

  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Empty turbopack config to acknowledge we're using Turbopack
  // Turbopack handles optimizations automatically
  turbopack: {},
};

export default nextConfig;
