'use client';

import { serializeSchema } from '@/lib/seo/structured-data';

interface StructuredDataProps {
    data: any;
}

/**
 * Component to render JSON-LD structured data
 * Usage: <StructuredData data={schema} />
 */
export default function StructuredData({ data }: StructuredDataProps) {
    if (!data) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: serializeSchema(data),
            }}
        />
    );
}
