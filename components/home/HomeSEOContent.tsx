'use client';

import StructuredData from '@/components/StructuredData';
import { generateFAQPageSchema } from '@/lib/seo';
import Link from 'next/link';

export default function HomeSEOContent() {
    const faqs = [
        {
            question: "How to download Tamil ringtones from TamilRing?",
            answer: "Simply search for your favorite song or browse our collections. Click on the ringtone you like, and tap the 'Download' button. You can choose to download directly or cut specific parts using our Ringtone Cutter tool."
        },
        {
            question: "Is TamilRing free to use?",
            answer: "Yes, TamilRing is 100% free. You can download unlimited Tamil ringtones, BGM, and cut songs without any subscription or hidden fees."
        },
        {
            question: "Can I request a specific Tamil song ringtone?",
            answer: "Absolutely! If you can't find a specific song, use our 'Request' feature in the menu. Our community and admins will upload it for you quickly."
        },
        {
            question: "How to set a ringtone on iPhone?",
            answer: "For iPhone users, download the '.m4r' version of the ringtone. Transfer it to your device using iTunes/Finder or GarageBand. Our Ringtone Cutter also allows you to export directly in iPhone format."
        },
        {
            question: "Do you have ringtones for latest Tamil movies?",
            answer: "Yes, we update our collection daily with BGM and songs from the latest Tamil movie releases, including upcoming teasers and trailers."
        }
    ];

    const faqSchema = generateFAQPageSchema(faqs);

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-2 mt-0 border-t border-zinc-100 dark:border-zinc-800">
            <StructuredData data={faqSchema} />

            {/* Visual Minimal Footer Info */}
            <div className="text-center">
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
                    TamilRing: Premium Tamil ringtones & BGM.
                    Browse, preview, and download instantly for Android & iPhone.
                </p>
            </div>

            {/* SEO/AEO/GEO Hidden Content - Visible to crawlers, hidden from users */}
            <div className="sr-only">
                <article>
                    <h2>The #1 Destination for Tamil Ringtones & BGM</h2>
                    <p>
                        Welcome to TamilRing, the most comprehensive collection of Tamil ringtones on the web.
                        Whether you are looking for mass BGMs from your favorite superstar's latest movie,
                        melting love melodies, or spiritual devotional songs, we have it all.
                    </p>
                    <h3>Why Choose TamilRing?</h3>
                    <ul>
                        <li>High Quality Audio (320kbps MP3 & M4R)</li>
                        <li>Built-in Ringtone Cutter and AI Tools</li>
                        <li>Daily Updates with latest Kollywood hits</li>
                    </ul>
                </article>

                <div className="faqs">
                    {faqs.map((faq, idx) => (
                        <div key={idx}>
                            <h3>{faq.question}</h3>
                            <p>{faq.answer}</p>
                        </div>
                    ))}
                </div>

                <div className="keywords">
                    Popular Searches: Tamil BGM Download, Love Ringtones Tamil, Ilayaraja Ringtones, AR Rahman BGM, Anirudh Latest Hits, Intro BGM, Sad Tamil Status Songs,
                    Devotional Ringtones Ivan, Vijay Mass Dialogues, Ajith BGM, Tamil Comedy Dialogues for Ringtone.
                </div>
            </div>
        </section>
    );
}
