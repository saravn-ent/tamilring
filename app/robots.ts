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
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'Google-Extended',
                    'CCBot',
                    'OAI-SearchBot',
                    'Claude-Web',
                    'ClaudeBot',
                    'Anthropic-AI',
                    'PerplexityBot',
                    'YouBot',
                    'Meta-ExternalAgent',
                    'Meta-ExternalFetcher',
                    'Amazonbot',
                    'Applebot-Extended',
                    'Bytespider',
                    'Diffbot',
                    'FacebookBot',
                    'ImagesiftBot',
                    'cohere-ai'
                ],
                disallow: ['/'],
            }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
