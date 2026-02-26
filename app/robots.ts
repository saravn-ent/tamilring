import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.in';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/_next/image'],
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                    '/user/*/edit',
                    '/static/',
                ],
            }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
