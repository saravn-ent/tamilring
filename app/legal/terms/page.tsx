
import { Metadata } from 'next';
import { generateMetadata as genMeta, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = genMeta({
    title: 'Terms of Service - TamilRing',
    description: 'Read the terms of service for using TamilRing audio ringtone platform.',
    url: '/legal/terms',
    type: 'website',
});

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/legal/terms' },
]);

export default function TermsOfService() {
    return (
        <div className="min-h-screen">
            <StructuredData data={breadcrumbSchema} />
            <div className="max-w-3xl mx-auto px-4 py-12 text-m3-on-surface-variant space-y-8">
                <h1 className="text-4xl font-display font-black text-m3-on-surface mb-8 tracking-tight">Terms of Service</h1>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">1</span>
                        Acceptance of Terms
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        By accessing TamilRing, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">2</span>
                        User Conduct
                    </h2>
                    <div className="border-l-2 border-m3-outline-variant/40 pl-4">
                        <p className="mb-2">You agree NOT to upload content that is:</p>
                        <ul className="list-disc ml-5 space-y-1 text-m3-on-surface-variant font-medium">
                            <li>Illegal, hate speech, or defamatory.</li>
                            <li>Explicitly infringing on copyright (though we respect fair use for ringtones, direct piracy is prohibited).</li>
                            <li>Malicious code or spam.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">3</span>
                        Copyright & DMCA
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        We respect intellectual property rights. If you believe your content has been infringed,
                        please submit a <a href="/legal/dmca" className="text-m3-primary font-bold hover:underline">DMCA Takedown Request</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container text-sm font-bold">4</span>
                        Termination
                    </h2>
                    <p className="leading-relaxed border-l-2 border-m3-outline-variant/40 pl-4">
                        We reserve the right to ban users who violate these terms or upload inappropriate content.
                    </p>
                </section>

                <div className="pt-8 border-t border-m3-outline-variant/30">
                    <p className="text-m3-outline text-xs font-medium uppercase tracking-wider">Last Updated: December 2025</p>
                </div>
            </div>
        </div>
    );
}
