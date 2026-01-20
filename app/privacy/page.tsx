
import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 text-zinc-600 space-y-8">
                <h1 className="text-4xl font-black text-brand-dark mb-8 tracking-tight">Privacy Policy</h1>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">1</span>
                        Information We Collect
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        Available information includes your account details (Google Profile) when you sign in,
                        which we use solely for authentication and profile display. We also collect usage data like
                        uploads, downloads, and favorites to personalize your experience.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">2</span>
                        Cookies
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        We use cookies to maintain your session and authentication state. By using TamilRing, you
                        consent to our use of cookies for these functional purposes.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">3</span>
                        User Generated Content
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        Any ringtones you upload are public. Please do not upload personal or private audio.
                        We are not responsible for the content uploaded by users, but we moderate it for compliance.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-wash flex items-center justify-center text-brand-accent text-sm">4</span>
                        Contact
                    </h2>
                    <p className="leading-relaxed border-l-2 border-brand-wash pl-4">
                        For privacy concerns, please contact us at <a href="mailto:tamilring.in@gmail.com" className="text-brand-accent font-medium hover:underline">tamilring.in@gmail.com</a>.
                    </p>
                </section>

                <div className="pt-8 border-t border-brand-wash">
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Last Updated: December 2025</p>
                </div>
            </div>
        </div>
    );
}
