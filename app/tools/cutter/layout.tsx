import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import { cutterMetadata, cutterStructuredData, cutterHowToData, cutterFAQData, cutterBreadcrumbSchema } from './metadata';

export const metadata: Metadata = cutterMetadata;

export default function CutterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Combine all structured data
    const combinedStructuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            cutterStructuredData,
            cutterHowToData,
            cutterFAQData,
            cutterBreadcrumbSchema
        ]
    };

    return (
        <>
            {children}
            <StructuredData data={combinedStructuredData} />
        </>
    );
}
