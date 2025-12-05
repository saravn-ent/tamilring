import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-zinc-100">Terms of Service</h1>
            <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 mb-4">
                    Welcome to TamilRing. By accessing or using our website, you agree to be bound by these Terms of Service.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">1. Acceptance of Terms</h2>
                <p className="text-zinc-300 mb-4">
                    By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">2. User Conduct</h2>
                <p className="text-zinc-300 mb-4">
                    You agree to use the website only for lawful purposes. You are prohibited from posting or transmitting any
                    unlawful, threatening, libelous, defamatory, obscene, or profane material.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">3. Content</h2>
                <p className="text-zinc-300 mb-4">
                    Ringtones and content available on TamilRing are for personal use only. Users are responsible for the content
                    they upload and share on the platform.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">4. Disclaimer</h2>
                <p className="text-zinc-300 mb-4">
                    The materials on TamilRing's website are provided on an 'as is' basis. TamilRing makes no warranties,
                    expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
                    implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
                    of intellectual property or other violation of rights.
                </p>
            </div>
        </div>
    );
}
