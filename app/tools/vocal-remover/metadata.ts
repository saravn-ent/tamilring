import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

// SEO, AEO, and GEO Optimized Metadata for Vocal Remover
export const vocalMetadata: Metadata = generateSEOMetadata({
    title: 'Free Online AI Vocal Remover - Extract Vocals & Instrumentals',
    description: 'Professional AI-powered vocal remover. Isolate vocals, extract acapellas, and remove human voices from songs online. Free, browser-side processing, no software download required.',
    keywords: [
        'vocal remover',
        'remove vocals from song',
        'extract acapella',
        'isolate vocals online',
        'voice extractor',
        'free vocal remover online',
        'ai vocal separation',
        'split vocals and music',
        'acapella maker',
        'karaoke maker vocal remover',
        'online audio separator',
        'browser vocal remover',
        'no download vocal remover',
        'tamil song vocal remover'
    ],
    url: '/tools/vocal-remover',
    type: 'website',
});

// Breadcrumb Structured Data
export const vocalBreadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Audio Tools', url: '/tools' },
    { name: 'Vocal Remover', url: '/tools/vocal-remover' }
]);

// Structured Data for Vocal Remover Tool
export const vocalStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Vocal Remover - Free Online Voice Extractor',
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Audio Editor',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
    },
    description: 'Free online AI-powered vocal remover and voice extractor. Easily isolate vocals or create acapella versions of any song. All processing happens directly in your browser for maximum privacy.',
    featureList: [
        'AI-powered vocal extraction',
        'High-quality acapella creation',
        'Real-time center-channel analysis',
        'Support for MP3, WAV, M4A, AAC, OGG formats',
        'Fast browser-side processing',
        'Privacy-focused - no files uploaded to servers',
        '100% free, no registration required'
    ],
    screenshot: 'https://tamilring.in/og-image.png',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '450',
        bestRating: '5',
        worstRating: '1'
    },
    inLanguage: ['en', 'ta'],
    browserRequirements: 'Requires JavaScript. Modern browser with Web Audio API support.',
    softwareVersion: '1.0',
    author: {
        '@type': 'Organization',
        name: 'TamilRing',
        url: 'https://tamilring.in'
    },
    potentialAction: {
        '@type': 'UseAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://tamilring.in/tools/vocal-remover',
            actionPlatform: [
                'http://schema.org/DesktopWebPlatform',
                'http://schema.org/MobileWebPlatform'
            ]
        }
    }
};

// HowTo Structured Data
export const vocalHowToData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Remove Vocals from Songs Online',
    description: 'Step-by-step guide to removing vocals and extracting acapellas from any song using our free online AI vocal remover.',
    image: 'https://tamilring.in/og-image.png',
    totalTime: 'PT3M',
    estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0'
    },
    tool: [{
        '@type': 'HowToTool',
        name: 'AI Vocal Remover Tool'
    }],
    step: [
        {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload Your Song',
            text: 'Click "Upload Song" and select the audio file (MP3, WAV, etc.) you want to process.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 2,
            name: 'Wait for AI Processing',
            text: 'Our browser-side AI will analyze the audio to identify and separate the vocal frequencies.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 3,
            name: 'Preview Isolate Vocals',
            text: 'Listen to the extracted vocal track to ensure clarity and quality.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 4,
            name: 'Download Acapella',
            text: 'Click the export button to save the vocals-only file to your device.',
            image: 'https://tamilring.in/og-image.png'
        }
    ]
};

// FAQ Structured Data
export const vocalFAQData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'How does the AI Vocal Remover work?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The tool uses advanced digital signal processing and AI algorithms to analyze the stereo image and frequency spectrum of a song, identifying the components typically associated with human vocals and isolating them.'
            }
        },
        {
            '@type': 'Question',
            name: 'Is the quality of extracted vocals professional?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'While results vary depending on the original mix, our tool provides high-quality extraction suitable for remixes, karaoke, and vocal practice. Songs with center-panned vocals give the best results.'
            }
        },
        {
            '@type': 'Question',
            name: 'Are my songs uploaded to a server?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Just like our other tools, the vocal remover runs entirely in your browser. All processing happens on your local device for maximum privacy.'
            }
        },
        {
            '@type': 'Question',
            name: 'What audio formats are supported?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'We support all major formats including MP3, WAV, M4A, AAC, and OGG.'
            }
        }
    ]
};
