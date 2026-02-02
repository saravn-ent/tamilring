import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import { karaokeMetadata, karaokeStructuredData, karaokeHowToData, karaokeFAQData, karaokeBreadcrumbSchema } from './metadata';

export const metadata: Metadata = karaokeMetadata;

export default function KaraokeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Combine all structured data
    const combinedStructuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            karaokeStructuredData,
            karaokeHowToData,
            karaokeFAQData,
            karaokeBreadcrumbSchema
        ]
    };

    return (
        <>
            {children}
            <StructuredData data={combinedStructuredData} />
        </>
    );
}
