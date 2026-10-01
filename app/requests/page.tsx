import type { Metadata } from 'next';
import { generateMetadata as genMeta, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import RequestsClient from './RequestsClient';

export const metadata: Metadata = genMeta({
    title: 'Ringtone Requests - Request Tamil Songs & BGM | TamilRing',
    description: 'Can\'t find your favorite Tamil song or BGM ringtone? Submit a ringtone request to the TamilRing community.',
    keywords: ['tamil ringtone request', 'request ringtone', 'tamil bgm request'],
    url: '/requests',
    type: 'website',
});

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Requests', url: '/requests' },
]);

export default function RequestsPage() {
    return (
        <>
            <StructuredData data={breadcrumbSchema} />
            <RequestsClient />
        </>
    );
}
