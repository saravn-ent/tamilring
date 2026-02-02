import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

// SEO, AEO, and GEO Optimized Metadata for MP3 Cutter
export const cutterMetadata: Metadata = generateSEOMetadata({
    title: 'Free Online MP3 Cutter - Trim Audio & Create Ringtones',
    description: 'Professional free MP3 cutter and audio trimmer. Cut, trim, and edit audio files online to create perfect ringtones. Supports MP3, WAV, M4A, AAC formats. No software download required - edit directly in browser.',
    keywords: [
        'mp3 cutter',
        'audio cutter online',
        'free mp3 trimmer',
        'ringtone cutter',
        'audio trimmer online',
        'cut mp3 online free',
        'tamil ringtone cutter',
        'audio editor',
        'trim audio online',
        'mp3 editor online',
        'audio splitter',
        'ringtone maker',
        'cut audio file',
        'online audio cutter',
        'browser mp3 cutter',
        'no download audio editor'
    ],
    url: '/tools/cutter',
    type: 'website',
});

// Breadcrumb Structured Data
export const cutterBreadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Audio Tools', url: '/tools' },
    { name: 'MP3 Cutter', url: '/tools/cutter' }
]);

// Structured Data for MP3 Cutter Tool
export const cutterStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MP3 Cutter - Free Online Audio Trimmer',
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Audio Editor',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
    },
    description: 'Free online MP3 cutter and audio trimmer. Precisely cut and trim audio files to create perfect ringtones. Supports multiple audio formats including MP3, WAV, M4A, AAC, and OGG. No software installation required.',
    featureList: [
        'Precise audio trimming with waveform visualization',
        'Support for MP3, WAV, M4A, AAC, M4R, OGG formats',
        'Real-time audio preview',
        'Fade in/fade out effects',
        'High-quality audio export',
        'No file size limits',
        'Privacy-focused - all processing done in browser',
        'No registration required'
    ],
    screenshot: 'https://tamilring.in/og-image.png',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '850',
        bestRating: '5',
        worstRating: '1'
    },
    inLanguage: ['en', 'ta'],
    browserRequirements: 'Requires JavaScript. Modern browser with Web Audio API support.',
    softwareVersion: '2.0',
    author: {
        '@type': 'Organization',
        name: 'TamilRing',
        url: 'https://tamilring.in'
    },
    potentialAction: {
        '@type': 'UseAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://tamilring.in/tools/cutter',
            actionPlatform: [
                'http://schema.org/DesktopWebPlatform',
                'http://schema.org/MobileWebPlatform'
            ]
        }
    }
};

// HowTo Structured Data for better AEO/GEO
export const cutterHowToData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Cut and Trim MP3 Audio Files Online',
    description: 'Step-by-step guide to cutting and trimming audio files to create ringtones using our free online MP3 cutter tool.',
    image: 'https://tamilring.in/og-image.png',
    totalTime: 'PT2M',
    estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0'
    },
    tool: [{
        '@type': 'HowToTool',
        name: 'MP3 Cutter Tool'
    }],
    step: [
        {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload Audio File',
            text: 'Click the "Choose Audio File" button and select your MP3, WAV, or other audio file from your device.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 2,
            name: 'Select Audio Section',
            text: 'Use the waveform visualization to select the exact portion of audio you want to keep. Drag the handles to adjust start and end points.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 3,
            name: 'Preview Your Cut',
            text: 'Click the play button to preview your selected audio section and ensure it sounds perfect.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 4,
            name: 'Apply Effects (Optional)',
            text: 'Add fade in/fade out effects to make your ringtone sound more professional.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 5,
            name: 'Download Your Ringtone',
            text: 'Click the "Export" button to download your trimmed audio file. Your ringtone is ready to use!',
            image: 'https://tamilring.in/og-image.png'
        }
    ]
};

// FAQ Structured Data for AEO
export const cutterFAQData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Is the MP3 cutter completely free to use?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, our MP3 cutter is 100% free with no hidden charges, no registration required, and no file size limits. All audio processing happens directly in your browser.'
            }
        },
        {
            '@type': 'Question',
            name: 'What audio formats are supported?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The MP3 cutter supports multiple audio formats including MP3, WAV, M4A, AAC, M4R, and OGG. You can upload any of these formats and export your trimmed audio.'
            }
        },
        {
            '@type': 'Question',
            name: 'Is my audio file safe and private?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Absolutely! All audio processing happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security.'
            }
        },
        {
            '@type': 'Question',
            name: 'Can I create ringtones for iPhone and Android?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! You can create ringtones compatible with both iPhone (M4R format) and Android (MP3 format). Simply trim your audio to the desired length (typically 30 seconds) and export.'
            }
        },
        {
            '@type': 'Question',
            name: 'Do I need to install any software?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'No installation required! Our MP3 cutter works entirely in your web browser. Just visit the page, upload your file, and start editing immediately.'
            }
        },
        {
            '@type': 'Question',
            name: 'What is the maximum file size I can upload?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'There is no strict file size limit. However, very large files (over 100MB) may take longer to process depending on your device capabilities.'
            }
        }
    ]
};
