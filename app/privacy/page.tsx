
import { Metadata } from 'next';
import { generateMetadata as genMeta, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = genMeta({
    title: 'Privacy Policy - TamilRing',
    description: 'Read the privacy policy of TamilRing. Understand how your personal information and cookies are handled securely.',
    url: '/privacy',
    type: 'website',
});

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy' },
]);

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen">
            <StructuredData data={breadcrumbSchema} />
            <div className="max-w-3xl mx-auto px-4 py-12 text-m3-on-surface-variant space-y-8">
                <h1 className="text-4xl font-display font-black text-m3-on-surface mb-8 tracking-tight">Privacy Policy</h1>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">1</span>
                        Information We Collect
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        Available information includes your account details (Google Profile) when you sign in,
                        which we use solely for authentication and profile display. We also collect usage data like
                        uploads, downloads, and favorites to personalize your experience.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">2</span>
                        Cookies
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        We use cookies to maintain your session and authentication state. By using TamilRing, you
                        consent to our use of cookies for these functional purposes.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">3</span>
                        User Generated Content
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        Any ringtones you upload are public. Please do not upload personal or private audio.
                        We are not responsible for the content uploaded by users, but we moderate it for compliance.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">4</span>
                        Contact
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        For privacy concerns, please contact us at <a href="mailto:tamilring.in@gmail.com" className="text-m3-primary font-medium hover:underline">tamilring.in@gmail.com</a>.
                    </p>
                </section>

                <div className="pt-8 border-t border-m3-outline-variant/30">
                    <p className="text-m3-outline text-xs font-medium uppercase tracking-wider">Last Updated: December 2025</p>
                </div>
            </div>
        </div>
    );
}
