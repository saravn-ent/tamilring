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
    };
}
