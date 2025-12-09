
import React from 'react';

export default function TermsOfService() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-300 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">1. Acceptance of Terms</h2>
                <p>
                    By accessing TamilRing, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">2. User Conduct</h2>
                <p>
                    You agree NOT to upload content that is:
                    <ul className="list-disc ml-5 mt-2 space-y-1 text-zinc-400">
                        <li>Illegal, hate speech, or defamatory.</li>
                        <li>Explicitly infringing on copyright (though we respect fair use for ringtones, direct piracy is prohibited).</li>
                        <li>Malicious code or spam.</li>
                    </ul>
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">3. Copyright & DMCA</h2>
                <p>
                    We respect intellectual property rights. If you believe your content has been infringed,
                    please submit a <a href="/legal/dmca" className="text-emerald-400 hover:underline">DMCA Takedown Request</a>.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">4. Termination</h2>
                <p>
                    We reserve the right to ban users who violate these terms or upload inappropriate content.
                </p>
            </section>

            <p className="text-zinc-500 text-sm mt-8">Last Updated: December 2025</p>
        </div>
    );
}
