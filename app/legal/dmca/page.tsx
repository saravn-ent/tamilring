
import React from 'react';
import DMCAForm from '@/components/DMCAForm';

export default function DMCA() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-300 space-y-8 pb-32">
            <h1 className="text-3xl font-bold text-white mb-6">DMCA Copyright Policy</h1>

            {/* Policy Statement */}
            <section className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">Our Commitment</h2>
                <p className="mb-4">
                    TamilRing respects the intellectual property rights of others and expects our users to do the same.
                    We comply with the Digital Millennium Copyright Act (DMCA) and will respond promptly to valid takedown notices.
                </p>
                <p className="text-zinc-400 text-sm">
                    <strong className="text-emerald-400">Important:</strong> All content on this site is user-generated.
                    We do not host, upload, or endorse copyrighted material. Users are responsible for ensuring they have
                    the right to upload content.
                </p>
            </section>

            {/* Designated Agent */}
            <section className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">Designated DMCA Agent</h2>
                <p className="mb-4">
                    To file a DMCA takedown notice, please contact our designated agent:
                </p>
                <div className="bg-neutral-800 p-4 rounded-lg space-y-2 text-sm font-mono">
                    <p><strong className="text-zinc-400">Name:</strong> DMCA Agent</p>
                    <p><strong className="text-zinc-400">Email:</strong> tamilring.in@gmail.com</p>
                    <p><strong className="text-zinc-400">Response Time:</strong> Within 24-48 hours</p>
                </div>
                <p className="text-zinc-500 text-xs mt-4">
                    Note: This agent is registered with the U.S. Copyright Office as required by 17 U.S.C. § 512(c)(2).
                </p>
            </section>

            {/* Takedown Process */}
            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">How to File a Takedown Notice</h2>
                <p className="mb-4">
                    Your DMCA notice must include the following information (17 U.S.C. § 512(c)(3)):
                </p>
                <ol className="list-decimal ml-6 space-y-2 text-zinc-400">
                    <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                    <li>Identification of the copyrighted work claimed to have been infringed</li>
                    <li>Identification of the infringing material and its location on our site</li>
                    <li>Your contact information (address, telephone number, email)</li>
                    <li>A statement of good faith belief that the use is not authorized</li>
                    <li>A statement that the information is accurate and you are authorized to act</li>
                </ol>
            </section>

            {/* Repeat Infringer Policy */}
            <section className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-red-400 mb-3">⚠️ Repeat Infringer Policy</h2>
                <p className="mb-4">
                    TamilRing has adopted a policy of terminating, in appropriate circumstances, the accounts of users
                    who are repeat infringers.
                </p>
                <div className="bg-neutral-900 p-4 rounded-lg space-y-2">
                    <p className="text-sm"><strong className="text-red-400">Strike 1:</strong> Warning + Content Removed</p>
                    <p className="text-sm"><strong className="text-red-400">Strike 2:</strong> 30-Day Suspension</p>
                    <p className="text-sm"><strong className="text-red-400">Strike 3:</strong> Permanent Account Termination</p>
                </div>
                <p className="text-zinc-500 text-xs mt-4">
                    We maintain records of all copyright strikes and takedown notices for legal compliance.
                </p>
            </section>

            {/* Counter-Notice */}
            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">Counter-Notice Procedure</h2>
                <p className="mb-4">
                    If you believe your content was removed by mistake or misidentification, you may file a counter-notice
                    containing:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-zinc-400">
                    <li>Your physical or electronic signature</li>
                    <li>Identification of the removed material and its former location</li>
                    <li>A statement under penalty of perjury that the material was removed by mistake</li>
                    <li>Your name, address, and consent to federal court jurisdiction</li>
                </ul>
                <p className="text-zinc-500 text-sm mt-4">
                    Upon receipt of a valid counter-notice, we may restore the content within 10-14 business days
                    unless the copyright owner files a court action.
                </p>
            </section>

            {/* Misrepresentation Warning */}
            <section className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-yellow-400 mb-3">⚠️ Warning About False Claims</h2>
                <p className="text-zinc-400">
                    Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is
                    infringing may be subject to liability for damages, including costs and attorneys' fees.
                </p>
            </section>

            {/* Takedown Form */}
            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">Submit a Takedown Request</h2>
                <p className="mb-4 text-zinc-400">
                    Use the form below to generate a formal DMCA notice. We will review and respond within 24-48 hours.
                </p>
                <DMCAForm />
            </section>

            {/* Transparency */}
            <section className="bg-neutral-800/30 border border-neutral-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">Transparency Report</h2>
                <p className="text-zinc-400 mb-4">
                    We believe in transparency. Statistics on DMCA takedown requests:
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-neutral-900 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-400">0</p>
                        <p className="text-xs text-zinc-500">Requests Received</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-400">0</p>
                        <p className="text-xs text-zinc-500">Content Removed</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-400">24h</p>
                        <p className="text-xs text-zinc-500">Avg Response Time</p>
                    </div>
                </div>
                <p className="text-zinc-600 text-xs mt-4">Last Updated: December 2025</p>
            </section>

            <p className="text-zinc-500 text-sm">
                Questions? Contact us at <a href="mailto:tamilring.in@gmail.com" className="text-emerald-400 hover:underline">tamilring.in@gmail.com</a>
            </p>
        </div>
    );
}
