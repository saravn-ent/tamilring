interface JsonLdScriptProps {
    data: Record<string, any>;
}

/**
 * Component for rendering JSON-LD structured data.
 * Optimized for static rendering by avoiding dynamic headers.
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
    return (
        <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
