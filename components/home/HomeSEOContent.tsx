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
        <section className="w-full max-w-4xl mx-auto px-4 py-8 mt-8 border-t border-zinc-100 dark:border-zinc-800">
            <StructuredData data={faqSchema} />

            <div className="space-y-12 text-zinc-600 dark:text-zinc-400">

                {/* Main Introduction - GEO Optimized */}
                <article className="prose dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                        The #1 Destination for Tamil Ringtones & BGM
                    </h2>
                    <p className="leading-relaxed mb-4">
                        Welcome to <strong>TamilRing</strong>, the most comprehensive collection of Tamil ringtones on the web.
                        Whether you are looking for mass BGMs from your favorite superstar's latest movie,
                        melting love melodies, or spiritual devotional songs, we have it all.
                        Our platform is designed to be fast, user-friendly, and optimized for both Android and iPhone users.
                    </p>
                    <p className="leading-relaxed">
                        Unlike other sites, we focus purely on high-quality audio (320kbps) and precise cuts.
                        Every ringtone is manually verified to ensure it's loud, clear, and perfect for your phone's speaker.
                    </p>
                </article>

                {/* Features Grid - AEO Optimized (Bullet points for quick answers) */}
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                        Why Choose TamilRing?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">High Quality Audio</h3>
                            <p className="text-sm">
                                We provide ringtones in crystal clear quality, mostly 320kbps MP3 and high-quality M4R for iPhones, ensuring they sound great even in noisy environments.
                            </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Built-in Cutter</h3>
                            <p className="text-sm">
                                Specific part of a song you love? Use our <Link href="/trim" className="text-primary hover:underline">Online Ringtone Cutter</Link> to trim any song and create your own custom tone in seconds.
                            </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Daily Updates</h3>
                            <p className="text-sm">
                                Stay energetic with fresh content. We update our library daily with the latest releases from Kollywood, ensuring you set the trend among your friends.
                            </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Request System</h3>
                            <p className="text-sm">
                                Missing a rare track? Submit a request, and our active community and dedicated team will upload it for you, often within hours.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section - FAQ Schema Enforced */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid gap-4">
                        {faqs.map((faq, idx) => (
                            <details key={idx} className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <summary className="flex justify-between items-center p-4 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    {faq.question}
                                    <span className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 opacity-50 group-open:rotate-180 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 text-sm leading-relaxed border-t border-transparent group-open:border-zinc-100 dark:group-open:border-zinc-800">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Semantic Keywords Block (Visualy subtle but good for crawlers) */}
                <div className="text-xs text-zinc-400 dark:text-zinc-600 text-center leading-loose pt-8 border-t border-zinc-100 dark:border-zinc-800">
                    Popular Searches: Tamil BGM Download, Love Ringtones Tamil, Ilayaraja Ringtones, AR Rahman BGM, Anirudh Latest Hits, Intro BGM, Sad Tamil Status Songs,
                    Devotional Ringtones Ivan, Vijay Mass Dialogues, Ajith BGM, Tamil Comedy Dialogues for Ringtone.
                </div>

            </div>
        </section>
    );
}
