
import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  compress: true,
  // productionBrowserSourceMaps: false, // Commented out to potentially help with debugging if needed, but defaults to false anyway

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
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // CRITICAL: Reduce image sizes as requested
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    qualities: [25, 75, 85],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com https://va.vercel-scripts.com https://unpkg.com https://accounts.google.com", // Added Google
              "style-src 'self' 'unsafe-inline' https://accounts.google.com", // Added Google
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://unpkg.com https://accounts.google.com https://api.cobalt.tools https://co.wuk.sh https://cobalt.api.kwiatekmiki.pl https://api.oxcdf.com https://pipedapi.kavin.rocks https://api.piped.privacy.com.de https://pipedapi.moomoo.me https://pipedapi.leptons.xyz https://pipedapi.smnz.de https://api.piped.projectsegfau.lt",
              "media-src 'self' https://*.supabase.co blob:",
              "frame-src 'self' https://accounts.google.com", // Added Google One Tap
              "frame-ancestors 'none'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
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
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
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

export default nextConfig;

