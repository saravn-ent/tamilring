
import React from 'react';
import DMCAForm from '@/components/DMCAForm';

import { getDmcaStats } from '@/lib/dmca';

export const revalidate = 3600;

export default async function DMCA() {
    const stats = await getDmcaStats();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 text-zinc-600 space-y-8 pb-32">
                <h1 className="text-4xl font-black text-brand-dark mb-8 tracking-tight">DMCA Copyright Policy</h1>

                {/* Policy Statement */}
                <section className="bg-brand-wash border border-brand-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-brand-dark mb-3">Our Commitment</h2>
                    <p className="mb-4 leading-relaxed">
                        TamilRing respects the intellectual property rights of others and expects our users to do the same.
                        We comply with the Digital Millennium Copyright Act (DMCA) and will respond promptly to valid takedown notices.
                    </p>
                    <p className="text-zinc-500 text-sm bg-white p-3 rounded-xl border border-brand-border/50">
                        <strong className="text-brand-accent">Important:</strong> All content on this site is user-generated.
                        We do not host, upload, or endorse copyrighted material. Users are responsible for ensuring they have
                        the right to upload content.
                    </p>
                </section>

                {/* Designated Agent */}
                <section className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-brand-dark mb-3">Designated DMCA Agent</h2>
                    <p className="mb-4">
                        To file a DMCA takedown notice, please contact our designated agent:
                    </p>
                    <div className="bg-brand-wash p-4 rounded-xl space-y-2 text-sm font-mono text-brand-dark border border-brand-border">
                        <p><strong className="text-zinc-500">Name:</strong> DMCA Agent</p>
                        <p><strong className="text-zinc-500">Email:</strong> tamilring.in@gmail.com</p>
                        <p><strong className="text-zinc-500">Response Time:</strong> Within 24-48 hours</p>
                    </div>
                    <p className="text-zinc-400 text-xs mt-4">
                        Note: This agent is registered with the U.S. Copyright Office as required by 17 U.S.C. § 512(c)(2).
                    </p>
                </section>

                {/* Takedown Process */}
                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3">How to File a Takedown Notice</h2>
                    <p className="mb-4">
                        Your DMCA notice must include the following information (17 U.S.C. § 512(c)(3)):
                    </p>
                    <ol className="list-decimal ml-6 space-y-2 text-zinc-600 font-medium">
                        <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                        <li>Identification of the copyrighted work claimed to have been infringed</li>
                        <li>Identification of the infringing material and its location on our site</li>
                        <li>Your contact information (address, telephone number, email)</li>
                        <li>A statement of good faith belief that the use is not authorized</li>
                        <li>A statement that the information is accurate and you are authorized to act</li>
                    </ol>
                </section>

                {/* Repeat Infringer Policy */}
                <section className="bg-red-50 border border-red-100 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2">⚠️ Repeat Infringer Policy</h2>
                    <p className="mb-4 text-red-800">
                        TamilRing has adopted a policy of terminating, in appropriate circumstances, the accounts of users
                        who are repeat infringers.
                    </p>
                    <div className="bg-white p-4 rounded-xl space-y-2 border border-red-100 shadow-sm">
                        <p className="text-sm font-medium text-red-900"><strong className="text-red-600">Strike 1:</strong> Warning + Content Removed</p>
                        <p className="text-sm font-medium text-red-900"><strong className="text-red-600">Strike 2:</strong> 30-Day Suspension</p>
                        <p className="text-sm font-medium text-red-900"><strong className="text-red-600">Strike 3:</strong> Permanent Account Termination</p>
                    </div>
                    <p className="text-red-400 text-xs mt-4">
                        We maintain records of all copyright strikes and takedown notices for legal compliance.
                    </p>
                </section>

                {/* Counter-Notice */}
                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3">Counter-Notice Procedure</h2>
                    <p className="mb-4">
                        If you believe your content was removed by mistake or misidentification, you may file a counter-notice
                        containing:
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-zinc-600 font-medium">
                        <li>Your physical or electronic signature</li>
                        <li>Identification of the removed material and its former location</li>
                        <li>A statement under penalty of perjury that the material was removed by mistake</li>
                        <li>Your name, address, and consent to federal court jurisdiction</li>
                    </ul>
                    <p className="text-zinc-500 text-sm mt-4 italic">
                        Upon receipt of a valid counter-notice, we may restore the content within 10-14 business days
                        unless the copyright owner files a court action.
                    </p>
                </section>

                {/* Misrepresentation Warning */}
                <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-amber-600 mb-3">⚠️ Warning About False Claims</h2>
                    <p className="text-amber-800 font-medium">
                        Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is
                        infringing may be subject to liability for damages, including costs and attorneys&apos; fees.
                    </p>
                </section>

                {/* Takedown Form */}
                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3">Submit a Takedown Request</h2>
                    <p className="mb-4 text-zinc-500">
                        Use the form below to generate a formal DMCA notice. We will review and respond within 24-48 hours.
                    </p>
                    <DMCAForm />
                </section>

                {/* Transparency */}
                <section className="bg-brand-wash border border-brand-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-brand-dark mb-3">Transparency Report</h2>
                    <p className="text-zinc-500 mb-6 font-medium">
                        We believe in transparency. Statistics on DMCA takedown requests:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border">
                            <p className="text-2xl font-black text-brand-dark">{stats.total}</p>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Requests</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border">
                            <p className="text-2xl font-black text-brand-dark">{stats.approved}</p>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Removed</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border">
                            <p className="text-2xl font-black text-brand-dark">24h</p>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Avg Time</p>
                        </div>
                    </div>
                    <p className="text-zinc-400 text-xs mt-4 font-medium">Last Updated: Real-time</p>
                </section>

                <p className="text-zinc-500 text-sm">
                    Questions? Contact us at <a href="mailto:tamilring.in@gmail.com" className="text-brand-accent font-medium hover:underline">tamilring.in@gmail.com</a>
                </p>
            </div>
        </div>
    );
}
