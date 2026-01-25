
import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  compress: true,
  // productionBrowserSourceMaps: false, // Commented out to potentially help with debugging if needed, but defaults to false anyway

  // Enable Web Workers support
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.globalObject = 'self';
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '**.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.apple.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: '**.themoviedb.org',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    qualities: [25, 75, 85],
    unoptimized: false,
  },

  async redirects() {
    return [
      // SEO Consolidation: Redirect legacy /tamil/* routes to canonical URLs
      {
        source: '/tamil/movies/:slug',
        destination: '/movie/:slug',
        permanent: true,
      },
      {
        source: '/tamil/music-directors/:slug',
        destination: '/artist/:slug',
        permanent: true,
      },
      {
        source: '/tamil/actors/:slug',
        destination: '/artist/:slug',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [

          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },

        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|ico|css|js|woff|woff2|ttf|eot)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const nextConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(config);

// Force restart - clear cache - fix hydration mismatch
export default nextConfig;

