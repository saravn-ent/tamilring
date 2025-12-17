import { headers } from 'next/headers';

interface JsonLdScriptProps {
    data: Record<string, any>;
}

/**
 * Component for rendering JSON-LD structured data with CSP nonce support
 * This ensures compliance with Content Security Policy while maintaining SEO benefits
 */
export async function JsonLdScript({ data }: JsonLdScriptProps) {
    const nonce = (await headers()).get('x-nonce') || undefined;

    return (
        <script
            type="application/ld+json"
            nonce={nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
