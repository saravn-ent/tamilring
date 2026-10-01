
import React from 'react';
import DMCAForm from '@/components/DMCAForm';
import { getDmcaStats } from '@/lib/dmca';
import { Metadata } from 'next';
import { generateMetadata as genMeta, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const revalidate = 3600;

export const metadata: Metadata = genMeta({
    title: 'DMCA Copyright Policy - TamilRing',
    description: 'TamilRing Digital Millennium Copyright Act (DMCA) notice and copyright takedown procedure.',
    url: '/legal/dmca',
    type: 'website',
});

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'DMCA Policy', url: '/legal/dmca' },
]);

export default async function DMCA() {
    const stats = await getDmcaStats();

    return (
        <div className="min-h-screen">
            <StructuredData data={breadcrumbSchema} />
            <div className="max-w-3xl mx-auto px-4 py-12 text-m3-on-surface-variant space-y-8 pb-32">
                <h1 className="text-4xl font-display font-black text-m3-on-surface mb-8 tracking-tight">DMCA Copyright Policy</h1>

                {/* Policy Statement */}
                <section className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3">Our Commitment</h2>
                    <p className="mb-4 leading-relaxed">
                        TamilRing respects the intellectual property rights of others and expects our users to do the same.
                        We comply with the Digital Millennium Copyright Act (DMCA) and will respond promptly to valid takedown notices.
                    </p>
                    <p className="text-m3-on-surface-variant text-sm bg-m3-surface-container p-3 rounded-xl border border-m3-outline-variant/30">
                        <strong className="text-m3-primary">Important:</strong> All content on this site is user-generated.
                        We do not host, upload, or endorse copyrighted material. Users are responsible for ensuring they have
                        the right to upload content.
                    </p>
                </section>

                {/* Designated Agent */}
                <section className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3">Designated DMCA Agent</h2>
                    <p className="mb-4">
                        To file a DMCA takedown notice, please contact our designated agent:
                    </p>
                    <div className="bg-m3-surface-container p-4 rounded-xl space-y-2 text-sm font-mono text-m3-on-surface border border-m3-outline-variant/30">
                        <p><strong className="text-m3-outline">Name:</strong> DMCA Agent</p>
                        <p><strong className="text-m3-outline">Email:</strong> tamilring.in@gmail.com</p>
                        <p><strong className="text-m3-outline">Response Time:</strong> Within 24-48 hours</p>
                    </div>
                    <p className="text-m3-outline text-xs mt-4">
                        Note: This agent is registered with the U.S. Copyright Office as required by 17 U.S.C. § 512(c)(2).
                    </p>
                </section>

                {/* Takedown Process */}
                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3">How to File a Takedown Notice</h2>
                    <p className="mb-4">
                        Your DMCA notice must include the following information (17 U.S.C. § 512(c)(3)):
                    </p>
                    <ol className="list-decimal ml-6 space-y-2 text-m3-on-surface-variant font-medium">
                        <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                        <li>Identification of the copyrighted work claimed to have been infringed</li>
                        <li>Identification of the infringing material and its location on our site</li>
                        <li>Your contact information (address, telephone number, email)</li>
                        <li>A statement of good faith belief that the use is not authorized</li>
                        <li>A statement that the information is accurate and you are authorized to act</li>
                    </ol>
                </section>

                {/* Repeat Infringer Policy */}
                <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">⚠️ Repeat Infringer Policy</h2>
                    <p className="mb-4 text-red-700 dark:text-red-300">
                        TamilRing has adopted a policy of terminating, in appropriate circumstances, the accounts of users
                        who are repeat infringers.
                    </p>
                    <div className="bg-m3-surface-container p-4 rounded-xl space-y-2 border border-red-500/20 shadow-sm">
                        <p className="text-sm font-medium text-m3-on-surface"><strong className="text-red-600 dark:text-red-400">Strike 1:</strong> Warning + Content Removed</p>
                        <p className="text-sm font-medium text-m3-on-surface"><strong className="text-red-600 dark:text-red-400">Strike 2:</strong> 30-Day Suspension</p>
                        <p className="text-sm font-medium text-m3-on-surface"><strong className="text-red-600 dark:text-red-400">Strike 3:</strong> Permanent Account Termination</p>
                    </div>
                    <p className="text-red-500/80 text-xs mt-4">
                        We maintain records of all copyright strikes and takedown notices for legal compliance.
                    </p>
                </section>

                {/* Counter-Notice */}
                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3">Counter-Notice Procedure</h2>
                    <p className="mb-4">
                        If you believe your content was removed by mistake or misidentification, you may file a counter-notice
                        containing:
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-m3-on-surface-variant font-medium">
                        <li>Your physical or electronic signature</li>
                        <li>Identification of the removed material and its former location</li>
                        <li>A statement under penalty of perjury that the material was removed by mistake</li>
                        <li>Your name, address, and consent to federal court jurisdiction</li>
                    </ul>
                    <p className="text-m3-outline text-sm mt-4 italic">
                        Upon receipt of a valid counter-notice, we may restore the content within 10-14 business days
                        unless the copyright owner files a court action.
                    </p>
                </section>

                {/* Misrepresentation Warning */}
                <section className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-3">⚠️ Warning About False Claims</h2>
                    <p className="text-amber-700 dark:text-amber-300 font-medium">
                        Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is
                        infringing may be subject to liability for damages, including costs and attorneys&apos; fees.
                    </p>
                </section>

                {/* Takedown Form */}
                <section>
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3">Submit a Takedown Request</h2>
                    <p className="mb-4 text-m3-on-surface-variant">
                        Use the form below to generate a formal DMCA notice. We will review and respond within 24-48 hours.
                    </p>
                    <DMCAForm />
                </section>

                {/* Transparency */}
                <section className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-m3-on-surface mb-3">Transparency Report</h2>
                    <p className="text-m3-on-surface-variant mb-6 font-medium">
                        We believe in transparency. Statistics on DMCA takedown requests:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-m3-surface-container p-4 rounded-xl shadow-sm border border-m3-outline-variant/30">
                            <p className="text-2xl font-black text-m3-on-surface">{stats.total}</p>
                            <p className="text-xs text-m3-outline font-bold uppercase tracking-wider mt-1">Requests</p>
                        </div>
                        <div className="bg-m3-surface-container p-4 rounded-xl shadow-sm border border-m3-outline-variant/30">
                            <p className="text-2xl font-black text-m3-on-surface">{stats.approved}</p>
                            <p className="text-xs text-m3-outline font-bold uppercase tracking-wider mt-1">Removed</p>
                        </div>
                        <div className="bg-m3-surface-container p-4 rounded-xl shadow-sm border border-m3-outline-variant/30">
                            <p className="text-2xl font-black text-m3-on-surface">24h</p>
                            <p className="text-xs text-m3-outline font-bold uppercase tracking-wider mt-1">Avg Time</p>
                        </div>
                    </div>
                    <p className="text-m3-outline text-xs mt-4 font-medium">Last Updated: Real-time</p>
                </section>

                <p className="text-m3-on-surface-variant text-sm">
                    Questions? Contact us at <a href="mailto:tamilring.in@gmail.com" className="text-m3-primary font-medium hover:underline">tamilring.in@gmail.com</a>
                </p>
            </div>
        </div>
    );
}
