
import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  compress: true,
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: '**.mzstatic.com' },
      { protocol: 'https', hostname: '**.apple.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '**.tmdb.org' },
      { protocol: 'https', hostname: '**.themoviedb.org' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    qualities: [25, 75, 85],
    unoptimized: false,
  },
  async redirects() {
    return [
      { source: '/tamil/movies/:slug', destination: '/movie/:slug', permanent: true },
      { source: '/tamil/music-directors/:slug', destination: '/artist/:slug', permanent: true },
      { source: '/tamil/actors/:slug', destination: '/artist/:slug', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Only enable SharedArrayBuffer (COEP/COOP) for routes that explicitly need it (client-side FFmpeg)
        // Applying this globally breaks cross-origin images (TMDB, etc) unless they send specific CORP headers
        source: '/tools/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        source: '/upload/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        source: '/ffmpeg/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/ffmpeg-st/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

const nextConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(config);

export default nextConfig;
