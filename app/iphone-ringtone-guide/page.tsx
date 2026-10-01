import type { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata as genMeta, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { CheckCircle, Smartphone, Download, Music, ArrowRight, AlertCircle } from 'lucide-react';

export const revalidate = 86400; // Revalidate once a day

export const metadata: Metadata = genMeta({
    title: 'How to Set Tamil Ringtone on iPhone (M4R Guide 2025)',
    description: 'Step-by-step guide to set a Tamil ringtone on iPhone. Download .m4r files from TamilRing, transfer via Finder or iTunes, and set as your ringtone in 5 minutes. Works on iOS 16, 17, 18.',
    keywords: [
        'how to set ringtone on iphone',
        'tamil ringtone iphone',
        'set tamil ringtone iphone',
        'm4r ringtone iphone',
        'iphone ringtone tamil',
        'how to add ringtone to iphone',
        'set custom ringtone iphone',
        'iphone m4r how to use',
        'tamil bgm iphone ringtone',
        'ios ringtone guide',
    ],
    url: '/iphone-ringtone-guide',
    type: 'article',
});

// Structured Data
const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'iPhone Ringtone Guide', url: '/iphone-ringtone-guide' },
]);

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Set a Tamil Ringtone on iPhone (Step-by-Step M4R Guide)',
    description: 'A complete guide on how to download a Tamil ringtone as an M4R file and set it as your iPhone ringtone using Finder, iTunes, or GarageBand.',
    image: 'https://tamilring.in/og-image.png',
    author: { '@type': 'Organization', name: 'TamilRing', url: 'https://tamilring.in' },
    publisher: { '@type': 'Organization', name: 'TamilRing', url: 'https://tamilring.in' },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: 'en',
    mainEntityOfPage: 'https://tamilring.in/iphone-ringtone-guide',
};

// HowTo schema — still valid for indexing even though it doesn't show as a rich result
const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Set a Tamil Ringtone on iPhone',
    description: 'Set any Tamil BGM or song as your iPhone ringtone using a .m4r file from TamilRing.',
    totalTime: 'PT5M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
    step: [
        {
            '@type': 'HowToStep', position: 1,
            name: 'Download the M4R File',
            text: 'Go to any ringtone on TamilRing and tap the iPhone (M4R) download button.',
        },
        {
            '@type': 'HowToStep', position: 2,
            name: 'Connect iPhone to Computer',
            text: 'Connect your iPhone to your Mac or Windows PC using a Lightning or USB-C cable.',
        },
        {
            '@type': 'HowToStep', position: 3,
            name: 'Open Finder or iTunes',
            text: 'On Mac: open Finder, select your iPhone from the sidebar. On Windows: open iTunes and click the phone icon.',
        },
        {
            '@type': 'HowToStep', position: 4,
            name: 'Drag the M4R File',
            text: 'Drag and drop the downloaded .m4r file into the Tones section of your iPhone in Finder/iTunes.',
        },
        {
            '@type': 'HowToStep', position: 5,
            name: 'Set as Ringtone',
            text: 'On your iPhone, go to Settings → Sounds & Haptics → Ringtone and select your new Tamil ringtone.',
        },
    ],
};

const combinedSchema = combineSchemas(articleSchema, howToSchema, breadcrumbSchema);

const METHOD_MAC = [
    { step: 1, text: 'Go to any ringtone on TamilRing and tap the iPhone / M4R download button' },
    { step: 2, text: 'Connect your iPhone to your Mac using a USB or USB-C cable' },
    { step: 3, text: 'Open Finder → select your iPhone from the left sidebar' },
    { step: 4, text: 'Click the "Files" tab at the top' },
    { step: 5, text: 'Drag the downloaded .m4r file directly onto your iPhone icon in the sidebar' },
    { step: 6, text: 'On your iPhone: Settings → Sounds & Haptics → Ringtone → select your ringtone' },
];

const METHOD_WINDOWS = [
    { step: 1, text: 'Download the M4R file from TamilRing' },
    { step: 2, text: 'Connect iPhone to your PC with a cable. Open iTunes (download from apple.com if not installed)' },
    { step: 3, text: 'Click the iPhone icon in the top-left of iTunes' },
    { step: 4, text: 'In the sidebar, click "Tones" (if not visible, drag-and-drop the file into the iTunes library)' },
    { step: 5, text: 'Drag the .m4r file into iTunes → it should appear under Tones' },
    { step: 6, text: 'Sync your iPhone. Then go to Settings → Sounds → Ringtone on your iPhone' },
];

const METHOD_GARAGEBAND = [
    { step: 1, text: 'Download the M4R file from TamilRing to your iPhone using iCloud Drive or AirDrop' },
    { step: 2, text: 'Open GarageBand on your iPhone → tap the + icon to create a new project' },
    { step: 3, text: 'Choose "Audio Recorder" → tap the Loop icon (top right) → "Files" tab' },
    { step: 4, text: 'Browse to your .m4r file and drag it into the timeline' },
    { step: 5, text: 'Trim to ≤30 seconds, then tap the down arrow (top left) → "My Songs"' },
    { step: 6, text: 'Long-press the project → Share → Ringtone → Export → Set as Default Ringtone' },
];

const TIPS = [
    'Ringtones must be under 40 seconds — TamilRing\'s ringtones are already pre-cut to the perfect length.',
    'If the .m4r file appears as an .m4a, simply rename the file extension from .m4a to .m4r.',
    'AirDrop the .m4r from Mac to iPhone → open with GarageBand → Share as Ringtone (no cable needed).',
    'iOS 18 users: The Tones section may be under Settings → Sounds & Haptics → Ringtone & Alerts.',
];

export default function IphoneRingtoneGuidePage() {
    return (
        <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
            <StructuredData data={combinedSchema} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-m3-on-surface-variant mb-6" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-m3-primary transition-colors">Home</Link>
                <ArrowRight size={12} />
                <span className="text-m3-on-surface font-medium">iPhone Ringtone Guide</span>
            </nav>

            {/* Hero */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-m3-primary text-white text-[10px] font-bold uppercase tracking-wider">Guide</span>
                    <span className="text-xs text-m3-on-surface-variant">5 min read • Works on iOS 16, 17, 18</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-m3-on-surface tracking-tight leading-tight mb-3">
                    How to Set a Tamil Ringtone on iPhone
                </h1>
                <p className="text-m3-on-surface-variant leading-relaxed text-sm sm:text-base">
                    iPhone doesn't let you set an MP3 as a ringtone directly — you need an <strong>.m4r file</strong>.
                    TamilRing provides both MP3 (Android) and M4R (iPhone) downloads on every ringtone page.
                    This guide walks you through 3 methods to get it set in under 5 minutes.
                </p>
            </div>

            {/* Quick Download CTA */}
            <Link
                href="/recent"
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-m3-primary text-white mb-8 hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-3">
                    <Music size={20} />
                    <div>
                        <div className="font-bold text-sm">Browse Tamil Ringtones</div>
                        <div className="text-white/80 text-xs">All with 1-tap iPhone M4R download</div>
                    </div>
                </div>
                <ArrowRight size={18} />
            </Link>

            {/* Method 1 — Mac + Finder */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-m3-primary-container text-m3-primary flex items-center justify-center font-bold text-sm">1</div>
                    <h2 className="text-base font-bold text-m3-on-surface">Method 1 — Mac (Finder) · Easiest</h2>
                </div>
                <div className="space-y-3">
                    {METHOD_MAC.map(({ step, text }) => (
                        <div key={step} className="flex gap-3 p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-m3-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">{step}</div>
                            <p className="text-sm text-m3-on-surface leading-snug">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Method 2 — Windows + iTunes */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-m3-secondary-container text-m3-secondary flex items-center justify-center font-bold text-sm">2</div>
                    <h2 className="text-base font-bold text-m3-on-surface">Method 2 — Windows (iTunes)</h2>
                </div>
                <div className="space-y-3">
                    {METHOD_WINDOWS.map(({ step, text }) => (
                        <div key={step} className="flex gap-3 p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-m3-secondary text-white text-xs font-bold flex items-center justify-center mt-0.5">{step}</div>
                            <p className="text-sm text-m3-on-surface leading-snug">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Method 3 — GarageBand (no computer) */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-m3-tertiary-container text-m3-tertiary flex items-center justify-center font-bold text-sm">3</div>
                    <h2 className="text-base font-bold text-m3-on-surface">Method 3 — GarageBand (No Computer Needed)</h2>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2 mb-3">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">GarageBand must be installed from the App Store (free). This method works without a Mac or PC.</p>
                </div>
                <div className="space-y-3">
                    {METHOD_GARAGEBAND.map(({ step, text }) => (
                        <div key={step} className="flex gap-3 p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-m3-tertiary text-white text-xs font-bold flex items-center justify-center mt-0.5">{step}</div>
                            <p className="text-sm text-m3-on-surface leading-snug">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips */}
            <section className="mb-8 p-5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30">
                <h2 className="font-bold text-m3-on-surface text-sm mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-m3-primary" />
                    Pro Tips
                </h2>
                <ul className="space-y-2">
                    {TIPS.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-xs text-m3-on-surface-variant leading-relaxed">
                            <span className="text-m3-primary font-bold shrink-0">→</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </section>

            {/* What is M4R */}
            <section className="mb-8">
                <h2 className="font-bold text-m3-on-surface text-base mb-3">What is an M4R File?</h2>
                <p className="text-sm text-m3-on-surface-variant leading-relaxed">
                    <strong>.m4r</strong> is Apple's ringtone format — it's essentially an AAC audio file with a different extension.
                    iPhones only recognize .m4r files as ringtones (not .mp3 or .m4a). TamilRing automatically
                    converts every ringtone to M4R format so you don't need any extra software.
                    All M4R files from TamilRing are pre-trimmed to under 40 seconds — the maximum allowed by iOS.
                </p>
            </section>

            {/* Bottom CTA */}
            <div className="rounded-2xl bg-m3-primary-container border border-m3-primary/20 p-5">
                <div className="flex items-start gap-3">
                    <Smartphone size={22} className="text-m3-primary shrink-0 mt-0.5" />
                    <div>
                        <h2 className="font-bold text-m3-on-primary-container text-sm mb-1">Ready to find your ringtone?</h2>
                        <p className="text-xs text-m3-on-primary-container/80 mb-3 leading-relaxed">
                            Browse 10,000+ Tamil ringtones — all with 1-tap M4R download for iPhone.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/recent" className="px-3 py-1.5 rounded-full bg-m3-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                                Latest Ringtones
                            </Link>
                            <Link href="/categories" className="px-3 py-1.5 rounded-full bg-m3-on-primary-container/10 text-m3-on-primary-container text-xs font-semibold border border-m3-primary/30 hover:bg-m3-on-primary-container/20 transition-colors">
                                Browse by Artist
                            </Link>
                            <Link href="/tools/cutter" className="px-3 py-1.5 rounded-full bg-m3-on-primary-container/10 text-m3-on-primary-container text-xs font-semibold border border-m3-primary/30 hover:bg-m3-on-primary-container/20 transition-colors">
                                Trim a Song
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
