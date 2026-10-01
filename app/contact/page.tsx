import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { generateMetadata as genMeta, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = genMeta({
    title: 'Contact Us - TamilRing Support & Feedback',
    description: 'Get in touch with the TamilRing team. Send inquiries, feedback, or copyright questions directly.',
    url: '/contact',
    type: 'website',
});

const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact TamilRing',
    description: 'Get in touch with the TamilRing team for questions, feedback, or support.',
    url: 'https://tamilring.in/contact',
};

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
]);

const combinedSchema = combineSchemas(contactPageSchema, breadcrumbSchema);

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
            <StructuredData data={combinedSchema} />
            <h1 className="text-3xl font-display font-black mb-8 text-m3-on-surface tracking-tight">Contact Us</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <p className="text-m3-on-surface-variant text-base leading-relaxed">
                        Have questions, suggestions, or just want to say hello? We'd love to hear from you.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-m3-primary-container p-3 rounded-2xl border border-m3-outline-variant/30 text-m3-on-primary-container">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-m3-on-surface font-bold">Email Us</h3>
                                <a href="mailto:tamilring.in@gmail.com" className="text-m3-on-surface-variant hover:text-m3-primary transition-colors font-medium">
                                    tamilring.in@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-m3-on-surface mb-4">Send us a message</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-m3-on-surface-variant mb-1 uppercase tracking-wider">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="w-full bg-m3-surface-container border border-m3-outline-variant/40 rounded-xl px-4 py-3 text-m3-on-surface focus:outline-none focus:border-m3-primary transition-colors placeholder:text-m3-outline text-sm font-medium"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-m3-on-surface-variant mb-1 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full bg-m3-surface-container border border-m3-outline-variant/40 rounded-xl px-4 py-3 text-m3-on-surface focus:outline-none focus:border-m3-primary transition-colors placeholder:text-m3-outline text-sm font-medium"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-xs font-bold text-m3-on-surface-variant mb-1 uppercase tracking-wider">Message</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full bg-m3-surface-container border border-m3-outline-variant/40 rounded-xl px-4 py-3 text-m3-on-surface focus:outline-none focus:border-m3-primary transition-colors placeholder:text-m3-outline text-sm font-medium resize-none"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>
                        <button
                            type="button"
                            className="w-full bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
