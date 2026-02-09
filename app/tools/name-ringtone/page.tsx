import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import NameRingtoneUI from './NameRingtoneUI';

export const metadata: Metadata = generateSEOMetadata({
    title: 'AI Name Ringtone Maker - Create Custom Ringtones with Your Name',
    description: 'Create professional AI-powered name ringtones for free. Choose from romantic, corporate, happy, or lofi background music. High-quality TTS with Tamil and English support.',
    keywords: ['name ringtone', 'ai name ringtone', 'custom ringtone maker', 'tamil name ringtone', 'free name ringtone maker'],
    url: '/tools/name-ringtone',
});

const ringtoneFaqs = [
    {
        question: "How do I create a name ringtone?",
        answer: "Enter your name, select your preferred language and voice, choose a background music track, and click generate. You can then preview and download your custom ringtone."
    },
    {
        question: "Does it support Tamil and other Indian languages?",
        answer: "Yes! We support Tamil (including Tanglish typing), Hindi, Malayalam, Telugu, Kannada, and many other languages with high-quality AI voices."
    },
    {
        question: "Can I use my own background music?",
        answer: "Currently, you can choose from our curated library of tracks. We're working on adding the ability to upload your own background tracks soon."
    },
    {
        question: "Is the service free to use?",
        answer: "Absolutely! You can create and download as many custom name ringtones as you like, free of charge."
    }
];

const ringtoneFeatures = [
    "AI-Powered Voice Synthesis",
    "Tamil & Indic Language Support",
    "Professional Background Music",
    "MP3 & M4R (iPhone) Formats",
    "Instant Preview",
    "100% Free & Privacy-Focused"
];

import ToolInfo from '@/components/ToolInfo';

export default function NameRingtonePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-3 px-2">
            <div className="max-w-4xl mx-auto">
                <NameRingtoneUI />
            </div>

            <ToolInfo
                title="AI Name Ringtone Maker"
                description="TamilRing's AI Name Ringtone Maker is a revolutionary tool that lets you create professional-sounding custom ringtones in seconds. Our advanced AI voice synthesis supports multiple languages including Tamil, Hindi, and English, allowing you to create ringtones that speak your name perfectly. Combined with studio-quality background music, your phone will stand out with a truly unique and personalized sound."
                faqs={ringtoneFaqs}
                features={ringtoneFeatures}
            />
        </div>
    );
}
