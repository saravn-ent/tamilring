
import React from 'react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 text-zinc-600 space-y-8">
                <h1 className="text-4xl font-black text-brand-dark mb-8 tracking-tight">Terms of Service</h1>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">1</span>
                        Acceptance of Terms
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        By accessing TamilRing, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">2</span>
                        User Conduct
                    </h2>
                    <div className="border-l-2 border-brand-wash pl-4">
                        <p className="mb-2">You agree NOT to upload content that is:</p>
                        <ul className="list-disc ml-5 space-y-1 text-zinc-600 font-medium">
                            <li>Illegal, hate speech, or defamatory.</li>
                            <li>Explicitly infringing on copyright (though we respect fair use for ringtones, direct piracy is prohibited).</li>
                            <li>Malicious code or spam.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">3</span>
                        Copyright & DMCA
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        We respect intellectual property rights. If you believe your content has been infringed,
                        please submit a <a href="/legal/dmca" className="text-brand-accent font-bold hover:underline">DMCA Takedown Request</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">4</span>
                        Termination
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        We reserve the right to ban users who violate these terms or upload inappropriate content.
                    </p>
                </section>

                <div className="pt-8 border-t border-brand-wash">
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Last Updated: December 2025</p>
                </div>
            </div>
        </div>
    );
}
