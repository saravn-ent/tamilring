import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

// SEO, AEO, and GEO Optimized Metadata for Karaoke Maker
export const karaokeMetadata: Metadata = generateSEOMetadata({
    title: 'Free Online Karaoke Maker - Remove Vocals & Create Instrumentals',
    description: 'Create karaoke tracks online for free. Remove vocals from any song to get high-quality instrumental versions. AI-powered browser-side processing, no registration required.',
    keywords: [
        'karaoke maker',
        'create karaoke online',
        'remove vocals for karaoke',
        'free instrumental maker',
        'karaoke track creator',
        'make karaoke from mp3',
        'online karaoke converter',
        'vocal remover for karaoke',
        'browser karaoke tool',
        'no download karaoke maker',
        'tamil karaoke maker online',
        'background music extractor'
    ],
    url: '/tools/karaoke',
    type: 'website',
});

// Breadcrumb Structured Data
export const karaokeBreadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Audio Tools', url: '/tools' },
    { name: 'Karaoke Maker', url: '/tools/karaoke' }
]);

// Structured Data for Karaoke Tool
export const karaokeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Karaoke Maker - Free Online Instrumental Creator',
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Audio Editor',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
    },
    description: 'Free online karaoke maker and instrumental extractor. Automatically remove vocals from your favorite songs to create perfect karaoke tracks. Process audio files locally in your browser.',
    featureList: [
        'AI-driven vocal removal for instrumentals',
        'High-quality background music extraction',
        'Real-time audio preview',
        'Support for MP3, WAV, M4A, AAC, OGG',
        'Fast and private browser processing',
        '100% free, no software install',
        'Easy-to-use interface'
    ],
    screenshot: 'https://tamilring.in/og-image.png',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.7',
        ratingCount: '320',
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
            urlTemplate: 'https://tamilring.in/tools/karaoke',
            actionPlatform: [
                'http://schema.org/DesktopWebPlatform',
                'http://schema.org/MobileWebPlatform'
            ]
        }
    }
};

// HowTo Structured Data
export const karaokeHowToData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Make Karaoke Tracks Online',
    description: 'Learn how to create instrumental karaoke tracks by removing vocals from any MP3 or audio file for free.',
    image: 'https://tamilring.in/og-image.png',
    totalTime: 'PT3M',
    estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0'
    },
    tool: [{
        '@type': 'HowToTool',
        name: 'Karaoke Maker Tool'
    }],
    step: [
        {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload Your Favorite Song',
            text: 'Choose an MP3 or WAV file from your device to convert into a karaoke track.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 2,
            name: 'Extract Instrumental',
            text: 'Wait a few seconds while our AI separates the vocals from the background music.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 3,
            name: 'Preview Calibration',
            text: 'Listen to the instrumental track to ensure the vocals are removed cleanly.',
            image: 'https://tamilring.in/og-image.png'
        },
        {
            '@type': 'HowToStep',
            position: 4,
            name: 'Download Karaoke Track',
            text: 'Save the instrumental version to your device and start singing!',
            image: 'https://tamilring.in/og-image.png'
        }
    ]
};

// FAQ Structured Data
export const karaokeFAQData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Can I make karaoke tracks for free?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! Our Karaoke Maker is completely free to use without any limitations or registrations.'
            }
        },
        {
            '@type': 'Question',
            name: 'Is the instrumental quality good?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, our tool uses AI to preserve the musical quality of the background track while removing as much of the vocal frequency as possible.'
            }
        },
        {
            '@type': 'Question',
            name: 'Works on mobile devices?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Absolutely! Our browser-side tool is fully responsive and works on iPhone, Android, and tablets.'
            }
        },
        {
            '@type': 'Question',
            name: 'Do I need to download an app?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'No app download is necessary. Everything works directly in your mobile or desktop web browser.'
            }
        }
    ]
};
