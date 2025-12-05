import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-zinc-100">Privacy Policy</h1>
            <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 mb-4">
                    At TamilRing, we prioritize the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by TamilRing and how we use it.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">Log Files</h2>
                <p className="text-zinc-300 mb-4">
                    TamilRing follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as a part of hosting services' analytics.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">Cookies</h2>
                <p className="text-zinc-300 mb-4">
                    Like any other website, TamilRing uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3 text-zinc-200">Data Security</h2>
                <p className="text-zinc-300 mb-4">
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                </p>
            </div>
        </div>
    );
}
