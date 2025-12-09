
import React from 'react';

export default function DMCA() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-300 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">DMCA Takedown Request</h1>

            <p>
                TamilRing respects the intellectual property rights of others. We comply with the Digital Millennium Copyright Act (DMCA).
            </p>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-bold text-white">Submit a Request</h2>
                <p className="text-sm">
                    To file a copyright infringement notification, please email us with the following information:
                </p>
                <ul className="list-disc ml-5 space-y-2 text-sm text-zinc-400">
                    <li>Identify the copyrighted work you claim has been infringed.</li>
                    <li>Identify the material on TamilRing that you claim is infringing (provide the URL).</li>
                    <li>Your contact information (Name, Email, Phone).</li>
                    <li>A statement that you have a "good faith belief" that the use is not authorized.</li>
                    <li>A statement that the information in the notification is accurate.</li>
                </ul>

                <div className="mt-6 pt-6 border-t border-neutral-800">
                    <p className="text-sm font-bold text-white mb-2">Send Email To:</p>
                    <a href="mailto:copyright@tamilring.com?subject=DMCA Takedown Request" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-500 transition-colors">
                        copyright@tamilring.com
                    </a>
                </div>
            </div>
        </div>
    );
}
