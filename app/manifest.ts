import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TamilRing - Tamil Ringtones',
        short_name: 'TamilRing',
        description: 'Download the best Tamil ringtones, BGM, and love songs.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#10b981',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
