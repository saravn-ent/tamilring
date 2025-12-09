
import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-300 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">1. Information We Collect</h2>
                <p>
                    Available information includes your account details (Google Profile) when you sign in,
                    which we use solely for authentication and profile display. We also collect usage data like
                    uploads, downloads, and favorites to personalize your experience.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">2. Cookies</h2>
                <p>
                    We use cookies to maintain your session and authentication state. By using TamilRing, you
                    consent to our use of cookies for these functional purposes.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">3. User Generated Content</h2>
                <p>
                    Any ringtones you upload are public. Please do not upload personal or private audio.
                    We are not responsible for the content uploaded by users, but we moderate it for compliance.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-emerald-500 mb-3">4. Contact</h2>
                <p>
                    For privacy concerns, please contact us at <a href="mailto:privacy@tamilring.com" className="text-emerald-400 hover:underline">privacy@tamilring.com</a>.
                </p>
            </section>

            <p className="text-zinc-500 text-sm mt-8">Last Updated: December 2025</p>
        </div>
    );
}
