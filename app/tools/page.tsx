import { Suspense } from 'react';
import ToolsHub from '@/components/ToolsHub';
import ToolInfo from '@/components/ToolInfo';
import StructuredData from '@/components/StructuredData';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Metadata } from 'next';

// SEO, AEO, and GEO Optimized Metadata
export const metadata: Metadata = generateSEOMetadata({
    title: 'Free Online Audio Tools - MP3 Cutter, Vocal Remover & More',
    description: 'Professional free online audio editing tools for Tamil ringtones. Cut MP3 files, remove vocals, create karaoke tracks, and enhance audio with AI. No download required - edit audio directly in your browser.',
    keywords: [
        'free audio tools',
        'online mp3 cutter',
        'audio editor online',
        'vocal remover free',
        'karaoke maker online',
        'tamil ringtone maker',
        'audio trimmer',
        'mp3 editor',
        'audio cutter online free',
        'remove vocals from song',
        'instrumental maker',
        'audio editing tools',
        'browser audio editor',
        'no download audio tools',
        'tamil audio tools'
    ],
    url: '/tools',
    type: 'website',
});

// Breadcrumb Structured Data
const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Audio Tools', url: '/tools' }
]);

// Structured Data for SEO/AEO/GEO
const toolsStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TamilRing Audio Studio Tools',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
    },
    description: 'Free online audio editing tools including MP3 cutter, vocal remover, karaoke maker, and AI-powered audio enhancement. Edit audio files directly in your browser without downloading any software.',
    featureList: [
        'MP3 Cutter - Trim and cut audio files with precision',
        'Vocal Remover - Extract vocals or instrumentals from songs',
        'Karaoke Maker - Create karaoke tracks by removing vocals',
        'AI Audio Enhancement - Remove noise and improve audio quality',
        'Voice Changer - Apply fun effects to audio recordings'
    ],
    screenshot: 'https://tamilring.in/og-image.png',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
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
    }
};

// Combine all structured data
const combinedStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [toolsStructuredData, breadcrumbSchema]
};

const studioFaqs = [
    {
        question: "Is the TamilRing Audio Studio free to use?",
        answer: "Yes, all our audio tools including the MP3 cutter, vocal remover, and karaoke maker are 100% free to use with no hidden costs or registration required."
    },
    {
        question: "Do I need to download any software to edit audio?",
        answer: "No, everything works directly in your web browser. Our tools use advanced Web Audio technology to process your files locally on your device."
    },
    {
        question: "Are my audio files safe in the Studio?",
        answer: "Absolutely. We prioritize your privacy. Your audio files are processed entirely within your browser and are never uploaded to our servers unless you explicitly choose to share or host them."
    },
    {
        question: "Which audio formats are supported?",
        answer: "Our studio tools support all major audio formats including MP3, WAV, M4A, AAC, M4R, and OGG."
    }
];

const studioFeatures = [
    "Precision MP3 Cutting",
    "AI Vocal Removal",
    "Instrumental Creation",
    "Noise Enhancement",
    "Funny Voice Effects"
];

export default function ToolsPage() {
    return (
        <>
            <div className="min-h-screen bg-slate-50 py-3 px-2">
                <ToolsHub />
                <ToolInfo
                    title="TamilRing Audio Studio"
                    description="Our professional-grade audio studio is designed specifically for Tamil music enthusiasts. Whether you're looking to create the perfect 30-second ringtone, extract clear vocals from your favorite songs, or generate clean instrumental tracks for karaoke, our suite of AI-powered tools offers everything you need without the complexity of traditional editing software."
                    faqs={studioFaqs}
                    features={studioFeatures}
                />
            </div>
            <StructuredData data={combinedStructuredData} />
        </>
    );
}
