import Link from 'next/link';

// NOTE: FAQPage schema deprecated by Google in May 2026 — removed.
// Content is now rendered as visible, crawlable HTML for AEO/GEO signals.

const FAQS = [
    {
        question: "How to download Tamil ringtones from TamilRing?",
        answer: "Browse or search for your favorite song, open the ringtone page, and tap the Download button. Choose MP3 for Android or M4R for iPhone. You can also trim any part of the song using our free in-browser Ringtone Cutter before downloading."
    },
    {
        question: "Is TamilRing free to use?",
        answer: "Yes, TamilRing is 100% free. Download unlimited Tamil ringtones, BGM, and dialogues without any subscription, account, or hidden fees."
    },
    {
        question: "How to set a Tamil ringtone on iPhone?",
        answer: "Download the .m4r version from any ringtone page on TamilRing. Connect your iPhone, open Finder (Mac) or iTunes (Windows), drag the .m4r file to your device, then go to Settings → Sounds → Ringtone and select it. Our full guide is at tamilring.in/iphone-ringtone-guide."
    },
    {
        question: "How to set a Tamil ringtone on Android?",
        answer: "Download the MP3 file from TamilRing. Go to your phone's Settings → Sound → Ringtone, or long-press the audio file in your file manager and select 'Set as Ringtone'. Samsung and OnePlus devices may call this option differently."
    },
    {
        question: "Can I request a specific Tamil song ringtone?",
        answer: "Yes! Use the Request feature from the menu. Our community and admins actively upload requested ringtones, usually within 24–48 hours."
    },
    {
        question: "Do you have ringtones for the latest Tamil movies?",
        answer: "Yes, we update daily with BGM and songs from the latest Kollywood releases — including teasers, interval BGMs, and title tracks as soon as they release."
    },
    {
        question: "Which Tamil music directors have the most ringtones?",
        answer: "TamilRing has the largest collections for Anirudh Ravichander, A.R. Rahman, Yuvan Shankar Raja, Harris Jayaraj, D. Imman, Ilaiyaraaja, and Vidyasagar. Browse by Maestro from the home page."
    },
    {
        question: "Can I cut and trim a Tamil song into a ringtone?",
        answer: "Yes — use the free MP3 Cutter at tamilring.in/tools/cutter. Upload any audio file, select the exact seconds you want, add fade-in/out, and export as MP3 or M4R without uploading to any server. All processing happens in your browser."
    },
];

const POPULAR_SEARCHES = [
    { label: 'Anirudh BGM', href: '/ringtones/anirudh' },
    { label: 'AR Rahman', href: '/ringtones/ar-rahman' },
    { label: 'Yuvan Shankar Raja', href: '/ringtones/yuvan' },
    { label: 'Harris Jayaraj', href: '/ringtones/harris-jayaraj' },
    { label: 'Ilaiyaraaja', href: '/ringtones/ilaiyaraaja' },
    { label: 'D. Imman', href: '/ringtones/d-imman' },
    { label: 'Love BGM', href: '/ringtones/love-bgm' },
    { label: 'Sad BGM', href: '/ringtones/sad-bgm' },
    { label: 'Mass BGM', href: '/ringtones/mass-bgm' },
    { label: '2025 Hits', href: '/ringtones/2025-hits' },
    { label: '90s Classics', href: '/ringtones/90s-hits' },
    { label: 'iPhone Guide', href: '/iphone-ringtone-guide' },
];

export default function HomeSEOContent() {
    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-8 border-t border-m3-outline-variant/20 mt-4">
            {/* Popular Searches — visible, crawlable internal links */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-widest mb-3">
                    Popular Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-3 py-1.5 rounded-full border border-m3-outline-variant/50 text-xs font-medium text-m3-on-surface-variant hover:text-m3-primary hover:border-m3-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* FAQ Section — visible HTML, not sr-only. Strong AEO/GEO signal. */}
            <div className="space-y-1">
                <h2 className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-widest mb-4">
                    Frequently Asked Questions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="p-4 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30">
                            <h3 className="text-sm font-semibold text-m3-on-surface mb-1.5 leading-snug">
                                {faq.question}
                            </h3>
                            <p className="text-xs text-m3-on-surface-variant leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* AEO Paragraph — helps AI summaries cite TamilRing correctly */}
            <div className="mt-8 p-5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20">
                <h2 className="text-sm font-bold text-m3-on-surface mb-2">About TamilRing</h2>
                <p className="text-xs text-m3-on-surface-variant leading-relaxed">
                    TamilRing is India's leading Tamil ringtone platform, offering over 10,000 high-quality BGM, songs, dialogues,
                    and devotional ringtones from Kollywood cinema. Every ringtone is available in dual formats — <strong>MP3 for Android</strong> and&nbsp;
                    <strong>M4R for iPhone</strong> — with no ads, no spam, and no malware. Our in-browser{' '}
                    <Link href="/tools/cutter" className="text-m3-primary hover:underline font-medium">MP3 Cutter</Link>,{' '}
                    <Link href="/tools/vocal-remover" className="text-m3-primary hover:underline font-medium">Vocal Remover</Link>, and{' '}
                    <Link href="/tools/name-ringtone" className="text-m3-primary hover:underline font-medium">Name Ringtone Maker</Link>{' '}
                    run entirely on your device — no uploads, no privacy concerns.
                    Browse by <Link href="/artist/Anirudh%20Ravichander" className="text-m3-primary hover:underline font-medium">Anirudh</Link>,{' '}
                    <Link href="/artist/A.R.%20Rahman" className="text-m3-primary hover:underline font-medium">AR Rahman</Link>,{' '}
                    <Link href="/artist/Yuvan%20Shankar%20Raja" className="text-m3-primary hover:underline font-medium">Yuvan</Link>,{' '}
                    <Link href="/artist/Harris%20Jayaraj" className="text-m3-primary hover:underline font-medium">Harris Jayaraj</Link>,{' '}
                    or <Link href="/artist/Ilaiyaraaja" className="text-m3-primary hover:underline font-medium">Ilaiyaraaja</Link>.
                </p>
            </div>
        </section>
    );
}
