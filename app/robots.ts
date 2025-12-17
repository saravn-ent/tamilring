import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.in';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                    '/user/*/edit',
                    '/_next/',
                    '/static/',
                ],
            },
            {
                userAgent: 'GPTBot', // OpenAI crawler
                disallow: '/',
            },
            {
                userAgent: 'CCBot', // Common Crawl
                disallow: '/',
            },
            {
                userAgent: 'anthropic-ai', // Anthropic crawler
                disallow: '/',
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
