import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.in';
    const lastMod = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
