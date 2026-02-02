import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import { vocalMetadata, vocalStructuredData, vocalHowToData, vocalFAQData, vocalBreadcrumbSchema } from './metadata';

export const metadata: Metadata = vocalMetadata;

export default function VocalRemoverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Combine all structured data
    const combinedStructuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            vocalStructuredData,
            vocalHowToData,
            vocalFAQData,
            vocalBreadcrumbSchema
        ]
    };

    return (
        <>
            {children}
            <StructuredData data={combinedStructuredData} />
        </>
    );
}
